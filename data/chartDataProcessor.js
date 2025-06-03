// data/chartDataProcessor.js
import yearlyListingData from './yearlyListingData.js';
import { areaRanges } from './listingsByAreaRange.js'; // Import areaRanges để tái sử dụng

/**
 * Tính toán thống kê đơn giá (min, avg, max) theo tháng cho một năm và một khoảng diện tích cụ thể (hoặc tất cả).
 * @param {string} year - Năm cần lấy dữ liệu (ví dụ: "2025").
 * @param {string | null} [areaRangeKey=null] - Key của khoảng diện tích (ví dụ: "lte45"). Nếu là null hoặc "all", sẽ tính cho tất cả diện tích.
 * @returns {Array<{month: number, minUnitPrice: number|null, avgUnitPrice: number|null, maxUnitPrice: number|null}>} 
 * Mảng dữ liệu cho biểu đồ, mỗi phần tử là một tháng.
 */
export function getUnitPriceChartDataForYear(year, areaRangeKey = null) {
    const listingsForYear = yearlyListingData[year];

    // Tạo mảng 12 tháng với giá trị null ban đầu
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        minUnitPrice: null,
        avgUnitPrice: null,
        maxUnitPrice: null,
        count: 0 // Để tính trung bình chính xác
    }));

    if (!listingsForYear || listingsForYear.length === 0) {
        return monthlyStats; // Trả về mảng rỗng nếu không có dữ liệu cho năm
    }

    let filteredListings = listingsForYear;

    // 1. Lọc theo khoảng diện tích nếu có areaRangeKey hợp lệ và không phải "all"
    if (areaRangeKey && areaRangeKey !== "all" && areaRanges[areaRangeKey]) {
        const areaTestFn = areaRanges[areaRangeKey].test;
        filteredListings = listingsForYear.filter(item => {
            const area = parseFloat(String(item.area).replace(',', '.'));
            return !isNaN(area) && areaTestFn(area);
        });
    }
    // Nếu areaRangeKey là "all" hoặc không hợp lệ, filteredListings giữ nguyên là listingsForYear

    // 2. Gom nhóm các đơn giá theo tháng
    const unitPricesByMonth = {}; // Ví dụ: { 1: [56.6, 62.22], 2: [66.7], ... }
    for (let i = 1; i <= 12; i++) {
        unitPricesByMonth[i] = [];
    }

    filteredListings.forEach(item => {
        const month = parseInt(item.month);
        const unitPrice = parseFloat(String(item.unitPrice).replace(',', '.')); // Chuyển đổi dấu phẩy
        
        if (!isNaN(month) && month >= 1 && month <= 12 && !isNaN(unitPrice)) {
            unitPricesByMonth[month].push(unitPrice);
        }
    });

    // 3. Tính toán min, avg, max cho mỗi tháng và cập nhật vào monthlyStats
    for (let i = 1; i <= 12; i++) {
        const pricesInMonth = unitPricesByMonth[i];
        if (pricesInMonth.length > 0) {
            monthlyStats[i-1].minUnitPrice = Math.min(...pricesInMonth);
            monthlyStats[i-1].maxUnitPrice = Math.max(...pricesInMonth);
            monthlyStats[i-1].avgUnitPrice = pricesInMonth.reduce((sum, val) => sum + val, 0) / pricesInMonth.length;
            monthlyStats[i-1].count = pricesInMonth.length;
        }
    }
    
    // Làm tròn avgUnitPrice về 2 chữ số thập phân nếu không phải null
    monthlyStats.forEach(monthData => {
        if (monthData.avgUnitPrice !== null) {
            monthData.avgUnitPrice = parseFloat(monthData.avgUnitPrice.toFixed(2));
        }
    });

    return monthlyStats;
}