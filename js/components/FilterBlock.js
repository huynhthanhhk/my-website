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
            font-size: 1em;
        }
        .toggle-icon {
            transition: transform 0.3s ease;
            font-size: 1.2em;
            line-height: 1;
        }
        .filter-block-content {
            padding: 0px 15px;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-out, padding 0.3s ease-out;
        }
        :host([open]) .filter-block-content {
            max-height: 1000px; /* Đủ lớn để chứa nội dung */
            padding: 15px;
            border-top: 1px solid var(--medium-gray-color);
        }
        :host([open]) .toggle-icon {
            transform: rotate(180deg);
        }

        /* === CSS Sửa lỗi marker cho radio === */
        ::slotted(ul), ::slotted(ul li) {
            list-style: none !important; /* Loại bỏ marker cho ul và li */
            padding-left: 0 !important;  /* Bỏ padding mặc định của ul/li có thể gây ra khoảng trống giống marker */
            margin-left: 0 !important;
        }
        /* Đảm bảo các ::slotted(li) không có list-style riêng */
        ::slotted(li) {
            list-style-type: none !important; 
            padding-left: 0 !important;
            margin-left: 0 !important;
            margin-bottom: 10px !important;
        }
        ::slotted(li:last-child) {
            margin-bottom: 0 !important;
        }
        /* === Kết thúc CSS sửa lỗi marker === */

        ::slotted(label) {
            display: flex;
            align-items: center;
            cursor: pointer;
            font-size: 0.95em;
            color: var(--text-color);
        }
        ::slotted(input[type="radio"]),
        ::slotted(input[type="checkbox"]) {
            margin-right: 8px;
            margin-top: 0; 
            flex-shrink: 0;
        }
        
        ::slotted(range-slider) {
            max-height: 200px;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease-in-out, visibility 0.3s;
            opacity: 1;
            margin-top: 10px;
            visibility: visible;
            display: block; /* Đảm bảo range-slider là block để margin-top hoạt động */
        }
        ::slotted(range-slider.hidden-by-radio) {
            max-height: 0;
            opacity: 0;
            margin-top: 0;
            visibility: hidden;
            /* transition-delay: 0s, 0s, 0s, 0.3s;  Nếu muốn delay việc ẩn visibility */
        }
    </style>
    <div class="filter-block-header" id="header" role="button" aria-expanded="false">
        <h4 class="filter-block-title">
            <slot name="title">Tiêu đề khối lọc</slot>
        </h4>
        <span class="toggle-icon" aria-hidden="true">&#9660;</span>
    </div>
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

        if (this.hasAttribute('open')) {
            this._open();
        } else {
            this._close();
        }

        this._contentSlot.addEventListener('slotchange', () => {
            // console.log('Slot content changed, re-evaluating radio listeners for range sliders.');
            this._setupRadioListenersForRangeSlider();
        });
        this._setupRadioListenersForRangeSlider(); // Gọi lần đầu
    }

    /**
     * Thiết lập listeners cho các radio button để ẩn/hiện range-slider.
     * Logic này tìm các radio "Tuỳ chọn" và range-slider liên quan dựa trên cấu trúc HTML
     * được mô tả trong "LƯU Ý QUAN TRỌNG".
     */
    _setupRadioListenersForRangeSlider() {
        // Lấy tất cả các phần tử <li> được slot vào (giả định cấu trúc ul > li)
        // Hoặc lấy các container trực tiếp nếu cấu trúc khác
        const directSlottedContainers = this._contentSlot.assignedElements({ flatten: true });

        directSlottedContainers.forEach(container => {
            // Tìm tất cả các input radio "custom" bên trong container này
            const customRadios = container.querySelectorAll('input[type="radio"][value="custom"], input[type="radio"][id*="_custom_radio"]');

            customRadios.forEach(customRadio => {
                // Tìm range-slider gần nhất với customRadio này.
                // Giả định: range-slider nằm trong cùng <li> với label chứa customRadio,
                // hoặc là anh em kế tiếp của label/input.
                let rangeSlider = null;
                const parentLi = customRadio.closest('li'); // Thường thì radio và slider sẽ nằm trong cùng 1 LI

                if (parentLi) {
                    rangeSlider = parentLi.querySelector('range-slider');
                } else {
                    // Fallback: nếu không có <li>, thử tìm range-slider là anh em kế tiếp của parent của customRadio
                    // (nếu customRadio được bọc trong label)
                    if (customRadio.parentElement && customRadio.parentElement.nextElementSibling && customRadio.parentElement.nextElementSibling.tagName === 'RANGE-SLIDER') {
                        rangeSlider = customRadio.parentElement.nextElementSibling;
                    }
                    // Hoặc nếu customRadio không được bọc trong label, và range-slider là anh em kế tiếp của nó
                    else if (customRadio.nextElementSibling && customRadio.nextElementSibling.tagName === 'RANGE-SLIDER'){
                         rangeSlider = customRadio.nextElementSibling;
                    }
                }
                // console.log('Found customRadio:', customRadio, 'Associated rangeSlider:', rangeSlider);


                if (rangeSlider) {
                    // Lấy tất cả radio trong cùng một nhóm (cùng `name`)
                    const radioGroupName = customRadio.name;
                    if (!radioGroupName) {
                        // console.warn('Custom radio does not have a "name" attribute, cannot group for toggle.', customRadio);
                        return; // Bỏ qua nếu không có name
                    }
                    
                    const radiosInGroup = Array.from(container.querySelectorAll(`input[type="radio"][name="${radioGroupName}"]`));
                    // console.log('Radios in group:', radioGroupName, radiosInGroup);

                    const handleRadioChange = () => {
                        // console.log(`Radio changed in group ${radioGroupName}. Custom radio checked: ${customRadio.checked}`);
                        if (customRadio.checked) {
                            rangeSlider.classList.remove('hidden-by-radio');
                        } else {
                            rangeSlider.classList.add('hidden-by-radio');
                        }
                    };

                    radiosInGroup.forEach(radio => {
                        // Gỡ listener cũ để tránh gắn nhiều lần khi slotchange hoặc re-render
                        radio.removeEventListener('change', handleRadioChange); 
                        radio.addEventListener('change', handleRadioChange);
                    });

                    // Thiết lập trạng thái ban đầu cho range-slider
                    handleRadioChange();
                } else {
                    // console.warn('Could not find an associated range-slider for custom radio:', customRadio);
                }
            });
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
        if (name === 'open' && this.shadowRoot) {
             if (this.hasAttribute('open')) {
                this._header.setAttribute('aria-expanded', 'true');
            } else {
                this._header.setAttribute('aria-expanded', 'false');
            }
        }
    }
}
customElements.define('filter-block', FilterBlock);
