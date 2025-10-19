// src/pages/ProductDetail.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { products as mockProducts } from '../data/products'
import ProductGallery from '../components/ProductGallery'
import { CapacitySelector, ColorSelector } from '../components/VariantSelector'
import QuantitySelector from '../components/QuantitySelector'
import ActionButtons from '../components/ActionButtons'
import ProductSpecs from '../components/ProductSpecs'
import Reviews from '../components/Reviews'
import RelatedProducts from '../components/RelatedProducts'
import useCart from '../hooks/useCart'
import useFav from '../hooks/useFav'
import { formatPrice } from '../utils/formatPrice'
import '../styles/product-detail.css' // make sure file exists

export default function ProductDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const pool = (window.__MOCK_PRODUCTS__ && window.__MOCK_PRODUCTS__.length) ? window.__MOCK_PRODUCTS__ : mockProducts
  const p = pool.find(x => String(x.id) === String(id)) || pool[0]

  const [capacity, setCapacity] = useState((p.variants && p.variants.capacity && p.variants.capacity[0]) || null)
  const [color, setColor] = useState((p.variants && p.variants.color && p.variants.color[0] && p.variants.color[0].label) || null)
  const [qty, setQty] = useState(1)
  const { add } = useCart()
  const { isFav, toggle } = useFav()

  useEffect(()=> { document.title = p.name + ' | MobileHub' }, [p.name])

  // chua co gio hang 
  const onAddCart = useCart(p).add; alert('Đã thêm vào giỏ hàng') 
  const onBuyNow = (item) => { add(item); navigate('/cart') }

  return (
    <main className="pdp-container" id="mainContent">
      <ProductGallery images={p.images || p.image ? (p.images || [p.image]) : []} />
      <aside className="pdp-info" aria-label="Thông tin sản phẩm">
        <div className="muted">SKU: <strong id="skuVal">{p.sku || p.id}</strong></div>
        <h1 id="pTitle">{p.name}</h1>
        <div className="rating"><div id="stars">★★★★★</div><div className="muted" id="reviewCount">(0 đánh giá)</div></div>
        <div className="price-row">
          <div className="price" id="pPrice">{p.price ? formatPrice(p.price) : 'Liên hệ'}</div>
          <div className="old" id="pOld">{p.oldPrice ? formatPrice(p.oldPrice) : ''}</div>
        </div>
        <div className="muted" id="pShort">{p.desc}</div>

        <CapacitySelector capacities={(p.variants && p.variants.capacity) || []} value={capacity} onChange={setCapacity} />
        <ColorSelector colors={(p.variants && p.variants.color) || []} value={color} onChange={setColor} />

        <QuantitySelector qty={qty} setQty={setQty} />

        <ActionButtons product={p} qty={qty} capacity={capacity} color={color} onAddCart={onAddCart} onBuyNow={onBuyNow} />

        <div className="muted" id="stockInfo">Tình trạng: <strong id="stockVal">{p.status === 'available' ? 'Còn hàng' : (p.status === 'coming_soon' ? 'Sắp có' : 'Hết hàng')}</strong></div>

        <div className="social" style={{ marginTop: 8 }}>
          <button className="icon-btn" onClick={() => { /* share already in ActionButtons */ }}><i className="fa fa-share-nodes"></i></button>
          <button className="icon-btn" onClick={() => toggle(p.id)} aria-pressed={isFav(p.id)}>
            {isFav(p.id) ? <i className="fa fa-heart" style={{ color:'#ff4444' }}></i> : <i className="fa-regular fa-heart"></i>}
          </button>
        </div>
      </aside>

      <section style={{ gridColumn: '1 / -1' }}>
        <div className="desc"><h3>Mô tả sản phẩm</h3><p id="longDesc">{p.desc}</p></div>
        <ProductSpecs specs={p.specs} />
        <Reviews productId={p.id} />
        <RelatedProducts products={pool} currentId={p.id} />
      </section>
    </main>
  )
}
