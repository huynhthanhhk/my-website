// js/components/ProductItem.js
const productItemTemplate = document.createElement('template');
productItemTemplate.innerHTML = `
    <style>
        /* CSS cho product-item.css */
        :host {
            display: block;
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            overflow: hidden; /* Để bo góc ảnh */
            box-shadow: var(--box-shadow);
            background-color: var(--white-color);
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        :host(:hover) {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .item-container {
            display: flex;
            flex-direction: column;
        }
        .item-image-wrapper {
            position: relative;
            width: 100%;
            padding-top: 75%; /* 4:3 Aspect Ratio */
            background-color: var(--light-gray-color); /* Placeholder bg */
            overflow: hidden; /* Cho ảnh trượt */
        }
        .item-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease; /* Cho hiệu ứng trượt */
        }
        /* Đơn giản hóa việc trượt ảnh: Giả sử có nhiều ảnh và chỉ hiện 1 */
        .item-image-wrapper:hover .item-image {
            /* transform: translateX(-100%); /* Ví dụ trượt ảnh (cần nhiều ảnh và JS phức tạp hơn) */
        }

        .image-overlay {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .image-count, .status-badge {
            background-color: rgba(0,0,0,0.6);
            color: var(--white-color);
            padding: 3px 8px;
            border-radius: var(--border-radius);
            font-size: 0.8em;
        }
        .status-badge.sold {
            background-color: #d9534f; /* Màu đỏ cho đã bán */
        }
        .status-badge.available {
            background-color: var(--primary-color);
        }
        .fav-icon {
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
            padding: 5px;
            cursor: pointer;
            width: 28px; /* Kích thước cố định */
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .fav-icon svg {
            width: 18px;
            height: 18px;
            fill: var(--medium-gray-color);
        }
        .fav-icon.active svg {
            fill: #e74c3c; /* Màu đỏ cho yêu thích */
        }

        .item-content {
            padding: 15px;
            cursor: pointer; /* Để click mở popup chi tiết */
        }
        .item-title { /* H3 */
            font-size: 1.15em;
            margin: 0 0 5px 0;
            color: var(--secondary-color);
            /* Giới hạn số dòng cho tiêu đề */
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            min-height: 2.3em; /* Đảm bảo chiều cao cho 2 dòng */
        }
        .item-address {
            font-size: 0.85em;
            color: var(--dark-gray-color);
            margin-bottom: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            min-height: 1.2em; /* Đảm bảo chiều cao cho 1 dòng */

        }
        .item-price {
            font-size: 1.25em;
            font-weight: bold;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        .item-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            font-size: 0.85em;
            color: var(--dark-gray-color);
        }
        .item-details span {
            background-color: #f0f0f0;
            padding: 3px 6px;
            border-radius: 3px;
        }
        .item-details svg { /* Icon cho chi tiết */
             width: 12px; height: 12px; fill: var(--dark-gray-color); vertical-align: middle; margin-right: 3px;
        }
    </style>
    <div class="item-container">
        <div class="item-image-wrapper">
            <img src="assets/images/placeholder-4-3.png" alt="Ảnh sản phẩm" class="item-image" id="productImage">
            <div class="image-overlay">
                <span class="image-count" id="imageCount">
                    <svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:white; margin-right:3px; vertical-align:middle;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h5v5H6V8zm7 0h5v2h-5V8zm0 3h5v2h-5v-2zM8 15h8v2H8v-2z"></path></svg>
                    1/5
                </span>
                <span class="fav-icon" id="favIcon" role="button" aria-pressed="false" aria-label="Yêu thích">
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </span>
            </div>
            <span class="status-badge available" id="statusBadge">Còn hàng</span>
        </div>
        <div class="item-content" id="contentArea">
            <h3 class="item-title" id="title">Tiêu đề sản phẩm rất dài để kiểm tra giới hạn dòng</h3>
            <p class="item-address" id="address">Địa chỉ sản phẩm, Quận, TP</p>
            <p class="item-price" id="price">5.2 tỷ</p>
            <div class="item-details" id="details">
                <span><svg viewBox="0 0 24 24"><path d="M7 14c-1.66 0-3-1.34-3-3S5.34 8 7 8s3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm10-4H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H7V8h10v10zM17 14c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path></svg><span id="bedrooms">2 PN</span></span>
                <span><svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 12H9V5h10v11zM12.5 8C11.12 8 10 9.12 10 10.5S11.12 13 12.5 13 15 11.88 15 10.5 13.88 8 12.5 8z"></path></svg><span id="wc">2 WC</span></span>
                <span><svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.29-6.29L22 12V6h-6z"></path></svg><span id="area">75 m²</span></span>
                <span id="furniture">Đầy đủ NT</span>
            </div>
        </div>
    </div>
`;

class ProductItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(productItemTemplate.content.cloneNode(true));
        this._favIcon = this.shadowRoot.getElementById('favIcon');
        this._contentArea = this.shadowRoot.getElementById('contentArea');
        this._productId = null; // Để lưu ID sản phẩm nếu cần
    }

    connectedCallback() {
        this._favIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Ngăn sự kiện click nổi lên contentArea
            this.toggleFavorite();
        });
        this._contentArea.addEventListener('click', () => {
            this.showProductDetail();
        });

        // Example of image swipe (very basic, just changes a class, no actual image change)
        const imageWrapper = this.shadowRoot.querySelector('.item-image-wrapper');
        let touchstartX = 0;
        imageWrapper.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true});
        imageWrapper.addEventListener('touchend', e => {
            let touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 50) { // Swiped left
                console.log(`Swiped left on item ${this._productId}`);
                // Logic to change image if multiple images are present
            }
            if (touchendX > touchstartX + 50) { // Swiped right
                console.log(`Swiped right on item ${this._productId}`);
            }
        }, {passive: true});
    }

    set productData(data) {
        this._productId = data.id;
        this.shadowRoot.getElementById('productImage').src = data.image || 'assets/images/placeholder-4-3.png';
        this.shadowRoot.getElementById('productImage').alt = data.title || 'Ảnh sản phẩm';
        this.shadowRoot.getElementById('imageCount').innerHTML = `<svg viewBox="0 0 24 24" style="width:12px; height:12px; fill:white; margin-right:3px; vertical-align:middle;"><path d="M20 4V2H4v2H2v16h20V4h-2zm-2 14H6V6h12v12zM11 11H9v2h2v-2zm4 0h-2v2h2v-2zm-4-4H9v2h2V7zm4 0h-2v2h2V7z"></path></svg> ${data.imageCount || '1/1'}`;
        this.shadowRoot.getElementById('title').textContent = data.title || 'N/A';
        this.shadowRoot.getElementById('address').textContent = data.address || 'N/A';
        this.shadowRoot.getElementById('price').textContent = data.price || 'Liên hệ';
        this.shadowRoot.getElementById('bedrooms').textContent = `${data.bedrooms || 'N/A'} PN`;
        this.shadowRoot.getElementById('wc').textContent = `${data.wc || 'N/A'} WC`;
        this.shadowRoot.getElementById('area').textContent = `${data.area || 'N/A'} m²`;
        this.shadowRoot.getElementById('furniture').textContent = data.furniture || 'N/A';

        const statusBadge = this.shadowRoot.getElementById('statusBadge');
        if (data.status === 'sold') {
            statusBadge.textContent = 'Đã bán';
            statusBadge.className = 'status-badge sold';
        } else {
            statusBadge.textContent = 'Còn hàng';
            statusBadge.className = 'status-badge available';
        }
        if (data.isFavorite) {
            this._favIcon.classList.add('active');
            this._favIcon.setAttribute('aria-pressed', 'true');
        } else {
            this._favIcon.classList.remove('active');
             this._favIcon.setAttribute('aria-pressed', 'false');
        }
    }

    toggleFavorite() {
        const isActive = this._favIcon.classList.toggle('active');
        this._favIcon.setAttribute('aria-pressed', isActive.toString());
        console.log(`Product ${this._productId} favorite status: ${isActive}`);
        // Dispatch event or call API to update favorite status
    }

    showProductDetail() {
        console.log(`Show details for product ${this._productId}`);
        const detailPopup = document.getElementById('product-detail-popup');
        if (detailPopup) {
            // Update popup content based on this._productId or data
            const title = this.shadowRoot.getElementById('title').textContent;
            const price = this.shadowRoot.getElementById('price').textContent;
            const address = this.shadowRoot.getElementById('address').textContent;
            const imageSrc = this.shadowRoot.getElementById('productImage').src;

            const popupContent = detailPopup.querySelector('#product-detail-content');
            if (popupContent) {
                 popupContent.innerHTML = `
                    <img src="${imageSrc}" alt="${title}" style="max-width: 100%; height: auto; border-radius: var(--border-radius); margin-bottom:15px;">
                    <p><strong>Địa chỉ:</strong> ${address}</p>
                    <p><strong>Giá:</strong> <span class="highlight-price">${price}</span></p>
                    <p><strong>Chi tiết:</strong> ${this.shadowRoot.getElementById('bedrooms').textContent}, ${this.shadowRoot.getElementById('wc').textContent}, ${this.shadowRoot.getElementById('area').textContent}, ${this.shadowRoot.getElementById('furniture').textContent}.</p>
                    <p>Mô tả chi tiết sản phẩm ${this._productId} sẽ được cập nhật sau. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.</p>
                `;
            }
            const popupTitle = detailPopup.querySelector('h2');
            if(popupTitle) popupTitle.textContent = title;

            detailPopup.show();
        }
    }
}
customElements.define('product-item', ProductItem);
