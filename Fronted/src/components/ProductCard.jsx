import React from 'react'

const ProductCard = ({product, onAddToCart, onView}) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 flex flex-col">
            <div className='text-6xl text-center mb-4'>{product.image}</div>
            <h3 className='text-lg font-bold mb-2'>{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.category}</p>
            <p className="text-sm text-gray-500 mb-4 flex-grow">{product.description}</p>
            <p className="text-lg font-semibold">${product.price}</p>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => onAddToCart(product)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                >
                    Add to Cart
                </button>
                <button
                    onClick={() => onView(product)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                    View Details
                </button>
            </div>
        </div>
    )
}

export default ProductCard