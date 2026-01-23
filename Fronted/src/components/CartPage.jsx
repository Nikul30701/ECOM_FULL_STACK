import React, {useState} from 'react'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Trash2 } from 'lucide-react'


const CartPage = ({ onNavigate }) => { 
    const {cart, removeFromCart , updateQuantity, clearCart, cartTotal} = useCart()
    const [checkoutStep, setCheckoutStep] = useState('cart');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        zip: '',
        country: ''
    });
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    
    const tax = cartTotal * 0.1
    const total = cartTotal + tax

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setCheckoutStep('address');
    }

    const handleAddressSubmit  = (e) => {
        e.preventDefault();
        setCheckoutStep('payment');
    }

    const handlePayment  = () => {
        setPaymentProcessing(true);
        setTimeout(() => {
            setPaymentProcessing(false);
            setCheckoutStep('confirmation');
            clearCart();
        }, 2000);
    }

    if (checkoutStep === 'confirmation') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6 text-lg">Thank you for your purchase. Your order has been placed successfully.</p>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
            <p className="text-sm text-gray-500 mb-2">Order ID</p>
            <p className="text-2xl font-bold text-purple-600">#{order.order_id}</p>
          </div>
          <button
            onClick={() => {
              setCheckoutStep('cart');
              onNavigate('home');
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold shadow-xl"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'payment') {
    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-12 px-4'>
            <div className='max-w-2xl mx-auto'>
                <h2 className='text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'>
                    Payment Details
                </h2>

                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <h3 className="font-bold text-xl mb-6">Order Summary</h3>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-semibold">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg">
                            <span className="text-gray-600">Tax (10%):</span>
                            <span className="font-semibold">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-2xl border-t-2 pt-4">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h3 className="font-bold text-xl mb-6">Card Information</h3>
                    <div className="space-y-4 mb-8">
                        <input
                            type="text"
                            placeholder="Card Number"
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                            <input
                                type="text"
                                placeholder="CVV"
                                className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                    <button
                        onClick={() => setCheckoutStep('address')}
                        className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                    >
                        Back
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={paymentProcessing}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg disabled:opacity-50"
                    >
                        {paymentProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                    </button>
                    </div>
                </div>
            </div>
        </div>
    )
  }

    if (checkoutStep === 'address') {
        return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Shipping Address</h2>
                <form onSubmit={handleAddressSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="space-y-4 mb-8">
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={address.street}
                            onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            required
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="City"
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                required
                                className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                            <input
                                type="text"
                                placeholder="ZIP Code"
                                value={address.zip}
                                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                                required
                            className="px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Country"
                            value={address.country}
                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            required
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                        />
                    </div>
                    
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setCheckoutStep('cart')}
                            className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold"
                        >
                            Back to Cart
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg"
                        >
                            Continue to Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Shopping Cart</h2>
      
      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Your cart is empty</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {cart.map(item => (
                <div key={item.id} className="flex items-center gap-4 pb-4 mb-4 border-b last:border-b-0">
                  <div className="text-4xl">{item.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-600">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  <div className="font-bold w-24 text-right">${(item.price * item.quantity).toFixed(2)}</div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    )
}
export default CartPage;
