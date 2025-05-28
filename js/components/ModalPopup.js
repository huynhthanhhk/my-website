// js/components/ModalPopup.js
const modalTemplate = document.createElement('template');
modalTemplate.innerHTML = `
    <style>
        /* CSS cho popup.css */
        :host {
            display: none; /* Hidden by default */
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        :host([open]) {
            display: flex;
        }
        .popup-content {
            background-color: var(--white-color);
            padding: 25px;
            border-radius: var(--border-radius);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            width: 90%;
            max-width: 600px; /* Default max-width */
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
        }
        .popup-close-btn {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.8em;
            cursor: pointer;
            color: var(--dark-gray-color);
        }
        .popup-close-btn:hover {
            color: var(--primary-color);
        }
        ::slotted(h2) { /* Style the H2 if passed via slot */
            margin-top: 0;
            color: var(--secondary-color);
            padding-bottom: 10px;
            border-bottom: 1px solid var(--light-gray-color);
            margin-bottom: 15px;
        }
    </style>
    <div class="popup-content">
        <button class="popup-close-btn" aria-label="Đóng popup">&times;</button>
        <slot></slot> </div>
`;

class ModalPopup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(modalTemplate.content.cloneNode(true));
        this._closeButton = this.shadowRoot.querySelector('.popup-close-btn');
        this._popupContent = this.shadowRoot.querySelector('.popup-content');
    }

    connectedCallback() {
        this._closeButton.addEventListener('click', () => this.close());
        // Close on escape key
        this.boundHandleEscape = this._handleEscape.bind(this);
        // Close on backdrop click
        this.boundHandleBackdropClick = this._handleBackdropClick.bind(this);
    }

    disconnectedCallback() {
        // Clean up event listeners if the element is removed from DOM
        document.removeEventListener('keydown', this.boundHandleEscape);
        this.removeEventListener('click', this.boundHandleBackdropClick);
    }

    _handleEscape(event) {
        if (event.key === 'Escape') {
            this.close();
        }
    }

    _handleBackdropClick(event) {
        // Close if clicked directly on the host (backdrop), not on the content
        if (event.target === this) {
            this.close();
        }
    }

    get open() {
        return this.hasAttribute('open');
    }

    set open(isOpen) {
        if (isOpen) {
            this.setAttribute('open', '');
        } else {
            this.removeAttribute('open');
        }
    }

    show() {
        this.open = true;
        document.addEventListener('keydown', this.boundHandleEscape);
        this.addEventListener('click', this.boundHandleBackdropClick);
        // Focus management can be added here for accessibility
        this._closeButton.focus();
    }

    close() {
        this.open = false;
        document.removeEventListener('keydown', this.boundHandleEscape);
        this.removeEventListener('click', this.boundHandleBackdropClick);
    }

    static get observedAttributes() {
        return ['open'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open') {
            // Could trigger events or other side effects if needed
        }
    }
}
customElements.define('modal-popup', ModalPopup);
