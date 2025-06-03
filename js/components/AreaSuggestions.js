// js/components/AreaSuggestions.js
const allAreasData = {
    "TP. Hồ Chí Minh": ["Tân Phú", "Quận 1", "Bình Thạnh", "Quận 3", "Quận 5", "Quận 7", "Gò Vấp", "Bình Tân", "Quận 2", "Quận 4", "Quận 6", "Quận 8", "Quận 9", "Quận 10", "Quận 11", "Quận 12", "Thủ Đức", "Bình Chánh", "Cần Giờ", "Củ Chi", "Hóc Môn", "Nhà Bè"],
    "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Hai Bà Trưng", "Đống Đa", "Tây Hồ", "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Hà Đông"]
};
const areaSuggestionsTemplate = document.createElement('template');
areaSuggestionsTemplate.innerHTML = `
    <style>
        :host { display: block; margin-bottom: 20px; }
        .suggestions-container {
            font-size: 0.95em; color: var(--dark-gray-color); display: flex;
            align-items: center; flex-wrap: wrap; gap: 10px;
        }
        .suggestions-container > span { white-space: nowrap; font-weight: 500; color: var(--text-color); }
        .suggestions-list {
            list-style: none; padding: 0; margin: 0; display: flex;
            flex-wrap: wrap; gap: 8px; align-items: center;
        }
        .suggestions-list li a {
            padding: 6px 12px; background-color: var(--light-gray-color);
            border-radius: var(--border-radius); color: var(--secondary-color);
            text-decoration: none; transition: background-color 0.2s, color 0.2s;
            display: inline-block; font-size: 0.9em; border: 1px solid transparent;
        }
        .suggestions-list li a:hover { background-color: var(--primary-color); color: var(--white-color); border-color: var(--primary-color); }
        .view-more-btn {
            background: none; border: none; color: var(--primary-color); text-decoration: underline;
            cursor: pointer; padding: 5px 0; font-size: 0.95em; white-space: nowrap; font-weight: 500;
        }
        .view-more-btn:hover { color: var(--secondary-color); text-decoration: none; }
        .hidden { display: none !important; }
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
        this.attachShadow({ mode: 'open' }).appendChild(areaSuggestionsTemplate.content.cloneNode(true));
        this._visibleCount = 5; this._areas = []; this._cityName = "TP. Hồ Chí Minh";
    }
    connectedCallback() {
        this._cityName = this.dataset.city || "TP. Hồ Chí Minh";
        this._areas = allAreasData[this._cityName] || [];
        this.renderVisibleAreas();
        this.shadowRoot.getElementById('view-more-areas').addEventListener('click', () => this.showPopupWithAllAreas());
    }
    renderVisibleAreas() {
        const visibleAreasContainer = this.shadowRoot.getElementById('visible-areas');
        visibleAreasContainer.innerHTML = '';
        const areasToShow = this._areas.slice(0, this._visibleCount);
        areasToShow.forEach(area => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#khu-vuc-${this._cityName.toLowerCase().replace(/\s+/g, '-')}-${area.toLowerCase().replace(/\s+/g, '-')}`;
            a.textContent = area;
            li.appendChild(a);
            visibleAreasContainer.appendChild(li);
        });
        const viewMoreButton = this.shadowRoot.getElementById('view-more-areas');
        viewMoreButton.classList.toggle('hidden', this._areas.length <= this._visibleCount);
    }
    showPopupWithAllAreas() {
        const popup = document.getElementById('area-list-popup');
        const contentDiv = document.getElementById('area-list-content');
        if (!popup || !contentDiv) { console.error("ModalPopup 'area-list-popup' not found."); return; }
        contentDiv.innerHTML = '';
        const ul = document.createElement('ul');
        ul.style.cssText = 'list-style:none; padding:0; display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px;';
        this._areas.forEach(area => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#khu-vuc-${this._cityName.toLowerCase().replace(/\s+/g, '-')}-${area.toLowerCase().replace(/\s+/g, '-')}`;
            a.textContent = area;
            a.style.cssText = 'display:block; padding:10px; background-color:var(--light-gray-color); border-radius:var(--border-radius); color:var(--secondary-color); text-decoration:none; text-align:center; transition:background-color 0.2s, color 0.2s;';
            a.onmouseover = () => { a.style.backgroundColor = 'var(--primary-color)'; a.style.color = 'var(--white-color)'; };
            a.onmouseout = () => { a.style.backgroundColor = 'var(--light-gray-color)'; a.style.color = 'var(--secondary-color)';};
            li.appendChild(a);
            ul.appendChild(li);
        });
        contentDiv.appendChild(ul);
        if (typeof popup.show === 'function') popup.show(); else popup.setAttribute('open', '');
    }
    static get observedAttributes() { return ['data-city']; }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-city' && oldValue !== newValue) {
            this._cityName = newValue || "TP. Hồ Chí Minh";
            this._areas = allAreasData[this._cityName] || [];
            this.renderVisibleAreas();
        }
    }
}
customElements.define('area-suggestions', AreaSuggestions);