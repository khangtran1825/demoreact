import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/login.css'
import useCart from '../hooks/useCart' // dùng hook để merge cart

// mock auth + mock server cart API
function mockSignIn({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || email.indexOf('@') === -1) return reject(new Error('Email không hợp lệ'))
      if (!password || password.length < 6) return reject(new Error('Mật khẩu phải >= 6 ký tự'))
      const name = email.split('@')[0].replace(/[^\w]/g, '')
      resolve({
        user: { id: Date.now().toString(), name: name.charAt(0).toUpperCase() + name.slice(1), email },
        token: 'demo-token-' + Math.random().toString(36).slice(2, 10)
      })
    }, 500)
  })
}

// MOCK: fetch server cart for given userId
async function mockFetchServerCart(userId) {  
  return new Promise(res => {
    setTimeout(() => {
      res([
        { id: 'v1', name: 'Điện thoại V1', price: 5990000, qty: 1, capacity: '128GB', color: 'Đen' },
        // add other server items if needed
      ])
    }, 250)
  })
}

// MOCK: save merged cart to server
async function mockSaveServerCart(userId, cart) {
  return new Promise(res => {
    setTimeout(() => res({ ok: true }), 200)
  })
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state && location.state.from) || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // hook cart
  const { cart, mergeWith, replaceCart } = useCart()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await mockSignIn({ email: email.trim(), password })

      // lưu user + token
      localStorage.setItem('user', JSON.stringify(user))
      if (remember) localStorage.setItem('token', token)
      else localStorage.removeItem('token')

      // 1) Lấy cart từ server
      const serverCart = await mockFetchServerCart(user.id)

      // 2) Dùng cart từ server làm nguồn chính (không merge với cart cũ)
      //    replaceCart đến từ useCart hook
      if (typeof replaceCart === 'function') {
        replaceCart(serverCart)
      } else {
        // fallback: set raw localStorage if hook not available
        try { localStorage.setItem('mh_cart', JSON.stringify(serverCart)) } catch (e) {}
        window.dispatchEvent(new Event('cart-changed'))
      }

      // lưu theo user để tránh trộn giữa các tài khoản
      try { localStorage.setItem(`mh_cart_${user.id}`, JSON.stringify(serverCart)) } catch (e) {}

      // 3) (optional) save final cart back to server
      const finalCart = JSON.parse(localStorage.getItem('mh_cart') || '[]')
      await mockSaveServerCart(user.id, finalCart)

      // 4) notify Header (same tab)
      window.dispatchEvent(new Event('user-changed'))

      setLoading(false)
      navigate(returnTo, { replace: true })
    } catch (err) {
      setLoading(false)
      setError(err?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h2>Đăng nhập</h2>
        <p className="muted">Đăng nhập để tiếp tục</p>

        {error && <div className="form-error" role="alert">{error}</div>}

        <form onSubmit={submit} className="login-form" noValidate>
          <label className="field">
            <div className="label">Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>

          <label className="field">
            <div className="label">Mật khẩu</div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </label>

          <div className="form-row">
            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary full" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  )
}
