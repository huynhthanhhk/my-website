// js/components/AreaSuggestions.js
const allAreasData = { // Dữ liệu mẫu, bạn có thể thay thế bằng dữ liệu thực tế
    "TP. Hồ Chí Minh": ["Tân Phú", "Quận 1", "Bình Thạnh", "Quận 3", "Quận 5", "Quận 7", "Gò Vấp", "Bình Tân", "Quận 2", "Quận 4", "Quận 6", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Thủ Đức", "Bình Chánh", "Cần Giờ", "Củ Chi", "Hóc Môn", "Nhà Bè"],
    "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Hà Đông"]
};

const areaSuggestionsTemplate = document.createElement('template');
areaSuggestionsTemplate.innerHTML = `
    <style>
        :host { 
            display: block; 
            margin-bottom: 20px; 
        }
        .suggestions-container {
            font-size: 0.95em;
            color: var(--dark-gray-color);
            display: flex; /* Đưa các item vào hàng */
            align-items: center; /* Căn giữa theo chiều dọc */
            flex-wrap: wrap; /* Cho phép xuống dòng nếu không đủ chỗ */
            gap: 10px; /* Khoảng cách giữa text, list và button */
        }
        .suggestions-container > span { /* Text "Gợi ý khu vực:" */
            white-space: nowrap; /* Không xuống dòng text này */
            font-weight: 500; /* Làm đậm chữ "Gợi ý khu vực" một chút */
            color: var(--text-color);
        }
        .suggestions-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex; /* Các thẻ a nằm trên một hàng */
            flex-wrap: wrap; /* Cho phép các thẻ a xuống dòng */
            gap: 8px; /* Khoảng cách giữa các thẻ a */
            align-items: center; /* Căn giữa các thẻ a */
        }
        .suggestions-list li a {
            padding: 6px 12px; /* Tăng padding một chút */
            background-color: var(--light-gray-color);
            border-radius: var(--border-radius);
            color: var(--secondary-color);
            text-decoration: none;
            transition: background-color 0.2s, color 0.2s;
            display: inline-block;
            font-size: 0.9em;
            border: 1px solid transparent; /* Thêm border để nhất quán khi hover */
        }
        .suggestions-list li a:hover {
            background-color: var(--primary-color);
            color: var(--white-color);
            border-color: var(--primary-color);
        }
        .view-more-btn {
            background: none;
            border: none;
            color: var(--primary-color);
            text-decoration: underline;
            cursor: pointer;
            padding: 5px 0;
            font-size: 0.95em; /* Đồng bộ font-size */
            white-space: nowrap;
            font-weight: 500;
        }
        .view-more-btn:hover {
            color: var(--secondary-color);
            text-decoration: none; /* Bỏ gạch chân khi hover để giống button hơn */
        }
        .hidden {
            display: none !important;
        }
    </style>
    <div class="suggestions-container">
        <span>Gợi ý khu vực: </span>
        <ul class="suggestions-list" id="visible-areas"></ul>
        <button class="view-more-btn" id="view-more-areas">Xem thêm</button>
    </div>
`;

class AreaSuggestions extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(areaSuggestionsTemplate.content.cloneNode(true));

        this._visibleCount = 5; // Số lượng khu vực hiển thị ban đầu
        this._areas = [];
        this._cityName = "TP. Hồ Chí Minh"; // Giá trị mặc định
    }

    connectedCallback() {
        this._cityName = this.dataset.city || "TP. Hồ Chí Minh";
        this._areas = allAreasData[this._cityName] || [];

        this.renderVisibleAreas();

        this.shadowRoot.getElementById('view-more-areas').addEventListener('click', () => {
            this.showPopupWithAllAreas();
        });
    }

    renderVisibleAreas() {
        const visibleAreasContainer = this.shadowRoot.getElementById('visible-areas');
        visibleAreasContainer.innerHTML = ''; // Clear previous
        const areasToShow = this._areas.slice(0, this._visibleCount);

        areasToShow.forEach(area => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#khu-vuc-${this._cityName.toLowerCase().replace(/\s+/g, '-')}-${area.toLowerCase().replace(/\s+/g, '-')}`; // URL thân thiện hơn
            a.textContent = area;
            li.appendChild(a);
            visibleAreasContainer.appendChild(li);
        });

        const viewMoreButton = this.shadowRoot.getElementById('view-more-areas');
        if (this._areas.length <= this._visibleCount) {
            viewMoreButton.classList.add('hidden');
        } else {
            viewMoreButton.classList.remove('hidden');
        }
    }

    showPopupWithAllAreas() {
        const popup = document.getElementById('area-list-popup'); // Tham chiếu đến popup trong main DOM
        const contentDiv = document.getElementById('area-list-content');
        if (!popup || !contentDiv) {
            console.error("ModalPopup 'area-list-popup' hoặc content div của nó không tìm thấy trong DOM chính.");
            return;
        }

        contentDiv.innerHTML = ''; // Clear previous content
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.display = 'grid';
        ul.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))'; // Responsive grid
        ul.style.gap = '10px';

        this._areas.forEach(area => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#khu-vuc-${this._cityName.toLowerCase().replace(/\s+/g, '-')}-${area.toLowerCase().replace(/\s+/g, '-')}`;
            a.textContent = area;
            // Style cho các mục trong popup
            a.style.display = 'block';
            a.style.padding = '10px';
            a.style.backgroundColor = 'var(--light-gray-color)';
            a.style.borderRadius = 'var(--border-radius)';
            a.style.color = 'var(--secondary-color)';
            a.style.textDecoration = 'none';
            a.style.textAlign = 'center';
            a.style.transition = 'background-color 0.2s, color 0.2s';
            a.onmouseover = () => { a.style.backgroundColor = 'var(--primary-color)'; a.style.color = 'var(--white-color)'; };
            a.onmouseout = () => { a.style.backgroundColor = 'var(--light-gray-color)'; a.style.color = 'var(--secondary-color)';};
            li.appendChild(a);
            ul.appendChild(li);
        });
        contentDiv.appendChild(ul);

        // Đảm bảo rằng ModalPopup có phương thức show() và nó được gọi đúng cách
        if (typeof popup.show === 'function') {
            popup.show();
        } else {
            // Fallback nếu không có phương thức show (ví dụ: tự quản lý thuộc tính 'open')
            popup.setAttribute('open', '');
        }
    }

    static get observedAttributes() {
        return ['data-city'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-city' && oldValue !== newValue) {
            this._cityName = newValue || "TP. Hồ Chí Minh";
            this._areas = allAreasData[this._cityName] || [];
            this.renderVisibleAreas();
        }
    }
}
customElements.define('area-suggestions', AreaSuggestions);
