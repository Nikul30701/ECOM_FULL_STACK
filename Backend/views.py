from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User
from django.db import transaction
import stripe 
from django.conf import settings
from .models import *
from .serializers import *
from .permissions import *

stripe.api_key = settings.STRIPE_SECRET_KEY


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile
    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)

        if category:
            queryset = queryset.filter(category__id=category)
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock(self,request):
        """ Admin endpoint to view products with low stock """
        if not request.user.is_staff:
            return Response({'error': "Admin access required"})
        
        products = Product.objects.filter(stock__lte=10, is_active=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try: 
            product = Product.objects.get(id=product_id, is_active=True)
        except:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if quantity > product.stock:
            return Response({'error': f"Only {product.stock} items available"},
                            status=status.HTTP_400_BAD_REQUEST)
                            
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity += quantity
            if cart_item.quantity > product.stock:
                return Response({'error': f"Only {product.stock} items available"}, 
                                status=status.HTTP_400_BAD_REQUEST)
            cart_item.save()
        else:
            cart_item.quantity = quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.data.get('item_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
        except CartItem.DoesNotExist:
            return Response({'error':'Item not found in cart'}, status=status.HTTP_404_NOT_FOUND) 
        
        if quantity > cart_item.product.stock:
            return Response({'error': f"Only {cart_item.product.stock} items available"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        cart_item.quantity = quantity
        cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.query_params.get('item_id')   

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesnotExist:
            return Response({'error': "Item not found in cart"}, 
                            status=status.HTTP_404_NOT_FOUND)   

        serilizer = CartSerializer(cart)
        return Response(serializers.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=self.request.user)
    
    @transaction.atomic
    def create(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        shipping_serializer = CreateOrderSerializer(data=request.data)
        if not shipping_serializer.is_valid():
            return Response(shipping_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Insufficient stock for {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        subtotal = cart.total_price
        tax = subtotal * 0.1 # 10%tax
        total = subtotal + tax

        # create stripe payment intent
        try:
            payment_intent = stripe.PaymentIntent.create(
                amount=int(total * 100),
                currency='ind',
                metadata={'user_id':request.user.id}
            )
        except stripe.error.StripeError as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # create order
        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_serializer.validated_data['shipping_address'],
            shipping_city=shipping_serializer.validated_data['shipping_city'],
            shipping_zip=shipping_serializer.validated_data['shipping_zip'],
            shipping_country=shipping_serializer.validated_data['shipping_country'],
            total_amount=total,
            tax_amount=tax,
            stripe_payment_intent=payment_intent.id,
        )

        # Create order items and update stock
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
            )

            # Update stock
            cart_item.product.stock -= cart_item.quantity
            cart_item.product.save()

        # clear Cart
        cart.items.all().delete()

        serializer = OrderSerializer(order)
        return Response({
            "order":serializer.data,
            "client_secret":payment_intent.client_secret
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def analytics(self, request):
        from django.db.models import Sum, Count
        from datetime import datetime, timedelta
        
        # Last 7 days analytics
        week_ago = datetime.now() - timedelta(days=7)
        
        total_revenue = Order.objects.filter(
            payment_status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        
        daily_sales = Order.objects.filter(
            created_at__gte=week_ago,
            payment_status='completed'
        ).extra(select={'date': 'DATE(created_at)'}).values('date').annotate(
            revenue=Sum('total_amount'),
            orders=Count('id')
        ).order_by('date')
        
        return Response({
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "daily_sales": list(daily_sales)
        })

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        order = Order.objects.get(stripe_payment_intent=payment_intent.id)
        order.payment_status = 'completed'
        order.save()
    
    return Response(status=status.HTTP_200_OK)
    