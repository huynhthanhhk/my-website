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
        const backgroundImageUrl = this.getAttribute('background-image-url') || 'https://placehold.co/1100x500/cccccc/FFFFFF?text=Placeholder';

        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                :host {
                    display: block; /* Cho phép đặt max-width */
                    max-width: var(--container-max-width, 1100px);
                    margin-left: auto;
                    margin-right: auto;
                    /* Section Hero: Full width (không padding, margin) - áp dụng cho nội dung bên trong để nó chạm tới max-width */
                }
                .hero-container {
                    width: 100%; /* Chiếm toàn bộ max-width của :host */
                    aspect-ratio: 2.2 / 1; /* W/H = 2.2/1 */
                    background-image: linear-gradient(rgba(0, 66, 56, 0.65), rgba(0, 66, 56, 0.65)), url(${backgroundImageUrl});
                    background-size: cover;
                    background-position: center;
                    color: var(--text-color-light, #FFFFFF);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 2rem; /* Thêm padding nội bộ cho nội dung không bị sát viền */
                    border-radius: var(--border-radius-lg, 8px); /* Bo góc nhẹ cho hero */
                    overflow: hidden; /* Đảm bảo gradient và ảnh nền nằm gọn trong border-radius */
                }
                .title { /* Kế thừa màu từ .hero-container */
                    /* Không cần đặt màu riêng ở đây nếu .hero-container đã có */
                }
                .button-action {
                    background-color: var(--primary-color, #53b966);
                    color: var(--text-color-light, #FFFFFF);
                    transition: background-color 0.3s ease, transform 0.2s ease;
                    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
                }
                .button-action:hover {
                    background-color: color-mix(in srgb, var(--primary-color, #53b966) 85%, black);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
                }
            </style>
            <section class="hero-container">
                <div class="max-w-2xl"> <h1 class="title text-3xl md:text-5xl font-bold mb-4">${titleText}</h1>
                    <p class="text-md md:text-lg mb-8">${subtitleText}</p>
                    <button class="button-action font-semibold py-3 px-8 rounded-lg text-base md:text-lg">
                        ${buttonText}
                    </button>
                </div>
            </section>
        `;
    }
}
customElements.define('hero-section', HeroSection);
