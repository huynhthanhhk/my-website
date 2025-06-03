// js/main.js
console.log("main.js: Bắt đầu tải các Web Components...");

// --- Components Imports ---
import './components/SiteHeader.js';
import './components/SiteFooter.js';
import './components/ModalPopup.js';
import './components/BreadcrumbNav.js';
import './components/AreaSuggestions.js';
import './components/RangeSlider.js';
import './components/ProductItem.js';
import './components/ProductList.js';
import './components/CustomPagination.js';
import './components/PropertyTypeTabs.js';
import './components/PriceStatistics.js';
import './components/FaqItem.js';
import './components/FaqSection.js';
import yearlyListingData from '../data/yearlyListingData.js';

/**
 * Khởi tạo các tương tác cho radio button "Tuỳ chọn" và RangeSlider bên trong một container filter.
 * @param {HTMLElement} filterContainerElement - Element DOM chứa các nhóm filter.
 */
function initializeFilterInteractions(filterContainerElement) {
    if (!filterContainerElement) return;
    const customOptionRadios = filterContainerElement.querySelectorAll('input[type="radio"].custom-option-radio');
    customOptionRadios.forEach(customRadio => {
        const associatedSliderId = customRadio.dataset.controlsSlider;
        const rangeSliderElement = filterContainerElement.querySelector(`#${associatedSliderId}`); 
        if (!rangeSliderElement) { return; }
        const radioGroupName = customRadio.name;
        if (!radioGroupName) { return; }
        const radioGroup = filterContainerElement.querySelectorAll(`input[type="radio"][name="${radioGroupName}"]`);
        const updateSliderVisibility = () => {
            rangeSliderElement.classList.toggle('is-hidden', !customRadio.checked);
        };
        const listenerKey = `__filterChangeListener_${radioGroupName}_${customRadio.value}`;
        radioGroup.forEach(radio => {
            if (radio[listenerKey]) radio.removeEventListener('change', radio[listenerKey]);
            radio.addEventListener('change', updateSliderVisibility);
            radio[listenerKey] = updateSliderVisibility;
        });
        updateSliderVisibility();
    });
}

/**
 * Thu thập tất cả các giá trị filter hiện tại từ một container cụ thể.
 * @param {HTMLElement} filterSourceContainer - Element chứa các input filter.
 * @param {boolean} [isApplyAction=false] 
 * @returns {object} Đối tượng chứa các filter đã chọn.
 */
function collectAndProcessFilters(filterSourceContainer, isApplyAction = false) {
    const selectedFilters = {};
    if (!filterSourceContainer) { console.error("Filter source container không được cung cấp."); return selectedFilters; }
    const getRadioValue = (groupName) => {
        const radioChecked = filterSourceContainer.querySelector(`input[type="radio"][name="${groupName}"]:checked`);
        return radioChecked ? radioChecked.value : null;
    };
    // Giá bán
    const priceValue = getRadioValue('filter-price');
    if (priceValue) {
        selectedFilters['Giá bán'] = { value: priceValue, type: 'defined' };
        if (priceValue === 'custom') {
            const priceSlider = filterSourceContainer.querySelector('#price-range-slider-instance');
            if (priceSlider && typeof priceSlider.getCurrentValues === 'function') {
                selectedFilters['Giá bán'].customRange = priceSlider.getCurrentValues(); 
                selectedFilters['Giá bán'].type = 'custom';
            }
        }
    }
    // Diện tích
    const areaValue = getRadioValue('filter-area');
    if (areaValue) {
        selectedFilters['Diện tích'] = { value: areaValue, type: 'defined' };
        if (areaValue === 'custom') {
            const areaSlider = filterSourceContainer.querySelector('#area-range-slider-instance');
            if (areaSlider && typeof areaSlider.getCurrentValues === 'function') {
                selectedFilters['Diện tích'].customRange = areaSlider.getCurrentValues();
                selectedFilters['Diện tích'].type = 'custom';
            }
        }
    }
    const bedroomsValue = getRadioValue('filter-bedrooms');
    if (bedroomsValue) selectedFilters['Số phòng ngủ'] = { value: bedroomsValue, type: 'defined' };
    const toiletsValue = getRadioValue('filter-toilets');
    if (toiletsValue) selectedFilters['Số toilet'] = { value: toiletsValue, type: 'defined' };
    const conditionValue = getRadioValue('filter-condition');
    if (conditionValue) selectedFilters['Hiện trạng'] = { value: conditionValue, type: 'defined' };
    const legalValue = getRadioValue('filter-legal');
    if (legalValue) selectedFilters['Pháp lý'] = { value: legalValue, type: 'defined' };

    // console.log('MAIN.JS - Selected Filters:', JSON.stringify(selectedFilters, null, 2));
    if (isApplyAction) { /* console.log("Nút Áp dụng bộ lọc được nhấn!"); */ }

    const productListElement = document.querySelector('product-list');
    if (productListElement && typeof productListElement.applyFilters === 'function') {
        productListElement.applyFilters(selectedFilters); 
    } else if (productListElement) { /* console.warn("ProductList element found, but 'applyFilters' method is not defined."); */ }
    return selectedFilters;
}
/**
     * Hàm xác định nhóm diện tích từ diện tích cụ thể.
     * @param {number} area Diện tích
     * @returns {string} Nhóm diện tích
     */
    function getProductAreaGroup (area) {
    if (area <= 0) return "Không xác định";
    if (area < 45) return "Dưới 45m²";
    if (area >= 45 && area < 60) return "45-60m²";
    if (area >= 60 && area < 80) return "60-80m²";
    if (area >= 80 && area <= 120) return "80-120m²";
    return "Trên 120m²";
}
// Biến lưu trữ instance của biểu đồ lịch sử giá PDP
let pdpPriceHistoryChartInstance = null;
let currentPdpChartTimeRange = 12; // Mặc định là 12 tháng (1 năm)
/**
     * Vẽ biểu đồ lịch sử giá cho PDP.
     * @param {object} productData Dữ liệu sản phẩm hiện tại (chứa area).
     * @param {object} allHistoricalData Dữ liệu lịch sử giá (yearlyListingData).
     * @param {number} numberOfMonthsToShow Số tháng để hiển thị (ví dụ: 12 hoặc 36)
     */

function renderPdpPriceHistoryChart(productData, allHistoricalData, numberOfMonthsToShow = 12) {
    currentPdpChartTimeRange = numberOfMonthsToShow;
    const chartCanvas = document.getElementById('pdp-price-history-chart-canvas');
    const chartTitleEl = document.getElementById('pdp-price-history-chart-title');
    const summaryCardContainer = document.getElementById('pdp-price-history-summary-cards');
    if (summaryCardContainer) summaryCardContainer.innerHTML = '';
    if (!chartCanvas || !productData || !productData.area || !allHistoricalData || typeof Chart === 'undefined') {
        const chartContainerParent = chartCanvas ? chartCanvas.parentElement : document.querySelector('.pdp-chart-container');
        if (chartContainerParent) chartContainerParent.innerHTML = '<p class="no-data-message">Không thể tải dữ liệu lịch sử giá.</p>';
        if (chartTitleEl) chartTitleEl.textContent = 'Biểu đồ biến động đơn giá';
    console.error("Render PDP Price History Chart: Missing elements, data, or Chart.js.");
    return;
    }

    const productArea = parseFloat(productData.area);
    const targetAreaGroup = getProductAreaGroup(productArea);
    //const productUnitPrice = parseFloat(productData.unitPrice); // Đơn giá sản phẩm hiện tại
    const productPostDateString = productData.postDate; // Ví dụ: "15/01/2025"
    const productCurrentUnitPrice = parseFloat(productData.unitPrice); 

    if (chartTitleEl) {
        chartTitleEl.textContent = `Biểu đồ biến động đơn giá căn hộ (Nhóm ${targetAreaGroup})`;
    }
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();
    // 1. Lọc dữ liệu lịch sử trong 36 tháng gần nhất & đúng nhóm diện tích

    const lookbackDate = new Date(now);
    lookbackDate.setMonth(now.getMonth() - (numberOfMonthsToShow - 1)); // numberOfMonthsToShow bao gồm tháng hiện tại
    lookbackDate.setDate(1);
    lookbackDate.setHours(0, 0, 0, 0);
    const thirtySixMonthsAgo = new Date(now);
    thirtySixMonthsAgo.setMonth(currentMonth - 35); 
    thirtySixMonthsAgo.setDate(1);
    thirtySixMonthsAgo.setHours(0, 0, 0, 0);
    let relevantHistoricalData = [];
    let relevantHistoricalDataFor36Months = [];
    for (const yearKey in allHistoricalData) {
        if (allHistoricalData.hasOwnProperty(yearKey)) {
            const year = parseInt(yearKey);
            allHistoricalData[yearKey].forEach(item => {
                if (!item.month || item.unitPrice == null || item.area == null) return;
                const itemDate = new Date(year, item.month - 1, 1);
                itemDate.setHours(0,0,0,0);
                const itemAreaGroup = item.areaGroup || getProductAreaGroup(parseFloat(item.area));
                // CHỈ LẤY DỮ LIỆU TRONG KHOẢNG THỜI GIAN CẦN THIẾT
                if (itemDate >= thirtySixMonthsAgo && itemDate <= now && itemAreaGroup === targetAreaGroup) {
                    relevantHistoricalDataFor36Months.push({
                        date: itemDate,
                        unitPrice: parseFloat(String(item.unitPrice).replace(',', '.'))
                    });
                }
            });
        }
    }
    // Sắp xếp dữ liệu theo ngày tăng dần
    relevantHistoricalDataFor36Months.sort((a, b) => a.date - b.date);
   if (relevantHistoricalDataFor36Months.length === 0 && isNaN(productCurrentUnitPrice)) {
        chartCanvas.parentElement.innerHTML = `<p class="no-data-message">Không có dữ liệu lịch sử giá cho nhóm "${targetAreaGroup}" và sản phẩm hiện tại.</p>`;
        if (summaryCardContainer) summaryCardContainer.style.display = 'none';
        return;
    }
    if (summaryCardContainer) summaryCardContainer.style.display = 'flex';
    // --- TÍNH TOÁN CHO DATA SUMMARY CARDS ---
    let popularPriceCurrentMonth = null;
    let avgPriceLast12Months = null;
    let priceChangeLastYearPercent = null;
    let priceChangeLastYearAbsolute = null;
    let priceLastYearMonthLabel = "-";
    let unitPriceOfCurrentProduct = !isNaN(productCurrentUnitPrice) ? productCurrentUnitPrice : null;
    // a. Giá Phổ Biến Hiện Tại (đơn giá trung bình của tháng hiện tại)
    const entriesCurrentMonth = relevantHistoricalDataFor36Months.filter(d => 
        d.date.getFullYear() === currentYear && 
        d.date.getMonth() === currentMonth
    );
    if (entriesCurrentMonth.length > 0) {
        popularPriceCurrentMonth = entriesCurrentMonth.reduce((sum, entry) => sum + entry.unitPrice, 0) / entriesCurrentMonth.length;
    }
    // b. Giá Trung Bình 12 Tháng Qua
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(currentMonth - 11); // Bao gồm tháng hiện tại là 12 tháng
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0,0,0,0);
    const entriesLast12Months = relevantHistoricalDataFor36Months.filter(d => d.date >= twelveMonthsAgo && d.date <= now);
    if (entriesLast12Months.length > 0) {
        avgPriceLast12Months = entriesLast12Months.reduce((sum, entry) => sum + entry.unitPrice, 0) / entriesLast12Months.length;
    }
    // c. Biến Động Giá /1 Năm
    const oneYearAgoMonth = new Date(now);
    oneYearAgoMonth.setFullYear(now.getFullYear() - 1); // Tháng này năm trước
    oneYearAgoMonth.setHours(0,0,0,0);
    priceLastYearMonthLabel = `${oneYearAgoMonth.getMonth() + 1}/${oneYearAgoMonth.getFullYear()}`;
    const entriesOneYearAgo = relevantHistoricalDataFor36Months.filter(d =>
        d.date.getFullYear() === oneYearAgoMonth.getFullYear() &&
        d.date.getMonth() === oneYearAgoMonth.getMonth()
    );
    let priceOneYearAgo = null;
    if (entriesOneYearAgo.length > 0) {
        priceOneYearAgo = entriesOneYearAgo.reduce((sum, entry) => sum + entry.unitPrice, 0) / entriesOneYearAgo.length;
    }

    if (popularPriceCurrentMonth !== null && priceOneYearAgo !== null && priceOneYearAgo !== 0) {
        priceChangeLastYearAbsolute = popularPriceCurrentMonth - priceOneYearAgo;
        priceChangeLastYearPercent = (priceChangeLastYearAbsolute / priceOneYearAgo) * 100;
    }
    const formatComparison = (productPrice, marketPrice) => {
            if (isNaN(productPrice) || marketPrice === null || isNaN(marketPrice)) return '';
            const diff = productPrice - marketPrice;
            const absDiff = Math.abs(diff).toFixed(2);
            if (diff <= 0) return `(<span class="price-lower">Thấp hơn ${absDiff} tr/m²</span>)`;
            return `(<span class="price-higher">Cao hơn ${absDiff} tr/m²</span>)`;
        };
    // --- TẠO HTML CHO DATA SUMMARY CARDS ---
    if (summaryCardContainer) {
        summaryCardContainer.innerHTML = `
            <div class="summary-card">
                <p class="card-title">Giá Phổ Biến (${now.getMonth() + 1}/${now.getFullYear()})</p>
                <p class="card-value">${popularPriceCurrentMonth !== null ? parseFloat(popularPriceCurrentMonth).toLocaleString('vi-VN', {maximumFractionDigits:2}) + ' tr/m²' : '-'}</p>
                ${unitPriceOfCurrentProduct !== null ? 
                    `<p class="card-comparison">Đơn giá tin đăng: <strong>${unitPriceOfCurrentProduct.toLocaleString('vi-VN', {maximumFractionDigits:2})} tr/m²</strong> ${formatComparison(unitPriceOfCurrentProduct, popularPriceCurrentMonth)}</p>` 
                    : ''}
            </div>
            <div class="summary-card">
                <p class="card-title">Trung bình (12 tháng qua)</p>
                <p class="card-value">${avgPriceLast12Months !== null ? parseFloat(avgPriceLast12Months).toLocaleString('vi-VN', {maximumFractionDigits:2}) + ' tr/m²' : '-'}</p>
                ${unitPriceOfCurrentProduct !== null ? 
                    `<p class="card-comparison">Đơn giá tin đăng: <strong>${unitPriceOfCurrentProduct.toLocaleString('vi-VN', {maximumFractionDigits:2})} tr/m²</strong> ${formatComparison(unitPriceOfCurrentProduct, avgPriceLast12Months)}</p>` 
                    : ''}
            </div>
            <div class="summary-card">
                <p class="card-title">Biến động giá /1 năm</p>
                <p class="card-value">
                    ${priceChangeLastYearPercent !== null ? 
                        `<span class="${priceChangeLastYearPercent >= 0 ? 'price-higher' : 'price-lower'}">
                            ${priceChangeLastYearPercent >= 0 ? '+' : ''}${parseFloat(priceChangeLastYearPercent).toFixed(2)}%
                         </span>` 
                        : '-'}
                </p>
                ${priceChangeLastYearAbsolute !== null ? 
                    `<p class="card-comparison-detail">
                        (${(priceChangeLastYearAbsolute >= 0 ? 'Tăng' : 'Giảm')} 
                        ${Math.abs(priceChangeLastYearAbsolute).toLocaleString('vi-VN', {maximumFractionDigits:2})} tr/m² so với T${priceLastYearMonthLabel})
                     </p>` 
                    : ''}
            </div>
        `;
    }
    // 2. Chuẩn bị labels (12 tháng gần nhất) và dataPoints (đơn giá trung bình theo tháng)
    const labels = [];
    const avgPricePoints = []; // THÊM MẢNG CHO GIÁ TRUNG BÌNH
    const minPricePoints = [];
    const maxPricePoints = [];
    const dataPointCurrentProduct = []; // Mảng chỉ chứa đơn giá của sản phẩm hiện tại tại đúng tháng của nó
    const currentDisplayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // Chuyển đổi productPostDateString thành đối tượng Date để so sánh tháng/năm
    let productPostDate = null;
    if (productPostDateString && productPostDateString !== '-') {
        const parts = productPostDateString.split('/'); // Giả định format DD/MM/YYYY
        if (parts.length === 3) {
            productPostDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            productPostDate.setHours(0,0,0,0);
        }
    }
    for (let i = (numberOfMonthsToShow - 1); i >= 0; i--) { // Lặp qua số tháng cần hiển thị
        const targetMonthDate = new Date(currentDisplayMonth);
        targetMonthDate.setMonth(currentDisplayMonth.getMonth() - i);
        targetMonthDate.setHours(0,0,0,0);
        labels.push(`${targetMonthDate.getMonth() + 1}/${targetMonthDate.getFullYear()}`);
        
        // ... (Logic tìm entriesForThisMonth, tính min/max, và dataPointCurrentProduct giữ nguyên) ...
        const entriesForThisMonth = relevantHistoricalDataFor36Months.filter(d => 
            d.date.getFullYear() === targetMonthDate.getFullYear() && 
            d.date.getMonth() === targetMonthDate.getMonth()
        ).map(d => d.unitPrice);

        if (entriesForThisMonth.length > 0) {
            minPricePoints.push(Math.min(...entriesForThisMonth));
            maxPricePoints.push(Math.max(...entriesForThisMonth));
            avgPricePoints.push(entriesForThisMonth.reduce((sum, val) => sum + val, 0) / entriesForThisMonth.length);
        } else {
            minPricePoints.push(null);
            maxPricePoints.push(null);
            avgPricePoints.push(null); // Thêm null cho giá trung bình
        }

        // Kiểm tra xem tháng này có phải là tháng đăng của sản phẩm hiện tại không
        if (productPostDate && 
            productPostDate.getFullYear() === targetMonthDate.getFullYear() &&
            productPostDate.getMonth() === targetMonthDate.getMonth() &&
            !isNaN(productCurrentUnitPrice )) {
            dataPointCurrentProduct.push(productCurrentUnitPrice );
        } else {
            dataPointCurrentProduct.push(null);
        }
    }

    
    
    // 4. Vẽ biểu đồ
    if (pdpPriceHistoryChartInstance) {
        pdpPriceHistoryChartInstance.destroy();
    }
    const productHighlightColor = 'rgba(255, 159, 64, 1)'; // Màu cam đậm
    const productHighlightBgColor = 'rgba(255, 159, 64, 0.7)'; // Màu cam mờ
    pdpPriceHistoryChartInstance = new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { 
                    label: `Giá thấp nhất (tr/m²) - Nhóm ${targetAreaGroup}`,
                    data: minPricePoints,
                    borderColor: 'rgba(100, 100, 255, 0.5)', // Ví dụ: Xanh dương nhạt
                    borderWidth: 1.5,
                    pointRadius: 0, 
                    pointHoverRadius: 0,
                    fill: false, 
                    tension: 0.2,
                    order: 3 // Vẽ sau cùng để không bị đường trung bình che
                },
                { 
                    label: `Giá cao nhất (tr/m²) - Nhóm ${targetAreaGroup}`,
                    data: maxPricePoints,
                    borderColor: 'rgba(100, 100, 255, 0.5)', // Cùng màu với min hoặc màu khác
                    backgroundColor: 'rgba(100, 100, 255, 0.1)', // Màu vùng biến động
                    fill: '-1', // Tô màu từ đường này xuống đường dataset minPricePoints (có index 0)
                    tension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 0,
                    borderWidth: 1.5,
                    order: 2
                },
                { // DATASET CHO ĐƯỜNG GIÁ TRUNG BÌNH
                    label: `Giá trung bình (tr/m²) - Nhóm ${targetAreaGroup}`,
                    data: avgPricePoints,
                    borderColor: 'var(--primary-color)', // Màu chính cho đường trung bình
                    backgroundColor: 'transparent', // Không tô nền cho đường trung bình
                    borderWidth: 2, // Đường trung bình đậm hơn
                    tension: 0.2,
                    fill: false,
                    pointRadius: 2, // Có thể hiện điểm nhỏ cho đường trung bình
                    pointHoverRadius: 4,
                    order: 1 // Vẽ trước vùng min/max
                },
                { 
                    label: 'Sản phẩm này',
                    data: dataPointCurrentProduct,
                    backgroundColor: productHighlightColor, // MÀU CAM
                    borderColor: productHighlightColor,    // MÀU CAM
                    pointRadius: 6, 
                    pointHoverRadius: 8,
                    pointStyle: 'circle', 
                    showLine: false,
                    order: 0 // Vẽ đầu tiên để nổi bật nhất
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: { /* ... (Giữ nguyên scales options) ... */ },
            plugins: {
                legend: { 
                    display: true, 
                    position: 'top',
                    labels: { 
                        usePointStyle: true, 
                        padding: 15, 
                        font: {size: 10}, // Giảm font size legend
                        // Tùy chỉnh màu cho legend của "Sản phẩm này"
                        filter: function(legendItem, chartData) {
                            // Bạn có thể tùy chỉnh thêm ở đây nếu muốn
                            return true; 
                        },
                        // Màu cho legend item "Sản phẩm này" có thể cần JS riêng để set nếu Chart.js không hỗ trợ trực tiếp
                        // Hoặc đơn giản là để Chart.js tự lấy màu từ dataset.
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) { /* ... giữ nguyên ... */ },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label.includes('Giá thấp nhất')) label = 'Giá thấp nhất';
                            else if (label.includes('Giá cao nhất')) label = 'Giá cao nhất';
                            else if (label.includes('Giá trung bình')) label = 'Giá trung bình';
                            else if (label.includes('Sản phẩm này')) label = 'Sản phẩm này';

                            if (context.parsed.y !== null) {
                                label += ': ' + parseFloat(context.parsed.y).toLocaleString('vi-VN', {maximumFractionDigits: 2}) + ' tr/m²';
                            } else {
                                return null; 
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    // Cập nhật trạng thái active cho tab thời gian
    const timeRangeTabs = document.querySelectorAll('#pdp-price-history-time-tabs .time-range-tab');
    timeRangeTabs.forEach(tab => {
        tab.classList.toggle('active', parseInt(tab.dataset.months) === numberOfMonthsToShow);
    });
    }

document.addEventListener('DOMContentLoaded', () => {
    console.log("main.js: Sự kiện DOMContentLoaded đã kích hoạt.");

    // --- KHỞI TẠO FILTER CHO DESKTOP ---
    const desktopFilterBox = document.getElementById('desktop-filter-box');
    if (desktopFilterBox) {
        initializeFilterInteractions(desktopFilterBox); 
        const applyFiltersButtonMain = document.getElementById('apply-filters-button-main');
        if (applyFiltersButtonMain) {
            applyFiltersButtonMain.addEventListener('click', () => {
                collectAndProcessFilters(desktopFilterBox, true);
            });
        }
    }

    // --- LOGIC CHO MOBILE FILTER PANEL TRƯỢT TỪ TRÁI ---
    const mobileFilterTrigger = document.getElementById('mobile-filter-trigger');
    const filterPanel = document.querySelector('.section-2-left'); 
    const filterOverlay = document.getElementById('filter-panel-overlay');
    const closeFilterPanelButton = document.getElementById('close-filter-panel-mobile');
    if (mobileFilterTrigger && filterPanel && filterOverlay && closeFilterPanelButton) {
        mobileFilterTrigger.addEventListener('click', () => {
            filterPanel.classList.add('filter-panel-open');
            filterOverlay.classList.add('active');
            document.body.classList.add('no-scroll');
        });
        const closeFilter = () => {
            filterPanel.classList.remove('filter-panel-open');
            filterOverlay.classList.remove('active');
            document.body.classList.remove('no-scroll'); 
        };
        filterOverlay.addEventListener('click', closeFilter);
        closeFilterPanelButton.addEventListener('click', closeFilter);
        const applyButtonInPanel = filterPanel.querySelector('#apply-filters-button-main');
        if(applyButtonInPanel) {
            applyButtonInPanel.addEventListener('click', () => {
                if (filterPanel.classList.contains('filter-panel-open')) {
                     closeFilter(); 
                }
            });
        }
    }

    // --- LOGIC CHO POPUP CHI TIẾT SẢN PHẨM ---
    const productDetailModal = document.getElementById('product-detail-popup');
    let pdpSlottedHeaderDiv = null; 
    let pdpInternalModalHeader = null; 
    let pdpScrollableContentContainer = null;
    let modalBodyActualScroller = null; 
    let currentPdpData = null; 
    

    const pdpCustomCloseBtn = document.getElementById('pdp-custom-close-btn');
    const popupShareBtn = document.getElementById('pdp-share-btn');
    const popupFavoriteBtn = document.getElementById('pdp-favorite-btn');
    const pdpFavoriteBtnText = document.getElementById('pdp-favorite-btn-text');

    const contactFormModal = document.getElementById('contact-form-modal');
    const contactFormProductNameDisplay = document.getElementById('contact-form-product-name-display');
    const actualContactFormInModal = document.getElementById('pdp-actual-contact-form');
    const hiddenProductIdInputInModal = document.getElementById('contact-product-id-hidden');
    const MOBILE_BREAKPOINT = 768; // Định nghĩa breakpoint cho mobile
   /**
/**
     * Gắn listener cho các element động bên trong PDP body
     * @param {HTMLElement} container - Chính là pdpScrollableContentContainer
     * @param {object} productDataRef - Dữ liệu sản phẩm hiện tại
     */
    
   
    const loanScheduleModal = document.getElementById('loan-schedule-modal'); // << KHAI BÁO Ở ĐÂY
    const loanScheduleModalBody = document.getElementById('loan-schedule-modal-body'); // Cần ID này trong HTML của modal
    const loanScheduleModalTitle = loanScheduleModal ? (loanScheduleModal.querySelector('#loan-schedule-title') || loanScheduleModal.shadowRoot.querySelector('#popupTitleModalGeneratedInternal')) : null;
    const imageDetailModal = document.getElementById('image-detail-popup'); // Modal

    // Biến lưu trữ instance của biểu đồ tròn để có thể hủy và vẽ lại
    let loanPieChartInstance = null;

    /**
     * Tính toán chi tiết khoản vay theo phương pháp Dư nợ giảm dần, gốc trả đều.
     * @param {number} totalLoanAmount - Tổng số tiền vay (tỷ VNĐ)
     * @param {number} totalMonths - Tổng số tháng vay
     * @param {number} annualInterestRate - Lãi suất năm (%)
     * @param {number} [prefAnnualInterestRate=annualInterestRate] - Lãi suất ưu đãi năm (%)
     * @param {number} [prefMonths=0] - Số tháng ưu đãi
     * @returns {object} Chứa monthlyPayments (mảng), totalInterest, minMonthlyPayment, maxMonthlyPayment
     */
    // --- BIẾN VÀ HÀM CHO HERO SLIDER CỦA PDP ---
    let pdpHeroImages = [];
    let pdpHeroCurrentIndex = 0;
    let pdpHeroAutoplayInterval = null;
    let pdpHeroKenBurnsTimeout = null;
    
    const KEN_BURNS_DURATION = 10;
    const AUTOPLAY_DELAY = KEN_BURNS_DURATION * 1000; 

    // --- BIẾN CHO IMAGE DETAIL POPUP ZOOM/PAN ---
    let currentZoomLevel = 1;
    let maxZoom = 3; // Mức zoom tối đa
    let minZoom = 1; // Mức zoom tối thiểu (ảnh vừa khít container)
    let zoomStep = 0.1;
    let currentPanX = 0;
    let currentPanY = 0;
    let isPanning = false;
    let lastPanPosition = { x: 0, y: 0 };
    
    // --- Placeholder SVG Icons ---
    const ICONS = {
        play: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
        chevronLeft: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
        chevronRight: '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
        share: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z"/></svg>',
        heartEmpty: '<svg class="icon-heart-empty" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.95 10.05z"/></svg>',
        heartFilled: '<svg class="icon-heart-filled" viewBox="0 0 24 24" width="18" height="18" style="display:none;"><path fill="#e74c3c" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
        close: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
    };
    function stopPdpHeroAutoplay() {
        clearInterval(pdpHeroAutoplayInterval);
        pdpHeroAutoplayInterval = null;
        clearTimeout(pdpHeroKenBurnsTimeout);
        const playPauseBtn = document.getElementById('pdp-hero-playpause-btn');
        if (playPauseBtn) {
        playPauseBtn.innerHTML = `${ICONS.play} <span style="display:none;">Play</span>`;
        playPauseBtn.setAttribute('aria-label', 'Tiếp tục slideshow');
        playPauseBtn.dataset.playing = "false";
    }
        const images = document.querySelectorAll('#pdpHeroImageContainer .pdp-hero-image-item');
        images.forEach(imgC => imgC.classList.remove('ken-burns'));
        
    }
    function applyKenBurns(imageElementContainer) {
        if (!imageElementContainer) return;
        const img = imageElementContainer.querySelector('img');
        if (!img) return;
        img.style.setProperty('--ken-burns-duration', `${KEN_BURNS_DURATION}s`);
        imageElementContainer.classList.remove('ken-burns');
        void imageElementContainer.offsetWidth; 
        imageElementContainer.classList.add('ken-burns');

    }
    function showPdpHeroImage(index, isAutoplay = false) {
        const imageContainer = document.getElementById('pdpHeroImageContainer');
        const dotsContainer = document.getElementById('pdpHeroDots');
        if (!imageContainer || !dotsContainer || pdpHeroImages.length === 0) return;

        const oldIndex = pdpHeroCurrentIndex;
        pdpHeroCurrentIndex = (index + pdpHeroImages.length) % pdpHeroImages.length;

        const allImageDivs = imageContainer.querySelectorAll('.pdp-hero-image-item');
        let activeImageDiv = imageContainer.querySelector('.pdp-hero-image-item.active');
        
        // Tìm hoặc tạo div cho ảnh tiếp theo
        let nextImageDiv = Array.from(allImageDivs).find(div => !div.classList.contains('active'));
        if (!nextImageDiv) {
            nextImageDiv = document.createElement('div');
            nextImageDiv.classList.add('pdp-hero-image-item');
            const imgEl = document.createElement('img');
            imgEl.alt = currentPdpData.title || 'Ảnh sản phẩm';
            nextImageDiv.appendChild(imgEl);
            imageContainer.appendChild(nextImageDiv);
        }
        
        const nextImgTag = nextImageDiv.querySelector('img');
        nextImgTag.src = pdpHeroImages[pdpHeroCurrentIndex];
        nextImageDiv.style.opacity = '0'; // Chuẩn bị cho fade in
        nextImageDiv.classList.remove('active');
        nextImgTag.style.animation = 'none';
        setTimeout(() => {
        // ...
        if (pdpHeroAutoplayInterval || isAutoplay) { // Chỉ apply nếu đang play
             // Kích hoạt lại animation bằng cách xóa và thêm class sau khi ảnh hiện
            nextImageDiv.classList.remove('ken-burns'); 
            void nextImageDiv.offsetWidth; // Trigger reflow
            applyKenBurns(nextImageDiv);
        }
        // ...
    }, 500);

        if (activeImageDiv && activeImageDiv !== nextImageDiv) {
            activeImageDiv.classList.remove('active', 'ken-burns');
            activeImageDiv.style.opacity = '0'; // Mờ ảnh cũ
        }
        
        // Hiển thị ảnh mới
        nextImageDiv.style.opacity = '1';
        nextImageDiv.classList.add('active');
        if (pdpHeroAutoplayInterval || isAutoplay) applyKenBurns(nextImageDiv);

        // Dọn dẹp các div ảnh thừa (chỉ giữ lại tối đa 2 div: 1 active, 1 để pre-load/transition)
        const finalImageDivs = imageContainer.querySelectorAll('.pdp-hero-image-item');
        if (finalImageDivs.length > 2) {
            finalImageDivs.forEach(div => {
                if (!div.classList.contains('active') && div !== nextImageDiv ) { // Giữ lại nextImageDiv nếu nó không phải active
                     div.remove();
                }
            });
        }
        
        const dots = dotsContainer.querySelectorAll('.pdp-hero-dot');
        dots.forEach((dot, idx) => dot.classList.toggle('active', idx === pdpHeroCurrentIndex));
    }
    function startPdpHeroAutoplay() {
        stopPdpHeroAutoplay(); // Dừng autoplay cũ nếu có
        const playPauseBtn = document.getElementById('pdp-hero-playpause-btn');
        if (playPauseBtn) {
        playPauseBtn.innerHTML = `${ICONS.pause} <span style="display:none;">Pause</span>`;
        playPauseBtn.setAttribute('aria-label', 'Tạm dừng slideshow');
        playPauseBtn.dataset.playing = "true";
    }

        const activeImageDiv = document.querySelector('#pdpHeroImageContainer .pdp-hero-image-item.active');
    if (activeImageDiv) {
        const img = activeImageDiv.querySelector('img');
        if(img) img.style.animationPlayState = 'running'; // Tiếp tục animation CSS
        applyKenBurns(activeImageDiv); // Áp dụng lại hoặc đảm bảo nó chạy
    }

    if (pdpHeroImages.length > 1) {
        pdpHeroAutoplayInterval = setInterval(() => {
            showPdpHeroImage(pdpHeroCurrentIndex + 1, true);
        }, KEN_BURNS_DURATION * 1000); 
    }
    }
    function setupPdpHeroSlider(images) {
        
        const imageContainer = document.getElementById('pdpHeroImageContainer');
        const dotsContainer = document.getElementById('pdpHeroDots');
        const playPauseBtn = document.getElementById('pdp-hero-playpause-btn');
        const heroSectionDiv = document.querySelector('.pdp-hero-section'); // Để gắn event listener click mở chi tiết

        if (!imageContainer || !dotsContainer || !playPauseBtn || !heroSectionDiv) {
            console.error("Một số element của Hero Slider không tìm thấy.");
            return;
        }
        
        // Chỉ lấy tối đa 5 ảnh cho Hero Slider chính
        pdpHeroImages = images.slice(0, 5); 
        imageContainer.innerHTML = ''; // Xóa ảnh cũ
        dotsContainer.innerHTML = '';   // Xóa dots cũ

        if (pdpHeroImages.length === 0) {
            imageContainer.innerHTML = `<img src="assets/images/placeholder-hero.png" alt="Sản phẩm chưa có ảnh" style="width:100%; height:100%; object-fit:cover;">`;
            playPauseBtn.style.display = 'none';
            return;
        }
        
        // Tạo ảnh đầu tiên
        const firstImageDiv = document.createElement('div');
        firstImageDiv.classList.add('pdp-hero-image-item', 'active');
        const firstImgTag = document.createElement('img');
        firstImgTag.src = pdpHeroImages[0];
        firstImgTag.alt = currentPdpData.title || 'Ảnh sản phẩm';
        firstImageDiv.appendChild(firstImgTag);
        imageContainer.appendChild(firstImageDiv);

        // Tạo dots (tối đa 5)
        pdpHeroImages.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('pdp-hero-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                stopPdpHeroAutoplay();
                showPdpHeroImage(index);
                // Có thể tự động play lại sau khi user click dot, hoặc không
                // startPdpHeroAutoplay(); 
            });
            dotsContainer.appendChild(dot);
        });

        if (pdpHeroImages.length > 1) {
            playPauseBtn.style.display = 'flex';
            playPauseBtn.onclick = () => {
                if (pdpHeroAutoplayInterval) {
                    stopPdpHeroAutoplay();
                } else {
                    startPdpHeroAutoplay();
                }
            };
            startPdpHeroAutoplay(); // Bắt đầu autoplay
        } else {
            playPauseBtn.style.display = 'none'; // Ẩn nút play/pause nếu chỉ có 1 ảnh
            applyKenBurns(firstImageDiv); // Vẫn áp dụng Ken Burns cho 1 ảnh
        }
        if (playPauseBtn) { // Đảm bảo nút tồn tại
        if (pdpHeroImages.length > 1) {
            playPauseBtn.style.display = 'flex'; // Luôn hiện nếu có nhiều ảnh
            playPauseBtn.onclick = (e) => {
                e.stopPropagation(); // NGĂN VIỆC MỞ POPUP CHI TIẾT ẢNH KHI CLICK NÚT NÀY
                if (pdpHeroAutoplayInterval) {
                    stopPdpHeroAutoplay();
                } else {
                    startPdpHeroAutoplay();
                }
            };
            // Khôi phục trạng thái nút khi setup lại slider
            if (pdpHeroAutoplayInterval) {
                 playPauseBtn.innerHTML = `${ICONS.pause} <span style="display:none;">Pause</span>`;
                 playPauseBtn.setAttribute('aria-label', 'Tạm dừng slideshow');
                 playPauseBtn.dataset.playing = "true";
            } else {
                 playPauseBtn.innerHTML = `${ICONS.play} <span style="display:none;">Play</span>`;
                 playPauseBtn.setAttribute('aria-label', 'Tiếp tục slideshow');
                 playPauseBtn.dataset.playing = "false";
            }
        } else {
            playPauseBtn.style.display = 'none'; 
        }
    }

        // Gắn listener click vào ảnh để mở imageDetailModal
        // Cần gỡ listener cũ nếu có để tránh gắn nhiều lần
        const imageClickHandlerKey = '__pdpHeroImageClickHandler';
        if (heroSectionDiv[imageClickHandlerKey]) {
            heroSectionDiv.removeEventListener('click', heroSectionDiv[imageClickHandlerKey]);
        }
        const newImageClickHandler = (event) => {
            // Chỉ mở popup nếu click không phải là vào nút play/pause hoặc dots
            if (event.target.closest('.pdp-hero-playpause') || event.target.closest('.pdp-hero-dot')) {
                return;
            }
            if (currentPdpData && currentPdpData.images && currentPdpData.images.length > 0) {
                openImageDetailPopup(currentPdpData.images, pdpHeroCurrentIndex);
            }
        };
        heroSectionDiv.addEventListener('click', newImageClickHandler);
        heroSectionDiv[imageClickHandlerKey] = newImageClickHandler;
    }
    // --- LOGIC CHO POPUP CHI TIẾT ẢNH ---
    let imageDetailImages = [];
    let imageDetailCurrentIndex = 0;
    function updateImageDetailView() {
        const imageDetailPopupBody = document.getElementById('image-detail-popup-body');
        if (!imageDetailPopupBody) {
            console.error("updateImageDetailView: #image-detail-popup-body không tìm thấy!");
            return;
        }

        const largeImageEl = document.getElementById('image-detail-large-img');
        const largeImageContainer = document.getElementById('idpLargeImageContainer');
        const thumbnailsContainer = document.getElementById('image-detail-thumbnails');
        const counterEl = document.getElementById('image-detail-counter');
        const captionEl = document.getElementById('image-detail-caption');
        

        if (!largeImageEl || !largeImageContainer || !thumbnailsContainer || !counterEl || !captionEl || imageDetailImages.length === 0) {
            console.error("updateImageDetailView: Thiếu các element cần thiết hoặc không có ảnh.");
            // Log chi tiết hơn
            if (!largeImageEl) console.error("Missing: largeImageEl (#image-detail-large-img)");
            if (!largeImageContainer) console.error("Missing: largeImageContainer (#idpLargeImageContainer)");
            if (!thumbnailsContainer) console.error("Missing: thumbnailsContainer (#image-detail-thumbnails)");
            if (!counterEl) console.error("Missing: counterEl (#image-detail-counter)");
            if (!captionEl) console.error("Missing: captionEl (#image-detail-caption)");
            if (imageDetailImages.length === 0) console.error("imageDetailImages rỗng.");
            return;
        }

        // Reset trạng thái zoom/pan khi đổi ảnh
        currentZoomLevel = 1;
        currentPanX = 0;
        currentPanY = 0;
        largeImageEl.style.transformOrigin = 'center center';
        largeImageEl.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoomLevel})`;
        largeImageEl.classList.remove('is-zoomed');
        largeImageContainer.classList.remove('zoomed-in-for-pan');
        largeImageContainer.style.cursor = 'zoom-in';
        largeImageContainer.scrollTop = 0; 
        largeImageContainer.scrollLeft = 0;

        largeImageEl.style.transformOrigin = 'center center'; // Reset transform origin
        largeImageEl.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoomLevel})`;
        largeImageEl.classList.remove('is-zoomed');
        largeImageContainer.classList.remove('zoomed-in-for-pan'); // Class mới để kiểm soát cursor/pan

        largeImageEl.src = imageDetailImages[imageDetailCurrentIndex];
        largeImageEl.alt = `Ảnh chi tiết ${imageDetailCurrentIndex + 1} của ${currentPdpData.title || 'sản phẩm'}`;
        captionEl.textContent = `Ảnh ${imageDetailCurrentIndex + 1}/${imageDetailImages.length}: ${currentPdpData.title || ''}`;
        counterEl.textContent = `${imageDetailCurrentIndex + 1} / ${imageDetailImages.length}`;
        const wheelListenerKey = '__idpWheelZoomHandler';
        if (largeImageContainer[wheelListenerKey]) {
            largeImageContainer.removeEventListener('wheel', largeImageContainer[wheelListenerKey]);
        }
        const handleWheelZoom = (event) => {
            event.preventDefault(); // Ngăn trang cuộn khi zoom ảnh

            const rect = largeImageContainer.getBoundingClientRect();
            // Tọa độ chuột tương đối so với góc trên trái của container ảnh
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Tọa độ chuột tương đối so với chính ảnh (đã tính cả pan và zoom hiện tại)
            // (mouse_x_on_image) = (mouseX - currentPanX) / currentZoomLevel
            // (mouse_y_on_image) = (mouseY - currentPanY) / currentZoomLevel
            // Đặt transform-origin tại vị trí chuột trên ảnh
            // Cần chuyển đổi tọa độ này thành % cho transform-origin
            const originXPercent = (mouseX / largeImageEl.offsetWidth) * 100;
            const originYPercent = (mouseY / largeImageEl.offsetHeight) * 100;
            
            // Tạm thời để đơn giản, chúng ta sẽ zoom vào tâm của con trỏ chuột TRÊN CONTAINER
            // Một phép tính transform-origin chính xác hơn sẽ phức tạp hơn khi đã có pan
            // Để zoom vào con trỏ một cách "tự nhiên" hơn, ta cần điều chỉnh cả pan
            
            let newZoomLevel = currentZoomLevel;
            if (event.deltaY < 0) { // Cuộn lên -> Zoom in
                newZoomLevel = Math.min(maxZoom, currentZoomLevel + zoomStep);
            } else { // Cuộn xuống -> Zoom out
                newZoomLevel = Math.max(minZoom, currentZoomLevel - zoomStep);
            }

            if (newZoomLevel === currentZoomLevel) return; // Không thay đổi zoom

            // Tính toán pan offset để giữ điểm dưới con trỏ cố định
            // (x_image_point) = (mouseX - panX) / oldZoom
            // new_panX = mouseX - (x_image_point * newZoom)
            const xImg = (mouseX - currentPanX) / currentZoomLevel;
            const yImg = (mouseY - currentPanY) / currentZoomLevel;

            currentZoomLevel = newZoomLevel;

            // Nếu zoom về minZoom, reset pan và transform-origin
            if (currentZoomLevel <= minZoom + 0.01) { // Thêm khoảng sai số nhỏ
                currentZoomLevel = minZoom; // Chuẩn hóa
                currentPanX = 0;
                currentPanY = 0;
                largeImageEl.style.transformOrigin = `center center`;
                largeImageEl.classList.remove('is-zoomed');
                largeImageContainer.classList.remove('zoomed-in-for-pan');
                largeImageContainer.style.cursor = 'zoom-in';

            } else {
                // Cập nhật pan để giữ điểm zoom cố định
                currentPanX = mouseX - (xImg * currentZoomLevel);
                currentPanY = mouseY - (yImg * currentZoomLevel);
                
                // Giới hạn pan để ảnh không trôi ra ngoài quá nhiều
                const imgRect = largeImageEl.getBoundingClientRect(); // Kích thước ảnh sau khi scale
                const containerRect = largeImageContainer.getBoundingClientRect();

                // Chiều rộng/cao của ảnh đã scale
                const scaledWidth = largeImageEl.offsetWidth * currentZoomLevel;
                const scaledHeight = largeImageEl.offsetHeight * currentZoomLevel;
                
                // Không cho pan quá xa bên trái/trên (ảnh không được thụt vào quá nhiều từ trái/trên)
                currentPanX = Math.min(currentPanX, 0);
                currentPanY = Math.min(currentPanY, 0);

                // Không cho pan quá xa bên phải/dưới (ảnh không được thụt vào quá nhiều từ phải/dưới)
                if (scaledWidth > containerRect.width) {
                    currentPanX = Math.max(currentPanX, containerRect.width - scaledWidth);
                } else {
                    currentPanX = (containerRect.width - scaledWidth) / 2; // Căn giữa nếu ảnh nhỏ hơn container
                }
                if (scaledHeight > containerRect.height) {
                    currentPanY = Math.max(currentPanY, containerRect.height - scaledHeight);
                } else {
                    currentPanY = (containerRect.height - scaledHeight) / 2; // Căn giữa
                }

                largeImageEl.style.transformOrigin = `0 0`; // Đặt origin về top-left khi pan/scale bằng JS
                largeImageEl.classList.add('is-zoomed');
                largeImageContainer.classList.add('zoomed-in-for-pan');
                largeImageContainer.style.cursor = 'grab';
            }
            
            largeImageEl.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoomLevel})`;
        };
        largeImageContainer.addEventListener('wheel', handleWheelZoom, { passive: false }); // passive: false để preventDefault hoạt động
        largeImageContainer[wheelListenerKey] = handleWheelZoom;
        // --- LOGIC PAN BẰNG CÁCH KÉO CHUỘT (CƠ BẢN) ---
        const panListenerKeyMouseDown = '__idpPanMouseDown';
        const panListenerKeyMouseMove = '__idpPanMouseMove';
        const panListenerKeyMouseUpOut = '__idpPanMouseUpOut';
         // Gỡ listener cũ
        if (largeImageContainer[panListenerKeyMouseDown]) {
            largeImageContainer.removeEventListener('mousedown', largeImageContainer[panListenerKeyMouseDown]);
        }
        const handleMouseDownPan = (event) => {
            if (currentZoomLevel > minZoom) { // Chỉ cho phép pan khi đã zoom
                event.preventDefault();
                isPanning = true;
                largeImageContainer.style.cursor = 'grabbing';
                lastPanPosition = { x: event.clientX, y: event.clientY };

                document.addEventListener('mousemove', handleMouseMovePan);
                document.addEventListener('mouseup', handleMouseUpOrOutPan);
                document.addEventListener('mouseout', handleMouseUpOrOutPanOnContainer); // Thêm cho container
            }
        };
        const handleMouseMovePan = (event) => {
            if (!isPanning) return;
            const deltaX = event.clientX - lastPanPosition.x;
            const deltaY = event.clientY - lastPanPosition.y;
            lastPanPosition = { x: event.clientX, y: event.clientY };

            currentPanX += deltaX;
            currentPanY += deltaY;
            
            // Giới hạn pan (tương tự như trong handleWheelZoom)
            const containerRect = largeImageContainer.getBoundingClientRect();
            const scaledWidth = largeImageEl.offsetWidth * currentZoomLevel;
            const scaledHeight = largeImageEl.offsetHeight * currentZoomLevel;

            currentPanX = Math.min(0, Math.max(containerRect.width - scaledWidth, currentPanX));
            currentPanY = Math.min(0, Math.max(containerRect.height - scaledHeight, currentPanY));
            
            largeImageEl.style.transform = `translate(${currentPanX}px, ${currentPanY}px) scale(${currentZoomLevel})`;
        };
        const handleMouseUpOrOutPan = () => {
            if (isPanning) {
                isPanning = false;
                largeImageContainer.style.cursor = currentZoomLevel > minZoom ? 'grab' : 'zoom-in';
                document.removeEventListener('mousemove', handleMouseMovePan);
                document.removeEventListener('mouseup', handleMouseUpOrOutPan);
                document.removeEventListener('mouseout', handleMouseUpOrOutPanOnContainer);
            }
        };
        const handleMouseUpOrOutPanOnContainer = (event) => { // Dành cho mouseout khỏi container
             if (event.target === largeImageContainer && !largeImageContainer.contains(event.relatedTarget) ){
                handleMouseUpOrOutPan();
             }
        }
        largeImageContainer.addEventListener('mousedown', handleMouseDownPan);
        largeImageContainer[panListenerKeyMouseDown] = handleMouseDownPan;
        largeImageContainer[panListenerKeyMouseMove] = handleMouseMovePan;
        largeImageContainer[panListenerKeyMouseUpOut] = handleMouseUpOrOutPan;

        // Cập nhật thumbnails
        thumbnailsContainer.innerHTML = ''; // Xóa thumbnails cũ
        imageDetailImages.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.alt = `Thumbnail ${index + 1}`;
            thumb.classList.add('image-detail-thumbnail-item');
            if (index === imageDetailCurrentIndex) {
                thumb.classList.add('active');
            }
            thumb.addEventListener('click', () => {
                imageDetailCurrentIndex = index;
                updateImageDetailView(); // Gọi lại để cập nhật ảnh lớn và trạng thái
            });
            thumbnailsContainer.appendChild(thumb);
        });
        const activeThumb = thumbnailsContainer.querySelector('.active');
        if (activeThumb && typeof activeThumb.scrollIntoView === 'function') {
            activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    }
    /**
     * Mở Popup Chi Tiết Ảnh
     * @param {string[]} allImagesFromProduct - Mảng URL tất cả ảnh của sản phẩm
     * @param {number} startIndex - Chỉ số của ảnh được click để hiển thị đầu tiên
     */
    function openImageDetailPopup(allImagesFromProduct, startIndex = 0) {
        const imageDetailModal = document.getElementById('image-detail-popup'); // Query lại ở đây để chắc chắn
        if (!imageDetailModal) {
            console.error("Modal chi tiết ảnh (#image-detail-popup) không tìm thấy!");
            return;
        }
        if (!allImagesFromProduct || allImagesFromProduct.length === 0) {
            console.error("Không có ảnh để hiển thị chi tiết.");
            return;
        }
        
        if (typeof stopPdpHeroAutoplay === 'function') stopPdpHeroAutoplay();

        imageDetailImages = allImagesFromProduct;
        imageDetailCurrentIndex = startIndex;
        
        // Tạo header cho imageDetailModal
        const headerSlot = imageDetailModal.querySelector('#image-detail-popup-header-slot');
        const bodySlot = document.getElementById('image-detail-popup-body');
        
        
        if (!headerSlot || !bodySlot) {
            console.error("Không tìm thấy slot header hoặc body cho imageDetailModal.");
            return;
        }

        // 1. Tạo HTML cho header và body
        const pdpTitleShort = currentPdpData.title ? (currentPdpData.title.length > 20 ? currentPdpData.title.substring(0, 17) + '...' : currentPdpData.title) : 'Chi tiết SP';
        headerSlot.innerHTML = `
            <button class="pdp-action-btn image-detail-back-btn" id="idp-back-to-pdp-btn">
                ${ICONS.chevronLeft}
                <span>${pdpTitleShort}</span>
            </button>
            <h3 id="image-detail-popup-main-title" style="flex-grow:1; text-align:center; margin:0 10px; font-size: 1.1em; color: var(--text-color-inverted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                Ảnh chi tiết
            </h3>
            <div class="pdp-header-actions">
                <button class="pdp-action-btn" id="idp-img-favorite-btn" aria-label="Yêu thích">
                    ${(currentPdpData && currentPdpData.isFavorite) ? ICONS.heartFilled.replace('style="display:none;"', '') : ICONS.heartEmpty}
                    <span id="idp-img-favorite-btn-text">${(currentPdpData && currentPdpData.isFavorite) ? 'Đã thích' : 'Yêu thích'}</span>
                </button>
                <button class="pdp-action-btn" id="idp-img-share-btn" aria-label="Chia sẻ">
                    ${ICONS.share}
                    <span>Chia sẻ</span>
                </button>
                <button class="pdp-action-btn" id="idp-img-custom-close-btn" aria-label="Đóng">
                    ${ICONS.close}
                </button>
            </div>
        `;

        bodySlot.innerHTML = `
            <div class="image-detail-layout">
                <div class="image-detail-left-col">
                    <div class="large-image-container" id="idpLargeImageContainer">
                        <img id="image-detail-large-img" src="" alt="Ảnh chi tiết">
                    </div>
                    <div class="image-info-bar">
                        <span id="image-detail-caption">Chú thích ảnh...</span>
                        <span id="image-detail-counter">0 / 0</span>
                    </div>
                     <div class="image-detail-nav-arrows">
                        <button id="idp-prev-image" aria-label="Ảnh trước">${ICONS.chevronLeft}</button>
                        <button id="idp-next-image" aria-label="Ảnh kế tiếp">${ICONS.chevronRight}</button>
                    </div>
                </div>
                <div class="image-detail-right-col">
                    <div id="image-detail-thumbnails" class="image-detail-thumbnails-container"></div>
                </div>
            </div>
        `;

        // 2. Đợi frame tiếp theo để DOM cập nhật, SAU ĐÓ mới query và gắn listener
        requestAnimationFrame(() => {
            const backBtn = headerSlot.querySelector('#idp-back-to-pdp-btn');
            const customCloseBtn = headerSlot.querySelector('#idp-img-custom-close-btn'); // Sửa ID nếu cần khớp HTML
            const favBtnIDP = headerSlot.querySelector('#idp-img-favorite-btn');
            const shareBtnIDP = headerSlot.querySelector('#idp-img-share-btn');

            if (backBtn) backBtn.addEventListener('click', () => imageDetailModal.close());
            else console.error("#idp-back-to-pdp-btn không tìm thấy sau khi set HTML.");

            if (customCloseBtn) customCloseBtn.addEventListener('click', () => imageDetailModal.close());
            else console.error("#idp-img-custom-close-btn không tìm thấy sau khi set HTML.");
            
            if (favBtnIDP) {
                // ... (logic cập nhật và gắn listener cho nút favorite của image detail popup giữ nguyên)
            }
            if (shareBtnIDP) {
                // ... (logic cho nút share của image detail popup giữ nguyên)
            }

            const prevImgBtn = bodySlot.querySelector('#idp-prev-image');
            const nextImgBtn = bodySlot.querySelector('#idp-next-image');
            if(prevImgBtn) prevImgBtn.addEventListener('click', () => {
                imageDetailCurrentIndex = (imageDetailCurrentIndex - 1 + imageDetailImages.length) % imageDetailImages.length;
                updateImageDetailView();
            });
            if(nextImgBtn) nextImgBtn.addEventListener('click', () => {
                imageDetailCurrentIndex = (imageDetailCurrentIndex + 1) % imageDetailImages.length;
                updateImageDetailView();
            });

            const largeImageContainerForZoom = bodySlot.querySelector('#idpLargeImageContainer');
            const largeImageElForZoom = bodySlot.querySelector('#image-detail-large-img');
            if (largeImageContainerForZoom && largeImageElForZoom) {
                // --- GẮN LẠI LISTENER CHO ZOOM VÀ PAN ---
                const wheelListenerKey = '__idpWheelZoomHandler';
                if (largeImageContainerForZoom[wheelListenerKey]) {
                    largeImageContainerForZoom.removeEventListener('wheel', largeImageContainerForZoom[wheelListenerKey]);
                }
                const handleWheelZoom = (event) => { /* ... nội dung hàm handleWheelZoom giữ nguyên ... */ };
                largeImageContainerForZoom.addEventListener('wheel', handleWheelZoom, { passive: false });
                largeImageContainerForZoom[wheelListenerKey] = handleWheelZoom;

                const panListenerKeyMouseDown = '__idpPanMouseDown';
                if (largeImageContainerForZoom[panListenerKeyMouseDown]) {
                    largeImageContainerForZoom.removeEventListener('mousedown', largeImageContainerForZoom[panListenerKeyMouseDown]);
                }
                const handleMouseDownPan = (event) => { /* ... nội dung hàm handleMouseDownPan giữ nguyên ... */};
                // const handleMouseMovePan = ... (cần định nghĩa lại hoặc đảm bảo nó truy cập đúng largeImageElForZoom, currentZoomLevel, etc.)
                // const handleMouseUpOrOutPan = ...
                largeImageContainerForZoom.addEventListener('mousedown', handleMouseDownPan);
                largeImageContainerForZoom[panListenerKeyMouseDown] = handleMouseDownPan;
                 // Lưu các hàm xử lý pan để có thể gỡ bỏ nếu cần (nếu chúng được định nghĩa lại trong scope này)
                 // largeImageContainerForZoom[panListenerKeyMouseMove] = handleMouseMovePan;
                 // largeImageContainerForZoom[panListenerKeyMouseUpOut] = handleMouseUpOrOutPan;

            }
            
            updateImageDetailView(); // Hiển thị ảnh đầu tiên và thumbnails
            imageDetailModal.show();
        });
    }

    function calculateReducingBalanceLoan(totalLoanAmount, totalMonths, annualInterestRate, prefAnnualInterestRate = annualInterestRate, prefMonths = 0) {
        if (totalLoanAmount <= 0 || totalMonths <= 0 || annualInterestRate < 0 || prefAnnualInterestRate < 0 || prefMonths < 0) {
            return { monthlyPayments: [], totalInterest: 0, minMonthlyPayment: 0, maxMonthlyPayment: 0, error: "Thông số không hợp lệ." };
        }
        // Nếu lãi suất ưu đãi lớn hơn lãi suất thường, coi như không có ưu đãi hoặc dùng lãi suất thường
        if (prefMonths > 0 && prefAnnualInterestRate > annualInterestRate) {
            prefAnnualInterestRate = annualInterestRate;
        }


        const monthlyPayments = [];
        let remainingBalance = totalLoanAmount * 1000; // Chuyển sang triệu VNĐ để tính toán
        const principalPerMonth = remainingBalance / totalMonths;
        let totalInterestPaid = 0;

        for (let i = 1; i <= totalMonths; i++) {
            let currentMonthlyInterestRate;
            let currentAnnualRateForDisplay;

            if (i <= prefMonths) {
                currentMonthlyInterestRate = (prefAnnualInterestRate / 100) / 12;
                currentAnnualRateForDisplay = prefAnnualInterestRate;
            } else {
                currentMonthlyInterestRate = (annualInterestRate / 100) / 12;
                currentAnnualRateForDisplay = annualInterestRate;
            }

            const interestForMonth = remainingBalance * currentMonthlyInterestRate;
            const totalPaymentForMonth = principalPerMonth + interestForMonth;
            
            totalInterestPaid += interestForMonth;
            remainingBalance -= principalPerMonth;

            monthlyPayments.push({
                period: i,
                principal: principalPerMonth,
                interest: interestForMonth,
                totalPayment: totalPaymentForMonth,
                remainingBalance: remainingBalance < 0.001 ? 0 : remainingBalance, // Làm tròn số dư cuối cùng
                appliedRate: currentAnnualRateForDisplay
            });
        }
        
        const paymentAmounts = monthlyPayments.map(p => p.totalPayment);
        return {
            monthlyPayments, // Mảng chi tiết từng kỳ (sẽ dùng cho bảng lịch trả nợ)
            totalInterest: totalInterestPaid / 1000, // Chuyển lại sang tỷ VNĐ
            minMonthlyPayment: Math.min(...paymentAmounts) / 1000,
            maxMonthlyPayment: Math.max(...paymentAmounts) / 1000,
        };
    }

    /**
     * Tính toán chi tiết khoản vay theo phương pháp Gốc đều, lãi cố định theo giai đoạn.
     * @param {number} totalLoanAmount - Tổng số tiền vay (tỷ VNĐ)
     * @param {number} totalMonths - Tổng số tháng vay
     * @param {number} annualInterestRate - Lãi suất năm (%)
     * @param {number} [prefAnnualInterestRate=annualInterestRate] - Lãi suất ưu đãi năm (%)
     * @param {number} [prefMonths=0] - Số tháng ưu đãi
     * @returns {object} Chứa monthlyPayments (mảng), totalInterest, minMonthlyPayment, maxMonthlyPayment
     */
    function calculateFixedPrincipalAndInterestLoan(totalLoanAmount, totalMonths, annualInterestRate, prefAnnualInterestRate = annualInterestRate, prefMonths = 0) {
        if (totalLoanAmount <= 0 || totalMonths <= 0 || annualInterestRate < 0 || prefAnnualInterestRate < 0 || prefMonths < 0) {
            return { monthlyPayments: [], totalInterest: 0, minMonthlyPayment: 0, maxMonthlyPayment: 0, error: "Thông số không hợp lệ." };
        }
        if (prefMonths > 0 && prefAnnualInterestRate > annualInterestRate) {
            prefAnnualInterestRate = annualInterestRate;
        }

        const monthlyPayments = [];
        const principalLoanAmountMillions = totalLoanAmount * 1000; // Gốc vay bằng triệu
        const principalPerMonth = principalLoanAmountMillions / totalMonths;
        let totalInterestPaid = 0;
        let remainingBalance = principalLoanAmountMillions;


        for (let i = 1; i <= totalMonths; i++) {
            let interestForMonth;
            let currentAnnualRateForDisplay;

            if (i <= prefMonths) {
                // Lãi ưu đãi tính trên tổng nợ gốc ban đầu
                interestForMonth = principalLoanAmountMillions * (prefAnnualInterestRate / 100 / 12);
                currentAnnualRateForDisplay = prefAnnualInterestRate;
            } else {
                // Lãi sau ưu đãi cũng tính trên tổng nợ gốc ban đầu
                interestForMonth = principalLoanAmountMillions * (annualInterestRate / 100 / 12);
                currentAnnualRateForDisplay = annualInterestRate;
            }
            
            const totalPaymentForMonth = principalPerMonth + interestForMonth;
            totalInterestPaid += interestForMonth;
            remainingBalance -= principalPerMonth;


            monthlyPayments.push({
                period: i,
                principal: principalPerMonth,
                interest: interestForMonth,
                totalPayment: totalPaymentForMonth,
                remainingBalance: remainingBalance < 0.001 ? 0 : remainingBalance,
                appliedRate: currentAnnualRateForDisplay
            });
        }
        
        const paymentAmounts = monthlyPayments.map(p => p.totalPayment);
        return {
            monthlyPayments,
            totalInterest: totalInterestPaid / 1000, // tỷ VNĐ
            // Với phương pháp này, nếu chỉ có 1 mức lãi suất thì totalPayment hàng tháng là như nhau
            // Nếu có 2 giai đoạn lãi suất thì sẽ có 2 mức totalPayment.
            minMonthlyPayment: Math.min(...paymentAmounts) / 1000,
            maxMonthlyPayment: Math.max(...paymentAmounts) / 1000,
        };
    }
   

    function initializePdpDynamicElements(container, productDataRef) {
        if (!container || !productDataRef) {
        console.error("initializePdpDynamicElements: Thiếu container hoặc productDataRef.");
        return;
    }
        const pdpOpenContactModalBtn = container.querySelector('#pdp-show-contact-form-btn-val');
        // === LOGIC CHO NÚT "XEM THÊM" CỦA BẢNG THÔNG TIN CHI TIẾT TRÊN MOBILE ===
        const detailsTable = container.querySelector('#pdp-details-table-val');
        const viewMoreDetailsBtn = container.querySelector('#pdp-details-view-more-btn');
         const detailsTableBody = container.querySelector('#pdp-details-table-val tbody');

        if (detailsTableBody && viewMoreDetailsBtn) {
            // Lấy tất cả các hàng (<tr>) có class pdp-detail-row-mobile-collapsible
            const collapsibleRows = Array.from(detailsTableBody.querySelectorAll('tr.pdp-detail-row-mobile-collapsible'));
            
            const updateViewMoreUI = () => {
                const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
                if (isMobile && collapsibleRows.length > 0) {
                    viewMoreDetailsBtn.style.display = 'block';
                    
                    // Đếm số mục thông tin thực sự đang bị ẩn trong các collapsibleRows
                    let hiddenItemCount = 0;
                    collapsibleRows.forEach(row => {
                        if (row.classList.contains('pdp-row-is-hidden-on-mobile')) {
                            const cells = row.querySelectorAll('td');
                            if (cells[0] && cells[0].textContent.includes(':')) hiddenItemCount++;
                            if (cells[1] && cells[1].textContent.includes(':')) hiddenItemCount++;
                        }
                    });

                    if (hiddenItemCount > 0) {
                        viewMoreDetailsBtn.textContent = `Xem thêm (${hiddenItemCount} mục)`;
                        viewMoreDetailsBtn.dataset.expanded = "false";
                    } else {
                        viewMoreDetailsBtn.textContent = 'Ẩn bớt';
                        viewMoreDetailsBtn.dataset.expanded = "true";
                    }
                } else { 
                    viewMoreDetailsBtn.style.display = 'none';
                    // Trên desktop hoặc khi không có hàng collapsible, đảm bảo tất cả đều hiện
                    collapsibleRows.forEach(row => row.classList.remove('pdp-row-is-hidden-on-mobile'));
                    // Không cần class 'show-all-details-mobile' trên table nữa
                }
            };
            
            // Thiết lập trạng thái ẩn/hiện ban đầu cho các hàng
            const setInitialRowVisibility = () => {
                const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
                collapsibleRows.forEach(row => {
                    // Chỉ ẩn nếu là mobile VÀ nút chưa được set là "đã mở rộng"
                    const shouldHide = isMobile && viewMoreDetailsBtn.dataset.expanded !== "true";
                    row.classList.toggle('pdp-row-is-hidden-on-mobile', shouldHide);
                });
                updateViewMoreUI(); // Cập nhật text và visibility của nút
            };

            setInitialRowVisibility(); // Gọi lần đầu để thiết lập

            const listenerKey = '__pdpViewMoreDetails';
            if (viewMoreDetailsBtn[listenerKey]) viewMoreDetailsBtn.removeEventListener('click', viewMoreDetailsBtn[listenerKey]);
            
            const toggleListener = () => {
                if (window.innerWidth <= MOBILE_BREAKPOINT) { // Chỉ hoạt động trên mobile
                    collapsibleRows.forEach(row => {
                        row.classList.toggle('pdp-row-is-hidden-on-mobile');
                    });
                    updateViewMoreUI(); // Cập nhật lại UI của nút
                }
            };
            viewMoreDetailsBtn.addEventListener('click', toggleListener);
            viewMoreDetailsBtn[listenerKey] = toggleListener;

            const resizeListenerKey = '__pdpResizeListenerDetails';
            if (window[resizeListenerKey]) window.removeEventListener('resize', window[resizeListenerKey]);
            
            const debouncedSetup = debounce(setInitialRowVisibility, 200);
            window[resizeListenerKey] = debouncedSetup;
            window.addEventListener('resize', debouncedSetup);
        } else if(viewMoreDetailsBtn) {
            viewMoreDetailsBtn.style.display = 'none'; // Ẩn nút nếu không có bảng hoặc hàng
        }
            // Hàm debounce đơn giản
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
     
        if (pdpOpenContactModalBtn) {
            const listenerKey = '__pdpOpenContactModal';
            if (pdpOpenContactModalBtn[listenerKey]) pdpOpenContactModalBtn.removeEventListener('click', pdpOpenContactModalBtn[listenerKey]);
            const newListener = () => {
                if (!contactFormModal) { console.error("Modal form liên hệ (#contact-form-modal) không tìm thấy!"); return; }
                if (!currentPdpData) { console.error("Không có currentPdpData cho form liên hệ."); return; }
                if (contactFormModal.setHeaderTitle && typeof contactFormModal.setHeaderTitle === 'function') {
                    contactFormModal.setHeaderTitle(`Yêu cầu tư vấn`);
                }
                if(contactFormProductNameDisplay) contactFormProductNameDisplay.textContent = currentPdpData.title;
                if(hiddenProductIdInputInModal) hiddenProductIdInputInModal.value = currentPdpData.id;
                if (actualContactFormInModal) actualContactFormInModal.reset();
                contactFormModal.show();
            };
            pdpOpenContactModalBtn.addEventListener('click', newListener);
            pdpOpenContactModalBtn[listenerKey] = newListener;
            pdpOpenContactModalBtn.textContent = 'Liên hệ tư vấn'; 
        }
        const pdpContactZaloBtnDesktop = container.querySelector('#pdp-zalo-chat-btn-val');
        const commonBtnLogic = (btn, listenerKeySuffix, action) => { /* ... (giữ nguyên) ... */ };
        commonBtnLogic(pdpContactZaloBtnDesktop, 'ZaloDesktop', (pData) => { /* ... */ });
        const pdpMobileBottomBar = productDetailModal.querySelector('.pdp-mobile-bottom-bar');
        if (pdpMobileBottomBar) { /* ... commonBtnLogic cho nút mobile giữ nguyên ... */ }
        

        // === LOGIC CHO CÔNG CỤ TÍNH LÃI VAY ===
        const propertyValueInput = container.querySelector('#lc-property-value');
        const loanAmountInput = container.querySelector('#lc-loan-amount');
        const loanAmountSlider = container.querySelector('#lc-loan-amount-slider');
        const loanPercentageText = container.querySelector('#lc-loan-percentage-text');
        const btnPropertyValueMinus = container.querySelector('#lc-property-value-minus');
        const btnPropertyValuePlus = container.querySelector('#lc-property-value-plus');
        const btnLoanAmountMinus = container.querySelector('#lc-loan-amount-minus');
        const btnLoanAmountPlus = container.querySelector('#lc-loan-amount-plus');

        const loanTermInput = container.querySelector('#lc-loan-term');
        const interestRateInput = container.querySelector('#lc-interest-rate');
        const prefInterestRateInput = container.querySelector('#lc-pref-interest-rate');
        const prefMonthsInput = container.querySelector('#lc-pref-months');
        //const disbursementDateInput = container.querySelector('#lc-disbursement-date');
        const calcMethodSelect = container.querySelector('#lc-calc-method');

        const monthlyPaymentEl = container.querySelector('#lc-monthly-payment');
        const totalInterestEl = container.querySelector('#lc-total-interest');
        const pieChartCanvas = container.querySelector('#loanPieChart');
        // Đồng bộ lãi suất ưu đãi với lãi suất năm KHI LÃI SUẤT NĂM THAY ĐỔI
        // và người dùng chưa tự nhập lãi suất ưu đãi hoặc số tháng ưu đãi = 0
        const resultsContainer = container.querySelector('.loan-calculator-results'); // Tham chiếu đến div chứa kết quả

        // Đảm bảo phần kết quả được ẩn khi PDP được khởi tạo/làm mới
        if (resultsContainer) {
            resultsContainer.classList.remove('results-visible');
            // Hoặc resultsContainer.style.display = 'none';
        }
        // Xóa biểu đồ cũ nếu có khi khởi tạo lại (để không bị lỗi nếu người dùng chưa tính toán lại)
        if (window.loanPieChartInstance) {
            window.loanPieChartInstance.destroy();
            window.loanPieChartInstance = null;
        }
        if (pieChartCanvas) { // Xóa nội dung canvas cũ
            const ctx = pieChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, pieChartCanvas.width, pieChartCanvas.height);
        }
        if (monthlyPaymentEl) monthlyPaymentEl.innerHTML = '-'; // Reset text kết quả
        if (totalInterestEl) totalInterestEl.textContent = '-';

        if (interestRateInput && prefInterestRateInput) {
            const prefMonthsInput = container.querySelector('#lc-pref-months');
            let userModifiedPrefRate = false; // Cờ để biết người dùng đã tự sửa lãi suất ưu đãi chưa

            prefInterestRateInput.addEventListener('input', () => {
                userModifiedPrefRate = true;
            });
            
            interestRateInput.addEventListener('input', () => {
                const currentPrefMonths = parseInt(prefMonthsInput.value) || 0;
                // Nếu không có ưu đãi tháng hoặc người dùng chưa tự sửa LS ưu đãi, thì cập nhật theo LS năm
                if (currentPrefMonths === 0 || !userModifiedPrefRate) {
                    prefInterestRateInput.value = interestRateInput.value;
                }
            });
            // Gọi lần đầu để đồng bộ nếu cần
            if ( (parseInt(container.querySelector('#lc-pref-months').value) || 0) === 0 || !prefInterestRateInput.value ) {
                 prefInterestRateInput.value = interestRateInput.value;
            }
        }


        const calculateLoanPercentage = () => {
            if (propertyValueInput && loanAmountInput && loanAmountSlider && loanPercentageText) {
                const propVal = parseFloat(propertyValueInput.value) || 0;
                let loanVal = parseFloat(loanAmountInput.value) || 0;

                if (propVal > 0) {
                    if (loanVal > propVal) { // Đảm bảo số tiền vay không lớn hơn giá trị nhà
                        loanVal = propVal;
                        loanAmountInput.value = loanVal.toFixed(1);
                    }
                    const percentage = Math.round((loanVal / propVal) * 100);
                    loanAmountSlider.value = percentage;
                    loanPercentageText.textContent = `${percentage}%`;
                } else {
                    loanAmountSlider.value = 0;
                    loanPercentageText.textContent = `0%`;
                }
                 // Giới hạn max cho input số tiền vay
                if (loanAmountInput) loanAmountInput.max = propVal > 0 ? propVal.toFixed(1) : '0';
            }
        };

        if (propertyValueInput) {
            propertyValueInput.addEventListener('input', calculateLoanPercentage);
            if(btnPropertyValueMinus) btnPropertyValueMinus.addEventListener('click', () => {
                propertyValueInput.stepDown(); propertyValueInput.dispatchEvent(new Event('input'));
            });
            if(btnPropertyValuePlus) btnPropertyValuePlus.addEventListener('click', () => {
                propertyValueInput.stepUp(); propertyValueInput.dispatchEvent(new Event('input'));
            });
        }
        if (loanAmountInput) {
            loanAmountInput.addEventListener('input', calculateLoanPercentage);
            if(btnLoanAmountMinus) btnLoanAmountMinus.addEventListener('click', () => {
                loanAmountInput.stepDown(); loanAmountInput.dispatchEvent(new Event('input'));
            });
            if(btnLoanAmountPlus) btnLoanAmountPlus.addEventListener('click', () => {
                loanAmountInput.stepUp(); loanAmountInput.dispatchEvent(new Event('input'));
            });
        }
        if (loanAmountSlider) {
            loanAmountSlider.addEventListener('input', () => {
                if (propertyValueInput && loanAmountInput && loanPercentageText) {
                    const propVal = parseFloat(propertyValueInput.value) || 0;
                    if (propVal > 0) {
                        const percentage = parseInt(loanAmountSlider.value);
                        const loanVal = (propVal * percentage) / 100;
                        loanAmountInput.value = loanVal.toFixed(1); // Làm tròn đến 1 chữ số thập phân
                        loanPercentageText.textContent = `${percentage}%`;
                    }
                }
            });
        }
        calculateLoanPercentage(); // Tính lần đầu

        const calculateLoanBtn = container.querySelector('.loan-calculate-btn');
        if (calculateLoanBtn) {
            calculateLoanBtn.addEventListener('click', () => {
                const propValueBillion = parseFloat(propertyValueInput.value);
                const loanAmountBillion = parseFloat(loanAmountInput.value);
                const propVal = parseFloat(propertyValueInput.value); // tỷ
                const loanAmount = parseFloat(loanAmountInput.value); // tỷ
                const loanTermMonths = parseInt(loanTermInput.value); // tháng
                let annualRate = parseFloat(interestRateInput.value); // %/năm
                let prefAnnualRate = parseFloat(prefInterestRateInput.value); // %/năm
                let prefMonths = parseInt(prefMonthsInput.value) || 0; // tháng
                // const disbursementDate = disbursementDateInput.value; // Sẽ dùng cho bảng chi tiết
                const calcMethod = calcMethodSelect.value;

                // Validations
                if (isNaN(propVal) || propVal <= 0) { alert("Vui lòng nhập giá trị nhà đất hợp lệ."); return; }
                if (isNaN(loanAmount) || loanAmount <= 0 || loanAmount > propVal) { alert("Số tiền vay không hợp lệ hoặc lớn hơn giá trị nhà đất."); return; }
                if (isNaN(loanTermMonths) || loanTermMonths <= 0) { alert("Thời gian vay không hợp lệ."); return; }
                if (isNaN(annualRate) || annualRate < 0) { alert("Lãi suất năm không hợp lệ."); return; }
                if (prefMonths > 0 && (isNaN(prefAnnualRate) || prefAnnualRate < 0)) { alert("Lãi suất ưu đãi năm không hợp lệ."); return; }
                if (prefMonths > 0 && prefAnnualRate > annualRate) {
                    alert("Lãi suất ưu đãi không được lớn hơn lãi suất vay thông thường. Sử dụng lãi suất vay thông thường cho giai đoạn ưu đãi.");
                    prefAnnualRate = annualRate; // Hoặc có thể không tính toán nữa
                }
                if (prefMonths >= loanTermMonths) {
                    // Nếu số tháng ưu đãi bằng hoặc lớn hơn tổng thời gian vay, toàn bộ khoản vay là ưu đãi
                    annualRate = prefAnnualRate; 
                    prefMonths = loanTermMonths; // Giới hạn tháng ưu đãi bằng tổng thời gian vay
                }


                let results;
                if (calcMethod === 'reducing_balance') {
                    results = calculateReducingBalanceLoan(loanAmount, loanTermMonths, annualRate, prefAnnualRate, prefMonths);
                } else { // annuity (gốc đều, lãi cố định theo giai đoạn)
                    results = calculateFixedPrincipalAndInterestLoan(loanAmount, loanTermMonths, annualRate, prefAnnualRate, prefMonths);
                }

                if (results.error) {
                    alert(results.error);
                    if (monthlyPaymentEl) monthlyPaymentEl.innerHTML = '-';
                    if (totalInterestEl) totalInterestEl.textContent = '-';
                    if (resultsContainer) resultsContainer.classList.remove('results-visible'); // Ẩn nếu có lỗi
                    return;
                }
                // === CẬP NHẬT HIỂN THỊ KẾT QUẢ SỐ LIỆU (VND) ===
                const formatToVND = (valueInBillion) => {
                    if (valueInBillion === null || isNaN(valueInBillion)) return '-';
                    return (valueInBillion * 1000000000).toLocaleString('vi-VN') + ' VND';
                };

                // Hiển thị kết quả số liệu
                if (monthlyPaymentEl) {
                    if (results.minMonthlyPayment === results.maxMonthlyPayment) {
                        monthlyPaymentEl.innerHTML = `<strong>${formatToVND(results.minMonthlyPayment)}</strong>`;
                    } else {
                        monthlyPaymentEl.innerHTML = 
                            `<span class="lc-result-prefix">từ</span> <strong>${formatToVND(results.minMonthlyPayment)}</strong><br>
                             <span class="lc-result-prefix">đến</span> <strong>${formatToVND(results.maxMonthlyPayment)}</strong>`;
                    }
                }
                if (totalInterestEl) {
                    totalInterestEl.textContent = formatToVND(results.totalInterest);
                }

                 // === CẬP NHẬT DỮ LIỆU BIỂU ĐỒ TRÒN (VND) ===
                const upfrontPayment = (propVal - loanAmount) > 0 ? (propVal - loanAmount) : 0; // Cần trả trước (tỷ VNĐ)
                const principalToPay = loanAmount * 1000000000 ; // Gốc cần trả (tỷ VNĐ)
                const interestToPay = results.totalInterest * 1000000000 ; // Lãi cần trả (tỷ VNĐ)
                const totalRepaymentVND = principalToPay + interestToPay; // Tổng tiền phải trả cho khoản vay
                const upfrontPaymentBillion = Math.max(0, propValueBillion - loanAmountBillion);
                const principalToPayBillion = loanAmountBillion;
                const interestToPayBillion = results.totalInterest; // totalInterest từ hàm tính toán là tỷ VNĐ
                // Tổng giá trị cho phần trăm (nếu cần cho legend hoặc text giữa)
                const totalPropertyValueBillion = upfrontPaymentBillion + principalToPayBillion + interestToPayBillion;
                // Hoặc chính là propValueBillion nếu upfrontPaymentBillion = propValueBillion - loanAmountBillion
                // const totalPaidForLoanAndUpfrontBillion = propValueBillion;

                // Text hiển thị ở giữa Donut Chart
                const centerTextValue = totalPropertyValueBillion .toLocaleString('vi-VN', {maximumFractionDigits:2}) + ' tỷ';
                const centerTextLabel = "Tổng thanh toán";

                // Vẽ biểu đồ tròn
                if (pieChartCanvas && typeof Chart !== 'undefined') {
                    if (loanPieChartInstance) { // Hủy biểu đồ cũ trước khi vẽ mới
                        loanPieChartInstance.destroy();
                    }
                    
                    const dataForPieChart = {
                        labels: [
                            'Cần trả trước', 
                            'Gốc cần trả', 
                            'Lãi cần trả'
                        ],
                        datasets: [{
                            data: [
                                upfrontPaymentBillion, // Giá trị bằng tỷ VNĐ
                                principalToPayBillion,
                                interestToPayBillion
                            ],
                            backgroundColor: [
                                'rgba(200, 200, 200, 0.7)',  // Màu cho "Cần trả trước" (Xám nhạt)
                                'rgba(83, 185, 102, 0.7)',   // Màu cho "Gốc cần trả" (Primary color mờ)
                                'rgba(255, 159, 64, 0.7)'    // Màu cho "Lãi cần trả" (Cam mờ)
                            ],
                            borderColor: [
                                'rgba(200, 200, 200, 1)',
                                'rgba(83, 185, 102, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                    };
                    window.loanPieChartInstance = new Chart(pieChartCanvas.getContext('2d'), {
                        type: 'doughnut',
                        data: dataForPieChart,
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            cutout: '60%',
                            plugins: {
                                legend: { position: 'bottom', /* ... */ },
                                title: { display: true, text: 'Cơ Cấu Khoản Thanh Toán (Ước Tính)', /* ... */ },
                                tooltip: { /* ... callbacks giữ nguyên ... */ },
                            },
                            animation: {
                                onComplete: () => {
                                    const chart = window.loanPieChartInstance;
                                    if (chart) {
                                        const ctx = chart.ctx;
                                        ctx.save();
                                        const x = chart.width / 2;
                                        const y = chart.height / 2;
                                        ctx.textAlign = 'center';
                                        ctx.textBaseline = 'middle';
                                        
                                        // HIỂN THỊ TEXT MỚI Ở GIỮA
                                        ctx.font = "bold 1em Arial"; 
                                        ctx.fillStyle = 'var(--secondary-color)';
                                        ctx.fillText(centerTextValue, x, y - 7); 

                                        ctx.font = "0.7em Arial"; 
                                        ctx.fillStyle = 'var(--text-color-light)';
                                        ctx.fillText(centerTextLabel, x, y + 10); 
                                        ctx.restore();
                                    }
                                }
                            }
                        }
                    });

                    
                } else if (typeof Chart === 'undefined') {
                    console.error("Thư viện Chart.js chưa được tải.");
                    if(pieChartCanvas) pieChartCanvas.parentElement.innerHTML = '<p class="no-data-message" style="font-size:0.8em; text-align:center;">Lỗi tải thư viện biểu đồ.</p>';
                } else if (!pieChartCanvas) {
                    console.error("Không tìm thấy canvas #loanPieChart.");
                }
                // Lưu trữ kết quả chi tiết để hiển thị trong modal lịch trả nợ
                container.dataset.loanScheduleDetails = JSON.stringify(results.monthlyPayments);
                container.dataset.disbursementDate = container.querySelector('#lc-disbursement-date').value || new Date().toISOString().split('T')[0];
                if (resultsContainer) {
                    resultsContainer.classList.add('results-visible');
                    // Hoặc resultsContainer.style.display = 'grid';
                }

            });
        }

        const viewScheduleBtn = container.querySelector('#lc-view-schedule-btn');
       
        if (viewScheduleBtn && loanScheduleModal && loanScheduleModalBody) {
            const listenerKey = '__lcViewSchedule';
            if(viewScheduleBtn[listenerKey]) viewScheduleBtn.removeEventListener('click', viewScheduleBtn[listenerKey]);
            
            const newListener = () => {
                const scheduleDataString = container.dataset.loanScheduleDetails;
                const disbursementDateString = container.dataset.disbursementDate || new Date().toISOString().split('T')[0];

                if (!scheduleDataString) {
                    loanScheduleModalBody.innerHTML = "<p>Chưa có dữ liệu lịch trả nợ. Vui lòng thực hiện tính toán trước.</p>";
                    if (loanScheduleModal.setHeaderTitle) loanScheduleModal.setHeaderTitle("Lịch Biểu Trả Nợ");
                    else if(loanScheduleModalTitle) loanScheduleModalTitle.textContent = "Lịch Biểu Trả Nợ";
                    loanScheduleModal.show();
                    return;
                }

                try {
                    const monthlyPayments = JSON.parse(scheduleDataString); // Dữ liệu này là mảng các object, mỗi object có đơn vị là triệu VND
                    
                    let tableHTML = `
                        <div class="loan-schedule-table-wrapper">
                            <table class="loan-schedule-table">
                                <thead>
                                    <tr>
                                        <th>Kỳ trả</th>
                                        <th>Ngày TT</th>
                                        <th>Dư nợ đầu kỳ (VND)</th>
                                        <th>Lãi suất (%/năm)</th>
                                        <th>Tiền lãi (VND)</th>
                                        <th>Tiền gốc (VND)</th>
                                        <th>Tổng trả (VND)</th>
                                        <th>Dư nợ cuối kỳ (VND)</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `;
                    
                    let sumInterest = 0;
                    let sumPrincipal = 0;
                    let sumTotalPayment = 0;
                    let currentDate = new Date(disbursementDateString);

                    monthlyPayments.forEach((payment, index) => {
                        // Kỳ trả đầu tiên dùng ngày giải ngân, các kỳ sau +1 tháng
                        if (index > 0) {
                            currentDate.setMonth(currentDate.getMonth() + 1);
                        }
                        const paymentDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
                        
                        // Dư nợ đầu kỳ = Dư nợ cuối kỳ trước đó (hoặc tổng vay ban đầu cho kỳ 1)
                        // Dữ liệu `monthlyPayments` đã có `remainingBalance` là dư nợ cuối kỳ, 
                        // vậy dư nợ đầu kỳ của kỳ `i` là `remainingBalance` của kỳ `i-1`.
                        // Hoặc nếu `monthlyPayments` chứa dư nợ đầu kỳ thì dùng trực tiếp.
                        // Giả sử `monthlyPayments` từ hàm tính toán đã có cấu trúc đúng.
                        // Các giá trị tiền tệ trong `monthlyPayments` là triệu VNĐ, cần *1,000,000
                        
                        const principalPaidVND = payment.principal * 1000000;
                        const interestPaidVND = payment.interest * 1000000;
                        const totalPaymentVND = payment.totalPayment * 1000000;
                        // Dư nợ đầu kỳ của kỳ hiện tại là dư nợ cuối kỳ của kỳ trước + tiền gốc đã trả của kỳ hiện tại
                        // Hoặc, dư nợ đầu kỳ của kỳ 1 là tổng vay, của kỳ i > 1 là dư nợ cuối kỳ i-1
                        let openingBalanceVND;
                        if (index === 0) {
                            // Lấy tổng số tiền vay từ input (cần truyền vào hoặc lấy từ đâu đó)
                            const totalLoanInput = container.querySelector('#lc-loan-amount');
                            openingBalanceVND = totalLoanInput ? (parseFloat(totalLoanInput.value) * 1000000000) : payment.remainingBalance * 1000000 + principalPaidVND;
                        } else {
                            openingBalanceVND = monthlyPayments[index-1].remainingBalance * 1000000 + principalPaidVND; 
                            // Hoặc đơn giản hơn, nếu monthlyPayments[index-1].remainingBalance đã là dư nợ cuối kỳ TRƯỚC KHI TRỪ GỐC KỲ ĐÓ
                            // Thì dư nợ đầu kỳ của kỳ i sẽ là monthlyPayments[index-1].remainingBalance.
                            // Cần xem lại cấu trúc chính xác của monthlyPayments.
                            // Giả định: payment.remainingBalance LÀ dư nợ cuối kỳ SAU KHI đã trừ gốc.
                            // Vậy dư nợ đầu kỳ của kỳ này = payment.remainingBalance (cuối kỳ này) + payment.principal (gốc kỳ này)
                            openingBalanceVND = payment.remainingBalance * 1000000 + principalPaidVND;
                        }
                        const closingBalanceVND = payment.remainingBalance * 1000000;


                        tableHTML += `
                            <tr>
                                <td>${payment.period}</td>
                                <td>${paymentDate}</td>
                                <td>${openingBalanceVND.toLocaleString('vi-VN')}</td>
                                <td>${payment.appliedRate.toFixed(2)}%</td>
                                <td>${interestPaidVND.toLocaleString('vi-VN')}</td>
                                <td>${principalPaidVND.toLocaleString('vi-VN')}</td>
                                <td>${totalPaymentVND.toLocaleString('vi-VN')}</td>
                                <td>${closingBalanceVND.toLocaleString('vi-VN')}</td>
                            </tr>
                        `;
                        sumInterest += interestPaidVND;
                        sumPrincipal += principalPaidVND;
                        sumTotalPayment += totalPaymentVND;
                    });

                    tableHTML += `
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="4" style="text-align: right; font-weight: bold;">Tổng cộng:</td>
                                        <td style="font-weight: bold;">${sumInterest.toLocaleString('vi-VN')}</td>
                                        <td style="font-weight: bold;">${sumPrincipal.toLocaleString('vi-VN')}</td>
                                        <td style="font-weight: bold;">${sumTotalPayment.toLocaleString('vi-VN')}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    `;
                    loanScheduleModalBody.innerHTML = tableHTML;

                } catch (e) {
                    console.error("Lỗi xử lý dữ liệu lịch trả nợ:", e);
                    loanScheduleModalBody.innerHTML = "<p>Có lỗi xảy ra khi hiển thị lịch trả nợ.</p>";
                }

                if (loanScheduleModal.setHeaderTitle) loanScheduleModal.setHeaderTitle("Lịch Biểu Trả Nợ");
                else if(loanScheduleModalTitle) loanScheduleModalTitle.textContent = "Lịch Biểu Trả Nợ";
                loanScheduleModal.show();
            };
            viewScheduleBtn.addEventListener('click', newListener);
            viewScheduleBtn[listenerKey] = newListener;
        }

    }
    const scheduleModalBackButton = document.getElementById('lc-schedule-back-btn');
    if (scheduleModalBackButton && loanScheduleModal) {
        scheduleModalBackButton.addEventListener('click', () => {
            loanScheduleModal.close();
        });
    }
    
     function handlePdpScroll() {
        if (!pdpSlottedHeaderDiv && productDetailModal) pdpSlottedHeaderDiv = productDetailModal.querySelector('#pdpSlottedHeader');
        if (!pdpInternalModalHeader && productDetailModal && productDetailModal.shadowRoot) pdpInternalModalHeader = productDetailModal.shadowRoot.querySelector('.popup-header');
        if (!modalBodyActualScroller && productDetailModal && productDetailModal.shadowRoot) modalBodyActualScroller = productDetailModal.shadowRoot.querySelector('.popup-body');
        if (!pdpScrollableContentContainer && modalBodyActualScroller) { /* ... query pdpScrollableContentContainer ... */ }

        if (!pdpSlottedHeaderDiv || !pdpInternalModalHeader || !modalBodyActualScroller || !pdpScrollableContentContainer) return;
        
        const heroSection = pdpScrollableContentContainer.querySelector('.pdp-hero-section');
        const actualFixedHeaderBarHeight = pdpInternalModalHeader.offsetHeight; 
        // const defaultModalCloseButton = productDetailModal.shadowRoot.querySelector('.popup-close-btn'); // << KHÔNG CẦN NỮA
        // Chiều cao của phần header bạn slot vào (pdpSlottedHeaderDiv), dùng để tính toán padding/margin cho hiệu ứng overlay
        const slottedHeaderHeight = pdpSlottedHeaderDiv.offsetHeight;
        // === ĐIỀU CHỈNH CHO HERO NẰM DƯỚI HEADER ===
        if (pdpScrollableContentContainer && heroSection && slottedHeaderHeight > 0) {
            // Đặt padding-top cho vùng cuộn bằng chiều cao của header được slot
            pdpScrollableContentContainer.style.paddingTop = `${slottedHeaderHeight}px`;
            // Đặt margin-top âm cho hero section để nó "chui" lên dưới header
            heroSection.style.marginTop = `-${slottedHeaderHeight}px`;
        } else if (pdpScrollableContentContainer && heroSection) {
            // Fallback nếu không lấy được slottedHeaderHeight, không áp dụng hiệu ứng overlay
            pdpScrollableContentContainer.style.paddingTop = '0px';
            heroSection.style.marginTop = '0px';
        }
        // === KẾT THÚC ĐIỀU CHỈNH HERO ===
        let needsSolidHeader = false;
        if (!heroSection) { 
            if (!pdpSlottedHeaderDiv.classList.contains('scrolled-past-hero')) {
                pdpSlottedHeaderDiv.classList.add('scrolled-past-hero');
            }
        } else {
            const heroHeight = heroSection.offsetHeight;
            const scrollTriggerPoint = Math.max(0, heroHeight - slottedHeaderHeight);
            
             if (modalBodyActualScroller.scrollTop >= scrollTriggerPoint) { 
                if (!pdpSlottedHeaderDiv.classList.contains('scrolled-past-hero')) {
                    pdpSlottedHeaderDiv.classList.add('scrolled-past-hero');
                }
            } else {
                if (pdpSlottedHeaderDiv.classList.contains('scrolled-past-hero')) {
                    pdpSlottedHeaderDiv.classList.remove('scrolled-past-hero');
                }
            }
        }

        if (needsSolidHeader) {
            if (!pdpSlottedHeaderDiv.classList.contains('scrolled-past-hero')) {
                pdpSlottedHeaderDiv.classList.add('scrolled-past-hero');
                // if (defaultModalCloseButton) defaultModalCloseButton.style.color = 'var(--dark-gray-color)'; // << KHÔNG CẦN NỮA
            }
        } else {
            if (pdpSlottedHeaderDiv.classList.contains('scrolled-past-hero')) {
                pdpSlottedHeaderDiv.classList.remove('scrolled-past-hero');
                // if (defaultModalCloseButton) defaultModalCloseButton.style.color = 'var(--text-color-inverted)'; // << KHÔNG CẦN NỮA
            }
        }

        const contactBox = pdpScrollableContentContainer.querySelector('.pdp-contact-box-sticky');
        if (contactBox && actualFixedHeaderBarHeight > 0) {
            contactBox.style.top = `${actualFixedHeaderBarHeight - 25}px`;
        }
    }

    if (productDetailModal) {
        // Listener cho các nút tĩnh trong header PDP
        if (pdpCustomCloseBtn && !pdpCustomCloseBtn.dataset.listenerAttachedPdpClose) {
            pdpCustomCloseBtn.addEventListener('click', () => productDetailModal.close());
            pdpCustomCloseBtn.dataset.listenerAttachedPdpClose = 'true';
        }
        if (popupShareBtn && !popupShareBtn.dataset.listenerAttachedShare) {
            popupShareBtn.addEventListener('click', () => { /* ... logic share ... */ });
            popupShareBtn.dataset.listenerAttachedShare = 'true';
        }
        if (popupFavoriteBtn && pdpFavoriteBtnText && !popupFavoriteBtn.dataset.listenerAttachedFav) {
            popupFavoriteBtn.addEventListener('click', () => { /* ... logic favorite ... */ });
            popupFavoriteBtn.dataset.listenerAttachedFav = 'true';
        }

        document.addEventListener('product-detail-requested', (event) => {
            if (!productDetailModal) { return; }
            if (event.detail && event.detail.productData) {
                currentPdpData = event.detail.productData;
                
                const displayValue = (value, suffix = '') => {
                    if (value !== null && value !== undefined && value !== '-') { // Giữ lại '-' nếu đã là '-'
                        // Nếu là số 0, vẫn hiển thị số 0
                        return value === 0 ? `0${suffix}` : `${value}${suffix}`;
                    }
                    return '-';
                };
                const displayUnitPrice = (value) => { // Hàm này cũng được định nghĩa gần đó
                    if (value !== null && !isNaN(value)) {
                        return `${parseFloat(value).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} tr/m²`;
                    }
                    return '-';
                };
                // --- TẠO HTML CHO BẢNG THÔNG TIN CHI TIẾT ---
                let detailsTableHTML = '';
                const allProductDetails = [ // Sắp xếp theo thứ tự ưu tiên bạn yêu cầu
                    { label: "Loại nhà đất", value: currentPdpData.propertyType || 'N/A' },
                    { label: "Pháp lý", value: currentPdpData.legal || 'N/A' },
                    { label: "Nội thất", value: currentPdpData.furniture || 'N/A' },
                    { label: "View, hướng", value: currentPdpData.viewDirection || 'N/A' }, // Trường mới
                    { label: "Tầng", value: currentPdpData.floorLevel || 'N/A' },         // Trường mới
                    { label: "Giá bán", value: currentPdpData.price || 'N/A' }, // price đã được format
                    { label: "Diện tích", value: `${currentPdpData.area || 'N/A'} m²` },
                    { label: "Giá/m²", value: (currentPdpData.unitPrice !== null && !isNaN(currentPdpData.unitPrice)) ? `${parseFloat(currentPdpData.unitPrice).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} tr/m²` : 'N/A' },
                    { label: "Số phòng ngủ", value: `${currentPdpData.bedrooms || 'N/A'} PN` },
                    { label: "Số WC", value: `${currentPdpData.wc || 'N/A'} WC` },
                    { label: "Hướng ban công", value: currentPdpData.balconyDirection || 'N/A' },// Trường mới
                    { label: "Hướng cửa", value: currentPdpData.doorDirection || 'N/A' },      // Trường mới
                    { label: "Mã tin", value: currentPdpData.id || 'N/A' },
                    { label: "Thông tin khác", value: currentPdpData.otherInfo || 'N/A' }  // Trường mới
                ];

                const initialMobileVisibleRows = 3; 
                const initialMobileVisiblePairs = initialMobileVisibleRows * 2;
                const initialMobileVisibleItems = 5; 
                 try { 
                    for (let i = 0; i < allProductDetails.length; i += 2) {
                        const item1 = allProductDetails[i];
                        const item2 = allProductDetails[i+1]; 
                        
                        
                        // Dòng này sẽ được ẩn ban đầu trên mobile nếu nó nằm ngoài số lượng hiển thị ban đầu
                        const isBeyondInitialViewMobile = i >= initialMobileVisiblePairs;
                        let rowClass = ''; 
                        
                        // Một hàng (<tr>) chứa tối đa 2 mục thông tin (item1, item2).
                        // Hàng này sẽ được đánh dấu là 'collapsible' nếu mục thông tin ĐẦU TIÊN của nó (item1)
                        // có chỉ số (i) vượt quá hoặc bằng số mục được phép hiển thị ban đầu.
                        if (i >= initialMobileVisibleItems) {
                            rowClass = 'pdp-detail-row-mobile-collapsible';
                        }

                        detailsTableHTML += `<tr class="${rowClass}">`;
                        detailsTableHTML += `<td>${item1.label || ''}: <strong>${item1.value || '-'}</strong></td>`;
                        if (item2) {
                            detailsTableHTML += `<td>${item2.label || ''}: <strong>${item2.value || '-'}</strong></td>`;
                        } else {
                             console.error("Lỗi khi tạo detailsTableHTML:", e);
                    detailsTableHTML = '<tr><td colspan="2">Lỗi hiển thị thông tin chi tiết.</td></tr>';
                        }
                        detailsTableHTML += `</tr>`;
                    }
                } catch (e) {
                    console.error("Lỗi khi tạo detailsTableHTML:", e);
                    detailsTableHTML = '<tr><td colspan="2">Lỗi hiển thị thông tin chi tiết.</td></tr>';
                }
                // --- CẬP NHẬT GIÁ TRỊ MẶC ĐỊNH CHO INPUTS CÔNG CỤ TÍNH LÃI VAY ---
                const defaultPropertyValue = currentPdpData.priceValue || 1;
                const defaultLoanAmount = (defaultPropertyValue * 0.7).toFixed(1);
                const today = new Date().toISOString().split('T')[0];
                const defaultAnnualRate = 7.5; // Giả sử lãi suất năm mặc định
                // --- KẾT THÚC TẠO HTML BẢNG ---
                // --- TẠO GOOGLE MAPS EMBED URL ---
                let mapEmbedHTML = '<div style="height:300px; background:#e0e0e0; display:flex; align-items:center; justify-content:center;">Không thể tải bản đồ.</div>'; // Fallback
                if (currentPdpData.address) {
                    const encodedAddress = encodeURIComponent(currentPdpData.address);
                    const mapSrc = `https://maps.google.com/maps?q=${encodedAddress}&hl=vi&z=15&output=embed`;
                    mapEmbedHTML = `
                        <iframe
                            width="100%"
                            height="300" 
                            style="border:0;"
                            loading="lazy"
                            allowfullscreen=""
                            referrerpolicy="no-referrer-when-downgrade"
                            src="${mapSrc}">
                        </iframe>
                    `;
                }
                // --- KẾT THÚC TẠO GOOGLE MAPS EMBED URL ---
                
                // Tạo HTML cho body của PDP 
         
                const bodyAndActionbarHTML = `
                    <div class="pdp-scrollable-content">
                        <section class="pdp-hero-section" id="pdpHeroSection">
                            <div id="pdpHeroImageContainer" class="pdp-hero-image-container">
                                  {/* Ảnh sẽ được JS chèn vào đây */}
                            </div>
                            <div class="pdp-hero-controls">
                                <div id="pdpHeroDots" class="pdp-hero-dots"></div>
                                <button id="pdp-hero-playpause-btn" class="pdp-hero-playpause" aria-label="Tạm dừng/Tiếp tục slideshow">
                                    ${ICONS.pause} <span style="display:none;">Pause</span>
                                </button>
                            </div>
                        </section>
                        <section class="pdp-main-content-area">
                            <div class="pdp-main-columns">
                                <div class="pdp-left-column">
                                    <nav aria-label="breadcrumb" class="pdp-breadcrumbs"><ol><li><a href="#">Trang chủ</a></li><li><a href="#">Bán căn hộ</a></li><li><a href="#">${currentPdpData.city || 'TP. HCM'}</a></li><li><a href="#">${currentPdpData.district || 'Quận'}</a></li><li aria-current="page">${currentPdpData.title ? (currentPdpData.title.length > 25 ? currentPdpData.title.substring(0,25)+'...' : currentPdpData.title) : 'Sản phẩm'}</li></ol></nav>
                                    <h1 class="pdp-product-title">${currentPdpData.title || 'N/A'}</h1>
                                    <p class="pdp-address"><svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg><span>${currentPdpData.address || 'N/A'}</span></p>
                                    <div class="pdp-price-specs-box">
                                        
                                        <div class="price-details-group spec-column">
                                            <div class="spec-item price-spec">
                                                <span class="spec-main-text price-main">${currentPdpData.price || '-'}</span>
                                                <span class="spec-sub-text price-sub">${(currentPdpData.unitPrice !== null && !isNaN(currentPdpData.unitPrice)) ? parseFloat(currentPdpData.unitPrice).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' tr/m²' : '-'}</span>
                                            </div>
                                        </div>
                                        <div class="other-specs-group spec-column">
                                            <div class="spec-item">
                                                <span class="spec-main-text">${displayValue(currentPdpData.bedrooms)}</span>
                                                <span class="spec-sub-text">Phòng ngủ</span>
                                            </div>
                                            <div class="spec-item">
                                                <span class="spec-main-text">${displayValue(currentPdpData.wc)}</span>
                                                <span class="spec-sub-text">Toilet</span>
                                            </div>
                                            <div class="spec-item">
                                                <span class="spec-main-text">${displayValue(currentPdpData.area)}</span>
                                                <span class="spec-sub-text">m²</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="pdp-description pdp-section"><h4>Mô tả chi tiết</h4><div>${currentPdpData.description || '<p>Chưa có mô tả.</p>'}</div></div>
                                    <div class="pdp-detailed-info-table pdp-section"><h4>Thông tin chi tiết</h4><table id="pdp-details-table-val">
                                            <tbody>
                                                ${detailsTableHTML}
                                            </tbody>
                                        </table>
                                    <button id="pdp-details-view-more-btn" class="pdp-details-view-more-btn" style="display:none;">Xem thêm</button>
                                    </div>
                                    <div class="pdp-post-date-display">
                                        Ngày đăng: <span id="pdp-post-date-value">${displayValue(currentPdpData.postDate)}</span>
                                    </div>
                                    <div class="pdp-project-info pdp-section">
                                    <h4>Thông tin dự án</h4>
                                        <div id="pdp-project-details-val" class="project-details-layout">
                                            <img src="${currentPdpData.projectThumbnail || 'assets/images/duan.jpg'}" alt="Ảnh dự án ${displayValue(currentPdpData.project)}" class="project-thumbnail">
                                            <div class="project-text-content">
                                                <h5 class="project-name">${displayValue(currentPdpData.project)}</h5>
                                                <p class="project-description">${displayValue(currentPdpData.address)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="pdp-map pdp-section">
                                        <h4>Vị trí trên bản đồ</h4>
                                        <div id="pdp-map-placeholder-injected" class="pdp-map-embed-container">
                                            ${mapEmbedHTML}
                                        </div>
                                    </div>
                                    <div class="pdp-loan-calculator pdp-section">
                                        <h4>Công cụ tính lãi vay</h4>
                                        <div id="pdp-loan-calculator-content">
                                            <div class="loan-calculator-inputs">
                                                <div class="form-group loan-input-group">
                                                    <label for="lc-property-value">Giá trị nhà đất (tỷ VNĐ):</label>
                                                    <div class="input-with-controls">
                                                        <button type="button" class="lc-control-btn" id="lc-property-value-minus" aria-label="Giảm giá trị nhà đất">-</button>
                                                        <input type="number" id="lc-property-value" name="propertyValue" value="${defaultPropertyValue}" min="0.1" step="0.1">
                                                        <button type="button" class="lc-control-btn" id="lc-property-value-plus" aria-label="Tăng giá trị nhà đất">+</button>
                                                    </div>
                                                </div>
                                                <div class="form-group loan-input-group">
                                                    <label for="lc-loan-amount">Số tiền vay (tỷ VNĐ):</label>
                                                    <div class="input-with-controls">
                                                        <button type="button" class="lc-control-btn" id="lc-loan-amount-minus" aria-label="Giảm số tiền vay">-</button>
                                                        <input type="number" id="lc-loan-amount" name="loanAmount" value="${defaultLoanAmount}" step="0.1" min="0">
                                                        <button type="button" class="lc-control-btn" id="lc-loan-amount-plus" aria-label="Tăng số tiền vay">+</button>
                                                    </div>
                                                    <input type="range" id="lc-loan-amount-slider" name="loanAmountSlider" min="0" max="100" value="70" class="loan-slider">
                                                    <div id="lc-loan-percentage-text" class="slider-percentage-text">70%</div>
                                                </div>
                                                <div class="form-group loan-input-group"><label for="lc-loan-term">Thời gian vay (tháng):</label><input type="number" id="lc-loan-term" value="240" step="12" min="12"></div>
                                                <div class="form-group loan-input-group"><label for="lc-interest-rate">Lãi suất (%/năm):</label><input type="number" id="lc-interest-rate" value="${defaultAnnualRate}" step="0.1" min="0"></div>

                                                <div class="form-group loan-input-group"><label for="lc-pref-months">Số tháng ưu đãi (tháng):</label><input type="number" id="lc-pref-months" value="0" step="1" min="0"></div>
                                                <div class="form-group loan-input-group"><label for="lc-pref-interest-rate">Lãi suất ưu đãi (%/năm):</label><input type="number" id="lc-pref-interest-rate" value="${defaultAnnualRate}" step="0.01" min="0"></div>
                                                
                                                <div class="form-group loan-input-group"><label for="lc-disbursement-date">Ngày giải ngân:</label><input type="date" id="lc-disbursement-date" name="disbursementDate" value="${today}"></div>
                                                <div class="form-group loan-input-group">
                                                    <label for="lc-calc-method">Phương pháp tính:</label>
                                                    <select id="lc-calc-method" name="calcMethod">
                                                        <option value="reducing_balance">Dư nợ giảm dần</option>
                                                        <option value="annuity">Trả đều (gốc + lãi)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="loan-calculator-action"> <button type="button" class="btn-primary loan-calculate-btn">Ước tính lãi vay</button> </div>
                                            <div class="loan-calculator-results">
                                                <div class="numeric-results">
                                                    <h4><svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary-color)" style="margin-right: 8px; vertical-align: text-bottom;"><path d="M12 2L1 9l4 1.5V20h4v-8h6v8h4V10.5L21 9l-1.87-1.4L12 2zm0 4.434L18.13 11H5.87L12 6.434zM9 13v5h6v-5H9z"/></svg>Kết quả ước tính</h4>
                                                    <p>Số tiền trả hàng tháng: <span id="lc-monthly-payment" class="lc-result-value">-</span></p>
                                                    <p>Tổng lãi phải trả: <strong id="lc-total-interest" class="lc-result-value">-</strong></p>
                                                    <button type="button" class="btn-link btn-view-loan-schedule" id="lc-view-schedule-btn">Xem chi tiết lịch trả nợ</button>
                                                </div>
                                                    <canvas id="loanPieChart" style="max-width: 250px; max-height: 250px; margin:auto;"></canvas>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="pdp-nearby-amenities pdp-section">
                                        <h4>Tiện ích lân cận</h4>
                    <div id="pdp-amenities-list-injected" class="pdp-amenities-grid">
                        <div class="amenity-card">
                            <span class="amenity-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z"/></svg>
                            </span>
                            <h6 class="amenity-title">Mua sắm</h6>
                            <div class="amenity-description">
                                <p>Vincom Center – 500m</p>
                                <p>Chợ Bến Thành – 1.2km</p>
                                <p>Siêu thị Co.op Mart – 800m</p>
                            </div>
                        </div>
                        <div class="amenity-card">
                            <span class="amenity-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15v-2h12v2H6z"/></svg>
                            </span>
                            <h6 class="amenity-title">Giáo dục</h6>
                            <div class="amenity-description">
                                <p>Trường THPT Năng Khiếu – 1km</p>
                                <p>Đại học Kinh Tế – 2km</p>
                            </div>
                        </div>
                        <div class="amenity-card">
                            <span class="amenity-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-3v3h-2v-3H9v-2h3V8h2v3h3v2z"/></svg>
                            </span>
                            <h6 class="amenity-title">Y tế</h6>
                            <div class="amenity-description">
                                <p>Bệnh viện Quận 1 – 700m</p>
                                <p>Phòng khám Đa khoa Quốc tế – 1.5km</p>
                            </div>
                        </div>
                        <div class="amenity-card">
                            <span class="amenity-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
                            </span>
                            <h6 class="amenity-title">Giao thông</h6>
                            <div class="amenity-description">
                                <p>Trạm xe buýt Nguyễn Huệ – 200m</p>
                                <p>Ga tàu điện ngầm (dự kiến) – 600m</p>
                            </div>
                        </div>
                        <div class="amenity-card">
                            <span class="amenity-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55c-2.21 0-4 1.79-4 4s1.79 4 4 4s4-1.79 4-4V7h4V3h-6z"/></svg>
                            </span>
                            <h6 class="amenity-title">Giải trí</h6>
                            <div class="amenity-description">
                                <p>Phố đi bộ Nguyễn Huệ – 300m</p>
                                <p>Rạp chiếu phim CGV – 1km</p>
                            </div>
                        </div>
                        <div class="amenity-card">
                            <span class="amenity-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2zm6 0c-1.1 0-2 .9-2 2s.9 2 2 2s2-.9 2-2s-.9-2-2-2z"/></svg>
                            </span>
                            <h6 class="amenity-title">Tiện ích khác</h6>
                            <div class="amenity-description">
                                <p>Công viên Tao Đàn – 1.5km</p>
                                <p>Ngân hàng ABC – 400m</p>
                            </div>
                        </div>
                    </div>
                                    </div>
                                    <div class="pdp-price-history pdp-section">
                                        <h4 id="pdp-price-history-chart-title">Biểu đồ biến động đơn giá</h4>
                                        <div id="pdp-price-history-time-tabs" class="price-history-time-tabs">
                                            <button class="time-range-tab active" data-months="12">1 Năm</button>
                                            <button class="time-range-tab" data-months="36">3 Năm</button>
                                        </div>
                                        <div id="pdp-price-history-summary-cards" class="price-history-summary-cards">
                                            {/* Nội dung sẽ được JS chèn vào */}
                                        </div>
                                        <div class="pdp-chart-container">
                                            <canvas id="pdp-price-history-chart-canvas"></canvas>
                                        </div>
                                        <p class="price-history-data-note">
                                            Lưu ý: Phân tích này dựa trên dữ liệu của website chungcutot.net. 
                                            Các yếu tố khác như vị trí cụ thể, tầng, hướng, tình trạng nội thất chi tiết, 
                                            pháp lý riêng của từng căn có thể ảnh hưởng đến giá trị thực tế và sự hấp dẫn của sản phẩm.
                                        </p>
                                    </div>
                                    
                                </div>
                                
                                <div class="pdp-right-column">
                                    <div class="pdp-contact-box-sticky">
                                        <p class="pdp-contact-box-title">Liên hệ tư vấn</p>
                                        <div class="pdp-agent-info">
                                            <img src="${currentPdpData.agentAvatar || 'assets/images/nhamoigioi.jpg'}" alt="Chuyên viên" class="pdp-agent-avatar">
                                            <div class="pdp-agent-details"><strong>${currentPdpData.agentName || 'Chuyên viên'}</strong><span>Chuyên viên tư vấn</span></div>
                                        </div>
                                        <button class="btn-primary pdp-contact-main-btn" id="pdp-show-contact-form-btn-val">Liên hệ tư vấn</button>
                                        <button class="pdp-contact-zalo-btn" id="pdp-zalo-chat-btn-val"><svg viewBox="0 0 448 512" width="18" height="18" style="margin-right:8px;"><path fill="currentColor" d="M292.6 256..."></path></svg><span>Chat Zalo</span></button>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section class="pdp-mobile-contact-form-area">
                             <h4>Liên hệ tư vấn</h4>
                             <div class="pdp-agent-info-mobile">
                                 <img src="${currentPdpData.agentAvatar || 'assets/images/nhamoigioi.jpg'}" alt="Chuyên viên" class="pdp-agent-avatar">
                                 <div class="pdp-agent-details"><strong>${currentPdpData.agentName || 'Chuyên viên'}</strong><span>Chuyên viên tư vấn</span></div>
                             </div>
                             <form><input type="text" placeholder="Họ và tên*" required> <input type="tel" placeholder="Số điện thoại*" required><input type="email" placeholder="Email"> <textarea placeholder="Nội dung..." rows="4"></textarea><button type="submit" class="btn-primary">Gửi yêu cầu</button></form>
                        </section>
                    </div>
                    <div class="pdp-mobile-bottom-bar">
                        <button id="pdp-call-btn-mobile"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6.62 10.79c..."></path></svg><span>Gọi</span></button>
                        <button id="pdp-sms-btn-mobile"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M20 2H4c-1.1..."></path></svg><span>SMS</span></button>
                        <button id="pdp-zalo-chat-btn-mobile" class="pdp-contact-zalo-btn"><svg viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M292.6 256c19.8-21.2..."></path></svg><span>Chat Zalo</span></button>
                    </div>
                `;
                
                productDetailModal.setBodyContent(bodyAndActionbarHTML);
                console.log("PDP - Project Name from currentPdpData:", currentPdpData.project);
                // Query lại các element quan trọng SAU KHI modal có nội dung
                pdpSlottedHeaderDiv = productDetailModal.querySelector('#pdpSlottedHeader');
                if (productDetailModal.shadowRoot) {
                     pdpInternalModalHeader = productDetailModal.shadowRoot.querySelector('.popup-header');
                     modalBodyActualScroller = productDetailModal.shadowRoot.querySelector('.popup-body');
                } else { pdpInternalModalHeader = null; modalBodyActualScroller = null; }
                
                if (modalBodyActualScroller) {
                    const defaultSlotInBody = modalBodyActualScroller.querySelector('slot:not([name])');
                    if (defaultSlotInBody) {
                        const assignedNodes = defaultSlotInBody.assignedElements({flatten:true});
                        pdpScrollableContentContainer = assignedNodes.find(node => node.classList && node.classList.contains('pdp-scrollable-content'));
                    } else { pdpScrollableContentContainer = null; }
                } else { pdpScrollableContentContainer = null; }

                if (pdpScrollableContentContainer && modalBodyActualScroller && pdpSlottedHeaderDiv && pdpInternalModalHeader) {
                    initializePdpDynamicElements(pdpScrollableContentContainer, currentPdpData);
                    setupPdpHeroSlider(currentPdpData.images || []); // Khởi tạo Hero Slider mới
                    // Reset scroll được xử lý trong ModalPopup.js#show()
                    // modalBodyActualScroller.scrollTop = 0; 
                    
                    
                    modalBodyActualScroller.removeEventListener('scroll', handlePdpScroll); 
                    modalBodyActualScroller.addEventListener('scroll', handlePdpScroll);
                    // GỌI HÀM VẼ BIỂU ĐỒ LỊCH SỬ GIÁ
                    if (currentPdpData && yearlyListingData) { // Đảm bảo có dữ liệu
                        renderPdpPriceHistoryChart(currentPdpData, yearlyListingData);
                    } else {
                        const chartCanvasEl = document.getElementById('pdp-price-history-chart-canvas');
                        if(chartCanvasEl && chartCanvasEl.parentElement) chartCanvasEl.parentElement.innerHTML = '<p class="no-data-message">Lỗi tải dữ liệu lịch sử giá.</p>';
                        console.warn("PDP: Thiếu currentPdpData hoặc yearlyListingData cho biểu đồ lịch sử giá.");
                    }
                    // GẮN LISTENER CHO TABS THỜI GIAN CỦA BIỂU ĐỒ LỊCH SỬ GIÁ
                    const timeRangeTabs = document.querySelectorAll('#pdp-price-history-time-tabs .time-range-tab');
                    timeRangeTabs.forEach(tab => {
                        // Gỡ listener cũ nếu có (quan trọng nếu PDP được mở lại)
                        const listenerKey = '__pdpTimeTabHandler';
                        if (tab[listenerKey]) tab.removeEventListener('click', tab[listenerKey]);

                        const tabClickListener = () => {
                            timeRangeTabs.forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                            const months = parseInt(tab.dataset.months);
                            if (currentPdpData && yearlyListingData) {
                                renderPdpPriceHistoryChart(currentPdpData, yearlyListingData, months);
                            }
                        };
                        tab.addEventListener('click', tabClickListener);
                        tab[listenerKey] = tabClickListener; // Lưu lại để gỡ
                    });


                    // Gọi handlePdpScroll sau một chút để đảm bảo DOM render xong và có offsetHeight
                    setTimeout(() => {
                        if (!pdpInternalModalHeader && productDetailModal.shadowRoot) pdpInternalModalHeader = productDetailModal.shadowRoot.querySelector('.popup-header');
                        if (!pdpSlottedHeaderDiv) pdpSlottedHeaderDiv = productDetailModal.querySelector('#pdpSlottedHeader');
                        if(pdpScrollableContentContainer) pdpScrollableContentContainer.style.paddingTop = '0px';
                        const hero = pdpScrollableContentContainer ? pdpScrollableContentContainer.querySelector('.pdp-hero-section') : null;
                        if(hero) hero.style.marginTop = '0px';
                        handlePdpScroll(); 
                    }, 50); 
                } else {
                    console.error("Lỗi PDP Init: Thiếu element cho scroll/interactions:", 
                        {pdpScrollableContentContainer, modalBodyActualScroller, pdpSlottedHeaderDiv, pdpInternalModalHeader}
                    );
                }
                
                if (popupFavoriteBtn && pdpFavoriteBtnText) { /* ... logic cập nhật nút favorite ... */ }
                if (pdpScrollableContentContainer && modalBodyActualScroller) {
                initializePdpDynamicElements(pdpScrollableContentContainer, currentPdpData); // Gắn listener cho PDP
                setupPdpHeroSlider(currentPdpData.images || []); // Khởi tạo Hero Slider mới cho PDP
                
                modalBodyActualScroller.removeEventListener('scroll', handlePdpScroll); 
                modalBodyActualScroller.addEventListener('scroll', handlePdpScroll);
                setTimeout(() => { handlePdpScroll(); }, 50);
                 
            }
                
                productDetailModal.show();
            }
        });

        productDetailModal.addEventListener('popup-closed', () => {
            stopPdpHeroAutoplay();
            if (pdpScrollableContentContainer) {
                pdpScrollableContentContainer.style.paddingTop = '';
                const heroSection = pdpScrollableContentContainer.querySelector('.pdp-hero-section');
                if (heroSection) {
                    heroSection.style.marginTop = '';
                }
            }
            if (modalBodyActualScroller) {
                modalBodyActualScroller.removeEventListener('scroll', handlePdpScroll);
            }
            pdpScrollableContentContainer = null; 
            pdpSlottedHeaderDiv = null;    
            pdpInternalModalHeader = null; 
            modalBodyActualScroller = null;
            currentPdpData = null;
        });
    } 

    // XỬ LÝ SUBMIT CHO MODAL FORM LIÊN HỆ MỚI
    if (actualContactFormInModal) {
        actualContactFormInModal.addEventListener('submit', function(event) { /* ... giữ nguyên ... */ });
    }
    
 

}); // Kết thúc DOMContentLoaded

console.log("main.js: Đã khai báo xong tất cả các import.");