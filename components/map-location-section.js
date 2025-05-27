// components/map-location-section.js
class MapLocationSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const mapEmbedUrl = this.getAttribute('map-embed-url') || '';

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
                    margin-bottom: 1rem;
                    border-bottom: 2px solid var(--primary-color, #53b966);
                    padding-bottom: 0.5rem;
                }
                .map-placeholder {
                    width: 100%;
                    height: 400px;
                    background-color: #e9ecef; /* bg-gray-200 */
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: var(--border-radius-md, 6px);
                    color: var(--text-color-medium, #4b5563);
                    font-style: italic;
                }
                iframe {
                    border-radius: var(--border-radius-md, 6px);
                }
            </style>
            <section>
                <h2>Vị Trí Dự Án Trên Bản Đồ</h2>
                ${mapEmbedUrl ? `
                    <iframe src="${mapEmbedUrl}" width="100%" height="400" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                ` : `
                    <div class="map-placeholder">
                        <p>Bản đồ sẽ được hiển thị ở đây. <br/> (Ví dụ: Nhúng iframe từ Google Maps)</p>
                    </div>
                `}
                 <p class="mt-4 text-sm text-gray-600">Để hiển thị bản đồ thực tế, bạn có thể cung cấp URL nhúng qua thuộc tính 'map-embed-url' cho component này. Ví dụ: &lt;map-location-section map-embed-url="YOUR_GOOGLE_MAPS_EMBED_URL"&gt;&lt;/map-location-section&gt;</p>
            </section>
        `;
    }
}
customElements.define('map-location-section', MapLocationSection);
