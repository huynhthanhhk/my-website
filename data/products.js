// data/products.js
// console.log("data/products.js: Loading updated product data with door and balcony directions.");

/**
 * Chuyển đổi chuỗi giá (ví dụ "3 tỷ", "2.8 tỷ") thành giá trị số.
 * @param {string | number} priceInput Chuỗi giá hoặc số.
 * @returns {number | null} Giá trị số hoặc null nếu không hợp lệ.
 */
function parsePriceValue(priceInput) {
    if (typeof priceInput === 'number') {
        return isNaN(priceInput) ? null : priceInput;
    }
    if (typeof priceInput !== 'string' || priceInput.trim() === '') {
        return null;
    }
    const numericString = priceInput.toLowerCase()
                                  .replace(/tỷ/g, '')
                                  .replace(/ty/g, '')
                                  .replace(/vnd/g, '') 
                                  .replace(',', '.')   
                                  .trim();
    const value = parseFloat(numericString);
    return isNaN(value) ? null : value;
}

/**
 * Chuyển đổi chuỗi danh sách ảnh thành mảng đường dẫn ảnh.
 * @param {string} imageString Chuỗi các tên file ảnh, cách nhau bởi dấu phẩy.
 * @returns {string[]} Mảng các đường dẫn ảnh.
 */
function parseImageString(imageString) {
    if (typeof imageString !== 'string' || imageString.trim() === '') {
        return ["assets/images/placeholder-4-3.png"]; 
    }
    return imageString.split(',')
                      .map(imgName => `assets/images/${imgName.trim()}`) 
                      .filter(imgPath => imgPath !== 'assets/images/'); 
}

// Dữ liệu thô từ bảng bạn cung cấp, bao gồm cả các cột mới nhất
const rawNewProductsData = [
    { uid: "Spb-2025-0051", title: "Căn hộ Quận 1 – Sống giữa trung tâm sôi động bậc nhất Sài Gòn", description: "Căn hộ hiện đại, đầy đủ tiện nghi, sẵn sàng dọn vào ở ngay. Thiết kế tối ưu không gian, phù hợp cho gia đình trẻ hoặc người độc thân cần nơi an cư lý tưởng.", price: "2,5", priceUnitInput: "Tỷ VNĐ", bedrooms: 1, area: 53, wc: 1, furniture: "Cơ bản", legal: "HĐC", postDate: "06/01/2025", imagesString: "product1.jpg, product2.jpg, product4.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "1", ward: "Bến Nghé", street: "Nguyễn Huệ", project: "The Grand Manhattan", propertyType: "Bán", agentName: "Nguyễn Văn A", agentAvatarFilename: "nhamoigioi1.jpeg", viewDirection: "View nội khu", floorLevel: "Trung", otherInfo: "Cần bán gấp, giá tốt", doorDirection: "Đông", balconyDirection: "Đông Bắc" },
    { uid: "Spb-2025-0037", title: "Quận 2 – Khu đô thị mới với tiềm năng phát triển vượt bậc", description: "Sở hữu vị trí đắc địa, căn hộ mang đến cuộc sống tiện nghi với đầy đủ tiện ích nội khu: hồ bơi, phòng gym, khu vui chơi trẻ em... Giao thông thuận tiện, kết nối nhanh đến trung tâm.", price: "4,2", priceUnitInput: "Tỷ VNĐ", bedrooms: 2, area: 75, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "14/02/2025", imagesString: "product3.jpg, product5.jpg, product6.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "2 (Thủ Thiêm)", ward: "An Khánh", street: "Trần Não", project: "The Metropole Thủ Thiêm", propertyType: "Bán", agentName: "Trần Thị Bích", agentAvatarFilename: "nhamoigioi.jpg", viewDirection: "View hồ, Đông Bắc", floorLevel: "Cao", otherInfo: "View đẹp, thoáng", doorDirection: "Nam", balconyDirection: "Nam" },
    { uid: "Spb-2025-0042", title: "Quận 3 – Vị trí vàng, tiện ích đầy đủ, môi trường sống văn minh", description: "Căn hộ mới, nội thất cao cấp, không gian sống yên tĩnh và an ninh 24/7. Lý tưởng cho gia đình đang tìm kiếm sự ổn định và tiện lợi", price: "5", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 84, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "21/03/2025", imagesString: "product1.jpg, product2.jpg, product3.jpg, product4.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "3", ward: "Võ Thị Sáu", street: "Nam Kỳ Khởi Nghĩa", project: "Serenity Sky Villas", propertyType: "Bán", agentName: "Lê Hoàng", agentAvatarFilename: "nhamoigioi2.jpg", viewDirection: "View sông, Nam", floorLevel: "Cao", otherInfo: "Căn góc, nhà đẹp", doorDirection: "Tây", balconyDirection: "Đông Bắc" },
    { uid: "Spb-2025-0065", title: "Quận 4 – Căn hộ ven sông, gần trung tâm, giá vẫn còn “mềm”", description: "Diện tích hợp lý, bố trí thông minh, căn hộ phù hợp để ở hoặc cho thuê. Khu vực dân cư văn minh, môi trường sống sạch sẽ và an toàn.", price: "4,1", priceUnitInput: "Tỷ VNĐ", bedrooms: 2, area: 80, wc: 2, furniture: "Nhà trống", legal: "HĐC", postDate: "03/09/2025", imagesString: "product6.jpg, product7.jpg", status: "Đã bán", city: "Hồ Chí Minh", district: "4", ward: "12", street: "Bến Vân Đồn", project: "Galaxy 9", propertyType: "Bán", agentName: "Phạm Quỳnh Mai", agentAvatarFilename: "nhamoigioi3.jpg", viewDirection: "View nội khu, Đông", floorLevel: "Thấp", otherInfo: "Giá tốt, cần bán nhanh", doorDirection: "Bắc", balconyDirection: "Đông Bắc" },
    { uid: "Spb-2025-0075", title: "Quận 5 – Nơi giao thoa giữa truyền thống và hiện đại", description: "Căn hộ tầng cao, view đẹp, đón gió và ánh sáng tự nhiên. Thiết kế sang trọng, trang bị sẵn các thiết bị cần thiết, chỉ cần xách vali vào ở.", price: "2,6", priceUnitInput: "Tỷ VNĐ", bedrooms: 1, area: 53, wc: 1, furniture: "Đầy đủ - cao cấp", legal: "HĐMB", postDate: "26/10/2025", imagesString: "product8.jpg, product9.jpg, product10.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "5", ward: "11", street: "Nguyễn Trãi", project: "The EverRich Infinity", propertyType: "Bán", agentName: "Trần Quốc Cường", agentAvatarFilename: "nhamoigioi4.jpg", viewDirection: "View vườn, Tây Bắc", floorLevel: "Trung", otherInfo: "Full nội thất, vào ở ngay", doorDirection: "Nam", balconyDirection: "Nam" },
    { uid: "Spb-2025-0047", title: "Quận 7 – Chuẩn sống quốc tế giữa lòng Phú Mỹ Hưng", description: "Căn hộ thuộc dự án được đánh giá cao về chất lượng xây dựng và dịch vụ quản lý. Tiện ích nội khu đa dạng đáp ứng nhu cầu sống hiện đại.", price: "6", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 107, wc: 2, furniture: "Nhà trống", legal: "HĐMB", postDate: "15/06/2025", imagesString: "product1.jpg, product2.jpg, product3.jpg, product4.jpg, product5.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "7", ward: "Tân Phong", street: "Nguyễn Lương Bằng", project: "Sunrise City", propertyType: "Bán", agentName: "Nguyễn Văn A", agentAvatarFilename: "nhamoigioi1.jpeg", viewDirection: "View sông, Đông Nam", floorLevel: "Cao", otherInfo: "View đẹp, 3 mặt thoáng", doorDirection: "Đông Nam", balconyDirection: "" },
    { uid: "Spb-2025-0035", title: "Quận 8 – Khu vực đang “lên hương” với nhiều dự án mới", description: "Giá bán hợp lý cho một căn hộ tại khu vực tiềm năng phát triển mạnh. Pháp lý rõ ràng, sổ hồng riêng, hỗ trợ vay ngân hàng.", price: "3,8", priceUnitInput: "Tỷ VNĐ", bedrooms: 2, area: 60, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "12/04/2025", imagesString: "product1.jpg, product5.jpg, product9.jpg", status: "Đã bán", city: "Hồ Chí Minh", district: "8", ward: "5", street: "Tạ Quang Bửu", project: "Tara Residence", propertyType: "Bán", agentName: "Trần Thị Bích", agentAvatarFilename: "nhamoigioi.jpg", viewDirection: "View nội khu, Tây Nam", floorLevel: "Trung", otherInfo: "Nhà sạch đẹp, giá tốt", doorDirection: "Tây - Nam", balconyDirection: "Nam" },
    { uid: "Spb-2025-0056", title: "Quận 9 – Thành phố công nghệ trong tương lai gần", description: "Không gian sống xanh, gần công viên, trường học, siêu thị. Thích hợp cho những ai yêu thích sự yên tĩnh nhưng vẫn muốn tiện nghi.", price: "3,55", priceUnitInput: "Tỷ VNĐ", bedrooms: 2, area: 57, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "09/08/2025", imagesString: "product2.jpg, product4.jpg, product6.jpg", status: "Đã bán", city: "Hồ Chí Minh", district: "9 (TP Thủ Đức)", ward: "Phước Long B", street: "Đỗ Xuân Hợp", project: "Vinhomes Grand Park", propertyType: "Bán", agentName: "Lê Hoàng", agentAvatarFilename: "nhamoigioi2.jpg", viewDirection: "View thành phố, Đông", floorLevel: "Trung", otherInfo: "Cần bán gấp, nhà đẹp", doorDirection: "Tây Bắc", balconyDirection: "" },
    { uid: "Spb-2025-0093", title: "Quận 10 – Căn hộ giữa lòng thành phố, tiện ích không thiếu thứ gì", description: "Căn hộ được thiết kế theo phong cách tối giản, tận dụng tối đa diện tích sử dụng. Ban công thoáng mát, thuận tiện cho việc trồng cây hoặc thư giãn.", price: "4,75", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 94, wc: 2, furniture: "Nhà trống", legal: "HĐMB", postDate: "30/12/2025", imagesString: "product3.jpg, product5.jpg, product6.jpg, product7.jpg, product8.jpg", status: "Đã bán", city: "Hồ Chí Minh", district: "10", ward: "15", street: "Thành Thái", project: "Hà Đô Centrosa Garden", propertyType: "Bán", agentName: "Phạm Quỳnh Mai", agentAvatarFilename: "nhamoigioi3.jpg", viewDirection: "View công viên, Nam", floorLevel: "Cao", otherInfo: "Căn góc, thoáng 2 mặt", doorDirection: "Nam", balconyDirection: "Đông" },
    { uid: "Spb-2025-0021", title: "Bình Thạnh – Giao điểm giữa trung tâm và khu Đông, cực kỳ thuận tiện", description: "Cơ hội đầu tư sinh lời cao với căn hộ nằm trong khu vực có tốc độ đô thị hóa nhanh. Giao dịch nhanh gọn, hỗ trợ pháp lý đầy đủ", price: "4,1", priceUnitInput: "Tỷ VNĐ", bedrooms: 2, area: 84, wc: 2, furniture: "Nhà trống", legal: "HĐC", postDate: "18/03/2025", imagesString: "product1.jpg, product2.jpg, product3.jpg", status: "Đã bán", city: "Hồ Chí Minh", district: "Bình Thạnh", ward: "22", street: "Điện Biên Phủ", project: "Vinhomes Central Park", propertyType: "Bán", agentName: "Trần Quốc Cường", agentAvatarFilename: "nhamoigioi4.jpg", viewDirection: "View hồ bơi, Bắc", floorLevel: "Thấp", otherInfo: "Nhà mới, sạch sẽ, giá mềm", doorDirection: "Đông Bắc", balconyDirection: "Tây - Nam" },
    { uid: "Spb-2024-0012", title: "Quận 4 – Căn hộ ven sông, gần trung tâm, giá vẫn còn “mềm”", description: "Căn hộ mới, nội thất cao cấp, không gian sống yên tĩnh và an ninh 24/7. Lý tưởng cho gia đình đang tìm kiếm sự ổn định và tiện lợi", price: "3,7", priceUnitInput: "Tỷ VNĐ", bedrooms: 2, area: 75, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "18/01/2024", imagesString: "product1.jpg, product5.jpg, product9.jpg, product6.jpg, product7.jpg, product10.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "4", ward: "22", street: "Điện Biên Phủ", project: "The EverRich Infinity", propertyType: "Bán", agentName: "Trần Quốc Cường", agentAvatarFilename: "nhamoigioi4.jpg", viewDirection: "View vườn, Tây Bắc", floorLevel: "Trung", otherInfo: "Nhà sạch đẹp, giá tốt", doorDirection: "Tây - Nam", balconyDirection: "Nam" },
    { uid: "Spb-2024-0017", title: "Quận 5 – Nơi giao thoa giữa truyền thống và hiện đại", description: "Căn hộ được thiết kế theo phong cách tối giản, tận dụng tối đa diện tích sử dụng. Ban công thoáng mát, thuận tiện cho việc trồng cây hoặc thư giãn.", price: "4,02", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 80, wc: 2, furniture: "Đầy đủ - cao cấp", legal: "Sổ hồng", postDate: "12/03/2024", imagesString: "product1.jpg, product5.jpg, product9.jpg, product6.jpg, product7.jpg, product10.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "5", ward: "22", street: "Điện Biên Phủ", project: "Sunrise City", propertyType: "Bán", agentName: "Nguyễn Văn A", agentAvatarFilename: "nhamoigioi1.jpeg", viewDirection: "View sông, Đông Nam", floorLevel: "Trung", otherInfo: "Cần bán gấp, nhà đẹp", doorDirection: "Tây Bắc", balconyDirection: "" },
    { uid: "Spb-2023-0016", title: "Quận 7 – Chuẩn sống quốc tế giữa lòng Phú Mỹ Hưng", description: "Căn hộ được thiết kế theo phong cách tối giản, tận dụng tối đa diện tích sử dụng. Ban công thoáng mát, thuận tiện cho việc trồng cây hoặc thư giãn.", price: "3,28", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 80, wc: 2, furniture: "Cơ bản", legal: "HĐMB", postDate: "21/02/2023", imagesString: "product1.jpg, product5.jpg, product9.jpg, product6.jpg, product7.jpg, product10.jpg", status: "Đã bán", city: "Hồ Chí Minh", district: "7", ward: "22", street: "Điện Biên Phủ", project: "Tara Residence", propertyType: "Bán", agentName: "Trần Thị Bích", agentAvatarFilename: "nhamoigioi.jpg", viewDirection: "View nội khu, Tây Nam", floorLevel: "Cao", otherInfo: "Căn góc, thoáng 2 mặt", doorDirection: "Nam", balconyDirection: "Đông" },
    { uid: "Spb-2023-0068", title: "Quận 3 – Vị trí vàng, tiện ích đầy đủ, môi trường sống văn minh", description: "Căn hộ được thiết kế theo phong cách tối giản, tận dụng tối đa diện tích sử dụng. Ban công thoáng mát, thuận tiện cho việc trồng cây hoặc thư giãn.", price: "4,39", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 84, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "11/09/2023", imagesString: "product1.jpg, product5.jpg, product9.jpg, product6.jpg, product7.jpg, product10.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "3", ward: "22", street: "Điện Biên Phủ", project: "Vinhomes Grand Park", propertyType: "Bán", agentName: "Lê Hoàng", agentAvatarFilename: "nhamoigioi2.jpg", viewDirection: "View thành phố, Đông", floorLevel: "Cao", otherInfo: "Căn góc, nhà đẹp", doorDirection: "Tây", balconyDirection: "Đông Bắc" },
    { uid: "Spb-2022-0001", title: "Quận 7 – Chuẩn sống quốc tế giữa lòng Phú Mỹ Hưng", description: "Căn hộ thuộc dự án được đánh giá cao về chất lượng xây dựng và dịch vụ quản lý. Tiện ích nội khu đa dạng đáp ứng nhu cầu sống hiện đại.", price: "6", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 107, wc: 2, furniture: "Nhà trống", legal: "HĐMB", postDate: "15/06/2022", imagesString: "product1.jpg, product2.jpg, product3.jpg, product4.jpg, product5.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "7", ward: "Tân Phong", street: "Nguyễn Lương Bằng", project: "Sunrise City", propertyType: "Bán", agentName: "Nguyễn Văn A", agentAvatarFilename: "nhamoigioi1.jpeg", viewDirection: "View sông, Đông Nam", floorLevel: "Cao", otherInfo: "Căn góc, thoáng 2 mặt", doorDirection: "Nam", balconyDirection: "Đông" },
    { uid: "Spb-2022-0001", title: "Quận 3 – Vị trí vàng, tiện ích đầy đủ, môi trường sống văn minh", description: "Căn hộ mới, nội thất cao cấp, không gian sống yên tĩnh và an ninh 24/7. Lý tưởng cho gia đình đang tìm kiếm sự ổn định và tiện lợi", price: "5", priceUnitInput: "Tỷ VNĐ", bedrooms: 3, area: 84, wc: 2, furniture: "Cơ bản", legal: "HĐC", postDate: "21/03/2022", imagesString: "product1.jpg, product2.jpg, product3.jpg, product4.jpg", status: "Còn hàng", city: "Hồ Chí Minh", district: "3", ward: "Võ Thị Sáu", street: "Nam Kỳ Khởi Nghĩa", project: "Serenity Sky Villas", propertyType: "Bán", agentName: "Lê Hoàng", agentAvatarFilename: "nhamoigioi2.jpg", viewDirection: "View sông, Nam", floorLevel: "Cao", otherInfo: "Căn góc, nhà đẹp", doorDirection: "Tây", balconyDirection: "Đông Bắc" }
];

const productsData = rawNewProductsData.map(product => {
    const priceVal = parsePriceValue(product.price);
    const unitText = (typeof product.priceUnitInput === 'string' && product.priceUnitInput.toLowerCase().includes('tỷ')) ? 
                     "tỷ VND" : 
                     (priceVal !== null ? "VND" : null);

    const addressParts = [product.street, product.ward, product.district, product.city].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const isFav = typeof product.isFavorite === 'boolean' ? product.isFavorite : false;

    let agentAvatarPath = "assets/images/nhamoigioi.jpg"; 
    if (product.agentAvatarFilename && typeof product.agentAvatarFilename === 'string' && product.agentAvatarFilename.trim() !== '') {
        agentAvatarPath = `assets/images/${product.agentAvatarFilename.trim()}`;
    }

    return {
        id: product.uid,
        title: product.title,
        address: fullAddress,
        priceValue: priceVal,
        priceUnit: unitText,
        bedrooms: parseInt(product.bedrooms) || 0,
        area: parseFloat(product.area) || 0,
        wc: parseInt(product.wc) || 0,
        furniture: product.furniture,
        legal: product.legal,
        postDate: product.postDate,
        images: parseImageString(product.imagesString),
        status: product.status === "Còn hàng" ? "available" : (product.status === "Đã bán" ? "sold" : "unknown"), // Xử lý "Đã bán"
        isFavorite: isFav,
        description: product.description,
        city: product.city,
        district: product.district,
        ward: product.ward,
        street: product.street,
        project: product.project,
        propertyType: product.propertyType,
        agentName: product.agentName,
        agentAvatar: agentAvatarPath,
        // Thêm các trường mới
        viewDirection: product.viewDirection || "N/A", // Nếu không có thì là N/A
        floorLevel: product.floorLevel || "N/A",
        otherInfo: product.otherInfo || "N/A",
        // THÊM HAI TRƯỜNG MỚI NHẤT
        doorDirection: product.doorDirection || "N/A",
        balconyDirection: product.balconyDirection || "N/A"
    };
});

export default productsData;