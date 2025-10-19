import React from 'react'
import SearchBar from './SearchBar'

export default function Header() {
  return (
    <>
      <header className="topbar" id="topbar" role="banner">
        <div className="container topbar-inner">
          <a href="/" className="logo" aria-label="MobileHub - Trang chủ">
            <svg className="logo-mark" width="48" height="48" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect width="120" height="120" rx="18" fill="#DD0000" />
              <g transform="translate(14,18)" fill="#ffffff">
                <circle cx="10" cy="10" r="6"></circle>
                <circle cx="34" cy="10" r="6"></circle>
                <circle cx="58" cy="10" r="6"></circle>
                <rect x="6" y="40" width="62" height="12" rx="6"></rect>
              </g>
            </svg>
            <div className="logo-text">
              <div className="brand">MobileHub</div>
              <div className="brand-sub">Điện thoại • Phụ kiện</div>
            </div>
          </a>

          <div className="search-wrap" role="search" aria-label="Tìm sản phẩm">
            <SearchBar />
          </div>

          <nav className="top-actions" aria-label="Tài khoản và giỏ hàng">
            <a href="login.html" className="action" id="loginLink" aria-label="Đăng nhập">
              <i className="fa fa-user"></i><span className="label">Đăng nhập</span>
            </a>
            <a href="/cart" className="action" id="cartLink" aria-label="Giỏ hàng">
              <i className="fa fa-shopping-cart"></i><span className="label">Giỏ hàng</span>
            </a>
          </nav>
        </div>
      </header>

      <nav className="main-nav" id="mainNav" role="navigation" aria-label="Main navigation">
        <div className="container nav-inner">
          <ul className="menu" role="menubar" aria-label="Danh mục">
            <li>
              <a className="nav-item" role="menuitem" tabIndex={0} href="#">
                <i className="fa fa-mobile-screen-button"></i><span>Điện thoại</span>
              </a>
            </li>
            <li>
              <a className="nav-item" role="menuitem" tabIndex={0} href="#">
                <i className="fa fa-tablet"></i><span>Tablet</span>
              </a>
            </li>
            <li>
              <a className="nav-item" role="menuitem" tabIndex={0} href="#">
                <i className="fa fa-headphones"></i><span>Phụ kiện</span>
              </a>
            </li>
            <li>
              <a className="nav-item" role="menuitem" tabIndex={0} href="#">
                <i className="fa fa-bolt"></i><span>Sạc &amp; Pin</span>
              </a>
            </li>
            <li>
              <a className="nav-item" role="menuitem" tabIndex={0} href="#">
                <i className="fa fa-tags"></i><span>Khuyến mãi</span>
              </a>
            </li>
            <li>
              <a className="nav-item" role="menuitem" tabIndex={0} href="#">
                <i className="fa fa-cog"></i><span>Dịch vụ</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  )
}
