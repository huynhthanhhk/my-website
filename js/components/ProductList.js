// js/components/ProductList.js
import productsDataFromFile from '../../data/products.js'; // Sử dụng dữ liệu từ file ngoài

const productListTemplate = document.createElement('template');
productListTemplate.innerHTML = `
    <style>
        :host { display: block; }
        .product-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr); 
            gap: 15px; /* Khoảng cách đã giảm */
            margin-bottom: 20px;
        }
        @media (max-width: 768px) {
            .product-grid {
                grid-template-columns: 1fr; 
                gap: 12px; 
            }
        }
        .message-feedback {
            grid-column: 1 / -1; text-align: center; padding: 30px 15px;
            color: var(--dark-gray-color, #666); font-size: 1.1em;
            border: 1px dashed var(--medium-gray-color, #ccc);
            border-radius: var(--border-radius, 5px);
            background-color: var(--light-gray-color, #f9f9f9); margin-top: 10px;
        }
    </style>
    <div class="product-grid" id="grid">
        <div class="message-feedback loading">Đang tải danh sách sản phẩm...</div>
    </div>
`;

class ProductList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(productListTemplate.content.cloneNode(true));
        
        this._grid = this.shadowRoot.getElementById('grid');
        this._allProductsData = []; // Lưu trữ toàn bộ dữ liệu sản phẩm gốc
        this._displayedProductsData = []; // Dữ liệu đang được dùng để hiển thị (có thể đã filter)
        
        this.itemsPerPage = 6;   // Mặc định 6 sản phẩm mỗi trang
        this.currentPage = 1;    // Trang hiện tại, bắt đầu từ 1
    }

    connectedCallback() {
        if (this.hasAttribute('items-per-page')) {
            const itemsAttr = parseInt(this.getAttribute('items-per-page'), 10);
            if (!isNaN(itemsAttr) && itemsAttr > 0) {
                this.itemsPerPage = itemsAttr;
            }
        }
        
        this.loadInitialProducts(); // Tải dữ liệu ban đầu

        // Lắng nghe sự kiện page-change từ custom-pagination
        // Đảm bảo rằng ProductList và CustomPagination được đặt trong cùng một scope DOM cha gần nhất
        // để querySelector hoạt động đúng, hoặc sử dụng document.getElementById nếu CustomPagination có ID.
        const paginationContainer = this.closest('.section-2-right') || document; // Tìm trong container cha hoặc toàn document
        const paginationElement = paginationContainer.querySelector('custom-pagination');
        
        if (paginationElement) {
            paginationElement.addEventListener('page-change', (event) => {
                if (event.detail && typeof event.detail.page === 'number') {
                    this.currentPage = event.detail.page;
                    this.renderProductsForCurrentPage();
                    // Cập nhật lại data-current-page cho pagination sau khi render
                    // để đảm bảo nó luôn đúng, đặc biệt nếu currentPage bị điều chỉnh
                    this.updatePaginationAttributes(); 
                }
            });
        } else {
            console.warn("ProductList: Không tìm thấy custom-pagination element.");
        }
    }

    /**
     * Tải dữ liệu sản phẩm ban đầu.
     */
    loadInitialProducts() {
        if (!productsDataFromFile || !Array.isArray(productsDataFromFile)) {
            console.error("ProductList.js: Dữ liệu sản phẩm (productsDataFromFile) không hợp lệ!");
            this._grid.innerHTML = `<div class="message-feedback no-results">Lỗi: Không thể tải dữ liệu sản phẩm.</div>`;
            this._allProductsData = [];
            this._displayedProductsData = [];
            this.updatePaginationAttributes();
            return;
        }

        this._allProductsData = productsDataFromFile;
        this._displayedProductsData = [...this._allProductsData]; // Ban đầu hiển thị tất cả
        
        this.currentPage = 1; // Reset về trang đầu khi tải dữ liệu mới
        this.renderProductsForCurrentPage();
        this.updatePaginationAttributes();
    }
    
    /**
     * Cập nhật các thuộc tính data-* cho component custom-pagination.
     */
    updatePaginationAttributes() {
        const totalItems = this._displayedProductsData ? this._displayedProductsData.length : 0;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        const paginationContainer = this.closest('.section-2-right') || document;
        const paginationElement = paginationContainer.querySelector('custom-pagination');

        if (paginationElement) {
            const effectiveTotalPages = totalPages > 0 ? totalPages : 1;
            // Chỉ cập nhật nếu giá trị thực sự thay đổi để tránh re-render không cần thiết của pagination
            if (paginationElement.dataset.totalPages !== effectiveTotalPages.toString()) {
                paginationElement.dataset.totalPages = effectiveTotalPages.toString();
            }
            
            // Điều chỉnh currentPage nếu nó vượt quá số trang mới (ví dụ sau khi filter)
            if (this.currentPage > effectiveTotalPages) {
                this.currentPage = effectiveTotalPages;
            }
            if (paginationElement.dataset.currentPage !== this.currentPage.toString()) {
                paginationElement.dataset.currentPage = this.currentPage.toString();
            }
        }
    }

    /**
     * Hiển thị các sản phẩm cho trang hiện tại dựa trên _displayedProductsData.
     */
    renderProductsForCurrentPage() {
        this._grid.innerHTML = ''; 

        if (!this._displayedProductsData || this._displayedProductsData.length === 0) {
            this._grid.innerHTML = `<div class="message-feedback no-results">Không tìm thấy sản phẩm nào phù hợp.</div>`;
            return; 
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToRender = this._displayedProductsData.slice(startIndex, endIndex);

        if (productsToRender.length === 0 && this._displayedProductsData.length > 0 && this.currentPage > 1) {
            // Nếu trang hiện tại không có sản phẩm (ví dụ do filter làm giảm số trang)
            // quay về trang 1 và render lại (hoặc trang cuối cùng có sản phẩm)
            this.currentPage = Math.ceil(this._displayedProductsData.length / this.itemsPerPage) || 1;
            this.updatePaginationAttributes(); // Cập nhật pagination trước
            this.renderProductsForCurrentPage(); // Rồi render lại
            return;
        }
        
        productsToRender.forEach(productData => {
            const productItemElement = document.createElement('product-item');
            productItemElement.productData = productData; 
            this._grid.appendChild(productItemElement);
        });
    }

    /**
     * Hàm này sẽ được gọi từ bên ngoài (ví dụ từ main.js sau khi có filter)
     * để cập nhật danh sách sản phẩm hiển thị.
     * @param {Object} filters - Đối tượng chứa các tiêu chí filter.
     */
    applyFilters(filters) {
        // console.log("ProductList: Applying filters", filters);
        // Logic filter dữ liệu gốc (_allProductsData) dựa trên `filters`
        // Đây là ví dụ rất đơn giản, bạn cần triển khai logic filter phức tạp hơn
        this._displayedProductsData = this._allProductsData.filter(product => {
            let match = true;
            if (filters['Giá bán']) {
                const priceFilter = filters['Giá bán'];
                const productPrice = parseFloat(product.price.replace(' tỷ','')); // Cần chuẩn hóa giá sản phẩm
                if (priceFilter.type === 'defined' && priceFilter.value !== 'all') {
                    if (priceFilter.value === '0-3' && productPrice >= 3) match = false;
                    if (priceFilter.value === '3-5' && (productPrice < 3 || productPrice >= 5)) match = false;
                    if (priceFilter.value === '10-' && productPrice < 10) match = false;
                } else if (priceFilter.type === 'custom' && priceFilter.customRange) {
                    if (productPrice > priceFilter.customRange.value) match = false; // Giả sử range slider đơn là max value
                }
            }
            if (filters['Diện tích']) {
                const areaFilter = filters['Diện tích'];
                const productArea = parseFloat(product.area);
                if (areaFilter.type === 'defined' && areaFilter.value !== 'all') {
                    // Triển khai logic cho các khoảng diện tích
                } else if (areaFilter.type === 'custom' && areaFilter.customRange) {
                    if (productArea > areaFilter.customRange.value) match = false;
                }
            }
            // Thêm các điều kiện filter khác (Số phòng ngủ, Số toilet, Hiện trạng, Pháp lý)
            if (filters['Số phòng ngủ'] && filters['Số phòng ngủ'].value !== 'all') {
                if (filters['Số phòng ngủ'].value === '4+' && product.bedrooms < 4) match = false;
                else if (filters['Số phòng ngủ'].value !== '4+' && product.bedrooms != filters['Số phòng ngủ'].value) match = false;
            }
            // ... các filter khác ...
            return match;
        });

        this.currentPage = 1; // Reset về trang đầu tiên sau khi filter
        this.renderProductsForCurrentPage();
        this.updatePaginationAttributes(); // Cập nhật lại tổng số trang và trang hiện tại cho pagination
        
        // Cập nhật số lượng kết quả hiển thị ở `search-results-info` (nếu cần)
        const countSpan = document.getElementById('search-results-count');
        if(countSpan) countSpan.textContent = this._displayedProductsData.length;
    }
}
customElements.define('product-list', ProductList);