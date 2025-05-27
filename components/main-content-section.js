// components/main-content-section.js
class MainContentSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                /* Sử dụng class section-card từ global.css */
                .main-card { /* Tên class riêng cho section này nếu cần tùy chỉnh thêm */
                    /* Kế thừa từ .section-card */
                }
                .main-card h2 {
                    /* Kế thừa từ .section-card h2 */
                }
                .main-card p {
                    color: var(--text-color-medium, #4b5563);
                    line-height: 1.7;
                    margin-bottom: 1rem; /* mb-4 */
                }
                 .highlight-primary {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                .highlight-secondary {
                    color: var(--secondary-color);
                    font-weight: 600;
                }
            </style>
            <section class="section-card main-card">
                <h2>Chào Mừng Đến Với Không Gian Sống Đẳng Cấp</h2>
                <p>Chúng tôi tự hào giới thiệu đến quý vị những dự án bất động sản <span class="highlight-primary">ưu việt</span>, kết hợp hài hòa giữa thiết kế hiện đại, không gian xanh mát và hệ thống tiện ích đồng bộ. Mỗi căn nhà không chỉ là một nơi ở, mà còn là một <span class="highlight-secondary">tổ ấm</span> vun đắp hạnh phúc và khởi nguồn cho những thành công mới.</p>
                <p>Hãy cùng chúng tôi khám phá những giá trị sống đích thực và cơ hội đầu tư không thể bỏ lỡ tại các vị trí vàng, được quy hoạch bài bản và phát triển bởi những chủ đầu tư uy tín hàng đầu.</p>
            </section>
        `;
    }
}
customElements.define('main-content-section', MainContentSection);
