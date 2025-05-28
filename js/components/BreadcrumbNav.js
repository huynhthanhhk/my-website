// js/components/BreadcrumbNav.js
const breadcrumbTemplate = document.createElement('template');
breadcrumbTemplate.innerHTML = `
    <style>
        /* CSS cho breadcrumb.css */
        :host { display: block; margin-bottom: 15px; }
        nav { font-size: 0.9em; color: var(--dark-gray-color); }
        ol { list-style: none; padding: 0; margin: 0; display: flex; }
        li { display: flex; align-items: center; }
        li a { color: var(--primary-color); text-decoration: none; }
        li a:hover { text-decoration: underline; }
        li:not(:last-child)::after {
            content: '/';
            margin: 0 8px;
            color: var(--medium-gray-color);
        }
        li[aria-current="page"] { color: var(--text-color); font-weight: bold; }
    </style>
    <nav aria-label="breadcrumb">
        <ol>
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Bán căn hộ</a></li>
            <li aria-current="page">TP. Hồ Chí Minh</li>
        </ol>
    </nav>
`;

class BreadcrumbNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(breadcrumbTemplate.content.cloneNode(true));
        // Props: items (array of {text, href, isCurrent}) - for dynamic breadcrumbs
    }

    // Example for dynamic breadcrumbs if needed later
    // connectedCallback() {
    //     this.render();
    // }
    // render(items = [{text: 'Trang chủ', href:'#'}, {text:'Bán căn hộ', href:'#'}, {text:'TP. Hồ Chí Minh', isCurrent: true}]) {
    //     const ol = this.shadowRoot.querySelector('ol');
    //     ol.innerHTML = items.map(item => `
    //         <li ${item.isCurrent ? 'aria-current="page"' : ''}>
    //             ${item.isCurrent ? item.text : `<a href="${item.href}">${item.text}</a>`}
    //         </li>
    //     `).join('');
    // }
}
customElements.define('breadcrumb-nav', BreadcrumbNav);
