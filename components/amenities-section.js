// components/amenities-section.js
class AmenitiesSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const amenities = [
            { name: 'Hồ bơi chuẩn Olympic', icon: '🏊' },
            { name: 'Gym & Fitness Center', icon: '🏋️‍♂️' },
            { name: 'Khu vui chơi trẻ em', icon: '🎈' },
            { name: 'Vườn thiền & Yoga', icon: '🧘‍♀️' },
            { name: 'An ninh đa lớp 24/7', icon: '📹' },
            { name: 'Sảnh Lounge sang trọng', icon: '🛋️' },
            { name: 'Nhà hàng & Cafe sân vườn', icon: '🍽️' },
            { name: 'Khu BBQ tiệc ngoài trời', icon: '🔥' },
            { name: 'Thư viện đọc sách', icon: '📖' },
            { name: 'Đường dạo bộ ven hồ', icon: '👟' },
            { name: 'Bãi đậu xe thông minh', icon: '🅿️' },
            { name: 'Dịch vụ quản gia', icon: '🛎️' }
        ];

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                /* Sử dụng class section-card từ global.css */
                .amenities-card {
                    /* Kế thừa từ .section-card */
                }
                .amenities-card h2 {
                    /* Kế thừa từ .section-card h2 */
                }
                .amenities-grid {
                    display: grid;
                    /* Responsive grid: 2 cột trên mobile, 3 cột trên tablet trở lên */
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 1rem; /* gap-4 */
                }
                @media (min-width: 768px) { /* md breakpoint */
                    .amenities-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                        gap: 1.5rem; /* gap-6 */
                    }
                }
                .amenity-item {
                    display: flex;
                    align-items: center;
                    padding: 0.75rem; /* p-3 */
                    background-color: var(--background-color-light, #f9fafb);
                    border-radius: var(--border-radius-md, 6px);
                    border: 1px solid #e5e7eb; /* border-gray-200 */
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .amenity-item:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
                }
                .amenity-icon {
                    font-size: 1.5rem; /* text-2xl */
                    margin-right: 0.75rem; /* mr-3 */
                    color: var(--primary-color, #53b966);
                    flex-shrink: 0;
                }
                .amenity-name {
                    font-weight: 500; /* font-medium */
                    color: var(--text-color-dark, #1f2937);
                    font-size: 0.9375rem; /* text-sm gần base */
                }
            </style>
            <section class="section-card amenities-card">
                <h2>Hệ Thống Tiện Ích Đẳng Cấp</h2>
                <div class="amenities-grid">
                    ${amenities.map(amenity => `
                        <div class="amenity-item">
                            <span class="amenity-icon">${amenity.icon}</span>
                            <span class="amenity-name">${amenity.name}</span>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }
}
customElements.define('amenities-section', AmenitiesSection);
