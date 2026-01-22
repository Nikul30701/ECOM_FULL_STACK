import React from 'react'
import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'

const Header = ({currentUser, onLogout, onNavigate, cartCount}) => {
    return (
        <header className='bg-white text-[#1b1b1b] fixed w-full z-10'>
            <div className='container max-auto px-4 py-4'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-3 hover:text-indigo-600 transition'>
                        <ShoppingBag  />
                        <h1 className='text-2xl font-bold'>ShopCom</h1>
                    </div>

                    <nav className='flex items-center gap-6'>
                        <button
                            className="hover:text-indigo-600 transition flex items-center gap-2"
                            onClick={() => onNavigate('/home')}
                        >
                            <span className='text-l font-semibold'>Home</span>
                        </button>

                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => onNavigate('admin')}
                                className="hover:text-indigo-600 transition flex items-center gap-2"
                            >
                                <span className='text-l font-semibold'>Admin</span>
                            </button>
                        )}

                        <button
                            onClick={() => onNavigate('/cart')}
                            className="hover:text-indigo-600 transition flex items-center gap-2"
                        >
                            <span className='text-l font-semibold'>Cart</span>
                            {cartCount > 0 && (
                                <span className='absolute -top-2 -rigth bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>{cartCount}</span>
                            )}
                        </button>

                        <div
                            className="flex items-center gap-3 ml-2 pl-2 hover:text-indigo-600 transition-colors"
                            onClick={() => onNavigate('/profile')}
                        >
                        <span className="text-l font-semibold">
                            {currentUser?.name ?? 'Guest'}
                        </span>

                        {currentUser && (
                            <button
                            onClick={onLogout}
                            aria-label="Logout"
                            className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors "
                            >
                            Logout
                            </button>
                        )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header