// js/components/SiteHeader.js
const headerTemplate = document.createElement('template');
headerTemplate.innerHTML = `
    <style>
        :host {
            display: block; width: 100%; position: sticky; 
            top: 0; z-index: 990; 
            background-color: var(--background-color, #fff);
        }
        header {
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.07);
            padding: 15px 0; width: 100%; box-sizing: border-box;
        }
        .header-container {
            max-width: var(--max-width-container, 1100px); margin: 0 auto; padding: 0 15px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .logo a { font-size: 1.8em; font-weight: bold; color: var(--secondary-color, #004238); text-decoration: none; }
        .logo a span { color: var(--primary-color, #53b966); }

        /* Wrapper cho nav và auth buttons trên desktop */
        .nav-auth-wrapper {
            display: flex;
            align-items: center;
            gap: 20px; /* Khoảng cách giữa nav và auth buttons trên desktop */
        }

        nav.main-navigation { display: flex; } /* Mặc định cho desktop */
        nav.main-navigation ul { list-style: none; margin: 0; padding: 0; display: flex; }
        nav.main-navigation ul li { margin-left: 25px; }
        nav.main-navigation ul li:first-child { margin-left: 0; }
        nav.main-navigation ul li a {
            color: var(--text-color, #333); font-size: 1em; font-weight: 500;
            padding: 8px 0; text-decoration: none;
            transition: color 0.3s ease, border-bottom-color 0.3s ease;
            border-bottom: 2px solid transparent;
        }
        nav.main-navigation ul li a:hover, 
        nav.main-navigation ul li a.active { color: var(--primary-color, #53b966); border-bottom-color: var(--primary-color, #53b966); }
        
        .auth-buttons { display: flex; } /* Mặc định cho desktop */
        .auth-buttons button {
            margin-left: 10px; padding: 8px 15px; border-radius: var(--border-radius, 5px);
            cursor: pointer; font-weight: 500; white-space: nowrap;
            border: 1px solid var(--primary-color, #53b966);
        }
        .auth-buttons button.login { background-color: transparent; color: var(--primary-color, #53b966); }
        .auth-buttons button.login:hover { background-color: var(--primary-color, #53b966); color: var(--text-color-inverted, #fff); }
        .auth-buttons button.register { background-color: var(--primary-color, #53b966); color: var(--text-color-inverted, #fff); }
        .auth-buttons button.register:hover { background-color: #45a054; border-color: #45a054; }

        .mobile-menu-toggle {
            display: none; background: none; border: none;
            padding: 8px; cursor: pointer; z-index: 1001;
        }
        .mobile-menu-toggle svg { width: 28px; height: 28px; fill: var(--secondary-color, #004238); }

        /* --- Responsive Styles --- */
        @media (max-width: 768px) {
            header { padding: 10px 0; }
            .mobile-menu-toggle { display: block; /* Hiện nút hamburger */ }

            .nav-auth-wrapper {
                display: none; /* Ẩn wrapper này trên mobile theo mặc định */
                position: absolute;
                top: 100%; /* Ngay dưới header */
                left: 0;
                right: 0;
                width: 100%;
                background-color: var(--background-color, #fff);
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                padding: 0; /* Reset padding, sẽ được style bởi ul, li */
                z-index: 1000;
                flex-direction: column; /* Sắp xếp nav và auth-buttons dọc */
                align-items: stretch; /* Kéo dài các item con */
                gap: 0; /* Reset gap, sẽ style riêng cho li */
            }
            .nav-auth-wrapper.menu-open { /* Class để hiện menu */
                display: flex; 
            }

            nav.main-navigation { width: 100%; } /* Nav chiếm toàn bộ chiều rộng trong wrapper */
            nav.main-navigation ul {
                flex-direction: column; align-items: stretch; width: 100%;
            }
            nav.main-navigation ul li {
                margin: 0; width: 100%; text-align: center;
                border-bottom: 1px solid var(--light-gray-color, #f0f0f0);
            }
            nav.main-navigation ul li:last-child { 
                /* Bỏ border nếu auth buttons ngay sau */
            }
            nav.main-navigation ul li a {
                 display: block; padding: 12px 15px; border-bottom: none; width: 100%;
            }
            nav.main-navigation ul li a:hover, 
            nav.main-navigation ul li a.active {
                background-color: var(--light-gray-color, #f4f4f4);
                color: var(--primary-color, #53b966);
            }

            .auth-buttons { /* Style cho auth-buttons khi trong mobile menu */
                display: flex;
                flex-direction: column; /* Các nút xếp dọc */
                padding: 10px 15px; /* Padding xung quanh nhóm nút */
                gap: 10px; /* Khoảng cách giữa các nút */
                border-top: 1px solid var(--light-gray-color, #f0f0f0); /* Ngăn cách với nav items */
            }
            .auth-buttons button {
                margin-left: 0; /* Reset margin */
                width: 100%; /* Nút chiếm toàn bộ chiều rộng */
            }
        }
    </style>
    <header>
        <div class="header-container">
            <div class="logo">
                <a href="#">Site<span>Name</span></a>
            </div>

            <button class="mobile-menu-toggle" aria-label="Mở menu" aria-expanded="false" aria-controls="navAuthWrapper">
                <svg class="icon-hamburger" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
                <svg class="icon-close" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style="display:none;"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
            
            <div class="nav-auth-wrapper" id="navAuthWrapper">
                <nav class="main-navigation">
                    <ul>
                        <li><a href="#" class="active">Trang chủ</a></li>
                        <li><a href="#">Mua bán</a></li>
                        <li><a href="#">Cho thuê</a></li>
                        <li><a href="#">Dự án</a></li>
                        <li><a href="#">Tin tức</a></li>
                    </ul>
                </nav>
                <div class="auth-buttons">
                    <button class="login">Đăng nhập</button>
                    <button class="register">Đăng ký</button>
                </div>
            </div>
        </div>
    </header>
`;

class SiteHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(headerTemplate.content.cloneNode(true));

        this._menuToggle = this.shadowRoot.querySelector('.mobile-menu-toggle');
        this._navAuthWrapper = this.shadowRoot.querySelector('.nav-auth-wrapper'); // Target wrapper mới
        this._iconHamburger = this.shadowRoot.querySelector('.icon-hamburger');
        this._iconClose = this.shadowRoot.querySelector('.icon-close');
    }

    connectedCallback() {
        if (this._menuToggle && this._navAuthWrapper) {
            this._menuToggle.addEventListener('click', this._toggleMenu.bind(this));
        }
    }

    _toggleMenu() {
        const isMenuOpen = this._navAuthWrapper.classList.toggle('menu-open'); // Toggle trên wrapper
        this._menuToggle.setAttribute('aria-expanded', isMenuOpen.toString());

        if (isMenuOpen) {
            this._iconHamburger.style.display = 'none';
            this._iconClose.style.display = 'block';
            this._menuToggle.setAttribute('aria-label', 'Đóng menu');
        } else {
            this._iconHamburger.style.display = 'block';
            this._iconClose.style.display = 'none';
            this._menuToggle.setAttribute('aria-label', 'Mở menu');
        }
    }

    disconnectedCallback() {
        if (this._menuToggle) {
            this._menuToggle.removeEventListener('click', this._toggleMenu.bind(this));
        }
    }
}
customElements.define('site-header', SiteHeader);