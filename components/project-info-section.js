// components/project-info-section.js
class ProjectInfoSection extends HTMLElement {
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
                .project-info-card {
                    /* Kế thừa từ .section-card */
                }
                .project-info-card h2 {
                    /* Kế thừa từ .section-card h2 */
                }
                 .project-info-card h3 {
                    /* Kế thừa từ .section-card h3 */
                }
                .project-info-card p, .project-info-card li {
                    color: var(--text-color-medium, #4b5563);
                    line-height: 1.7;
                }
                .project-info-card ul {
                    list-style-type: disc;
                    padding-left: 1.5rem; /* pl-6 */
                    margin-bottom: 1rem;
                }
                .project-info-card .highlight {
                    color: var(--primary-color, #53b966);
                    font-weight: 600;
                }
            </style>
            <section class="section-card project-info-card">
                <h2>Thông Tin Chi Tiết Dự Án</h2>
                <p class="mb-4">Dự án <span class="highlight">EcoVista Residences</span> là một biểu tượng mới của cuộc sống thượng lưu, tọa lạc tại trung tâm thành phố với tầm nhìn panorama tuyệt đẹp. Nơi đây hội tụ những tinh hoa kiến trúc và tiện ích đẳng cấp quốc tế.</p>

                <h3>Tổng Quan</h3>
                <ul>
                    <li>Tên dự án: <span class="font-semibold">EcoVista Residences</span></li>
                    <li>Chủ đầu tư: Tập đoàn EcoBuild</li>
                    <li>Vị trí: Đại lộ Ánh Sao, Khu đô thị mới BrightCity</li>
                    <li>Quy mô: 15 hecta, 3 tòa tháp căn hộ hạng sang và 50 shophouse thương mại.</li>
                    <li>Mật độ xây dựng: 30%</li>
                </ul>

                <h3>Pháp Lý & Bàn Giao</h3>
                <p>Dự án sở hữu pháp lý minh bạch, sổ hồng lâu dài. Dự kiến bàn giao Quý II/2026 với tiêu chuẩn hoàn thiện cao cấp, nội thất từ các thương hiệu danh tiếng.</p>
            </section>
        `;
    }
}
customElements.define('project-info-section', ProjectInfoSection);
