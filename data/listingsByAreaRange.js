// data/listingsByAreaRange.js
import yearlyListingData from './yearlyListingData.js'; // Đảm bảo file này chứa dữ liệu chi tiết của các năm

console.log("listingsByAreaRange.js: Bắt đầu xử lý dữ liệu theo nhóm diện tích.");

// Định nghĩa các khoảng diện tích và hàm kiểm tra tương ứng
// Export hằng số này để các module khác (ví dụ: PriceStatistics.js) có thể sử dụng
export const areaRanges = {
    lte45: { 
        label: '<=45 m²', 
        test: (area) => area <= 45 
    },
    gt45_lte60: { 
        label: '45 - 60 m²', 
        test: (area) => area > 45 && area <= 60 
    },
    gt60_lte80: { 
        label: '60 - 80 m²', 
        test: (area) => area > 60 && area <= 80 
    },
    gt80_lte120: { 
        label: '80 - 120 m²', 
        test: (area) => area > 80 && area <= 120 
    },
    gt120: { 
        label: '>120 m²', 
        test: (area) => area > 120 
    }
};

const processedDataByAreaRange = {};

// Lặp qua từng năm có trong yearlyListingData (ví dụ: "2025", "2024", "2023")
for (const year in yearlyListingData) {
    if (yearlyListingData.hasOwnProperty(year)) {
        processedDataByAreaRange[year] = {}; // Khởi tạo một object cho mỗi năm

        // Khởi tạo các mảng chứa cho từng nhóm diện tích trong năm hiện tại
        for (const rangeKey in areaRanges) {
            if (areaRanges.hasOwnProperty(rangeKey)) {
                processedDataByAreaRange[year][rangeKey] = {
                    label: areaRanges[rangeKey].label, // Lưu lại nhãn của nhóm diện tích
                    previewItems: [],
                    allItems: []
                };
            }
        }

        const yearData = yearlyListingData[year]; // Lấy mảng dữ liệu của năm hiện tại

        if (Array.isArray(yearData)) {
            yearData.forEach(item => {
                // Đảm bảo 'area' là một số để so sánh chính xác
                // Dữ liệu trong yearlyListingData.js đã được chuẩn hóa là số
                const itemArea = parseFloat(item.area); 

                if (isNaN(itemArea)) {
                    // console.warn(`Mục có UID ${item.uid} trong năm ${year} có giá trị diện tích không hợp lệ: ${item.area}`);
                    return; // Bỏ qua item này nếu diện tích không hợp lệ
                }

                // Phân loại item vào đúng nhóm diện tích
                for (const rangeKey in areaRanges) {
                    if (areaRanges[rangeKey].test(itemArea)) {
                        processedDataByAreaRange[year][rangeKey].allItems.push(item);
                        break; // Mỗi item chỉ thuộc về một nhóm diện tích duy nhất
                    }
                }
            });
        }

        // Sau khi đã gom tất cả item vào allItems của từng nhóm,
        // cắt ra 5 item đầu tiên cho previewItems
        for (const rangeKey in processedDataByAreaRange[year]) {
            if (processedDataByAreaRange[year].hasOwnProperty(rangeKey)) {
                const currentGroup = processedDataByAreaRange[year][rangeKey];
                currentGroup.previewItems = currentGroup.allItems.slice(0, 5);
            }
        }
    }
}

// Log này để bạn kiểm tra cấu trúc dữ liệu đã xử lý trong console của trình duyệt
// Bạn có thể xóa hoặc comment lại sau khi đã kiểm tra xong
// console.log("listingsByAreaRange.js: Dữ liệu đã xử lý xong:", JSON.stringify(processedDataByAreaRange, null, 2));

// Export dữ liệu đã được xử lý và nhóm theo khoảng diện tích
export default processedDataByAreaRange;