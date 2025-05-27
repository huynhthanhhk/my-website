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
            { name: 'Hồ bơi vô cực', icon: '🌊' },
            { name: 'Phòng Gym hiện đại', icon: '🏋️' },
            { name: 'Khu vui chơi trẻ em', icon: '🧸' },
            { name: 'Công viên cây xanh', icon: '🌳' },
            { name: 'An ninh 24/7', icon: '🛡️' },
            { name: 'Trung tâm thương mại', icon: '🛍️' },
            { name: 'Nhà hàng & Cafe', icon: '☕' },
            { name: 'Khu BBQ ngoài trời', icon: '🍖' },
            { name: 'Thư viện cộng đồng', icon: '📚' },
            { name: 'Đường dạo bộ', icon: '🚶‍♀️' }
        ];

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
                    font-weight: 700;
                    color: var(--secondary-color, #004238);
                    margin-bottom: 1.5rem; /* mb-6 */
                    border-bottom: 2px solid var(--primary-color, #53b966);
                    padding-bottom: 0.5rem;
                }
                .amenities-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem; /* gap-6 */
                }
                .amenity-item {
                    display: flex;
                    align-items: center;
                    padding: 1rem; /* p-4 */
                    background-color: var(--background-color-light, #f9fafb);
                    border-radius: var(--border-radius-md, 6px);
                    border: 1px solid #e5e7eb; /* border-gray-200 */
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .amenity-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .amenity-icon {
                    font-size: 1.75rem; /* text-3xl */
                    margin-right: 1rem; /* mr-4 */
                    color: var(--primary-color, #53b966);
                }
                .amenity-name {
                    font-weight: 500; /* font-medium */
                    color: var(--text-color-dark, #1f2937);
                }
            </style>
            <section>
                <h2>Tiện Ích Vượt Trội</h2>
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
