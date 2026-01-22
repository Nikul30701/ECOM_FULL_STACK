import React from 'react'
import { X } from 'lucide-react'

const ProductDetail = ({onClose, product, onAddToCart}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className='bg-white rounded-lg max-2-2xl w-full relative'>
                <button onClick={onClose} className='absolute top-4 right-4'>
                    <X size={24} />
                </button>
            
                <div className='grid mg:grid-cols-2 gap-8'>
                    <div className='text-9xl text-center'>{product.image}</div>
                </div>

                <div>
                    <h2 className='text-3xl font-bold mb-2'>{product.name}</h2>
                    <p className='text-grat-600 mb-4'>{product.category}</p>
                    <p className='text-grat-600 mb-6'>{product.description}</p>

                    <div className='mb-6'>
                        <div className='text-4xl font-bold text-indigo mb-2'>{product.price}</div>
                        <div className="text-sm text-gray-600">Stock available: {product.stock} units</div>
                    </div>

                    <button
                        onClick={() => {
                            onAddToCart(product);
                            onClose();
                        }}>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ProductDetail;