// components/hero-section.js
class HeroSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['title-text', 'subtitle-text', 'button-text', 'background-image-url'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const titleText = this.getAttribute('title-text') || 'Tiêu đề mặc định';
        const subtitleText = this.getAttribute('subtitle-text') || 'Phụ đề mặc định.';
        const buttonText = this.getAttribute('button-text') || 'Nút';
        const backgroundImageUrl = this.getAttribute('background-image-url') || 'https://placehold.co/1920x800/cccccc/FFFFFF?text=Placeholder';

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com'); /* Import Tailwind vào Shadow DOM */
                /* Thêm các biến màu nếu cần truy cập trực tiếp mà không qua var() từ global.css */
                :host { /* Áp dụng cho chính web component tag */
                    display: block; /* Để component chiếm không gian */
                }
                .hero-container {
                    background-image: linear-gradient(rgba(0, 66, 56, 0.7), rgba(0, 66, 56, 0.7)), url(${backgroundImageUrl});
                    background-size: cover;
                    background-position: center;
                    color: var(--text-color-light, #FFFFFF); /* Sử dụng biến từ global.css, fallback nếu không có */
                }
                .title {
                    color: var(--text-color-light, #FFFFFF); /* Đảm bảo tiêu đề màu sáng */
                }
                .button-primary {
                    background-color: var(--primary-color, #53b966);
                    color: var(--text-color-light, #FFFFFF);
                    transition: background-color 0.3s ease;
                }
                .button-primary:hover {
                    background-color: color-mix(in srgb, var(--primary-color, #53b966) 85%, black);
                }
            </style>
            <section class="hero-container w-full h-[60vh] md:h-[80vh] flex flex-col justify-center items-center text-center p-6 md:p-12">
                <div class="max-w-3xl">
                    <h1 class="title text-4xl md:text-6xl font-bold mb-4 animate-fade-in-down">${titleText}</h1>
                    <p class="text-lg md:text-xl mb-8 animate-fade-in-up">${subtitleText}</p>
                    <button class="button-primary font-semibold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 animate-fade-in-up-delay">
                        ${buttonText}
                    </button>
                </div>
            </section>
            <style>
                /* Basic animations */
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
                .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.2s forwards; }
                .animate-fade-in-up-delay { animation: fade-in-up 0.8s ease-out 0.4s forwards; }
            </style>
        `;
    }
}
customElements.define('hero-section', HeroSection);

