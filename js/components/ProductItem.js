// js/components/ProductItem.js
const productItemTemplate = document.createElement('template');
productItemTemplate.innerHTML = `
    <style>
        :host {
            display: block;
            border: 1px solid var(--medium-gray-color, #ccc);
            border-radius: var(--border-radius, 5px);
            overflow: hidden;
            box-shadow: var(--box-shadow, 0 2px 8px rgba(0,0,0,0.1));
            background-color: var(--white-color, #fff);
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        :host(:hover) {
            transform: translateY(-4px); /* Hiệu ứng nổi lên một chút khi hover */
            box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }
        .item-container {
            display: flex;
            flex-direction: column;
            height: 100%; /* Đảm bảo các item có chiều cao đều nhau nếu cần trong grid */
        }

        /* --- Phần Ảnh Đại Diện --- */
        .item-image-wrapper {
            position: relative;
            width: 100%;
            padding-top: 75%; /* Tỷ lệ 4:3 (height = 3/4 * width) */
            background-color: var(--light-gray-color, #f4f4f4); /* Màu nền cho ảnh placeholder */
            overflow: hidden;
        }
        .item-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover; /* Đảm bảo ảnh che phủ toàn bộ, có thể bị cắt */
            transition: transform 0.4s ease;
        }
        .item-image-wrapper:hover .item-image {
            transform: scale(1.05); /* Hiệu ứng zoom nhẹ khi hover ảnh */
        }
        /* Các overlay trên ảnh (số lượng ảnh, yêu thích, đã bán/còn hàng) */
        .image-overlay-top {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            z-index: 1;
        }
        .image-count, .status-badge {
            background-color: rgba(0,0,0,0.65);
            color: var(--white-color, #fff);
            padding: 4px 8px;
            border-radius: var(--border-radius, 5px);
            font-size: 0.75em;
            display: flex;
            align-items: center;
        }
        .image-count svg {
             width: 12px; height: 12px; fill: currentColor; margin-right: 4px;
        }
        .fav-icon {
            background: rgba(255,255,255,0.9);
            border-radius: 50%;
            padding: 6px;
            cursor: pointer;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .fav-icon svg {
            width: 18px;
            height: 18px;
            fill: var(--medium-gray-color, #ccc);
            transition: fill 0.2s ease;
        }
        .fav-icon.active svg {
            fill: #e74c3c; /* Màu đỏ cho yêu thích */
        }
        .fav-icon:hover svg {
            fill: #e74c3c;
        }
        .status-badge {
            position: absolute;
            bottom: 10px; /* Đặt ở góc dưới trái hoặc phải */
            left: 10px;
            font-weight: 500;
        }
        .status-badge.sold {
            background-color: #c0392b; /* Màu đỏ đậm cho đã bán */
        }
        .status-badge.available {
            background-color: var(--primary-color, #53b966);
        }


        /* --- Phần Nội Dung Item --- */
        .item-content {
            padding: 15px;
            cursor: pointer; /* Để click mở popup chi tiết */
            display: flex;
            flex-direction: column;
            flex-grow: 1; /* Để nội dung chiếm hết không gian còn lại */
        }

        /* Tiêu đề (H3) */
        .item-title {
            font-size: 1.1em; /* Kích thước tiêu đề */
            font-weight: 600; /* Độ đậm */
            margin: 0 0 8px 0;
            color: var(--secondary-color, #004238);
            line-height: 1.4;
            /* Giới hạn số dòng cho tiêu đề */
            display: -webkit-box;
            -webkit-line-clamp: 2; /* Số dòng tối đa */
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            min-height: calc(1.1em * 1.4 * 2); /* Chiều cao tối thiểu cho 2 dòng */
        }

        /* Địa chỉ */
        .item-address {
            font-size: 0.85em;
            color: var(--dark-gray-color, #666);
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            line-height: 1.5;
            min-height: calc(0.85em * 1.5 * 1); /* Chiều cao tối thiểu cho 1 dòng */
        }
        .item-address svg {
            width: 14px; height: 14px; fill: currentColor; margin-right: 5px; flex-shrink: 0;
        }
        .item-address span {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        /* Giá (Nổi bật) */
        .item-price {
            font-size: 1.3em; /* Kích thước lớn hơn */
            font-weight: bold; /* In đậm */
            color: var(--primary-color, #53b966); /* Màu chính */
            margin-bottom: 12px;
        }

        /* Thông tin chi tiết: PN, WC, Diện tích, Nội thất */
        .item-details {
            display: flex;
            flex-wrap: wrap; /* Cho phép xuống dòng nếu không đủ chỗ */
            gap: 8px 12px; /* Khoảng cách giữa các mục (dọc và ngang) */
            font-size: 0.85em;
            color: var(--dark-gray-color, #666);
            margin-top: auto; /* Đẩy xuống dưới cùng nếu item-content flex-grow */
        }
        .item-details span { /* Mỗi mục thông tin (PN, WC,...) */
            display: flex;
            align-items: center;
            /* background-color: #f0f0f0; */ /* Tùy chọn: nền nhẹ cho các mục */
            /* padding: 3px 6px; */
            /* border-radius: 3px; */
        }
        .item-details svg { /* Icon cho chi tiết */
             width: 15px; height: 15px; fill: currentColor; vertical-align: middle; margin-right: 4px;
        }
    </style>
    <div class="item-container">
        <div class="item-image-wrapper">
            <img src="assets/images/placeholder-4-3.png" alt="Ảnh sản phẩm" class="item-image" id="productImage">
            
            <div class="image-overlay-top">
                <span class="image-count" id="imageCount">
                    <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm0 2v12h16V6H4zm2 2h5v5H6V8zm7 0h5v2h-5V8zm0 3h5v2h-5v-2zM8 15h8v2H8v-2z"></path></svg>
                    1/1
                </span>
                <span class="fav-icon" id="favIcon" role="button" aria-pressed="false" aria-label="Yêu thích">
                    <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </span>
            </div>
            <span class="status-badge available" id="statusBadge">Còn hàng</span>
        </div>

        <div class="item-content" id="contentArea">
            <h3 class="item-title" id="title">Tiêu đề sản phẩm ở đây</h3>
            <p class="item-address" id="address">
                <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg>
                <span id="addressText">Địa chỉ chi tiết của sản phẩm</span>
            </p>
            <p class="item-price" id="price">Liên hệ</p>
            <div class="item-details">
                <span title="Số phòng ngủ"><svg viewBox="0 0 24 24"><path d="M7 10.19V14H5v-3.81C4.39 9.64 4 8.86 4 8c0-1.1.9-2 2-2s2 .9 2 2c0 .86-.39 1.64-1 2.19zm12-2.19V14h-2v-3.81c-.61-.55-1-1.33-1-2.19 0-1.1.9-2 2-2s2 .9 2 2c0 .86-.39 1.64-1 2.19zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"></path></svg><span id="bedrooms">N/A</span></span>
                <span title="Số toilet"><svg viewBox="0 0 24 24"><path d="M6 20h12c1.1 0 2-.9 2-2v-4H4v4c0 1.1.9 2 2 2zM4 8h2.5c.54 0 .98.33 1.12.81C8.31 8.32 8.97 8 10 8s1.69.32 2.38.81c.14-.48.58-.81 1.12-.81H16V6H4v2zm15-4H5C3.9 4 3 4.9 3 6v12c0 .8.4 1.5.9 1.9L5 22h14l1.1-2.1c.5-.4.9-1.1.9-1.9V6c0-1.1-.9-2-2-2zM9 12c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm6 0c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"></path></svg><span id="wc">N/A</span></span>
                <span title="Diện tích"><svg viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 8H5V8h14v6zM6 10h2v2H6zm3 0h2v2H9zm3 0h2v2h-2z"></path></svg><span id="area">N/A m²</span></span>
                <span title="Nội thất"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"></path></svg><span id="furniture">N/A</span></span>
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
        this._productId = null;
    }

    connectedCallback() {
        this._favIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorite();
        });
        this._contentArea.addEventListener('click', () => {
            this.showProductDetail();
        });

        // Gợi ý cho image swipe (chưa triển khai đầy đủ, chỉ là console log)
        const imageWrapper = this.shadowRoot.querySelector('.item-image-wrapper');
        if (imageWrapper) {
            let touchstartX = 0;
            imageWrapper.addEventListener('touchstart', e => { touchstartX = e.changedTouches[0].screenX; }, {passive: true});
            imageWrapper.addEventListener('touchend', e => {
                let touchendX = e.changedTouches[0].screenX;
                if (touchendX < touchstartX - 50) { 
                    console.log(`Swiped left on item (ID: ${this._productId}). Implement image change.`);
                }
                if (touchendX > touchstartX + 50) {
                    console.log(`Swiped right on item (ID: ${this._productId}). Implement image change.`);
                }
            }, {passive: true});
        }
    }

    set productData(data) {
        if (!data) return;
        this._productId = data.id || null;

        this.shadowRoot.getElementById('productImage').src = data.image || 'assets/images/placeholder-4-3.png';
        this.shadowRoot.getElementById('productImage').alt = data.title || 'Ảnh bất động sản';
        this.shadowRoot.getElementById('imageCount').innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 4V2H4v2H2v16h20V4h-2zm-2 14H6V6h12v12zM11 11H9v2h2v-2zm4 0h-2v2h2v-2zm-4-4H9v2h2V7zm4 0h-2v2h2V7z"></path></svg> ${data.imageCount || '1/1'}`;
        
        this.shadowRoot.getElementById('title').textContent = data.title || 'Chưa có tiêu đề';
        this.shadowRoot.getElementById('addressText').textContent = data.address || 'Chưa rõ địa chỉ';
        this.shadowRoot.getElementById('price').textContent = data.price || 'Thỏa thuận';
        
        this.shadowRoot.querySelector('#bedrooms').textContent = `${data.bedrooms || 'N/A'}`;
        this.shadowRoot.querySelector('#wc').textContent = `${data.wc || 'N/A'}`;
        this.shadowRoot.querySelector('#area').textContent = `${data.area || 'N/A'} m²`;
        this.shadowRoot.querySelector('#furniture').textContent = data.furniture || 'Không xác định';

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
        // Thông báo sự kiện ra ngoài hoặc gọi API
        this.dispatchEvent(new CustomEvent('favorite-toggled', {
            detail: { productId: this._productId, isFavorite: isActive },
            bubbles: true,
            composed: true
        }));
        console.log(`Sản phẩm ID ${this._productId} - trạng thái yêu thích: ${isActive}`);
    }

    showProductDetail() {
        // Thông báo sự kiện ra ngoài để component cha (hoặc trang) xử lý việc mở popup
        this.dispatchEvent(new CustomEvent('product-detail-requested', {
            detail: { productId: this._productId, productData: this.productDataProperty }, // Gửi kèm ID hoặc toàn bộ data
            bubbles: true,
            composed: true
        }));
        console.log(`Yêu cầu xem chi tiết sản phẩm ID: ${this._productId}`);
        
        // Logic mở popup chi tiết sản phẩm (ví dụ đã làm ở productItem trước đó)
        // sẽ được thực hiện bởi component cha lắng nghe sự kiện 'product-detail-requested'
        // và truyền dữ liệu vào modal-popup.
    }

    // Để có thể truy cập productData từ bên ngoài nếu cần (ví dụ khi showProductDetail)
    get productDataProperty() {
        return {
            id: this._productId,
            image: this.shadowRoot.getElementById('productImage').src,
            imageCount: this.shadowRoot.getElementById('imageCount').textContent.trim().split(' ')[1] || '1/1',
            title: this.shadowRoot.getElementById('title').textContent,
            address: this.shadowRoot.getElementById('addressText').textContent,
            price: this.shadowRoot.getElementById('price').textContent,
            bedrooms: this.shadowRoot.querySelector('#bedrooms').textContent,
            wc: this.shadowRoot.querySelector('#wc').textContent,
            area: this.shadowRoot.querySelector('#area').textContent.replace(' m²', ''),
            furniture: this.shadowRoot.querySelector('#furniture').textContent,
            status: this.shadowRoot.getElementById('statusBadge').classList.contains('sold') ? 'sold' : 'available',
            isFavorite: this._favIcon.classList.contains('active')
        };
    }
}
customElements.define('product-item', ProductItem);
