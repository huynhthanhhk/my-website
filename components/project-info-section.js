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
                :host {
                    display: block;
                    background-color: var(--background-color-white, #FFFFFF);
                    padding: 1.5rem; /* p-6 */
                    border-radius: var(--border-radius-lg, 8px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                h2 {
                    font-size: 1.75rem; /* text-2xl */
                    font-weight: 700; /* font-bold */
                    color: var(--secondary-color, #004238);
                    margin-bottom: 1rem; /* mb-4 */
                    border-bottom: 2px solid var(--primary-color, #53b966);
                    padding-bottom: 0.5rem; /* pb-2 */
                }
                h3 {
                    font-size: 1.25rem; /* text-xl */
                    font-weight: 600; /* font-semibold */
                    color: var(--secondary-color, #004238);
                    margin-top: 1.5rem; /* mt-6 */
                    margin-bottom: 0.75rem; /* mb-3 */
                }
                p, li {
                    color: var(--text-color-medium, #4b5563);
                    line-height: 1.7;
                }
                ul {
                    list-style-type: disc;
                    padding-left: 1.5rem; /* pl-6 */
                }
                .highlight {
                    color: var(--primary-color, #53b966);
                    font-weight: 600;
                }
            </style>
            <section>
                <h2>Thông Tin Chi Tiết Dự Án</h2>
                <p class="mb-4">Dự án <span class="highlight">EcoGreen City</span> là một khu đô thị hiện đại, tọa lạc tại vị trí đắc địa, mang đến không gian sống xanh và tiện nghi bậc nhất cho cư dân. Với thiết kế thông minh và hạ tầng đồng bộ, EcoGreen City hứa hẹn sẽ là nơi an cư lý tưởng và đầu tư sinh lời hấp dẫn.</p>

                <h3>Tổng Quan</h3>
                <ul>
                    <li>Tên dự án: <span class="font-semibold">EcoGreen City Premier</span></li>
                    <li>Chủ đầu tư: Tập đoàn Green Corp</li>
                    <li>Vị trí: Quận trung tâm, Thành phố Mới</li>
                    <li>Quy mô: 25 hecta, bao gồm 5 tòa tháp căn hộ và 100 biệt thự</li>
                    <li>Mật độ xây dựng: 35%</li>
                </ul>

                <h3>Pháp Lý</h3>
                <p>Dự án đã có đầy đủ giấy tờ pháp lý, sổ hồng từng căn, đảm bảo quyền lợi tối đa cho khách hàng.</p>

                <h3>Tiến Độ</h3>
                <p>Hiện tại, dự án đã hoàn thành 80% hạ tầng và đang trong giai đoạn mở bán đợt cuối. Dự kiến bàn giao vào Quý IV năm nay.</p>
            </section>
        `;
    }
}
customElements.define('project-info-section', ProjectInfoSection);
