// js/components/SiteFooter.js
const footerTemplate = document.createElement('template');
footerTemplate.innerHTML = `
    <style>
        :host {
            display: block; /* Quan trọng cho custom element */
            width: 100%;
        }
        footer {
            /* background-color được đặt ở đây để áp dụng cho toàn bộ chiều rộng */
            background-color: var(--light-gray-color, #f4f4f4); /* Màu nền cho toàn bộ footer */
            
            padding: 40px 0 20px 0; 
            margin-top: 30px; 
            width: 100%; /* Đảm bảo footer chiếm toàn bộ chiều rộng của :host */
            border-top: 1px solid var(--medium-gray-color, #ddd); /* Giữ lại đường viền trên nhẹ nhàng */
            box-sizing: border-box;
        }
        .footer-container { /* Container này giới hạn nội dung bên trong */
            max-width: var(--max-width-container, 1100px);
            margin: 0 auto;
            padding: 0 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 30px;
        }
        .footer-column h4 { 
            color: var(--secondary-color, #004238); 
            margin-bottom: 15px; 
            font-size: 1.1em; 
        }
        .footer-column ul { 
            list-style: none; 
            padding: 0; 
            margin: 0; 
        }
        .footer-column ul li { 
            margin-bottom: 10px; 
        }
        .footer-column ul li a { 
            color: var(--text-color-light, #555); 
            text-decoration: none; 
            font-size: 0.95em; 
        }
        .footer-column ul li a:hover { 
            color: var(--primary-color, #53b966); 
            text-decoration: underline; 
        }
        .footer-column p { 
            color: var(--dark-gray-color, #6c757d); 
            font-size: 0.9em; 
            margin-bottom:10px; 
        }
        .footer-column .app-badges a { 
            display: inline-block; 
            margin-bottom: 5px; 
            margin-right: 5px; 
        }
        .footer-column .app-badges img { 
            width:120px; 
            height:auto; 
            opacity: 0.8; 
            transition: opacity 0.3s ease; 
        }
        .footer-column .app-badges img:hover { 
            opacity: 1; 
        }
        .footer-bottom {
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px;
            border-top: 1px solid var(--medium-gray-color, #ddd); 
            font-size: 0.85em; 
            color: var(--dark-gray-color, #6c757d);
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
                <h4>Kết nối</h4>
                <ul>
                    <li><a href="#">Facebook</a></li>
                    <li><a href="#">Youtube</a></li>
                    <li><a href="#">Zalo</a></li>
                    <li><a href="#">LinkedIn</a></li>
                </ul>
            </div>
             <div class="footer-column">
                <h4>Tải ứng dụng</h4>
                <p>Truy cập nhanh và tiện lợi hơn.</p>
                <div class="app-badges">
                    <a href="#" aria-label="Tải về từ App Store"><img src="assets/images/placeholder-appstore.png" alt="App Store"></a>
                    <a href="#" aria-label="Tải về từ Google Play"><img src="assets/images/placeholder-playstore.png" alt="Google Play"></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} Your Company Name. Bảo lưu mọi quyền.</p>
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