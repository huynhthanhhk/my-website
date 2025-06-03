// js/components/FilterBlock.js
const filterBlockTemplate = document.createElement('template');
filterBlockTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            margin-bottom: 20px; 
        }
        :host(:last-child) {
            margin-bottom: 0;
        }
        .filter-block-header {
            padding-bottom: 8px;
            font-weight: 600;
            color: var(--secondary-color, #004238);
            border-bottom: 1px solid var(--medium-gray-color, #eee);
            margin-bottom: 12px;
        }
        .filter-block-title {
            margin: 0;
            font-size: 1rem;
        }
        /* Container cho các nút lựa chọn */
        ::slotted(.filter-options-group) { /* Áp dụng cho div được slot vào với class này */
            display: flex;
            flex-wrap: wrap;
            gap: 8px; /* Khoảng cách giữa các nút */
        }

        /* Style cho từng nút lựa chọn (button được slot vào) */
        ::slotted(button.filter-option) {
            padding: 7px 12px; /* Điều chỉnh padding cho vừa vặn */
            font-size: 0.88em; /* Kích thước chữ nhỏ hơn một chút */
            color: var(--text-color-light, #555);
            background-color: var(--background-color, #fff);
            border: 1px solid var(--medium-gray-color, #ccc);
            border-radius: var(--border-radius, 5px);
            cursor: pointer;
            text-align: center;
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        ::slotted(button.filter-option:hover) {
            border-color: var(--primary-color, #53b966);
            color: var(--primary-color, #53b966);
            /* box-shadow: 0 0 0 0.1rem rgba(83, 185, 102, 0.25); */ /* Tùy chọn hiệu ứng focus/hover */
        }
        ::slotted(button.filter-option.active) {
            background-color: var(--primary-color, #53b966);
            color: var(--text-color-inverted, #fff);
            border-color: var(--primary-color, #53b966);
            font-weight: 500;
        }
        
        /* Style cho range-slider khi bị ẩn/hiện */
        ::slotted(range-slider) {
            width: 100%; /* Đảm bảo range-slider chiếm hết chiều rộng trong slot */
            max-height: 200px;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin-top 0.3s ease-in-out, visibility 0.3s;
            opacity: 1;
            margin-top: 15px; 
            visibility: visible;
            display: block; 
        }
        ::slotted(range-slider.hidden-by-option) { 
            max-height: 0;
            opacity: 0;
            margin-top: 0;
            visibility: hidden;
            overflow: hidden;
        }
    </style>
    <div class="filter-block-header">
        <h4 class="filter-block-title" id="filterTitleInBlock">
            <slot name="title">Tiêu đề nhóm lọc</slot>
        </h4>
    </div>
    <div class="filter-block-content">
        <slot name="content" id="contentSlot"></slot>
    </div>
`;

class FilterBlock extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(filterBlockTemplate.content.cloneNode(true));
        
        this._contentSlot = this.shadowRoot.getElementById('contentSlot');
        this._filterTitleFromSlot = '';

        this._handleOptionClick = this._handleOptionClick.bind(this);
    }

    connectedCallback() {
        const titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
        if (titleSlot) {
            const assignedNodes = titleSlot.assignedNodes({ flatten: true });
            if (assignedNodes.length > 0) {
                this._filterTitleFromSlot = assignedNodes.map(node => node.textContent.trim()).join(' ');
            }
        }

        this._contentSlot.addEventListener('slotchange', this._onSlotChange.bind(this));
        this._setupOptionListeners(); // Gọi lần đầuเผื่อ nội dung đã có
    }
    
    _onSlotChange() {
        // console.log('FilterBlock: Slot content changed for', this._filterTitleFromSlot);
        this._setupOptionListeners();
    }

    _getSlottedOptions() {
        // Lấy tất cả các button.filter-option được slot vào (kể cả khi chúng nằm trong một div cha)
        const directSlottedElements = this._contentSlot.assignedElements({ flatten: true });
        let options = [];
        directSlottedElements.forEach(el => {
            if (el.matches && el.matches('button.filter-option')) {
                options.push(el);
            } else if (el.querySelectorAll) {
                options.push(...el.querySelectorAll('button.filter-option'));
            }
        });
        return options;
    }

    _getSlottedRangeSlider() {
         const directSlottedElements = this._contentSlot.assignedElements({ flatten: true });
         for (const el of directSlottedElements) {
            if (el.matches && el.matches('range-slider')) return el;
            const slider = el.querySelector('range-slider'); // Tìm trong con của phần tử slot
            if (slider) return slider;
         }
         return null;
    }

    _setupOptionListeners() {
        const options = this._getSlottedOptions();
        const rangeSlider = this._getSlottedRangeSlider();
        let initialActiveOption = null;
        // console.log(`FilterBlock [${this._filterTitleFromSlot}]: Setting up listeners for options:`, options.length);

        options.forEach(option => {
            option.removeEventListener('click', this._handleOptionClick); // Gỡ listener cũ
            option.addEventListener('click', this._handleOptionClick);
            if (option.classList.contains('active')) {
                initialActiveOption = option;
            }
        });

        if (rangeSlider) {
            const isCustomInitiallyActive = initialActiveOption && 
                                         (initialActiveOption.dataset.value === 'custom' || 
                                          initialActiveOption.classList.contains('custom-option'));
            rangeSlider.classList.toggle('hidden-by-option', !isCustomInitiallyActive);
        } else {
            // console.log(`FilterBlock [${this._filterTitleFromSlot}]: No range slider found.`);
        }
    }

    _handleOptionClick(event) {
        const clickedOption = event.currentTarget;
        const options = this._getSlottedOptions(); // Lấy lại danh sách options phòng trường hợp DOM thay đổi
        const rangeSlider = this._getSlottedRangeSlider();
        const value = clickedOption.dataset.value;
        const isCustomOption = value === 'custom' || clickedOption.classList.contains('custom-option');

        // console.log(`FilterBlock [${this._filterTitleFromSlot}]: Option clicked - Value: ${value}, IsCustom: ${isCustomOption}`);

        options.forEach(opt => {
            if (opt !== clickedOption) {
                opt.classList.remove('active');
            }
        });
        clickedOption.classList.add('active');

        if (rangeSlider) {
            rangeSlider.classList.toggle('hidden-by-option', !isCustomOption);
        }
        
        this.dispatchEvent(new CustomEvent('filter-block-changed', {
            detail: {
                filterName: this._filterTitleFromSlot || this.dataset.filterTitle || 'Unknown Filter',
                value: value,
                isCustom: isCustomOption
            },
            bubbles: true,
            composed: true
        }));
    }
}
customElements.define('filter-block', FilterBlock);