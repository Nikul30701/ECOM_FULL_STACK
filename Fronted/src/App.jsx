import React from 'react'
import Header from './components/Header'
import ProductCard from './components/ProductCard'
import ProductDetail from './components/ProductDetail'
import ShopPage from './components/ShopPage'
import CartPage from './components/CartPage'


const App = () => {
  return (
    <div>
      <Header />
      <CartPage />
    </div>
  )
}

export default App