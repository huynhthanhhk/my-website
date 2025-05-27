// components/main-layout-section.js
class MainLayoutSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                :host {
                    display: block; /* Quan trọng cho layout */
                    max-width: var(--container-max-width, 1100px);
                    margin-left: auto;
                    margin-right: auto;
                    padding-left: 1rem; /* px-4 chung cho khối 2 */
                    padding-right: 1rem; /* px-4 chung cho khối 2 */
                }
                .main-layout-grid {
                    display: grid;
                    gap: 2rem; /* gap-8, khoảng cách giữa 2 cột */
                }
                @media (min-width: 768px) { /* md breakpoint */
                    .main-layout-grid {
                        /* Cột 1 chiếm 7 phần, cột 2 chiếm 3 phần */
                        grid-template-columns: 7fr 3fr;
                    }
                }
                /* Đảm bảo slot content được hiển thị */
                ::slotted(*) { 
                    /* Các phần tử được slot vào sẽ tự động kế thừa/hiển thị */
                }
            </style>
            <div class="main-layout-grid">
                <div class="left-column">
                    <slot name="left-column-content"></slot>
                </div>
                <div class="right-column">
                    <slot name="right-column-content"></slot>
                </div>
            </div>
        `;
    }
}
customElements.define('main-layout-section', MainLayoutSection);
