// js/main.js
import './components/SiteHeader.js';
import './components/SiteFooter.js';
import './components/BreadcrumbNav.js';
import './components/AreaSuggestions.js';
import './components/FilterSidebar.js';
// FilterBlock và RangeSlider sẽ được import bên trong FilterSidebar nếu chỉ dùng ở đó
import './components/ProductList.js';
// ProductItem sẽ được import bên trong ProductList
import './components/CustomPagination.js';
import './components/PropertyTypeTabs.js';
import './components/PriceStatistics.js';
import './components/FaqSection.js';
// FaqItem sẽ được import bên trong FaqSection
import './components/ModalPopup.js';

// Global event listeners or setup if needed
document.addEventListener('DOMContentLoaded', () => {
    // Logic khởi tạo chung cho toàn trang (nếu có)
    console.log("Trang web đã tải xong và các components đã được đăng ký.");
});
