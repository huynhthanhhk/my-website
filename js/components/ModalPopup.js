// js/components/ModalPopup.js
const modalTemplate = document.createElement('template');
modalTemplate.innerHTML = `
    <style>
        :host(.full-width) .popup-content-wrapper {
            max-width: 100vw; /* Hoặc 100% nếu padding của :host là 0 */
            width: 100vw;   /* Chiếm toàn bộ chiều rộng viewport */
            height: 100vh;  /* Chiếm toàn bộ chiều cao viewport */
            max-height: 100vh;
            border-radius: 0; /* Bỏ bo góc cho full screen */
            margin: 0; /* Bỏ margin nếu có */
        }
        :host {
            display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.6); z-index: 1000;
            justify-content: center; align-items: center; padding: 15px;
            box-sizing: border-box;
        }
        :host([open]) { display: flex; }

        .popup-content-wrapper {
            background-color: var(--background-color, #fff);
            border-radius: var(--border-radius, 5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            width: 100%;
            max-width: var(--modal-max-width, 600px); 
            max-height: 90vh; 
            display: flex;
            flex-direction: column;
            overflow: hidden; 
            transform: scale(0.95);
            opacity: 0;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease-out;
        }
        :host([open]) .popup-content-wrapper { transform: scale(1); opacity: 1; }

        .popup-header {
            background-color: transparent !important; /* LUÔN TRONG SUỐT */
            border-bottom: none !important; /* Bỏ border mặc định */
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0; 
            position: sticky; 
            top: 0;
            z-index: 1000; 
            padding: 0; 
        }
        /* Nếu là PDP modal, main.css sẽ style .pdp-header (slotted) có nền đen mờ ban đầu */
       
        :host(.product-detail-modal) .popup-header h2#popupTitleModalGeneratedInternal,
        :host(.product-detail-modal) .popup-close-btn {
            color: var(--text-color-inverted, #fff); /* Chữ/icon trắng trên nền PDP header */
        }


        .popup-header ::slotted(div[slot="header"]) { /* Cho phép div slot chiếm không gian */
            flex-grow: 1; /* Để nó chiếm không gian và đẩy nút X về cuối nếu cần */
            display: flex;
             width: 100%; 
            justify-content: space-between;
            align-items: center;
            min-width: 0; /* Giúp flex-grow hoạt động tốt với nội dung dài */
        }
        /* H2 mặc định nếu không có gì slot */
        .popup-header h2#popupTitleModalGeneratedInternal { 
            margin: 0; 
            padding: 10px 15px;
            font-size: 1.2rem; 
            color: var(--secondary-color, #004238); /* Màu tối cho tiêu đề mặc định (trên nền trắng) */
            flex-grow: 1; 
            line-height: 1.4;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .popup-close-btn { 
            background: none; border: none; font-size: 1.8rem; font-weight: bold;
            cursor: pointer; 
            color: var(--dark-gray-color, #6c757d); /* Màu tối cho nút X mặc định (trên nền trắng) */
            line-height: 1; padding: 10px 15px; 
            flex-shrink: 0; /* Không cho nút X bị co lại */
        }
        /* Sửa lại selector này */
        :host(.no-default-close-btn) .popup-close-btn { 
            display: none !important; /* Quan trọng: Ẩn nút X mặc định nếu có class */
        }
        .popup-close-btn:hover { 
            color: var(--primary-color, #53b966); 
        }

        .popup-body { 
            padding: 0; 
            overflow-y: auto; 
            flex-grow: 1; 
            -webkit-overflow-scrolling: touch; 
        }
        .popup-body:focus {
            outline: none; /* Bỏ outline mặc định khi focus vào vùng cuộn */
        }

        .popup-footer {
            padding: 10px 15px; border-top: 1px solid var(--medium-gray-color, #eee);
            text-align: right; flex-shrink: 0; 
            background-color: var(--light-gray-color, #f9f9f9);
        }
    </style>
    <div class="popup-content-wrapper" role="dialog" aria-modal="true" aria-labelledby="popupTitleModalGeneratedInternal">
        <div class="popup-header" id="internalModalHeader">
            <slot name="header"><h2 id="popupTitleModalGeneratedInternal">Tiêu đề Popup</h2></slot>
            <button class="popup-close-btn" aria-label="Đóng popup">&times;</button>
        </div>
        <div class="popup-body" id="modalBodyScroller"> <slot></slot>
        </div>
        <div class="popup-footer"><slot name="footer"></slot></div>
    </div>
`;

class ModalPopup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(modalTemplate.content.cloneNode(true));
        
        this._closeButton = this.shadowRoot.querySelector('.popup-close-btn');
        this._wrapper = this.shadowRoot.querySelector('.popup-content-wrapper');
        this._headerSlot = this.shadowRoot.querySelector('slot[name="header"]');
        this._defaultSlot = this.shadowRoot.querySelector('slot:not([name])'); 
        this._modalBodyScroller = this.shadowRoot.getElementById('modalBodyScroller'); 
        this._defaultTitleEl = this.shadowRoot.getElementById('popupTitleModalGeneratedInternal');
        
        this.boundHandleEscape = this._handleEscape.bind(this);
    }

    connectedCallback() {
        this._closeButton.addEventListener('click', () => this.close());
        this._updateAriaLabelledBy(); 
    }

    disconnectedCallback() { 
        document.removeEventListener('keydown', this.boundHandleEscape);
        if (this.open) {
             document.body.classList.remove('no-scroll');
        }
    }

    _handleEscape(event) { if (event.key === 'Escape') this.close(); }
    _handleBackdropClick(event) { if (event.target === this) this.close(); }

    get open() { return this.hasAttribute('open'); }
    set open(isOpen) { 
        if (isOpen) this.setAttribute('open', '');
        else this.removeAttribute('open');
    }

    _updateAriaLabelledBy() {
        let titleElement;
        const assignedHeaderNodes = this._headerSlot.assignedElements({flatten: true});
        
        if (assignedHeaderNodes.length > 0 && !(assignedHeaderNodes.length === 1 && assignedHeaderNodes[0] === this._defaultTitleEl && this._defaultTitleEl.textContent === "Tiêu đề Popup")) {
            const customTitleContainer = assignedHeaderNodes.find(el => 
                (el.id === 'pdp-title-fixed' || el.id === 'contact-form-modal-title') && el.tagName === 'H2' || 
                el.matches('h2') || el.querySelector('h2')
            );
            if (customTitleContainer) {
                 titleElement = customTitleContainer.matches('h2') ? customTitleContainer : customTitleContainer.querySelector('h2');
                 if (titleElement && !titleElement.id) titleElement.id = `modal-title-slot-${Math.random().toString(36).substring(2,9)}`;
            }
        }
        if (!titleElement) {
            titleElement = this._defaultTitleEl;
            if(!titleElement.id) titleElement.id = 'popupTitleModalGeneratedInternal'; // Đảm bảo ID mặc định có
        }
        
        if (titleElement && titleElement.id) {
            this._wrapper.setAttribute('aria-labelledby', titleElement.id);
        } else {
             this._wrapper.removeAttribute('aria-labelledby');
        }
    }

    show() {
        this.open = true; 
        document.body.classList.add('no-scroll'); 
        document.addEventListener('keydown', this.boundHandleEscape);
        this.addEventListener('click', this.boundHandleBackdropClick);
        this._updateAriaLabelledBy(); 

        // KHÔI PHỤC VIỆC RESET SCROLL VÀ ĐẶT NÓ Ở ĐÂY
        if (this._modalBodyScroller) {
            this._modalBodyScroller.scrollTop = 0;
        }

        requestAnimationFrame(() => { 
            // Reset scroll một lần nữa để chắc chắn sau khi DOM ổn định
             if (this._modalBodyScroller) {
                this._modalBodyScroller.scrollTop = 0;
            }

            // Logic focus: ưu tiên vùng cuộn
            if (this._modalBodyScroller) {
                if (!this._modalBodyScroller.hasAttribute('tabindex')) {
                    this._modalBodyScroller.setAttribute('tabindex', '-1');
                }
                this._modalBodyScroller.focus({ preventScroll: true }); 
            } else if (this._wrapper) { 
                if (!this._wrapper.hasAttribute('tabindex')) {
                     this._wrapper.setAttribute('tabindex', '-1');
                }
                this._wrapper.focus({ preventScroll: true }); 
            } else {
                this._closeButton.focus({ preventScroll: true });
            }
        });
    }

    close() { 
        this.open = false;
        document.body.classList.remove('no-scroll'); 
        document.removeEventListener('keydown', this.boundHandleEscape);
        this.removeEventListener('click', this.boundHandleBackdropClick);
        this.dispatchEvent(new CustomEvent('popup-closed', {bubbles: true, composed: true}));
    }

    setHeaderTitle(titleText) { 
        this._updateAriaLabelledBy(); 
        let titleElement = this.shadowRoot.getElementById(this._wrapper.getAttribute('aria-labelledby'));
        if (!titleElement) titleElement = this._defaultTitleEl;
        if (titleElement) titleElement.textContent = titleText;
    }

    setBodyContent(htmlContentOrNode) { 
        const assignedElements = this._defaultSlot.assignedElements({flatten: true});
        assignedElements.forEach(el => el.remove());
        if (typeof htmlContentOrNode === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContentOrNode;
            Array.from(tempDiv.children).forEach(child => this.appendChild(child));
        } else if (htmlContentOrNode instanceof Node) {
            this.appendChild(htmlContentOrNode);
        }
    }
}
customElements.define('modal-popup', ModalPopup);