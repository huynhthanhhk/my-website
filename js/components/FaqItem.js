// js/components/FaqItem.js
const faqItemTemplate = document.createElement('template');
faqItemTemplate.innerHTML = `
    <style>
        :host { display: block; margin-bottom: 12px; } /* Tăng margin */
        .faq-item-container {
            border: 1px solid var(--medium-gray-color, #ccc);
            border-radius: var(--border-radius, 5px); overflow: hidden;
            background-color: var(--background-color);
        }
        .faq-question {
            background-color: transparent; /* Bỏ màu nền để giống khối filter */
            padding: 15px; /* Tăng padding */
            cursor: pointer; display: flex; justify-content: space-between; align-items: center;
            font-weight: 600; color: var(--secondary-color, #004238);
            border-bottom: 1px solid transparent; /* Chuẩn bị cho border khi mở */
             transition: background-color 0.2s ease;
        }
        .faq-question:hover { background-color: var(--light-gray-color, #f4f4f4); }
        .faq-question span { flex-grow: 1; line-height: 1.4; } /* Cải thiện line-height */
        .toggle-icon { font-size: 1.3em; transition: transform 0.3s ease; color: var(--primary-color); }
        .faq-answer {
            padding: 0px 15px; max-height: 0; overflow: hidden;
            transition: max-height 0.35s ease-out, padding 0.35s ease-out;
            font-size: 0.95em; line-height: 1.7; color: var(--text-color-light, #555);
        }
        .faq-answer p { margin-top: 0; margin-bottom: 10px; }
        .faq-answer p:last-child { margin-bottom: 0; }
        .faq-meta { font-size: 0.8em; color: var(--dark-gray-color, #6c757d); margin-top: 10px; font-style: italic; }
        :host([open]) .faq-question {
            /* background-color: var(--light-gray-color); */ /* Không cần đổi màu nền khi mở nữa */
            border-bottom-color: var(--medium-gray-color, #ccc);
        }
        :host([open]) .faq-answer { padding: 15px; max-height: 600px; }
        :host([open]) .toggle-icon { transform: rotate(135deg); } /* Đổi icon thành 'x' (45+90) hoặc mũi tên lên */
    </style>
    <details class="faq-item-container" ontoggle="this.getRootNode().host._handleToggleDetails()">
        <summary class="faq-question" id="questionHeader" role="button">
            <span><slot name="question">Câu hỏi mặc định?</slot></span>
            <span class="toggle-icon" aria-hidden="true">+</span>
        </summary>
        <div class="faq-answer" id="answerContent">
            <slot name="answer"><p>Câu trả lời mặc định.</p></slot>
            <div class="faq-meta">
                Cập nhật: <slot name="last-updated">N/A</slot>
            </div>
        </div>
    </details>
`;
class FaqItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).appendChild(faqItemTemplate.content.cloneNode(true));
        this._detailsElement = this.shadowRoot.querySelector('details');
        this._summaryElement = this.shadowRoot.querySelector('summary'); // Summary là trigger mặc định
        this._toggleIcon = this.shadowRoot.querySelector('.toggle-icon');
    }
    connectedCallback() {
        // Sử dụng thuộc tính 'open' của <details>
        if (this.hasAttribute('open')) this._detailsElement.open = true;
        else this._detailsElement.open = false; // Đảm bảo trạng thái ban đầu đúng
        this._updateIcon(); // Cập nhật icon ban đầu
    }
    // Được gọi bởi ontoggle của <details>
    _handleToggleDetails() {
        this.toggleAttribute('open', this._detailsElement.open);
        this._updateIcon();
    }
    _updateIcon() {
        this._toggleIcon.textContent = this._detailsElement.open ? '−' : '+'; // Hoặc dùng SVG icons
        if (this._detailsElement.open) this._toggleIcon.style.transform = 'rotate(0deg)'; // Hoặc không rotate nếu là dấu trừ
        else this._toggleIcon.style.transform = 'rotate(0deg)';

        // Nếu muốn hiệu ứng xoay cho dấu + -> x
        // if (this._detailsElement.open) {
        //    this._toggleIcon.style.transform = 'rotate(135deg)';
        //    this._toggleIcon.textContent = '+'; // Giữ dấu + và xoay
        // } else {
        //    this._toggleIcon.style.transform = 'rotate(0deg)';
        //    this._toggleIcon.textContent = '+';
        // }
    }
    static get observedAttributes() { return ['open']; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open' && this._detailsElement) {
            const isOpen = this.hasAttribute('open');
            if (this._detailsElement.open !== isOpen) {
                this._detailsElement.open = isOpen;
            }
            this._updateIcon();
        }
    }
}
customElements.define('faq-item', FaqItem);