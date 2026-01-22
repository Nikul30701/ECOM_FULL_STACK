import React, {useState, useEffect, useMemo} from 'react'
import { Search } from 'lucide-react'
import ProductCard from './ProductCard';
import ProductDetail from './ProductDetail';


const ShopPage = ({products, onAddToCart, categories}) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProduct, setSelectedProduct] = useState(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search])

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = !debouncedSearch ||
                product.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                product.description.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesCategory = selectedCategory === 'All' ||
                product.category === selectedCategory ||
                (product.category?.name && product.category.name === selectedCategory);

            return matchesSearch && matchesCategory;
        })
    }, [products, debouncedSearch, selectedCategory])

    const handleSearch = (e) => {
        setSearch(e.target.value);
    }
    
    
    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50'>
            <div className='container max-auto px-4 py-12'>
                <div className='text-center mb-12'>
                    <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                        Discover amazing products
                    </h2>
                    <p className="text-lg text-gray-600">
                        Curated collection of high-quality products
                    </p>
                </div>

                <div className='max-w-4xl max-auto mb-12'>
                    <div className='flex flex-col md:flex-row gap-4'>
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

                        <div className='flex gap-2 overflow-x-auto pb-2'>
                            {categories.map(cat => (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-6 py-4 rounded-xl font-semibold whitespace-nowrap transition-all duration-300 ${
                                        selectedCategory === cat
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={onAddToCart}
                            onView={setSelectedProduct}
                        />
                    ))}
                </div>
            </div>

            {selectedProduct && (
                <ProductDetail 
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={onAddToCart}
                />
            )}
        </div>
    )
}

export default ShopPage
