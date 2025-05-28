// js/components/PropertyTypeTabs.js
const propertyTypeTabsTemplate = document.createElement('template');
propertyTypeTabsTemplate.innerHTML = `
    <style>
        /* CSS cho property-tabs.css */
        :host { display: block; }
        .tabs-container {
            display: flex;
            flex-wrap: wrap; /* Cho phép xuống dòng nếu không đủ chỗ */
            gap: 10px;
            border-bottom: 2px solid var(--primary-color);
            margin-bottom: 20px;
        }
        .tab-button {
            padding: 10px 18px;
            cursor: pointer;
            border: none;
            background-color: transparent;
            color: var(--dark-gray-color);
            font-size: 1em;
            position: relative;
            transition: color 0.3s ease;
        }
        .tab-button:hover {
            color: var(--primary-color);
        }
        .tab-button.active {
            color: var(--primary-color);
            font-weight: bold;
        }
        .tab-button.active::after {
            content: '';
            position: absolute;
            bottom: -2px; /* Nằm trên border của container */
            left: 0;
            width: 100%;
            height: 2px;
            background-color: var(--primary-color);
        }
        .tab-content {
            /* Nội dung của tab có thể được xử lý bên ngoài component này,
               hoặc component này có thể dispatch event để component cha xử lý.
               Ở đây, chúng ta chỉ thay đổi class active cho button. */
            padding: 15px;
            border: 1px solid var(--medium-gray-color);
            border-top: none;
            border-radius: 0 0 var(--border-radius) var(--border-radius);
            min-height: 100px; /* Chiều cao tối thiểu cho nội dung */
        }
    </style>
    <div class="tabs-navigation">
        <div class="tabs-container" id="tabs-buttons-container">
            </div>
    </div>
    <div class="tab-content" id="tab-content-area">
        <p>Chọn một loại hình để xem thông tin.</p>
    </div>
`;

class PropertyTypeTabs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(propertyTypeTabsTemplate.content.cloneNode(true));
        this._tabsContainer = this.shadowRoot.getElementById('tabs-buttons-container');
        this._tabContentArea = this.shadowRoot.getElementById('tab-content-area');
        this._propertyTypes = ['Shophouse', 'Nhà phố', 'Đất nền', 'Biệt thự', 'Văn phòng'];
        this._activeTab = '';
    }

    connectedCallback() {
        this.renderTabs();
        if (this._propertyTypes.length > 0) {
            this.activateTab(this._propertyTypes[0]); // Kích hoạt tab đầu tiên mặc định
        }
    }

    renderTabs() {
        this._tabsContainer.innerHTML = ''; // Clear existing tabs
        this._propertyTypes.forEach(type => {
            const button = document.createElement('button');
            button.classList.add('tab-button');
            button.textContent = type;
            button.dataset.type = type;
            button.addEventListener('click', () => this.activateTab(type));
            this._tabsContainer.appendChild(button);
        });
    }

    activateTab(type) {
        if (this._activeTab === type) return;

        this._activeTab = type;
        const buttons = this.shadowRoot.querySelectorAll('.tab-button');
        buttons.forEach(button => {
            if (button.dataset.type === type) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Cập nhật nội dung (ví dụ)
        // Trong thực tế, component cha có thể lắng nghe event này
        // và cập nhật nội dung ở cột bên phải (Section 3 - Right Column)
        this._tabContentArea.innerHTML = `<p>Thông tin chi tiết về <strong>${type}</strong>. Dữ liệu này có thể được tải động hoặc quản lý bởi component cha.</p>`;

        this.dispatchEvent(new CustomEvent('tab-changed', {
            detail: { activeTab: type },
            bubbles: true, // Cho phép event nổi bọt lên DOM tree
            composed: true // Cho phép event vượt qua ranh giới Shadow DOM
        }));
        console.log(`Tab active: ${type}`);
    }
}
customElements.define('property-type-tabs', PropertyTypeTabs);
