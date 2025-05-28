// js/components/CustomPagination.js
const paginationTemplate = document.createElement('template');
paginationTemplate.innerHTML = `
    <style>
        /* CSS cho pagination.css */
        :host {
            display: block;
            margin-top: 30px;
            margin-bottom: 20px;
        }
        nav {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            gap: 5px;
        }
        li button {
            min-width: 38px; /* Kích thước nút */
            height: 38px;
            padding: 5px 10px;
            border: 1px solid var(--medium-gray-color);
            background-color: var(--white-color);
            color: var(--primary-color);
            cursor: pointer;
            border-radius: var(--border-radius);
            transition: background-color 0.3s, color 0.3s;
        }
        li button:hover {
            background-color: var(--light-gray-color);
            border-color: var(--primary-color);
        }
        li button.active {
            background-color: var(--primary-color);
            color: var(--white-color);
            border-color: var(--primary-color);
            font-weight: bold;
        }
        li button:disabled {
            color: var(--medium-gray-color);
            cursor: not-allowed;
            background-color: #f9f9f9;
        }
        .ellipsis {
            padding: 8px 0;
            color: var(--dark-gray-color);
        }
    </style>
    <nav aria-label="Phân trang">
        <ul id="pagination-list">
            </ul>
    </nav>
`;

class CustomPagination extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(paginationTemplate.content.cloneNode(true));
        this._paginationList = this.shadowRoot.getElementById('pagination-list');
        this._currentPage = 1;
        this._totalPages = 1;
    }

    connectedCallback() {
        this._currentPage = parseInt(this.dataset.currentPage, 10) || 1;
        this._totalPages = parseInt(this.dataset.totalPages, 10) || 1;
        this.render();
    }

    render() {
        this._paginationList.innerHTML = ''; // Clear existing items

        const createPageItem = (page, text, isActive = false, isDisabled = false) => {
            const li = document.createElement('li');
            const button = document.createElement('button');
            button.textContent = text || page;
            if (isActive) button.classList.add('active');
            if (isDisabled) button.disabled = true;
            if (!isDisabled && page) {
                button.addEventListener('click', () => {
                    this.dispatchEvent(new CustomEvent('page-change', { detail: { page: page } }));
                    // For demo, directly update and re-render
                    this._currentPage = page;
                    this.dataset.currentPage = page; // Update dataset for visual consistency
                    // this.render(); // Re-render if not handled by parent
                    console.log(`Page changed to: ${page}`);
                });
            }
            li.appendChild(button);
            return li;
        };

        const addEllipsis = () => {
            const li = document.createElement('li');
            li.textContent = '...';
            li.className = 'ellipsis';
            this._paginationList.appendChild(li);
        };

        // Previous button
        this._paginationList.appendChild(createPageItem(this._currentPage - 1, 'Trước', false, this._currentPage === 1));

        const pageRange = 2; // Number of pages to show around current page
        let startPage = Math.max(1, this._currentPage - pageRange);
        let endPage = Math.min(this._totalPages, this._currentPage + pageRange);

        if (startPage > 1) {
            this._paginationList.appendChild(createPageItem(1, '1'));
            if (startPage > 2) {
                addEllipsis();
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            this._paginationList.appendChild(createPageItem(i, i.toString(), i === this._currentPage));
        }

        if (endPage < this._totalPages) {
            if (endPage < this._totalPages - 1) {
                addEllipsis();
            }
            this._paginationList.appendChild(createPageItem(this._totalPages, this._totalPages.toString()));
        }

        // Next button
        this._paginationList.appendChild(createPageItem(this._currentPage + 1, 'Sau', false, this._currentPage === this._totalPages));
    }

    static get observedAttributes() {
        return ['data-current-page', 'data-total-pages'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            if (name === 'data-current-page') this._currentPage = parseInt(newValue, 10) || 1;
            if (name === 'data-total-pages') this._totalPages = parseInt(newValue, 10) || 1;
            this.render();
        }
    }
}
customElements.define('custom-pagination', CustomPagination);
