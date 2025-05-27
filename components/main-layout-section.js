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
                    /* max-width: var(--container-max-width, 1100px); */ /* Max-width được xử lý bên ngoài component này */
                    /* margin-left: auto; */
                    /* margin-right: auto; */
                    padding-left: 1rem; /* px-4 */
                    padding-right: 1rem; /* px-4 */
                }
                .main-layout-grid {
                    display: grid;
                    gap: 2rem; /* gap-8 */
                }
                @media (min-width: 768px) { /* md breakpoint */
                    .main-layout-grid {
                        grid-template-columns: 7fr 3fr; /* Tương đương 70% và 30% với gap */
                    }
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
