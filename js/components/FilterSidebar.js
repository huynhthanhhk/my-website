// js/components/FilterSidebar.js
// Import dependencies if they are not globally available or registered in main.js before this
// Ví dụ: import './FilterBlock.js'; import './RangeSlider.js'; (nếu dùng modules cục bộ)

const filterSidebarTemplate = document.createElement('template');
filterSidebarTemplate.innerHTML = `
    <style>
        /* CSS cho filter-sidebar.css */
        :host {
            display: block;
        }
        .filter-toggle-mobile {
            display: none; /* Ẩn trên desktop */
            background-color: var(--primary-color);
            color: var(--white-color);
            padding: 10px;
            text-align: center;
            border-radius: var(--border-radius);
            cursor: pointer;
            margin-bottom: 15px;
        }
        .filter-toggle-mobile svg { /* Basic filter icon */
            width: 20px; height: 20px; fill: white; vertical-align: middle; margin-right: 5px;
        }
        .filters-container {
            display: block; /* Hiển thị trên desktop */
        }

        @media (max-width: 768px) {
            .filter-toggle-mobile {
                display: block;
            }
            .filters-container {
                display: none; /* Ẩn mặc định trên mobile */
                position: fixed; /* Hoặc absolute tùy theo layout mong muốn */
                top: 0;
                left: 0;
                width: 80%;
                max-width: 300px;
                height: 100%;
                background-color: var(--white-color);
                box-shadow: 2px 0 10px rgba(0,0,0,0.2);
                z-index: 999;
                overflow-y: auto;
                padding: 20px;
                transition: transform 0.3s ease-in-out;
                transform: translateX(-100%);
            }
            :host([open-mobile]) .filters-container {
                display: block;
                transform: translateX(0);
            }
            /* Overlay for mobile filter */
            .filter-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.4);
                z-index: 998;
            }
            :host([open-mobile]) .filter-overlay {
                display: block;
            }
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
            <div slot="content">
                <ul>
                    <li><label><input type="radio" name="price" value="0-3"> Dưới 3 tỷ</label></li>
                    <li><label><input type="radio" name="price" value="3-5"> Từ 3 - 5 tỷ</label></li>
                    <li><label><input type="radio" name="price" value="5-10"> Từ 5 - 10 tỷ</label></li>
                    <li><label><input type="radio" name="price" value="10-"> Trên 10 tỷ</label></li>
                    <li>
                        <label for="price_custom_radio"><input type="radio" name="price" id="price_custom_radio" value="custom"> Tuỳ chọn</label>
                        <range-slider min="0.5" max="50" step="0.1" unit=" tỷ" default-min="1" default-max="15"></range-slider>
                    </li>
                </ul>
            </div>
        </filter-block>

        <filter-block>
            <span slot="title">Diện tích (m²)</span>
            <div slot="content">
                 <ul>
                    <li><label><input type="radio" name="area" value="0-50"> Dưới 50 m²</label></li>
                    <li><label><input type="radio" name="area" value="50-70"> 50 - 70 m²</label></li>
                    <li><label><input type="radio" name="area" value="70-100"> 70 - 100 m²</label></li>
                    <li><label><input type="radio" name="area" value="100-"> Trên 100 m²</label></li>
                    <li>
                        <label for="area_custom_radio"><input type="radio" name="area" id="area_custom_radio" value="custom"> Tuỳ chọn</label>
                        <range-slider min="20" max="500" step="5" unit=" m²" default-min="60" default-max="120"></range-slider>
                    </li>
                </ul>
            </div>
        </filter-block>

        <filter-block>
            <span slot="title">Số phòng ngủ</span>
            <div slot="content">
                <ul>
                    <li><label><input type="radio" name="bedrooms" value="all" checked> Tất cả</label></li>
                    <li><label><input type="radio" name="bedrooms" value="1"> 1 phòng ngủ</label></li>
                    <li><label><input type="radio" name="bedrooms" value="2"> 2 phòng ngủ</label></li>
                    <li><label><input type="radio" name="bedrooms" value="3"> 3 phòng ngủ</label></li>
                    <li><label><input type="radio" name="bedrooms" value="4+"> 4+ phòng ngủ</label></li>
                </ul>
            </div>
        </filter-block>

        <filter-block>
            <span slot="title">Số toilet</span>
            <div slot="content">
                 <ul>
                    <li><label><input type="radio" name="toilets" value="all" checked> Tất cả</label></li>
                    <li><label><input type="radio" name="toilets" value="1"> 1 toilet</label></li>
                    <li><label><input type="radio" name="toilets" value="2"> 2 toilets</label></li>
                    <li><label><input type="radio" name="toilets" value="3+"> 3+ toilets</label></li>
                </ul>
            </div>
        </filter-block>

        <filter-block>
            <span slot="title">Nội thất</span>
            <div slot="content">
                <ul>
                    <li><label><input type="radio" name="furniture" value="all" checked> Tất cả</label></li>
                    <li><label><input type="radio" name="furniture" value="full"> Đầy đủ nội thất</label></li>
                    <li><label><input type="radio" name="furniture" value="basic"> Nội thất cơ bản</label></li>
                    <li><label><input type="radio" name="furniture" value="none"> Không nội thất</label></li>
                </ul>
            </div>
        </filter-block>

         <filter-block>
            <span slot="title">Pháp lý</span>
            <div slot="content">
                <ul>
                    <li><label><input type="radio" name="legal" value="all" checked> Tất cả</label></li>
                    <li><label><input type="radio" name="legal" value="sohong"> Sổ hồng</label></li>
                    <li><label><input type="radio" name="legal" value="hdmb"> Hợp đồng mua bán</label></li>
                    <li><label><input type="radio" name="legal" value="other"> Khác</label></li>
                </ul>
            </div>
        </filter-block>
        </div>
`;

class FilterSidebar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(filterSidebarTemplate.content.cloneNode(true));
        this._mobileToggle = this.shadowRoot.getElementById('mobile-toggle');
        this._filtersContainer = this.shadowRoot.getElementById('filters');
        this._filterOverlay = this.shadowRoot.getElementById('filter-overlay');
    }

    connectedCallback() {
        this._mobileToggle.addEventListener('click', () => this.toggleMobileFilter());
        this._filterOverlay.addEventListener('click', () => this.closeMobileFilter());
    }

    toggleMobileFilter() {
        if (this.hasAttribute('open-mobile')) {
            this.closeMobileFilter();
        } else {
            this.openMobileFilter();
        }
    }

    openMobileFilter() {
        this.setAttribute('open-mobile', '');
        // Ngăn scroll body khi filter mở trên mobile
        document.body.style.overflow = 'hidden';
    }

    closeMobileFilter() {
        this.removeAttribute('open-mobile');
        document.body.style.overflow = '';
    }
}
customElements.define('filter-sidebar', FilterSidebar);
