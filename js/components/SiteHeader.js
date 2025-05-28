// js/components/SiteHeader.js
// ... (phần template và class definition giữ nguyên)
const headerTemplate = document.createElement('template');
headerTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%; /* Cho phép host chiếm toàn bộ chiều ngang */
        }
        header {
            background-color: var(--secondary-color); /* Màu nền full-width */
            color: var(--white-color);
            padding: 15px 0;
            border-bottom: 5px solid var(--primary-color);
            width: 100%; /* Đảm bảo thẻ header bên trong cũng full-width */
        }
        .header-container { /* Container cho nội dung */
            max-width: 1100px;
            margin: 0 auto; /* Căn giữa nội dung */
            padding: 0 15px; /* Padding cho nội dung bên trong container */
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo a {
            font-size: 1.8em;
            font-weight: bold;
            color: var(--white-color);
            text-decoration: none;
        }
        .logo a span {
            color: var(--primary-color);
        }
        nav ul {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
        }
        nav ul li {
            margin-left: 20px;
        }
        nav ul li a {
            color: var(--white-color);
            text-decoration: none;
            font-size: 1em;
            transition: color 0.3s ease;
        }
        nav ul li a:hover,
        nav ul li a.active {
            color: var(--primary-color);
        }
        .auth-buttons button {
            margin-left: 10px;
            background-color: var(--primary-color);
            color: var(--white-color);
            border: none;
            padding: 8px 15px;
            border-radius: var(--border-radius);
            cursor: pointer;
        }
        .auth-buttons button.login {
            background-color: transparent;
            border: 1px solid var(--primary-color);
        }
         @media (max-width: 768px) {
            .header-container {
                flex-direction: column;
                gap: 10px;
            }
            nav ul {
                flex-direction: column;
                align-items: center;
                width: 100%;
            }
            nav ul li {
                margin: 5px 0;
                width: 100%;
                text-align: center;
            }
            nav ul li a {
                 display: block;
                 padding: 5px;
            }
            .auth-buttons {
                margin-top:10px;
            }
        }
    </style>
    <header>
        <div class="header-container">
            <div class="logo">
                <a href="#">My<span>Logo</span></a>
            </div>
            <nav>
                <ul>
                    <li><a href="#" class="active">Trang chủ</a></li>
                    <li><a href="#">Mua nhà</a></li>
                    <li><a href="#">Cho thuê</a></li>
                    <li><a href="#">Dự án</a></li>
                    <li><a href="#">Tin tức</a></li>
                </ul>
            </nav>
            <div class="auth-buttons">
                <button class="login">Đăng nhập</button>
                <button>Đăng ký</button>
            </div>
        </div>
    </header>
`;
// Class SiteHeader giữ nguyên
class SiteHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(headerTemplate.content.cloneNode(true));
    }
}
customElements.define('site-header', SiteHeader);
