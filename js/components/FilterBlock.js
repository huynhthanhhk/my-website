// js/components/FilterBlock.js
const filterBlockTemplate = document.createElement('template');
filterBlockTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            margin-bottom: 15px;
            overflow: hidden; /* Quan trọng để hiệu ứng đóng mở đẹp */
        }
        .filter-block-header {
            background-color: var(--light-gray-color);
            padding: 10px 15px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: bold;
            color: var(--secondary-color);
        }
        .filter-block-header:hover {
            background-color: #e0e0e0;
        }
        .filter-block-title {
            margin: 0;
        }
        .toggle-icon {
            transition: transform 0.3s ease;
            font-size: 1.2em; /* Kích thước icon */
        }
        .filter-block-content {
            padding: 15px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        :host([open]) .filter-block-content {
            max-height: 1000px; /* Một giá trị đủ lớn */
            padding: 15px; /* Khôi phục padding khi mở */
            border-top: 1px solid var(--medium-gray-color);
        }
        :host([open]) .toggle-icon {
            transform: rotate(180deg);
        }
        /* CSS cho các options bên trong */
        ::slotted(ul) {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        ::slotted(li) {
            margin-bottom: 8px;
        }
        ::slotted(label) {
            display: flex;
            align-items: center;
            cursor: pointer;
        }
        ::slotted(input[type="radio"]),
        ::slotted(input[type="checkbox"]) {
            margin-right: 8px;
        }
    </style>
    <div class="filter-block-header" id="header">
        <h4 class="filter-block-title">
            <slot name="title">Tiêu đề khối lọc</slot>
        </h4>
        <span class="toggle-icon">&#9660;</span> </div>
    <div class="filter-block-content" id="content">
        <slot name="content"></slot> </div>
`;

class FilterBlock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(filterBlockTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        this.shadowRoot.getElementById('header').addEventListener('click', () => {
            this.toggle();
        });

        // Mặc định mở nếu có attribute 'open'
        if (this.hasAttribute('open')) {
            this._open();
        } else {
            this._close();
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
    }

    _close() {
        this.removeAttribute('open');
    }

    static get observedAttributes() {
        return ['open'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        // Xử lý nếu 'open' thay đổi từ bên ngoài (ví dụ qua JS)
        if (name === 'open') {
            const content = this.shadowRoot.getElementById('content');
            if (this.hasAttribute('open')) {
                // Đã có CSS xử lý việc này qua :host([open])
            } else {
                // Đã có CSS xử lý việc này
            }
        }
    }
}
customElements.define('filter-block', FilterBlock);
