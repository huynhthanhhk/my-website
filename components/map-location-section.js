// components/map-location-section.js
class MapLocationSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['map-embed-url'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'map-embed-url' && oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const mapEmbedUrl = this.getAttribute('map-embed-url') || '';

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                /* Sử dụng class section-card từ global.css */
                .map-card {
                    /* Kế thừa từ .section-card */
                }
                 .map-card h2 {
                    /* Kế thừa từ .section-card h2 */
                }
                .map-container {
                    width: 100%;
                    height: 350px; /* Chiều cao cố định cho bản đồ */
                    border-radius: var(--border-radius-md, 6px);
                    overflow: hidden; /* Đảm bảo iframe nằm gọn */
                }
                .map-placeholder {
                    background-color: #e9ecef; /* bg-gray-200 */
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    color: var(--text-color-medium, #4b5563);
                    font-style: italic;
                    height: 100%;
                    text-align: center;
                    padding: 1rem;
                }
                .map-container iframe {
                    width: 100%;
                    height: 100%;
                    border: 0;
                }
            </style>
            <section class="section-card map-card">
                <h2>Vị Trí Vàng Kết Nối Ngàn Tiện Ích</h2>
                <div class="map-container">
                ${mapEmbedUrl ? `
                    <iframe src="${mapEmbedUrl}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                ` : `
                    <div class="map-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p>Bản đồ vị trí dự án sẽ được hiển thị tại đây.</p>
                        <p class="text-xs mt-1">(Cấu hình thuộc tính 'map-embed-url' để nhúng bản đồ)</p>
                    </div>
                `}
                </div>
            </section>
        `;
    }
}
customElements.define('map-location-section', MapLocationSection);
