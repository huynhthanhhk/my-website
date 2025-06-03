// js/components/CustomPagination.js
const paginationTemplate = document.createElement('template');
paginationTemplate.innerHTML = `
    <style>
        :host { display: block; margin-top: 30px; margin-bottom: 20px; }
        nav { display: flex; justify-content: center; align-items: center; }
        ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 8px; }
        li button {
            min-width: 40px; height: 40px; 
            padding: 5px 10px; border: 1px solid var(--medium-gray-color, #ccc);
            background-color: var(--white-color, #fff); color: var(--primary-color, #53b966);
            cursor: pointer; border-radius: var(--border-radius, 5px);
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
            font-size: 0.95rem;
        }
        li button:hover { background-color: var(--light-gray-color, #f4f4f4); border-color: var(--primary-color, #53b966); }
        li button.active {
            background-color: var(--primary-color, #53b966); color: var(--text-color-inverted, #fff);
            border-color: var(--primary-color, #53b966); font-weight: bold;
        }
        li button:disabled {
            color: var(--medium-gray-color, #ccc); cursor: not-allowed; background-color: #f9f9f9;
            opacity: 0.7;
        }
        .ellipsis { padding: 8px 5px; color: var(--dark-gray-color, #6c757d); display: flex; align-items: center; height: 40px;}
    </style>
    <nav aria-label="Phân trang">
        <ul id="pagination-list"></ul>
    </nav>
`;
class CustomPagination extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).appendChild(paginationTemplate.content.cloneNode(true));
        this._paginationList = this.shadowRoot.getElementById('pagination-list');
        this._currentPage = 1; 
        this._totalPages = 1;
    }

    connectedCallback() { 
        this._updateStateFromAttributes(); 
        this.render(); 
    }

    static get observedAttributes() { 
        return ['data-current-page', 'data-total-pages']; 
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) { 
            this._updateStateFromAttributes(); 
            this.render(); 
        }
    }

    _updateStateFromAttributes() {
        const newCurrentPage = parseInt(this.dataset.currentPage, 10) || 1;
        const newTotalPages = parseInt(this.dataset.totalPages, 10) || 1;

        this._totalPages = Math.max(1, newTotalPages); // Total pages không bao giờ nhỏ hơn 1
        this._currentPage = Math.max(1, Math.min(newCurrentPage, this._totalPages)); // Current page nằm trong khoảng [1, totalPages]
    }

    render() {
        this._paginationList.innerHTML = ''; // Xóa các nút cũ

        if (this._totalPages <= 1 && this._currentPage === 1) { // Không hiển thị nếu chỉ có 1 trang và đang ở trang 1
             // Hoặc nếu totalPages = 0 (tức là không có item nào)
            const noItems = (parseInt(this.dataset.totalPages, 10) === 0);
            if (noItems || this._totalPages <=1 ) return;
        }


        const createPageItem = (page, textContent, isActive = false, isDisabled = false, isControl = false) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.innerHTML = textContent || page.toString(); // Cho phép HTML (vd: &laquo;)
            if (isActive) button.classList.add('active');
            if (isDisabled) button.disabled = true;
            
            if (isControl) {
                button.setAttribute('aria-label', textContent === '&laquo;' ? 'Trang trước' : 'Trang sau');
            } else {
                button.setAttribute('aria-label', `Đi đến trang ${page}`);
            }

            if (!isDisabled && typeof page === 'number' && page >= 1 && page <= this._totalPages) {
                button.addEventListener('click', () => {
                    if (this._currentPage === page) return; // Không làm gì nếu click vào trang hiện tại
                    // Gửi sự kiện để ProductList xử lý
                    this.dispatchEvent(new CustomEvent('page-change', { 
                        detail: { page: page },
                        bubbles: true, // Cho phép event nổi bọt
                        composed: true // Cho phép event vượt qua ranh giới Shadow DOM
                    }));
                    // Không tự cập nhật this._currentPage ở đây nữa, ProductList sẽ cập nhật data-current-page
                    // và attributeChangedCallback sẽ trigger re-render.
                });
            }
            li.appendChild(button); 
            return li;
        };

        const addEllipsis = () => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="ellipsis" aria-hidden="true">...</span>`;
            this._paginationList.appendChild(li);
        };

        // Nút "Trang trước"
        this._paginationList.appendChild(createPageItem(this._currentPage - 1, '&laquo;', false, this._currentPage === 1, true));

        // Logic hiển thị các nút số trang (ví dụ: 1 ... 3 4 5 ... 10)
        // Đơn giản hóa: hiển thị 2 trang trước, trang hiện tại, 2 trang sau, và nút đầu/cuối + ellipsis
        const pageLinksToShow = 1; // Số lượng page links ở mỗi bên của current page
        const showFirst = this._currentPage > pageLinksToShow + 1;
        const showLast = this._currentPage < this._totalPages - pageLinksToShow;
        const showEllipsisStart = this._currentPage > pageLinksToShow + 2;
        const showEllipsisEnd = this._currentPage < this._totalPages - pageLinksToShow - 1;

        if (showFirst) {
            this._paginationList.appendChild(createPageItem(1, '1'));
        }
        if (showEllipsisStart) {
            addEllipsis();
        }

        for (let i = Math.max(1, this._currentPage - pageLinksToShow); i <= Math.min(this._totalPages, this._currentPage + pageLinksToShow); i++) {
            this._paginationList.appendChild(createPageItem(i, i.toString(), i === this._currentPage));
        }

        if (showEllipsisEnd) {
            addEllipsis();
        }
        if (showLast && (this._currentPage + pageLinksToShow < this._totalPages)) { // Đảm bảo không trùng lặp nút cuối
            this._paginationList.appendChild(createPageItem(this._totalPages, this._totalPages.toString()));
        }


        // Nút "Trang sau"
        this._paginationList.appendChild(createPageItem(this._currentPage + 1, '&raquo;', false, this._currentPage === this._totalPages, true));
    }
}
customElements.define('custom-pagination', CustomPagination);