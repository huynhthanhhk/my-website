// js/components/FaqSection.js
// Import FaqItem if needed: import './FaqItem.js';

const faqSectionTemplate = document.createElement('template');
faqSectionTemplate.innerHTML = `
    <style>
        :host { display: block; }
        h3 { /* Đã có style global, nhưng có thể override ở đây */
            margin-bottom: 20px;
            font-size: 1.4em;
        }
    </style>
    <div class="faq-list-container">
        <h3>Câu Hỏi Thường Gặp (FAQ)</h3>
        <slot></slot> </div>
`;

// Dữ liệu FAQ giả lập
const mockFaqs = [
    {
        id: "faq1",
        question: "Làm thế nào để đăng tin bất động sản trên website?",
        answer: "Bạn cần tạo tài khoản, sau đó vào mục 'Đăng tin' và điền đầy đủ thông tin theo hướng dẫn. Tin đăng sẽ được duyệt trước khi hiển thị.",
        lastUpdated: "20/05/2025"
    },
    {
        id: "faq2",
        question: "Chi phí đăng tin là bao nhiêu?",
        answer: "Chúng tôi có nhiều gói đăng tin khác nhau, từ miễn phí đến các gói VIP với ưu đãi hiển thị. Vui lòng tham khảo bảng giá chi tiết tại mục 'Báo giá'.",
        lastUpdated: "15/05/2025"
    },
    {
        id: "faq3",
        question: "Làm sao để tìm kiếm bất động sản hiệu quả?",
        answer: "Sử dụng bộ lọc chi tiết về giá, diện tích, số phòng ngủ, khu vực... để thu hẹp kết quả. Bạn cũng có thể tìm kiếm theo từ khóa hoặc tên dự án.",
        lastUpdated: "10/05/2025"
    },
    {
        id: "faq4",
        question: "Website có hỗ trợ vay vốn ngân hàng không?",
        answer: "Chúng tôi có liên kết với một số ngân hàng uy tín để hỗ trợ tư vấn vay vốn. Thông tin chi tiết sẽ có ở trang chi tiết sản phẩm hoặc liên hệ với chúng tôi.",
        lastUpdated: "01/04/2025"
    }
];

class FaqSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(faqSectionTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        this.renderFaqs();
    }

    renderFaqs() {
        // Nếu không có slot nào được truyền vào, thì render từ mockFaqs
        if (this.children.length === 0) {
            mockFaqs.forEach((faqData, index) => {
                const faqItem = document.createElement('faq-item');
                // Mở FAQ đầu tiên làm ví dụ
                if (index === 0) {
                    faqItem.setAttribute('open', '');
                }

                const qSlot = document.createElement('span');
                qSlot.setAttribute('slot', 'question');
                qSlot.textContent = faqData.question;

                const aSlot = document.createElement('div'); // Use div for answer to allow HTML
                aSlot.setAttribute('slot', 'answer');
                aSlot.innerHTML = `<p>${faqData.answer}</p>`; // Wrap answer in <p> or allow raw HTML

                const uSlot = document.createElement('span');
                uSlot.setAttribute('slot', 'last-updated');
                uSlot.textContent = faqData.lastUpdated;

                faqItem.appendChild(qSlot);
                faqItem.appendChild(aSlot);
                faqItem.appendChild(uSlot);
                this.shadowRoot.querySelector('.faq-list-container').appendChild(faqItem);
            });
        }
    }
}
customElements.define('faq-section', FaqSection);
