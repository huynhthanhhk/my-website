// js/components/PropertyTypeTabs.js
const propertyTypeTabsTemplate = document.createElement('template');
propertyTypeTabsTemplate.innerHTML = `
    <style>
        :host { 
            display: block; 
            margin-top: 10px; /* Thêm chút khoảng cách với tiêu đề của Section 3 Left */
        }
        .tabs-navigation-container {
             /* Bỏ border-bottom ở đây nếu không muốn có đường kẻ ngang cố định */
             /* border-bottom: 2px solid var(--medium-gray-color, #ccc); */
             margin-bottom: 0; /* Không còn content area bên dưới nữa */
        }
        .tabs-buttons-list {
            display: flex; 
            flex-wrap: wrap; 
            gap: 10px; /* Khoảng cách giữa các tab */
            list-style: none; 
            padding: 0; 
            margin: 0;
        }
        /* Style cho mỗi mục tab (giờ là thẻ <a>) */
        .tab-link {
            display: inline-block; /* Để padding có tác dụng */
            padding: 10px 18px;
            cursor: pointer; 
            background-color: var(--light-gray-color, #f0f0f0); /* Nền cho tab không active */
            color: var(--text-color-light, #555); 
            font-size: 0.95em;
            text-decoration: none; /* Bỏ gạch chân mặc định của link */
            border-radius: var(--border-radius, 5px) var(--border-radius, 5px) 0 0; /* Bo góc trên */
            border: 1px solid var(--medium-gray-color, #ccc);
            border-bottom: none; /* Không có border dưới cho tab không active */
            position: relative;
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
            margin-bottom: -1px; /* Để đè lên border của container (nếu có) hoặc để sát */
        }
        .tab-link:hover { 
            background-color: var(--primary-color, #53b966);
            color: var(--text-color-inverted, #fff);
            border-color: var(--primary-color, #53b966);
        }
        
        /* Không còn class .active vì khi click sẽ chuyển trang. 
           Trang mới sẽ cần logic riêng để xác định tab nào active (dựa trên URL).
           Tuy nhiên, có thể giữ lại style .active nếu muốn hiệu ứng hover mạnh hơn
           hoặc nếu bạn dùng JavaScript để đánh dấu tab vừa click trước khi chuyển trang (ít phổ biến).
        */
        /* Ví dụ nếu vẫn muốn style cho tab được focus (trước khi click) */
        .tab-link:focus-visible {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }

        /* Không còn .tab-content-area nữa */

    </style>
    <div class="tabs-container">
        <div class="tabs-navigation-container">
            <ul class="tabs-buttons-list" id="tabs-buttons-list" role="tablist">
                </ul>
        </div>
        </div>
`;

class PropertyTypeTabs extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(propertyTypeTabsTemplate.content.cloneNode(true));
        
        this._tabsList = this.shadowRoot.getElementById('tabs-buttons-list');
        
        // Dữ liệu các loại hình và URL tương ứng
        // Bạn cần thay thế các URL này bằng URL thực tế của trang bạn
        this._propertyTypes = [
            { name: 'Shophouse', url: 'listings-shophouse.html' },
            { name: 'Nhà phố', url: 'listings-nha-pho.html' },
            { name: 'Đất nền', url: 'listings-dat-nen.html' },
            { name: 'Biệt thự', url: 'listings-biet-thu.html' },
            { name: 'Văn phòng', url: 'listings-van-phong.html' }
        ];
    }

    connectedCallback() {
        this.renderTabs();
        // Không còn activate tab đầu tiên mặc định nữa
    }

    renderTabs() {
        this._tabsList.innerHTML = ''; // Xóa các tab cũ (nếu có)
        this._propertyTypes.forEach(typeInfo => {
            const li = document.createElement('li');
            li.setAttribute('role', 'presentation');

            const link = document.createElement('a');
            link.classList.add('tab-link');
            link.href = typeInfo.url; // Đặt URL cho thẻ <a>
            link.textContent = typeInfo.name;
            link.setAttribute('role', 'tab');
            // Không còn quản lý aria-selected bằng JS ở đây nữa vì sẽ chuyển trang.
            // Trang đích sẽ tự xác định tab active (nếu cần).

            // Không cần event listener để gọi activateTab nữa, thẻ <a> sẽ tự điều hướng.
            // link.addEventListener('click', (event) => {
            //     // event.preventDefault(); // Không cần nếu muốn điều hướng thực sự
            //     // window.location.href = typeInfo.url; 
            // });

            li.appendChild(link);
            this._tabsList.appendChild(li);
        });
    }

    // Phương thức activateTab không còn cần thiết theo logic mới (click là chuyển trang)
    // activateTab(typeName) { ... } 
    // Việc dispatch event cũng không cần thiết nữa nếu mục tiêu là chuyển trang.
}

customElements.define('property-type-tabs', PropertyTypeTabs);