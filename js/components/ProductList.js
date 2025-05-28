// js/components/ProductList.js
// Import ProductItem if needed: import './ProductItem.js';

const productListTemplate = document.createElement('template');
productListTemplate.innerHTML = `
    <style>
        /* CSS cho product-list.css */
        :host { display: block; }
        .product-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr); /* 2 cột */
            gap: 20px;
        }
        @media (max-width: 768px) {
            .product-grid {
                grid-template-columns: 1fr; /* 1 cột trên mobile */
            }
        }
        .loading, .no-results {
            grid-column: 1 / -1; /* Span all columns */
            text-align: center;
            padding: 20px;
            color: var(--dark-gray-color);
        }
    </style>
    <div class="product-grid" id="grid">
        <div class="loading">Đang tải sản phẩm...</div>
    </div>
`;

class ProductList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(productListTemplate.content.cloneNode(true));
        this._grid = this.shadowRoot.getElementById('grid');
    }

    connectedCallback() {
        this.fetchAndRenderProducts(); // Hoặc nhận data qua attribute/property
    }

    // Giả lập fetch data
    async fetchAndRenderProducts() {
        // Trong thực tế, bạn sẽ fetch từ API
        const mockProducts = [
            { id: 1, title: "Căn hộ The Sun Avenue Quận 2, view sông thoáng mát", address: "28 Mai Chí Thọ, An Phú, Quận 2, TP.HCM", price: "3.5 tỷ", bedrooms: 2, wc: 2, area: 70, furniture: "Đầy đủ NT", image: "assets/images/product1.jpg", imageCount: "1/8", status: "available", isFavorite: false },
            { id: 2, title: "Biệt thự Vinhomes Grand Park, tiện ích đẳng cấp", address: "Nguyễn Xiển, Long Thạnh Mỹ, Quận 9, TP.HCM", price: "15 tỷ", bedrooms: 4, wc: 5, area: 250, furniture: "Nội thất cơ bản", image: "assets/images/product2.jpg", imageCount: "1/12", status: "available", isFavorite: true },
            { id: 3, title: "Nhà phố mặt tiền kinh doanh đường Lê Văn Sỹ", address: "Lê Văn Sỹ, Phường 1, Tân Bình, TP.HCM", price: "12.8 tỷ", bedrooms: 3, wc: 3, area: 80, furniture: "Không nội thất", image: "assets/images/product3.jpg", imageCount: "1/6", status: "sold" },
            { id: 4, title: "Chung cư Opal Boulevard, gần Gigamall Thủ Đức", address: "Phạm Văn Đồng, An Bình, Dĩ An, Bình Dương (Giáp Thủ Đức)", price: "2.1 tỷ", bedrooms: 2, wc: 1, area: 65, furniture: "Đầy đủ NT", image: "assets/images/product4.jpg", imageCount: "1/5", status: "available" },
            { id: 5, title: "Penthouse Masteri Thảo Điền, tầm nhìn panorama", address: "159 Xa lộ Hà Nội, Thảo Điền, Quận 2, TP.HCM", price: "25 tỷ", bedrooms: 3, wc: 3, area: 180, furniture: "Đầy đủ cao cấp", image: "assets/images/product5.jpg", imageCount: "1/10", status: "available", isFavorite: true },
            { id: 6, title: "Căn hộ dịch vụ cho thuê Q1, full tiện nghi", address: "Nguyễn Trãi, Phường Bến Thành, Quận 1, TP.HCM", price: "1.8 tỷ", bedrooms: 1, wc: 1, area: 50, furniture: "Đầy đủ NT", image: "assets/images/product6.jpg", imageCount: "1/4", status: "sold" },
        ];
        // Thêm ảnh placeholder thực tế vào thư mục assets/images/productX.jpg hoặc dùng placeholder-4-3.png

        // Giả lập thời gian tải
        setTimeout(() => {
            this.renderProducts(mockProducts);
        }, 500);
    }

    renderProducts(products) {
        this._grid.innerHTML = ''; // Clear loading or previous items
        if (!products || products.length === 0) {
            this._grid.innerHTML = `<div class="no-results">Không tìm thấy sản phẩm phù hợp.</div>`;
            return;
        }

        products.forEach(productData => {
            const productItem = document.createElement('product-item');
            productItem.productData = productData;
            this._grid.appendChild(productItem);
        });
    }
}
customElements.define('product-list', ProductList);
