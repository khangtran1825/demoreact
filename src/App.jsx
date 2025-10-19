import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import SearchResults from './pages/SearchResults'

export default function App(){
  const hideFooterPaths = ['/product/','/cart','/search']
  const currentPath = window.location.pathname
  const hideFooter = hideFooterPaths.some(p => currentPath.startsWith(p))
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/product/:id" element={<ProductDetail/>} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/search" element={<SearchResults />} /> 
      </Routes>
      {!hideFooter && <Footer />}
    </>
  )
}
