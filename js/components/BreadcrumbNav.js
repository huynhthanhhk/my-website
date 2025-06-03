// js/components/BreadcrumbNav.js
const breadcrumbTemplate = document.createElement('template');
breadcrumbTemplate.innerHTML = `
    <style>
        :host { display: block; margin-bottom: 15px; }
        nav { font-size: 0.9em; color: var(--dark-gray-color); }
        ol { list-style: none; padding: 0; margin: 0; display: flex; flex-wrap: wrap; }
        li { display: flex; align-items: center; }
        li a { color: var(--primary-color); text-decoration: none; }
        li a:hover { text-decoration: underline; }
        li:not(:last-child)::after {
            content: '/';
            margin: 0 8px;
            color: var(--medium-gray-color);
        }
        li span[aria-current="page"] { /* Đổi thành span để không bị style link */
             color: var(--text-color); font-weight: 500; 
        }
    </style>
    <nav aria-label="breadcrumb">
        <ol>
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Bán căn hộ</a></li>
            <li><span aria-current="page">TP. Hồ Chí Minh</span></li> </ol>
    </nav>
`;
class BreadcrumbNav extends HTMLElement {
    constructor() { super(); this.attachShadow({ mode: 'open' }).appendChild(breadcrumbTemplate.content.cloneNode(true)); }
    // Có thể thêm connectedCallback để render breadcrumbs động từ attributes/properties sau này
}
customElements.define('breadcrumb-nav', BreadcrumbNav);