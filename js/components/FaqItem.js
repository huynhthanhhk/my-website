// js/components/FaqItem.js
const faqItemTemplate = document.createElement('template');
faqItemTemplate.innerHTML = `
    <style>
        :host { display: block; margin-bottom: 10px; }
        .faq-item-container {
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        .faq-question {
            background-color: var(--light-gray-color);
            padding: 12px 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            color: var(--secondary-color);
        }
        .faq-question:hover {
            background-color: #e7e7e7;
        }
        .faq-question span { flex-grow: 1; }
        .toggle-icon {
            font-size: 1.3em;
            transition: transform 0.3s ease;
        }
        .faq-answer {
            padding: 0px 15px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
            font-size: 0.95em;
            line-height: 1.7;
            color: var(--text-color);
        }
        .faq-answer p { margin-top: 0; }
        .faq-meta {
            font-size: 0.8em;
            color: var(--dark-gray-color);
            margin-top: 10px;
            font-style: italic;
        }
        :host([open]) .faq-answer {
            padding: 15px;
            max-height: 500px; /* Giá trị đủ lớn cho nội dung */
            border-top: 1px solid var(--medium-gray-color);
        }
        :host([open]) .toggle-icon {
            transform: rotate(45deg); /* Icon 'x' hoặc '+' tùy ý */
        }
    </style>
    <div class="faq-item-container">
        <div class="faq-question" id="questionHeader">
            <span><slot name="question">Câu hỏi?</slot></span>
            <span class="toggle-icon" aria-hidden="true">+</span>
        </div>
        <div class="faq-answer" id="answerContent">
            <slot name="answer">Câu trả lời.</slot>
            <div class="faq-meta">
                Cập nhật lần cuối: <slot name="last-updated">Chưa rõ</slot>
            </div>
        </div>
    </div>
`;

class FaqItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(faqItemTemplate.content.cloneNode(true));
        this._header = this.shadowRoot.getElementById('questionHeader');
    }

    connectedCallback() {
        this._header.addEventListener('click', () => this.toggle());
        if (this.hasAttribute('open')) {
            this._open();
        }
    }

    toggle() {
        if (this.hasAttribute('open')) {
            this._close();
        } else {
            this._open();
        }
    }

    _open() {
        this.setAttribute('open', '');
        this._header.setAttribute('aria-expanded', 'true');
        this.shadowRoot.querySelector('.toggle-icon').textContent = '−'; // Dấu trừ khi mở
    }

    _close() {
        this.removeAttribute('open');
        this._header.setAttribute('aria-expanded', 'false');
        this.shadowRoot.querySelector('.toggle-icon').textContent = '+';
    }

    static get observedAttributes() {
        return ['open'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open') {
            // CSS handles visual changes
        }
    }
}
customElements.define('faq-item', FaqItem);
