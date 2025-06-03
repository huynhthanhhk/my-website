// js/components/ProductItem.js
const productItemTemplate = document.createElement('template');
productItemTemplate.innerHTML = `
    <style>
        /* CSS giữ nguyên như phiên bản có nhiều ảnh và swipe */
        :host {
            display: block; border: 1px solid var(--medium-gray-color, #ccc);
            border-radius: var(--border-radius, 5px); overflow: hidden;
            box-shadow: var(--box-shadow, 0 2px 8px rgba(0,0,0,0.1));
            background-color: var(--white-color, #fff);
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        }
        :host(:hover) { transform: translateY(-4px); box-shadow: var(--box-shadow-hover); }
        .item-container { display: flex; flex-direction: column; height: 100%; }
        
        .item-image-wrapper {
            position: relative; width: 100%; padding-top: 75%; 
            background-color: var(--light-gray-color, #f4f4f4); overflow: hidden;
            cursor: grab; 
        }
        .item-image-wrapper.grabbing { cursor: grabbing; }

        .item-image {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover; 
            transition: opacity 0.3s ease-in-out; 
        }

        .status-badge {
            position: absolute;
            top: 10px;
            left: 10px;
            /* background-color: var(--primary-color); Bỏ màu nền mặc định ở đây */
            color: white;
            padding: 3px 8px;
            border-radius: var(--border-radius);
            font-size: 0.7rem;
            font-weight: 500;
            z-index: 1;
            line-height: 1.2; /* Thêm để chữ nhỏ dễ đọc hơn */
        }
        .status-badge.sold {
            display: inline-block !important; /* Đảm bảo hiện */
            background-color: var(--dark-gray-color); 
        }
        .status-badge.available {
            display: none !important; 
        }

        .image-count { /* Vị trí: góc phải dưới */
            position: absolute; bottom: 10px; right: 10px;
            background-color: rgba(0,0,0,0.65); color: var(--white-color, #fff);
            padding: 3px 7px; border-radius: 3px;
            font-size: 0.75em; z-index: 2;
        }

        .fav-icon {
            position: absolute; top: 10px; right: 10px;
            background: rgba(255,255,255,0.9); border-radius: 50%; padding: 6px; cursor: pointer;
            width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2); z-index: 2;
        }
        .fav-icon svg { width: 18px; height: 18px; fill: var(--medium-gray-color, #ccc); transition: fill 0.2s ease; }
        .fav-icon.active svg, .fav-icon:hover svg { fill: #e74c3c; }

        .image-nav-button {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background-color: rgba(0, 0, 0, 0.4); /* Giữ lại hoặc điều chỉnh nền */
            color: white;
            border: none;
            cursor: pointer;
            
            /* TĂNG KÍCH THƯỚC NÚT */
             width: 32px;  /* Đặt chiều rộng */
            height: 32px; /* Đặt chiều cao BẰNG chiều rộng để có hình tròn */
            padding: 0;   /* Bỏ padding nếu đã set width/height */
            font-size: 1.2rem; /* Điều chỉnh kích thước icon nếu cần */
            line-height: 32px; /* Căn giữa icon theo chiều dọc (bằng height) */
            text-align: center; /* Căn giữa icon theo chiều ngang */
            
            border-radius: 50%; /* QUAN TRỌNG: Để tạo hình tròn */
            
            opacity: 0;
            transition: opacity 0.2s ease-in-out, background-color 0.2s ease-in-out;
            z-index: 2;
            display: flex; /* Thêm để căn giữa SVG nếu dùng SVG */
            align-items: center; /* Căn giữa SVG theo chiều dọc */
            justify-content: center; /* Căn giữa SVG theo chiều ngang */
        }
        .item-image-wrapper:hover .image-nav-button { opacity: 0.8; }
        .item-image-wrapper:hover .image-nav-button:hover {
            opacity: 1; /* Rõ hơn nữa khi hover trực tiếp vào nút */
        }
        .image-nav-prev { left: 8px; }
        .image-nav-next { right: 8px; }
        .image-nav-button:hover { background-color: rgba(0, 0, 0, 0.7);
            opacity: 1; }
        
            

        .item-content { 
            padding: 12px; cursor: pointer; display: flex; 
            flex-direction: column; flex-grow: 1;
        }
        .item-title {
            font-size: 1.05em; font-weight: 600; margin: 0 0 4px 0; 
            color: var(--secondary-color, #004238); line-height: 1.35; 
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
            overflow: hidden; text-overflow: ellipsis; min-height: calc(1.05em * 1.35 * 2);
        }
        .item-address {
            font-size: 0.8em; color: var(--dark-gray-color, #666); margin-bottom: 6px;
            display: flex; align-items: center; line-height: 1.4; 
            min-height: calc(0.8em * 1.4 * 1);
        }
        .item-address svg { width: 13px; height: 13px; fill: currentColor; margin-right: 4px; flex-shrink: 0; }
        .item-address span { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; }
        .item-price { 
            font-size: 1.2em; font-weight: bold; color: var(--primary-color, #53b966); 
            margin-bottom: 8px; 
        }
        .item-details { 
            display: flex; flex-wrap: wrap; gap: 4px 8px; font-size: 0.8em; 
            color: var(--dark-gray-color, #666); margin-top: auto; 
        }
        .item-details span[title] { display: flex; align-items: center; }
        .item-details svg { width: 14px; height: 14px; fill: currentColor; margin-right: 3px; }
    </style>
    <div class="item-container">
        <div class="item-image-wrapper" id="imageWrapper">
            <img src="assets/images/placeholder-4-3.png" alt="Ảnh sản phẩm" class="item-image" id="productImage">
            <button class="image-nav-button image-nav-prev" aria-label="Ảnh trước">&#10094;</button>
            <button class="image-nav-button image-nav-next" aria-label="Ảnh kế tiếp">&#10095;</button>
            <span class="status-badge available" id="statusBadge">Còn hàng</span>
            <span class="fav-icon" id="favIcon" role="button" aria-pressed="false" aria-label="Yêu thích"><svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></span>
            <span class="image-count" id="imageCount">1/1</span>
        </div>
        <div class="item-content" id="contentArea">
            <h3 class="item-title" id="title">Tiêu đề sản phẩm</h3>
            <p class="item-address" id="address"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg><span id="addressText">Địa chỉ</span></p>
            <p class="item-price" id="price">Liên hệ</p>
            <div class="item-details">
                <span title="Số phòng ngủ"><svg viewBox="0 0 24 24"><path d="M19 7H5c-1.11 0-2 .9-2 2v6c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V9c0-1.1-.89-2-2-2zm-2 6H7v-2h10v2zm0-4H7V9h10v2z"></path></svg><span id="bedrooms">N/A</span></span>
                <span title="Số toilet"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM5 10V7h2v3H5zm12-3v3h2V7h-2z"></path></svg><span id="wc">N/A</span></span>
                <span title="Diện tích"><svg viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 8H5V8h14v6zM6 10h2v2H6zm3 0h2v2H9zm3 0h2v2h-2z"></path></svg><span id="area">N/A m²</span></span>
                <span title="Nội thất"><svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"></path></svg><span id="furniture">N/A</span></span>
            </div>
        </div>
    </div>
`;
/**
 * Chuyển đổi chuỗi giá có dạng "X tỷ" hoặc "X,Y tỷ" thành số (đơn vị tỷ).
 * @param {string} priceString Chuỗi giá, ví dụ "3,5 tỷ".
 * @returns {number} Giá trị số hoặc NaN nếu không hợp lệ.
 */
function parsePriceToBillion(priceString) {
    if (!priceString || typeof priceString !== 'string') return NaN;
    const numericPart = priceString.toLowerCase()
                                .replace('tỷ', '')
                                .replace('ty', '')
                                .replace(',', '.') // Chuyển dấu phẩy thành dấu chấm cho parseFloat
                                .trim();
    return parseFloat(numericPart);
}
class ProductItem extends HTMLElement {
    constructor() {
        super(); 
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(productItemTemplate.content.cloneNode(true));
        
        this._productImageEl = this.shadowRoot.getElementById('productImage');
        this._imageCountEl = this.shadowRoot.getElementById('imageCount');
        this._imageWrapper = this.shadowRoot.getElementById('imageWrapper');
        this._navPrev = this.shadowRoot.querySelector('.image-nav-prev');
        this._navNext = this.shadowRoot.querySelector('.image-nav-next');

        this._favIcon = this.shadowRoot.getElementById('favIcon');
        this._contentArea = this.shadowRoot.getElementById('contentArea');
        
        this._productId = null;
        this._productImages = []; // Mảng lưu trữ các đường dẫn ảnh
        this._currentImageIndex = 0; // Chỉ số của ảnh đang hiển thị
        this.rawData = {}; // Lưu trữ dữ liệu gốc được truyền vào

        this._handleTouchStart = this._handleTouchStart.bind(this);
        this._handleTouchEnd = this._handleTouchEnd.bind(this);
        this._touchstartX = 0;
    }

    connectedCallback() {
        this._favIcon.addEventListener('click', (e) => { e.stopPropagation(); this.toggleFavorite(); });
        this._contentArea.addEventListener('click', () => this.showProductDetail());

        if (this._navPrev && this._navNext) {
            this._navPrev.addEventListener('click', (e) => { e.stopPropagation(); this._showPrevImage(); });
            this._navNext.addEventListener('click', (e) => { e.stopPropagation(); this._showNextImage(); });
        }

        this._imageWrapper.addEventListener('touchstart', this._handleTouchStart, {passive: true});
        this._imageWrapper.addEventListener('touchend', this._handleTouchEnd, {passive: true});
        this._imageWrapper.addEventListener('mousedown', (e) => {
             this._touchstartX = e.screenX;
             this._imageWrapper.classList.add('grabbing');
        });
        this._imageWrapper.addEventListener('mouseup', (e) => {
            this._imageWrapper.classList.remove('grabbing');
            const touchendX = e.screenX;
            this._processSwipe(touchendX);
        });
        this._imageWrapper.addEventListener('mouseleave', () => {
            this._imageWrapper.classList.remove('grabbing');
        });
    }

    _handleTouchStart(event) { /* ... giữ nguyên ... */ 
        this._touchstartX = event.changedTouches[0].screenX;
        this._imageWrapper.classList.add('grabbing');
    }
    _handleTouchEnd(event) { /* ... giữ nguyên ... */ 
        this._imageWrapper.classList.remove('grabbing');
        const touchendX = event.changedTouches[0].screenX;
        this._processSwipe(touchendX);
    }
    _processSwipe(touchendX) { /* ... giữ nguyên ... */ 
        const threshold = 50; 
        if (touchendX < this._touchstartX - threshold) this._showNextImage();
        else if (touchendX > this._touchstartX + threshold) this._showPrevImage();
    }

    /**
     * Cập nhật ảnh hiển thị và bộ đếm ảnh.
     */
    _updateDisplayedImage() {
        if (this._productImages.length > 0) {
            this._productImageEl.style.opacity = 0; 
            setTimeout(() => { 
                this._productImageEl.src = this._productImages[this._currentImageIndex];
                this._productImageEl.alt = `${this.rawData.title || 'Ảnh sản phẩm'} ${this._currentImageIndex + 1}`; // Sử dụng this.rawData
                // CẬP NHẬT BỘ ĐẾM ẢNH THEO SỐ LƯỢNG THỰC TẾ
                this._imageCountEl.textContent = `${this._currentImageIndex + 1} / ${this._productImages.length}`;
                this._productImageEl.style.opacity = 1; 
            }, 50); 
        } else { // Trường hợp không có ảnh nào trong mảng
            this._productImageEl.src = 'assets/images/placeholder-4-3.png'; // Ảnh mặc định
            this._productImageEl.alt = 'Không có ảnh';
            this._imageCountEl.textContent = '0 / 0'; // Hoặc có thể ẩn imageCount đi
        }
        
        // Ẩn/hiện nút điều hướng tùy theo tổng số ảnh và vị trí ảnh hiện tại
        const hasMultipleImages = this._productImages.length > 1;
        if(this._navPrev && this._navNext){
            this._navPrev.style.display = (hasMultipleImages && this._currentImageIndex > 0) ? 'block' : 'none';
            this._navNext.style.display = (hasMultipleImages && this._currentImageIndex < this._productImages.length - 1) ? 'block' : 'none';
        }
    }

    _showNextImage() {
        if (this._productImages.length > 1 && this._currentImageIndex < this._productImages.length - 1) {
            this._currentImageIndex++;
        } else if (this._productImages.length > 1) { // Về ảnh đầu tiên nếu đang ở cuối (quay vòng)
            this._currentImageIndex = 0;
        }
        this._updateDisplayedImage();
    }

    _showPrevImage() {
        if (this._productImages.length > 1 && this._currentImageIndex > 0) {
            this._currentImageIndex--;
        } else if (this._productImages.length > 1) { // Về ảnh cuối nếu đang ở đầu (quay vòng)
            this._currentImageIndex = this._productImages.length - 1;
        }
        this._updateDisplayedImage();
    }

    set productData(data) {
        if (!data) {
            console.warn("ProductItem: Dữ liệu sản phẩm không hợp lệ (null hoặc undefined).", this);
            return;
        }
        // Thêm console.log để kiểm tra dữ liệu đầu vào
        // console.log(`ProductItem ID [${data.id || 'unknown'}]: Received data ->`, JSON.parse(JSON.stringify(data)));

        this.rawData = data; 
        this._productId = data.id || null;

        if (Array.isArray(data.images) && data.images.length > 0) {
            this._productImages = data.images;
        } else if (typeof data.image === 'string' && data.image.trim() !== '') { 
            this._productImages = [data.image];
        } else {
            this._productImages = ['assets/images/placeholder-4-3.png'];
        }
        this._currentImageIndex = 0;
        this._updateDisplayedImage(); 
        
        this.shadowRoot.getElementById('title').textContent = data.title || 'Chưa có tiêu đề';
        this.shadowRoot.getElementById('addressText').textContent = data.address || 'Chưa rõ địa chỉ';
        
        const priceEl = this.shadowRoot.getElementById('price');
        // CẬP NHẬT LOGIC KIỂM TRA GIÁ CHO CHẶT CHẼ HƠN
        if (typeof data.priceValue === 'number' && !isNaN(data.priceValue) && data.priceUnit && typeof data.priceUnit === 'string') {
            priceEl.textContent = `${data.priceValue.toLocaleString('vi-VN')} ${data.priceUnit}`;
        } else if (data.price && typeof data.price === 'string') { // Fallback cho cấu trúc price cũ (chuỗi "X tỷ")
            console.warn(`ProductItem ID [${data.id}]: Using fallback 'data.price'. Should migrate to 'priceValue' and 'priceUnit'.`);
            priceEl.textContent = data.price;
        } else {
            // console.log(`ProductItem ID [${data.id}]: Price data missing or invalid. Defaulting to "Thỏa thuận". priceValue: ${data.priceValue}, priceUnit: ${data.priceUnit}`);
            priceEl.textContent = 'Thỏa thuận';
        }
        
        this.shadowRoot.querySelector('#bedrooms').textContent = `${data.bedrooms !== undefined ? data.bedrooms : 'N/A'}`;
        this.shadowRoot.querySelector('#wc').textContent = `${data.wc !== undefined ? data.wc : 'N/A'}`;
        this.shadowRoot.querySelector('#area').textContent = `${data.area || 'N/A'} m²`;
        this.shadowRoot.querySelector('#furniture').textContent = data.furniture || 'Không xác định';
        
        const statusBadge = this.shadowRoot.getElementById('statusBadge');
        if (data.status === 'sold') {
            statusBadge.textContent = 'Đã bán';
            statusBadge.className = 'status-badge sold'; // Chỉ có class 'sold'
        } else {
            // Nếu là 'available' hoặc trạng thái khác không phải 'sold'
            statusBadge.textContent = ''; // Xóa text
            statusBadge.className = 'status-badge available'; // Giữ class 'available' để CSS có thể ẩn nó
        }
        
        
        this._favIcon.classList.toggle('active', data.isFavorite || false);
        this._favIcon.setAttribute('aria-pressed', (data.isFavorite || false).toString());
    }

    // toggleFavorite, showProductDetail, productDataProperty giữ nguyên
    toggleFavorite() { /* ... */ 
        const isActive = this._favIcon.classList.toggle('active');
        this._favIcon.setAttribute('aria-pressed', isActive.toString());
        this.dispatchEvent(new CustomEvent('favorite-toggled', { detail: { productId: this._productId, isFavorite: isActive }, bubbles: true, composed: true }));
    }
    showProductDetail() { 
        this.dispatchEvent(new CustomEvent('product-detail-requested', { 
            detail: { 
                productId: this._productId, 
                productData: this.productDataProperty // Gọi getter để lấy dữ liệu đã xử lý
            }, 
            bubbles: true, composed: true 
        }));
    }
    get productDataProperty() {
        const numericPriceInBillion = parseFloat(this.rawData.priceValue); 
        const rawArea = parseFloat(this.rawData.area);
        let unitPrice = null;

        if (!isNaN(numericPriceInBillion) && !isNaN(rawArea) && rawArea > 0) {
            unitPrice = (numericPriceInBillion * 1000) / rawArea; 
        }

        let displayPriceString = 'N/A';
        if (typeof this.rawData.priceValue === 'number' && !isNaN(this.rawData.priceValue) && this.rawData.priceUnit) {
            displayPriceString = `${this.rawData.priceValue.toLocaleString('vi-VN')} ${this.rawData.priceUnit}`;
        } else if (this.rawData.price) { 
             displayPriceString = this.rawData.price;
        }

        return {
            id: this._productId, 
            images: this._productImages, 
            currentImageSrc: this._productImages.length > 0 ? this._productImages[this._currentImageIndex] : 'assets/images/placeholder-4-3.png',
            imageCountDisplay: this._imageCountEl ? this._imageCountEl.textContent.trim() : 'N/A',
            title: this.rawData.title || 'N/A', 
            address: this.rawData.address || 'N/A',
            price: displayPriceString, 
            priceValue: this.rawData.priceValue, 
            priceUnitText: this.rawData.priceUnit, 
            area: this.rawData.area || 'N/A',   
            bedrooms: this.rawData.bedrooms !== undefined ? this.rawData.bedrooms : 'N/A',
            wc: this.rawData.wc !== undefined ? this.rawData.wc : 'N/A',
            furniture: this.rawData.furniture || 'N/A',
            status: this.rawData.status || 'available',
            isFavorite: this._favIcon ? this._favIcon.classList.contains('active') : false,
            legal: this.rawData.legal || 'N/A',
            postDate: this.rawData.postDate || 'N/A',
            city: this.rawData.city, 
            district: this.rawData.district, 
            description: this.rawData.description, 
            propertyType: this.rawData.propertyType, 
            project: this.rawData.project, 
            agentAvatar: this.rawData.agentAvatar, 
            agentName: this.rawData.agentName, 
            unitPrice: unitPrice,
            
            // === BỔ SUNG CÁC TRƯỜNG MỚI TỪ rawData ===
            viewDirection: this.rawData.viewDirection || 'N/A',
            floorLevel: this.rawData.floorLevel || 'N/A',
            otherInfo: this.rawData.otherInfo || 'N/A',
            doorDirection: this.rawData.doorDirection || 'N/A',
            balconyDirection: this.rawData.balconyDirection || 'N/A'
        };
    }
     disconnectedCallback() { /* ... giữ nguyên ... */ 
        this._imageWrapper.removeEventListener('touchstart', this._handleTouchStart);
        this._imageWrapper.removeEventListener('touchend', this._handleTouchEnd);
    }
}
customElements.define('product-item', ProductItem);