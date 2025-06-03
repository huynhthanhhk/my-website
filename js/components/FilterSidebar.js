// js/components/FilterSidebar.js
// File này định nghĩa component <filter-sidebar>.
// Mặc dù không còn được sử dụng trực tiếp trong Section 2 của index.html nữa
// do yêu cầu xóa nội dung cột trái, nhưng định nghĩa component vẫn có thể hữu ích
// nếu bạn muốn sử dụng lại bộ lọc ở một nơi khác hoặc khôi phục nó sau này.

// Nếu bạn không có kế hoạch sử dụng lại, có thể xóa file này và xóa import trong main.js.

const filterSidebarTemplate = document.createElement('template');
filterSidebarTemplate.innerHTML = `
    <style>
        :host { display: block; }
        .filter-toggle-mobile {
            display: none; background-color: var(--primary-color); color: var(--white-color);
            padding: 10px; text-align: center; border-radius: var(--border-radius);
            cursor: pointer; margin-bottom: 15px;
        }
        .filter-toggle-mobile svg { width: 20px; height: 20px; fill: white; vertical-align: middle; margin-right: 5px; }
        .filters-container { display: block; }

        @media (max-width: 768px) {
            .filter-toggle-mobile { display: block; }
            .filters-container {
                display: none; position: fixed; top: 0; left: 0; width: 80%; max-width: 300px;
                height: 100%; background-color: var(--white-color);
                box-shadow: 2px 0 10px rgba(0,0,0,0.2); z-index: 999;
                overflow-y: auto; padding: 20px; transition: transform 0.3s ease-in-out;
                transform: translateX(-100%);
            }
            :host([open-mobile]) .filters-container { display: block; transform: translateX(0); }
            .filter-overlay {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background-color: rgba(0,0,0,0.4); z-index: 998;
            }
            :host([open-mobile]) .filter-overlay { display: block; }
        }
    </style>
    <div class="filter-toggle-mobile" id="mobile-toggle">
        <svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"></path></svg>
        Bộ lọc
    </div>
    <div class="filter-overlay" id="filter-overlay"></div>
    <div class="filters-container" id="filters">
        <filter-block open>
            <span slot="title">Giá bán</span>
            <div slot="content" class="filter-options-group">
                <button class="filter-option" data-value="0-3">Dưới 3 tỷ</button>
                <button class="filter-option active" data-value="3-5">Từ 3 - 5 tỷ</button>
                <button class="filter-option" data-value="5-10">Từ 5 - 10 tỷ</button>
                <button class="filter-option" data-value="10-">Trên 10 tỷ</button>
                <button class="filter-option custom-option" data-value="custom">Tuỳ chọn</button>
                <range-slider class="hidden-by-option" min="0.5" max="50" step="0.1" unit=" tỷ" default-min="1" default-max="15"></range-slider>
            </div>
        </filter-block>

        <filter-block>
            <span slot="title">Diện tích (m²)</span>
            <div slot="content" class="filter-options-group">
                <button class="filter-option" data-value="0-50">Dưới 50 m²</button>
                <button class="filter-option" data-value="50-70">50 - 70 m²</button>
                <button class="filter-option custom-option" data-value="custom">Tuỳ chọn</button>
                <range-slider class="hidden-by-option" min="20" max="500" step="5" unit=" m²" default-min="60" default-max="120"></range-slider>
            </div>
        </filter-block>
        </div>
`;
class FilterSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).appendChild(filterSidebarTemplate.content.cloneNode(true));
        this._mobileToggle = this.shadowRoot.getElementById('mobile-toggle');
        this._filtersContainer = this.shadowRoot.getElementById('filters');
        this._filterOverlay = this.shadowRoot.getElementById('filter-overlay');
    }
    connectedCallback() {
        this._mobileToggle.addEventListener('click', () => this.toggleMobileFilter());
        this._filterOverlay.addEventListener('click', () => this.closeMobileFilter());

        // Lắng nghe sự kiện filter-changed từ các filter-block con
        this._filtersContainer.addEventListener('filter-changed', (event) => {
            const { filterName, value, isCustom } = event.detail;
            console.log(`FilterSidebar: Filter '${filterName}' changed. Value: '${value}', IsCustom: ${isCustom}`);
            
            if (isCustom) {
                // Nếu là custom, cần lấy giá trị từ range-slider tương ứng
                // Tìm range-slider bên trong filter-block đã dispatch sự kiện
                const originatingFilterBlock = event.target; // event.target là filter-block
                const rangeSlider = originatingFilterBlock.querySelector('range-slider'); // Query trong light DOM của filter-block
                if (rangeSlider && typeof rangeSlider.getCurrentValues === 'function') { // Giả sử range-slider có hàm getCurrentValues
                    const rangeValues = rangeSlider.getCurrentValues();
                    console.log(`   Custom range values: Min ${rangeValues.min}, Max ${rangeValues.max}`);
                    // Xử lý filter với rangeValues
                } else if (rangeSlider) {
                    // Nếu không có hàm getCurrentValues, cần lấy từ input của nó
                    const minInput = rangeSlider.shadowRoot.getElementById('inputMin'); // Truy cập Shadow DOM của range-slider
                    const maxInput = rangeSlider.shadowRoot.getElementById('inputMax');
                    if (minInput && maxInput) {
                         console.log(`   Custom range input values: Min ${minInput.value}, Max ${maxInput.value}`);
                         // Xử lý filter với minInput.value và maxInput.value
                    }
                }
            } else {
                // Xử lý filter với giá trị `value`
            }
            // Gọi hàm để áp dụng tất cả các filter và cập nhật ProductList
            // this.applyAllFilters();
        });
    }
    toggleMobileFilter() { this.hasAttribute('open-mobile') ? this.closeMobileFilter() : this.openMobileFilter(); }
    openMobileFilter() { this.setAttribute('open-mobile', ''); document.body.style.overflow = 'hidden'; }
    closeMobileFilter() { this.removeAttribute('open-mobile'); document.body.style.overflow = ''; }
}
customElements.define('filter-sidebar', FilterSidebar);