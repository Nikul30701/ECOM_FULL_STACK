import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, Loader2 } from 'lucide-react'; // Added Loader icon
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';
import { productsAPI, categoriesAPI } from '../services/api';

const ShopPage = ({ onAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Initial Data Fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                productsAPI.getAll(),
                categoriesAPI.getAllCategories(),
            ]);

            // SAFETY CHECK: Ensure we are setting arrays
            const pList = productsData.results || productsData.result || productsData;
            const cList = categoriesData.results || categoriesData.result || categoriesData;

            setProducts(Array.isArray(pList) ? pList : []);
            setCategories(Array.isArray(cList) ? cList : []);
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter Effect
    useEffect(() => {
        const fetchFilteredProducts = async () => {
            try {
                // Note: Not setting global loading here to prevent the whole UI from flickering
                const params = {};
                if (search) params.search = search;
                if (selectedCategory) params.category = selectedCategory.id; // Send ID to API

                const data = await productsAPI.getAll(params);
                const pList = data.results || data.result || data;
                
                setProducts(Array.isArray(pList) ? pList : []);
            } catch (err) {
                console.error('Error fetching filtered products:', err);
            }
        };

        const debounce = setTimeout(() => {
            fetchFilteredProducts();
        }, 300);

        return () => clearTimeout(debounce);
    }, [search, selectedCategory]);

    const handleSearch = (e) => setSearch(e.target.value);

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        if (!categoryId) {
            setSelectedCategory(null);
        } else {
            const category = categories.find(c => c.id.toString() === categoryId);
            setSelectedCategory(category);
        }
    };

    // If there is a critical error on first load
    if (error) return <div className="p-10 text-center text-red-500">Error: {error}</div>;

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 sticky'>
            <div className='container mx-auto px-4 py-20'>
                <div className='text-center mb-12'>
                    <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        Discover amazing products
                    </h2>
                    <p className="text-lg text-gray-600">
                        Curated collection of high-quality products
                    </p>
                </div>

                <div className='max-w-4xl mx-auto mb-12'>
                    <div className='flex flex-col md:flex-row gap-4'>
                        {/* Search Input */}
                        <div className='flex-1 relative'>
                            <Search className="absolute left-4 top-4 text-gray-400" />
                            <input 
                                type="text"
                                placeholder='Search for products' 
                                value={search}
                                onChange={handleSearch}
                                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white shadow-sm"
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className='relative md:w-64'>
                            <select 
                                value={selectedCategory?.id || ''}
                                onChange={handleCategoryChange}
                                className="w-full pl-4 pr-10 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white shadow-sm appearance-none cursor-pointer text-gray-700 font-medium"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Check length to show "Not Found" message */}
                        {products.length > 0 ? (
                            products.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={() => onAddToCart(product)}
                                    onView={setSelectedProduct}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                No products found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedProduct && (
                <ProductDetail 
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={onAddToCart}
                />
            )}
        </div>
    );
};

export default ShopPage;