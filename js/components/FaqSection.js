// js/components/FaqSection.js
const faqSectionTemplate = document.createElement('template');
faqSectionTemplate.innerHTML = `
    <style> :host { display: block; } h3 { margin-bottom: 20px; font-size: 1.4em; } </style>
    <div class="faq-list-container">
        <h3>Câu Hỏi Thường Gặp (FAQ)</h3>
        <slot></slot> </div>
`;
const mockFaqs = [
    { id: "faq1", question: "Làm thế nào để đăng tin bất động sản?", answer: "<p>Bạn cần tạo tài khoản, sau đó vào mục 'Đăng tin' và điền đầy đủ thông tin theo hướng dẫn. Tin đăng sẽ được duyệt trước khi hiển thị.</p>", lastUpdated: "20/05/2025", open: true }, // Mở sẵn FAQ đầu tiên
    { id: "faq2", question: "Chi phí đăng tin là bao nhiêu?", answer: "<p>Chúng tôi có nhiều gói đăng tin khác nhau, từ miễn phí đến các gói VIP với ưu đãi hiển thị. Vui lòng tham khảo bảng giá chi tiết tại mục 'Báo giá'.</p>", lastUpdated: "15/05/2025" },
    { id: "faq3", question: "Làm sao để tìm kiếm bất động sản hiệu quả?", answer: "<p>Sử dụng bộ lọc chi tiết về giá, diện tích, số phòng ngủ, khu vực... để thu hẹp kết quả. Bạn cũng có thể tìm kiếm theo từ khóa hoặc tên dự án.</p>", lastUpdated: "10/05/2025" },
    { id: "faq4", question: "Website có hỗ trợ vay vốn ngân hàng không?", answer: "<p>Chúng tôi có liên kết với một số ngân hàng uy tín để hỗ trợ tư vấn vay vốn. Thông tin chi tiết sẽ có ở trang chi tiết sản phẩm hoặc liên hệ với chúng tôi.</p>", lastUpdated: "01/04/2025" }
];
class FaqSection extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }).appendChild(faqSectionTemplate.content.cloneNode(true)); }
    connectedCallback() { this.renderFaqs(); }
    renderFaqs() {
        const container = this.shadowRoot.querySelector('.faq-list-container');
        // Chỉ render mockFaqs nếu không có phần tử nào được slot vào từ HTML
        const slottedChildren = this.shadowRoot.querySelector('slot').assignedElements({flatten: true});
        if (slottedChildren.length === 0) {
            mockFaqs.forEach(faqData => {
                const faqItem = document.createElement('faq-item');
                if (faqData.open) faqItem.setAttribute('open', ''); // Set thuộc tính open

                const qSlot = document.createElement('span'); qSlot.setAttribute('slot', 'question'); qSlot.textContent = faqData.question;
                const aSlot = document.createElement('div'); aSlot.setAttribute('slot', 'answer'); aSlot.innerHTML = faqData.answer; // Cho phép HTML trong câu trả lời
                const uSlot = document.createElement('span'); uSlot.setAttribute('slot', 'last-updated'); uSlot.textContent = faqData.lastUpdated;
                
                faqItem.appendChild(qSlot); faqItem.appendChild(aSlot); faqItem.appendChild(uSlot);
                container.appendChild(faqItem); // Append vào container trong shadow DOM
            });
        }
    }
}
customElements.define('faq-section', FaqSection);