from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth.models import User
from django.db import transaction
from django.conf import settings
from .models import *
from .serializers import *
from .permissions import *

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
    
    @action(detail=False, permission_classes=[IsAdminUser],  methods=['get'])
    def low_stock(self,request):
        """ Admin endpoint to view products with low stock """
        if not request.user.is_staff:
            return Response({'error': "Admin access required"})
        
        products = Product.objects.filter(stock__lte=10, is_active=True)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    

class CartViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # Get request - retrieve cart
    def list(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    # Post request - add item to cart
    @action(detail=False, methods=['post'])
    def add_item(self, request):
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
        except CartItem.DoesNotExist:
            return Response({'error': "Item not found in cart"}, 
                            status=status.HTTP_404_NOT_FOUND)   

        serializer = CartSerializer(cart)
        return Response(serializer.data)

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
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )

        shipping_serializer = CreateOrderSerializer(data=request.data)
        shipping_serializer.is_valid(raise_exception=True)

        # stock validation
        for item in cart.items.all():
            if item.quantity > item.product.stock:
                return Response(
                    {"error": f"Insufficient stock for {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        subtotal = cart.total_price
        tax = subtotal * 0.1
        total = subtotal + tax

        order = Order.objects.create(
            user=request.user,
            shipping_address=shipping_serializer.validated_data['shipping_address'],
            shipping_city=shipping_serializer.validated_data['shipping_city'],
            shipping_zip=shipping_serializer.validated_data['shipping_zip'],
            shipping_country=shipping_serializer.validated_data['shipping_country'],
            total_amount=total,
            tax_amount=tax,
            payment_status='pending'
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )

        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
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

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    @transaction.atomic
    def confirm_payment(self, request, pk=None):
        order = get_object_or_404(
            Order,
            id=pk,
            user=request.user,
            payment_status='pending'
        )

        # simulate payment success
        order.payment_status = 'completed'
        order.save()

        # reduce stock AFTER payment
        for item in order.items.all():
            product = item.product
            product.stock -= item.quantity
            product.save()

        return Response({
            "message": "Payment successful",
            "order_id": order.id
        })
    