// src/pages/Login.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/login.css'
import useCart from '../hooks/useCart'

/* ========== CONFIG ========== */
const GOOGLE_CLIENT_ID = 'REPLACE_WITH_GOOGLE_CLIENT_ID' // <-- set this for Google sign-in
/* ============================ */

// ---------- MOCK (replace with real API in production) ----------
function mockSignIn({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || email.indexOf('@') === -1) return reject(new Error('Email không hợp lệ'))
      if (!password || password.length < 6) return reject(new Error('Mật khẩu phải >= 6 ký tự'))
      const name = email.split('@')[0].replace(/[^\w]/g, '')
      resolve({
        user: { id: 'u_' + Date.now(), name: name.charAt(0).toUpperCase() + name.slice(1), email },
        token: 'demo-token-' + Math.random().toString(36).slice(2, 10)
      })
    }, 500)
  })
}
async function mockFetchServerCart(userId) {
  return new Promise(res => setTimeout(() => res([
    { id: 'v1', name: 'Điện thoại V1', price: 5990000, qty: 1, capacity: '128GB', color: 'Đen' }
  ]), 250))
}

async function mockSaveServerCart(userId, cart) {
  return new Promise(res => setTimeout(() => res({ ok: true }), 200))
}

// OTP mock
let __mockOtpStore = {}
function mockSendOtp(phone) {
  return new Promise(res => setTimeout(() => {
    const code = '123456'
    __mockOtpStore[phone] = code
    res({ ok: true, otp: code })
  }, 350))
}
function mockVerifyOtp(phone, otp) {
  return new Promise((res, rej) => setTimeout(() => {
    if (String(__mockOtpStore[phone]) === String(otp)) res({ ok: true })
    else rej(new Error('OTP không đúng'))
  }, 300))
}

// Decode JWT payload (simple base64 decode)
function decodeJwtPayload(token) {
  try {
    const p = token.split('.')[1]
    return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/')))
  } catch (e) { return null }
}

/* ---------- Component ---------- */
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = (location.state && location.state.from) || '/'

  // email login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // phone OTP
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [showPhoneForm, setShowPhoneForm] = useState(false)

  // google
  const googleBtnRef = useRef(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  // cart hook
  const { cart, mergeWith, replaceCart } = useCart()

  // utility: wait for cart-changed event (timeout fallback)
  function waitForCartPersist(timeout = 1000) {
    return new Promise(resolve => {
      let done = false
      function onChanged() {
        if (done) return
        done = true
        window.removeEventListener('cart-changed', onChanged)
        resolve()
      }
      window.addEventListener('cart-changed', onChanged)
      // fallback after timeout
      setTimeout(() => {
        if (done) return
        done = true
        window.removeEventListener('cart-changed', onChanged)
        resolve()
      }, timeout)
    })
  }

  // common post-login: save user, token, sync cart, notify header
  async function onLoginSuccess({ user, token }) {
    // save user + token
    localStorage.setItem('user', JSON.stringify(user))
    if (remember) localStorage.setItem('token', token)
    else localStorage.removeItem('token')

    // fetch server cart and merge (or replace — choose strategy)
    try {
      const serverCart = await mockFetchServerCart(user.id)
      // Strategy: merge server into local (keep local items)
      if (typeof mergeWith === 'function') {
        mergeWith(serverCart, { sumQty: true })
      } else if (typeof replaceCart === 'function') {
        // fallback: replace (server authoritative)
        replaceCart(serverCart)
      } else {
        // fallback write to localStorage
        try { localStorage.setItem('mh_cart', JSON.stringify(serverCart)) } catch (e) { }
        window.dispatchEvent(new Event('cart-changed'))
      }

      // wait until hook persisted cart (to avoid race)
      await waitForCartPersist(1000)

      // finalCart read from localStorage (hook persists there)
      const finalCart = JSON.parse(localStorage.getItem('mh_cart') || '[]')
      await mockSaveServerCart(user.id, finalCart)
    } catch (e) {
      console.warn('cart sync failed', e)
    }

    // notify header in same tab and cross-tab
    window.dispatchEvent(new Event('user-changed'))
    // also set localStorage (again) to trigger storage in other tabs
    localStorage.setItem('user', JSON.stringify(user))

    navigate(returnTo, { replace: true })
  }

  // ---------- Email submit ----------
  const submitEmail = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await mockSignIn({ email: email.trim(), password })
      await onLoginSuccess(res)
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại'); setLoading(false)
    }
  }

  // ---------- Google sign-in ----------
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return
    const id = 'google-identity-client'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.id = id
      s.async = true
      s.defer = true
      document.head.appendChild(s)
      s.onload = initGSI
    } else {
      initGSI()
    }

    function initGSI() {
      if (!window.google || !window.google.accounts || !window.google.accounts.id) return
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (resp) => {
            setGoogleLoading(true)
            try {
              const payload = decodeJwtPayload(resp.credential)
              const user = {
                id: payload.sub,
                name: payload.name || payload.email?.split('@')[0],
                email: payload.email,
                avatar: payload.picture
              }
              const token = resp.credential
              await onLoginSuccess({ user, token })
            } catch (e) {
              console.error(e)
              setError('Google sign-in thất bại')
            } finally {
              setGoogleLoading(false)
            }
          }
        })
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, { theme: 'outline', size: 'large', width: '220' })
        }
      } catch (e) {
        console.warn('GSI init error', e)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------- Phone OTP ----------
  const sendOtp = async () => {
    setPhoneError(''); setOtpLoading(true)
    if (!phone || phone.trim().length < 8) {
      setPhoneError('Số điện thoại không hợp lệ'); setOtpLoading(false); return
    }
    try {
      const r = await mockSendOtp(phone.trim())
      setOtpSent(true)
      // in mock we log OTP for dev
      console.log('mock OTP:', r.otp)
    } catch (e) {
      setPhoneError(e.message || 'Gửi OTP thất bại')
    } finally {
      setOtpLoading(false)
    }
  }
  const verifyOtp = async () => {
    setPhoneError(''); setOtpLoading(true)
    try {
      await mockVerifyOtp(phone.trim(), otpCode.trim())
      const user = { id: 'ph_' + phone.trim(), name: phone.trim(), phone: phone.trim() }
      const token = 'phone-token-' + Math.random().toString(36).slice(2, 10)
      await onLoginSuccess({ user, token })
    } catch (e) {
      setPhoneError(e.message || 'Xác thực OTP thất bại')
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <h2>Đăng nhập</h2>
        <p className="muted">Đăng nhập để tiếp tục</p>

        {error && <div className="form-error" role="alert">{error}</div>}

        {/* Email */}
        <form onSubmit={submitEmail} className="login-form" noValidate>
          <label className="field"><div className="label">Email</div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </label>

          <label className="field"><div className="label">Mật khẩu</div>
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

        <div className="divider">Hoặc</div>

        {/* Google */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div ref={googleBtnRef} />
        </div>
        {googleLoading && <div className="muted">Đang đăng nhập bằng Google...</div>}

        {/* Phone */}
        <div style={{ marginTop: 8 }}>
          
        </div>
      </div>
    </main>
  )
}
