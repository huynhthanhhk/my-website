// components/broker-contact-section.js
class BrokerContactSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // Dữ liệu mẫu, bạn có thể truyền qua attributes sau này
        const broker = {
            name: 'Nguyễn Văn An',
            title: 'Chuyên viên Tư vấn BĐS Cao cấp',
            phone: '0987 654 321',
            email: 'an.nguyen@realestate.vn',
            imageUrl: 'https://placehold.co/200x200/004238/FFFFFF?text=Broker+An',
            social: [
                { name: 'Zalo', link: '#zalo-link', icon: '📱' }, // Thay icon bằng SVG nếu muốn đẹp hơn
                { name: 'Facebook', link: '#facebook-link', icon: '👍' }
            ]
        };

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                /* Sử dụng class section-card từ global.css, tùy chỉnh lại padding */
                .contact-card {
                    background-color: var(--background-color-white, #FFFFFF);
                    padding: calc(var(--spacing-unit) * 2.5); /* p-5 */
                    border-radius: var(--border-radius-xl, 12px);
                    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
                    text-align: center; /* Căn giữa nội dung trong card */
                }
                .contact-card h2 {
                    font-size: 1.25rem; /* text-xl */
                    font-weight: 700;
                    color: var(--secondary-color, #004238);
                    margin-bottom: calc(var(--spacing-unit) * 2); /* mb-4 */
                }
                .broker-image {
                    width: 100px; /* w-25 */
                    height: 100px; /* h-25 */
                    border-radius: 50%; /* rounded-full */
                    object-fit: cover;
                    margin-left: auto;
                    margin-right: auto;
                    margin-bottom: 1rem; /* mb-4 */
                    border: 3px solid var(--primary-color, #53b966);
                }
                .broker-name {
                    font-size: 1.125rem; /* text-lg */
                    font-weight: 600; /* font-semibold */
                    color: var(--secondary-color, #004238);
                    margin-bottom: 0.25rem; /* mb-1 */
                }
                .broker-title {
                    font-size: 0.875rem; /* text-sm */
                    color: var(--text-color-medium, #4b5563);
                    margin-bottom: 1rem; /* mb-4 */
                }
                .contact-info p {
                    font-size: 0.9375rem; /* gần text-base */
                    color: var(--text-color-dark, #1f2937);
                    margin-bottom: 0.5rem; /* mb-2 */
                    display: flex;
                    align-items: center;
                    justify-content: center; /* Căn giữa icon và text */
                }
                .contact-info p svg, .contact-info p .icon-placeholder {
                    margin-right: 0.5rem; /* mr-2 */
                    color: var(--primary-color, #53b966);
                    width: 1.25rem; /* w-5 */
                    height: 1.25rem; /* h-5 */
                }
                .contact-info a {
                    color: var(--primary-color, #53b966);
                    text-decoration: none;
                    transition: color 0.2s ease;
                }
                .contact-info a:hover {
                    color: var(--secondary-color, #004238);
                    text-decoration: underline;
                }
                .social-links {
                    margin-top: 1rem; /* mt-4 */
                    display: flex;
                    justify-content: center;
                    gap: 1rem; /* gap-4 */
                }
                .social-links a {
                    color: var(--secondary-color, #004238);
                    font-size: 1.5rem; /* text-2xl */
                    transition: color 0.2s ease;
                }
                .social-links a:hover {
                    color: var(--primary-color, #53b966);
                }
            </style>
            <section class="contact-card">
                <h2>Liên Hệ Tư Vấn Viên</h2>
                <img src="${broker.imageUrl}" alt="Ảnh nhà môi giới ${broker.name}" class="broker-image">
                <p class="broker-name">${broker.name}</p>
                <p class="broker-title">${broker.title}</p>
                <div class="contact-info text-left mx-auto max-w-xs"> <p>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <a href="tel:${broker.phone}">${broker.phone}</a>
                    </p>
                    <p>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <a href="mailto:${broker.email}">${broker.email}</a>
                    </p>
                </div>
                <div class="social-links">
                    ${broker.social.map(item => `<a href="${item.link}" title="${item.name}" target="_blank" rel="noopener noreferrer">${item.icon}</a>`).join('')}
                </div>
                <button class="mt-6 w-full bg-secondary text-text-light font-semibold py-2.5 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Yêu Cầu Gọi Lại</button>
            </section>
        `;
    }
}
customElements.define('broker-contact-section', BrokerContactSection);
