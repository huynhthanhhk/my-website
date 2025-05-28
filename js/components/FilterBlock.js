// js/components/FilterBlock.js
const filterBlockTemplate = document.createElement('template');
filterBlockTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            margin-bottom: 15px;
            overflow: hidden;
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
            font-size: 1em; /* Chuẩn hóa kích thước title */
        }
        .toggle-icon {
            transition: transform 0.3s ease;
            font-size: 1.2em;
            line-height: 1; /* Đảm bảo icon không làm thay đổi chiều cao header */
        }
        .filter-block-content {
            padding: 0px 15px; /* Bỏ padding top/bottom ban đầu khi đóng */
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        :host([open]) .filter-block-content {
            max-height: 1000px; /* Một giá trị đủ lớn để chứa nội dung */
            padding: 15px; /* Khôi phục padding khi mở */
            border-top: 1px solid var(--medium-gray-color);
        }
        :host([open]) .toggle-icon {
            transform: rotate(180deg); /* Icon mũi tên lật ngược khi mở */
        }

        /* CSS cho các options bên trong slot */
        ::slotted(ul) {
            list-style: none !important; /* Quan trọng: loại bỏ dấu chấm đầu dòng */
            padding: 0 !important;
            margin: 0 !important;
        }
        ::slotted(li) {
            margin-bottom: 10px !important; /* Tăng khoảng cách một chút */
        }
        ::slotted(li:last-child) {
            margin-bottom: 0 !important;
        }
        ::slotted(label) {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 0.95em; /* Điều chỉnh kích thước chữ của label */
            color: var(--text-color);
        }
        ::slotted(input[type="radio"]),
        ::slotted(input[type="checkbox"]) {
            margin-right: 8px;
            margin-top: 0; /* Căn chỉnh với text */
            flex-shrink: 0; /* Ngăn co lại */
        }
        
        /* Style cho range-slider khi bị ẩn/hiện bởi radio "Tuỳ chọn" */
        ::slotted(range-slider) {
            max-height: 200px; /* Chiều cao tối đa khi hiện */
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease-in-out, visibility 0.3s;
            opacity: 1;
            margin-top: 10px; /* Khoảng cách với radio "Tuỳ chọn" */
            visibility: visible;
        }
        ::slotted(range-slider.hidden-by-radio) {
            max-height: 0;
            opacity: 0;
            margin-top: 0;
            visibility: hidden;
            /* Quan trọng: display: none sẽ không có transition */
        }
    </style>
    <div class="filter-block-header" id="header" role="button" aria-expanded="false">
        <h4 class="filter-block-title">
            <slot name="title">Tiêu đề khối lọc</slot>
        </h4>
        <span class="toggle-icon" aria-hidden="true">&#9660;</span> </div>
    <div class="filter-block-content" id="content">
        <slot name="content" id="contentSlot"></slot>
    </div>
`;

class FilterBlock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(filterBlockTemplate.content.cloneNode(true));
        this._header = this.shadowRoot.getElementById('header');
        this._contentSlot = this.shadowRoot.getElementById('contentSlot');
    }

    connectedCallback() {
        this._header.addEventListener('click', () => {
            this.toggle();
        });

        // Mặc định mở nếu có attribute 'open', đồng bộ aria-expanded
        if (this.hasAttribute('open')) {
            this._open();
        } else {
            this._close(); // Đảm bảo aria-expanded được set đúng ban đầu
        }

        // Lắng nghe sự kiện slotchange để biết khi nào nội dung slot được thêm vào
        this._contentSlot.addEventListener('slotchange', () => {
            this._setupRadioListenersForRangeSlider();
        });
        // Gọi một lần ban đầu phòng trường hợp nội dung đã có sẵn (ví dụ khi cloneNode)
        this._setupRadioListenersForRangeSlider();
    }

    _setupRadioListenersForRangeSlider() {
        // assignedElements() tốt hơn assignedNodes() vì nó chỉ trả về element nodes.
        const slottedElements = this._contentSlot.assignedElements({ flatten: true });
        
        slottedElements.forEach(slottedElementContainer => {
            // Thường thì slot="content" sẽ chứa một div hoặc ul làm container trực tiếp
            const customRadio = slottedElementContainer.querySelector('input[type="radio"][value="custom"], input[type="radio"][id*="_custom_radio"]');
            const rangeSlider = slottedElementContainer.querySelector('range-slider');
            const otherRadiosInGroup = customRadio ? 
                Array.from(slottedElementContainer.querySelectorAll(`input[type="radio"][name="${customRadio.name}"]`))
                : [];

            if (customRadio && rangeSlider) {
                const handleRadioChange = () => {
                    if (customRadio.checked) {
                        rangeSlider.classList.remove('hidden-by-radio');
                    } else {
                        rangeSlider.classList.add('hidden-by-radio');
                    }
                };

                otherRadiosInGroup.forEach(radio => {
                    radio.removeEventListener('change', handleRadioChange); // Xóa listener cũ nếu có
                    radio.addEventListener('change', handleRadioChange);
                });

                // Set initial state for the range slider
                handleRadioChange();
            }
        });
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
    }

    _close() {
        this.removeAttribute('open');
        this._header.setAttribute('aria-expanded', 'false');
    }

    static get observedAttributes() {
        return ['open'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'open' && this.shadowRoot) { // Đảm bảo shadowRoot đã sẵn sàng
            // CSS :host([open]) sẽ tự động xử lý việc hiển thị content
            // Chỉ cần cập nhật aria-expanded nếu thuộc tính 'open' thay đổi từ bên ngoài
             if (this.hasAttribute('open')) {
                this._header.setAttribute('aria-expanded', 'true');
            } else {
                this._header.setAttribute('aria-expanded', 'false');
            }
        }
    }
}
customElements.define('filter-block', FilterBlock);
