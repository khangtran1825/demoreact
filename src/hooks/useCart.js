// src/hooks/useCart.js
import { useState, useEffect } from 'react'

const KEY = 'mh_cart'

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}
function write(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch {}
}

/**
 * Cart item shape:
 * { id, name, price, qty, capacity?, color?, image? }
 */
export default function useCart() {
  const [cart, setCart] = useState(read)

  // persist
  useEffect(() => {
    write(cart)
  }, [cart])

  // helper to match by id + variants
  const match = (a, b) => {
    return String(a.id) === String(b.id) &&
      (a.capacity || '') === (b.capacity || '') &&
      (a.color || '') === (b.color || '')
  }

  const add = (item) => {
    // normalize incoming item
    const normalized = {
      id: item.id,
      name: item.name,
      price: typeof item.price === 'number' ? item.price : Number(item.price) || 0,
      qty: Math.max(1, Number(item.qty || 1)),
      capacity: item.capacity || null,
      color: item.color || null,
      image: item.image || (item.images && item.images[0]) || null
    }

    setCart(prev => {
      // find index (do NOT mutate prev directly)
      const idx = prev.findIndex(i => match(i, normalized))
      if (idx !== -1) {
        const copy = prev.map(i => ({ ...i }))
        copy[idx].qty = Math.min(999, Number(copy[idx].qty || 0) + normalized.qty)
        return copy
      }
      return [...prev, normalized]
    })
  }

  const remove = (target) => {
    // remove by index or by matching item
    setCart(prev => {
      if (typeof target === 'number') {
        const copy = [...prev]; copy.splice(target, 1); return copy
      }
      return prev.filter(i => !match(i, target))
    })
  }

  const updateQty = (target, qty) => {
    setCart(prev => {
      const copy = prev.map(i => ({ ...i }))
      const idx = copy.findIndex(i => match(i, target))
      if (idx === -1) return prev
      const q = Number(qty)
      if (q <= 0) {
        copy.splice(idx, 1)
      } else {
        copy[idx].qty = Math.min(999, q)
      }
      return copy
    })
  }

  const clear = () => setCart([])

  const total = () => {
    return cart.reduce((s, it) => s + (Number(it.price || 0) * Number(it.qty || 0)), 0)
  }

  const count = () => cart.reduce((s, it) => s + (Number(it.qty || 0)), 0)

  return { cart, add, remove, updateQty, clear, total, count }
}
