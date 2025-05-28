// js/components/AreaSuggestions.js
// ... (allAreasData giữ nguyên)
const areaSuggestionsTemplate = document.createElement('template');
areaSuggestionsTemplate.innerHTML = `
    <style>
        :host { display: block; margin-bottom: 20px; }
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
        }
        .suggestions-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex; /* Các thẻ a nằm trên một hàng */
            flex-wrap: wrap; /* Cho phép các thẻ a xuống dòng */
            gap: 10px; /* Khoảng cách giữa các thẻ a */
            align-items: center; /* Căn giữa các thẻ a */
        }
        .suggestions-list li a { /* Bỏ li đi nếu không cần thiết nữa */
            padding: 5px 10px;
            background-color: var(--light-gray-color);
            border-radius: var(--border-radius);
            color: var(--secondary-color);
            text-decoration: none;
            transition: background-color 0.3s, color 0.3s;
            display: inline-block; /* Để padding có tác dụng đúng */
        }
        .suggestions-list li a:hover {
            background-color: var(--primary-color);
            color: var(--white-color);
        }
        .view-more-btn {
            background: none;
            border: none;
            color: var(--primary-color);
            text-decoration: underline;
            cursor: pointer;
            padding: 5px 0; /* Điều chỉnh padding nếu cần */
            /* margin-left: 5px; /* Không cần margin nếu đã có gap */
            font-size: 0.95em;
            white-space: nowrap; /* Không xuống dòng chữ "Xem thêm" */
        }
        .view-more-btn:hover {
            color: var(--secondary-color);
        }
    </style>
    <div class="suggestions-container">
        <span>Gợi ý khu vực: </span>
        <ul class="suggestions-list" id="visible-areas"></ul>
        <button class="view-more-btn" id="view-more-areas">Xem thêm</button>
    </div>
`;

// Class AreaSuggestions giữ nguyên, logic renderVisibleAreas không cần thay đổi lớn
// Chỉ cần đảm bảo thẻ `a` được append vào `ul`
class AreaSuggestions extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(areaSuggestionsTemplate.content.cloneNode(true));

        this._visibleCount = 5;
        this._areas = [];
    }

    connectedCallback() {
        const cityName = this.dataset.city || "TP. Hồ Chí Minh";
        this._areas = allAreasData[cityName] || []; // allAreasData is defined above the template

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
            const li = document.createElement('li'); // Vẫn dùng li để dễ quản lý
            const a = document.createElement('a');
            a.href = `#khu-vuc-${area.toLowerCase().replace(/\s+/g, '-')}`;
            a.textContent = area;
            li.appendChild(a);
            visibleAreasContainer.appendChild(li);
        });

        if (this._areas.length <= this._visibleCount) {
            this.shadowRoot.getElementById('view-more-areas').classList.add('hidden');
        } else {
            this.shadowRoot.getElementById('view-more-areas').classList.remove('hidden');
        }
    }
    // ... (phần showPopupWithAllAreas, observedAttributes, attributeChangedCallback giữ nguyên)
    showPopupWithAllAreas() {
        const popup = document.getElementById('area-list-popup');
        const contentDiv = document.getElementById('area-list-content');
        if (!popup || !contentDiv) {
            console.error("Popup elements not found in the main document.");
            return;
        }

        contentDiv.innerHTML = ''; // Clear previous content
        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.display = 'grid';
        ul.style.gridTemplateColumns = 'repeat(auto-fill, minmax(150px, 1fr))';
        ul.style.gap = '10px';


        this._areas.forEach(area => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#khu-vuc-${area.toLowerCase().replace(/\s+/g, '-')}`;
            a.textContent = area;
            a.style.display = 'block';
            a.style.padding = '8px';
            a.style.backgroundColor = 'var(--light-gray-color)';
            a.style.borderRadius = 'var(--border-radius)';
            a.style.color = 'var(--secondary-color)';
            a.style.textDecoration = 'none';
            a.onmouseover = () => { a.style.backgroundColor = 'var(--primary-color)'; a.style.color = 'var(--white-color)'; };
            a.onmouseout = () => { a.style.backgroundColor = 'var(--light-gray-color)'; a.style.color = 'var(--secondary-color)';};
            li.appendChild(a);
            ul.appendChild(li);
        });
        contentDiv.appendChild(ul);
        popup.show(); // Assuming ModalPopup has a show() method
    }

    static get observedAttributes() {
        return ['data-city'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-city' && oldValue !== newValue) {
            const cityName = newValue || "TP. Hồ Chí Minh";
            this._areas = allAreasData[cityName] || [];
            this.renderVisibleAreas();
        }
    }
}
customElements.define('area-suggestions', AreaSuggestions);
