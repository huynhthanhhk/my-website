// js/components/SiteFooter.js
const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
    <style>
        /* CSS cho footer.css */
        :host {
            display: block;
        }
        footer {
            background-color: var(--secondary-color);
            color: #a0a0a0; /* Light text color for footer */
            padding: 30px 0;
            margin-top: 30px;
        }
        .footer-container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .footer-column h4 {
            color: var(--white-color);
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        .footer-column ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        .footer-column ul li {
            margin-bottom: 8px;
        }
        .footer-column ul li a {
            color: #a0a0a0;
            text-decoration: none;
        }
        .footer-column ul li a:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }
        .footer-bottom {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #335c55; /* Darker shade of secondary */
            font-size: 0.9em;
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
                </ul>
            </div>
             <div class="footer-column">
                <h4>Tải ứng dụng</h4>
                <p>Ứng dụng di động của chúng tôi</p>
                <img src="assets/images/placeholder-appstore.png" alt="App Store" style="width:120px; margin-right:5px;">
                <img src="assets/images/placeholder-playstore.png" alt="Google Play" style="width:120px;">
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} Tên Công Ty. Bảo lưu mọi quyền.</p>
        </div>
    </footer>
`;

class SiteFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(footerTemplate.content.cloneNode(true));
    }
}
customElements.define('site-footer', SiteFooter);
