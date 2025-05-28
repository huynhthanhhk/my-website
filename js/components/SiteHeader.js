// js/components/SiteHeader.js
const headerTemplate = document.createElement('template');
headerTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
        }
        header {
            /* Bỏ background-color: var(--secondary-color); */
            padding: 15px 0; /* Giữ padding trên dưới */
            border-bottom: 3px solid var(--primary-color); /* Đường viền dưới để phân biệt */
            width: 100%;
            box-sizing: border-box; /* Để padding và border không làm tăng kích thước tổng */
        }
        .header-container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 15px; /* Padding cho nội dung bên trong container */
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo a {
            font-size: 1.8em;
            font-weight: bold;
            color: var(--secondary-color); /* Thay đổi màu logo cho phù hợp nền sáng */
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
            color: var(--text-color); /* Màu chữ cho menu */
            text-decoration: none;
            font-size: 1em;
            font-weight: 500; /* Hơi đậm hơn một chút */
            padding: 5px 0; /* Thêm padding để dễ click và tạo khoảng cách */
            transition: color 0.3s ease, border-bottom-color 0.3s ease;
            border-bottom: 2px solid transparent; /* Đường viền dưới ẩn cho hover effect */
        }
        nav ul li a:hover,
        nav ul li a.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color); /* Hiện đường viền khi active/hover */
        }
        .auth-buttons button {
            margin-left: 10px;
            background-color: var(--primary-color);
            color: var(--white-color);
            border: none;
            padding: 8px 15px;
            border-radius: var(--border-radius);
            cursor: pointer;
            font-weight: 500;
        }
        .auth-buttons button.login {
            background-color: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
        }
        .auth-buttons button.login:hover {
            background-color: var(--primary-color);
            color: var(--white-color);
        }
         @media (max-width: 768px) {
            .header-container {
                flex-direction: column;
                gap: 15px; /* Tăng khoảng cách khi xếp dọc */
            }
            header {
                 padding: 10px 0;
            }
            nav ul {
                flex-direction: column;
                align-items: center;
                width: 100%;
            }
            nav ul li {
                margin: 8px 0; /* Tăng khoảng cách giữa các mục menu mobile */
                width: 100%;
                text-align: center;
            }
            nav ul li a {
                 display: block;
                 padding: 8px; /* Tăng padding cho dễ click trên mobile */
                 border-bottom: none; /* Bỏ border dưới trên mobile, hoặc tùy chỉnh lại */
            }
            nav ul li a:hover,
            nav ul li a.active {
                background-color: var(--light-gray-color); /* Hiệu ứng nền khi hover/active trên mobile */
                border-bottom: none;
            }
            .auth-buttons {
                margin-top:10px;
                display: flex;
                gap: 10px;
            }
        }
    </style>
    <header>
        <div class="header-container">
            <div class="logo">
                <a href="#">Site<span>Name</span></a>
            </div>
            <nav>
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
