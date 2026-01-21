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
            return Response({'error', f"Only {product.stock} items available"},
                            status=status.HTTP_400_BAD_REQUEST)\
                            
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
        item_id = request.data.get(item_id)
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

    @action(detail=False, method=['delete'])
    def remove_item(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        item_id = request.query_params.get('item_id')   

        try:
            cart_item = CartItem.objects.get(id=item_id, cart=cart)
            cart_item.delete()
        except CartItem.DoesnotExist:
            return Response({'error': "Item not found in cart"}, 
                            status=status.HTTP_404_NOT_FOUND)   
