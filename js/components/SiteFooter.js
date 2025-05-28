// js/components/SiteFooter.js
const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            width: 100%;
        }
        footer {
            /* Bỏ background-color: var(--secondary-color); */
            padding: 40px 0 20px 0; /* Tăng padding trên, giảm padding dưới chút */
            margin-top: 30px; /* Khoảng cách với section cuối cùng */
            width: 100%;
            border-top: 2px solid var(--medium-gray-color); /* Đường viền trên để phân biệt */
            box-sizing: border-box;
        }
        .footer-container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Điều chỉnh minmax nếu cần */
            gap: 30px; /* Tăng khoảng cách giữa các cột */
        }
        .footer-column h4 {
            color: var(--secondary-color); /* Màu cho tiêu đề cột */
            margin-bottom: 15px;
            font-size: 1.2em; /* Tăng kích thước tiêu đề cột */
        }
        .footer-column ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .footer-column ul li {
            margin-bottom: 10px; /* Tăng khoảng cách giữa các mục */
        }
        .footer-column ul li a {
            color: var(--text-color); /* Màu chữ cho link footer */
            text-decoration: none;
        }
        .footer-column ul li a:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }
        .footer-column p { /* Cho text trong cột tải ứng dụng */
            color: var(--dark-gray-color);
            font-size: 0.95em;
            margin-bottom:10px;
        }
        .footer-column img { /* Cho ảnh app store */
            opacity: 0.8;
            transition: opacity 0.3s ease;
        }
        .footer-column img:hover {
            opacity: 1;
        }
        .footer-bottom {
            text-align: center;
            margin-top: 40px; /* Tăng khoảng cách với các cột trên */
            padding-top: 20px;
            border-top: 1px solid var(--light-gray-color); /* Đường viền mỏng hơn bên trong footer */
            font-size: 0.9em;
            color: var(--dark-gray-color); /* Màu chữ cho copyright */
        }
    </style>
    <footer>
        <div class="footer-container">
            <div class="footer-column">
                <h4>Về chúng tôi</h4>
                <ul>
                    <li><a href="#">Giới thiệu</a></li>
                    <li><a href="#">Liên hệ</a></li>
                    <li><a href="#">Tuyển dụng</a></li>
                    <li><a href="#">Điều khoản</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>Hỗ trợ khách hàng</h4>
                <ul>
                    <li><a href="#">Câu hỏi thường gặp</a></li>
                    <li><a href="#">Hướng dẫn đăng tin</a></li>
                    <li><a href="#">Báo giá quảng cáo</a></li>
                </ul>
            </div>
            <div class="footer-column">
                <h4>Kết nối với chúng tôi</h4>
                <ul>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Youtube</a></li>
                    <li><a href="#">Zalo</a></li>
                    <li><a href="#">LinkedIn</a></li>
                </ul>
            </div>
             <div class="footer-column">
                <h4>Tải ứng dụng</h4>
                <p>Truy cập nhanh chóng và tiện lợi hơn với ứng dụng di động của chúng tôi.</p>
                <a href="#" aria-label="Tải về từ App Store"><img src="assets/images/placeholder-appstore.png" alt="App Store" style="width:120px; height:auto; margin-bottom:5px; margin-right:5px;"></a>
                <a href="#" aria-label="Tải về từ Google Play"><img src="assets/images/placeholder-playstore.png" alt="Google Play" style="width:120px; height:auto; margin-bottom:5px;"></a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} Tên Công Ty Của Bạn. Bảo lưu mọi quyền.</p>
        </div>
    </footer>
`;
// Class SiteFooter giữ nguyên
class SiteFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(footerTemplate.content.cloneNode(true));
    }
}
customElements.define('site-footer', SiteFooter);
