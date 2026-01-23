import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    DollarSign, 
    Trash2, 
    RefreshCw, 
    Clock,
    CheckCircle,
    TrendingUp
} from 'lucide-react';
import {ordersAPI, productsAPI} from '../services/api';

const AdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            // Keep loading true only on initial load, strictly speaking
            // But for simple refresh logic, we can leave it or manage a specific 'refreshing' state
            const [analyticsData, productsData, ordersData] = await Promise.all([
                ordersAPI.getAnalytics(),
                productsAPI.getAll(),
                ordersAPI.getAll(),
            ]);

            setAnalytics(analyticsData);
            setProducts(productsData.results || productsData);
            setOrders(ordersData.results || ordersData);
        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            fetchAdminData(); 
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if(!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await productsAPI.delete(productId);
            fetchAdminData(); 
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'shipped': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'processing': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-800">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <LayoutDashboard className="text-purple-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Overview of store performance and management</p>
                </div>
                <button 
                    onClick={() => { setLoading(true); fetchAdminData(); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                    <RefreshCw size={16} /> Refresh Data
                </button>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                ${analytics?.total_revenue?.toLocaleString() || '0'}
                            </h3>
                        </div>
                        <div className="p-3 bg-green-50 rounded-xl text-green-600">
                            <DollarSign size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                {analytics?.total_orders || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <ShoppingCart size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Pending Orders</p>
                            <h3 className="text-3xl font-bold text-gray-900">
                                {analytics?.pending_orders || 0}
                            </h3>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                            <Clock size={24} />
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-100">
                        <div className="flex gap-1 p-2">
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    activeTab === 'orders' 
                                    ? 'bg-purple-50 text-purple-700' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <ShoppingCart size={18} /> Orders
                            </button>
                            <button 
                                onClick={() => setActiveTab('products')}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                                    activeTab === 'products' 
                                    ? 'bg-purple-50 text-purple-700' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                <Package size={18} /> Products
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Orders Table */}
                        {activeTab === 'orders' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Order ID</th>
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Date</th>
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Total</th>
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Status</th>
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4 font-medium text-gray-900">#{order.id}</td>
                                                <td className="py-4 px-4 text-gray-500 text-sm">{new Date(order.created_at || Date.now()).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 font-medium">${order.total_amount || '0.00'}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)} uppercase tracking-wide`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2 cursor-pointer"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && <div className="text-center py-10 text-gray-400">No orders found.</div>}
                            </div>
                        )}

                        {/* Products Table */}
                        {activeTab === 'products' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Product Name</th>
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500">Price</th>
                                            <th className="py-4 px-4 text-sm font-medium text-gray-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                            <Package size={20} />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-gray-600 font-medium">
                                                    ${parseFloat(product.price).toFixed(2)}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {products.length === 0 && <div className="text-center py-10 text-gray-400">No products found.</div>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;