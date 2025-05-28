// js/components/PriceStatistics.js
const priceStatisticsTemplate = document.createElement('template');
priceStatisticsTemplate.innerHTML = `
    <style>
        /* CSS cho price-stats.css */
        :host { display: block; }
        h3 {
            font-size: 1.4em;
            margin-bottom: 15px;
            color: var(--secondary-color);
        }
        .stats-tabs-container {
            display: flex;
            border-bottom: 1px solid var(--medium-gray-color);
            margin-bottom: 20px;
        }
        .stat-tab-button {
            padding: 10px 15px;
            cursor: pointer;
            border: none;
            border-bottom: 3px solid transparent;
            background-color: transparent;
            font-size: 1em;
            color: var(--dark-gray-color);
            margin-right: 10px; /* Khoảng cách giữa các tab */
        }
        .stat-tab-button:hover {
            color: var(--primary-color);
        }
        .stat-tab-button.active {
            color: var(--primary-color);
            border-bottom-color: var(--primary-color);
            font-weight: bold;
        }
        .stats-content {
            /* Styles for table and chart area */
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 0.95em;
        }
        th, td {
            border: 1px solid var(--medium-gray-color);
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: var(--light-gray-color);
            color: var(--secondary-color);
            font-weight: bold;
        }
        td.price-value {
            font-weight: bold;
            color: var(--primary-color);
        }
        .chart-placeholder {
            width: 100%;
            height: 300px; /* Chiều cao của biểu đồ */
            background-color: var(--light-gray-color);
            border: 1px dashed var(--medium-gray-color);
            display: flex;
            justify-content: center;
            align-items: center;
            color: var(--dark-gray-color);
            font-size: 1.1em;
            border-radius: var(--border-radius);
        }
    </style>
    <div class="statistics-container">
        <h3>Thống kê giá bán căn hộ tại <span id="areaName">Khu vực</span></h3>
        <div class="stats-tabs-container" id="stats-tabs">
            </div>
        <div class="stats-content" id="stats-data-content">
            <h4>Bảng thống kê giá <span id="selectedYearTable"></span></h4>
            <table id="priceTable">
                <thead>
                    <tr>
                        <th>Khu vực/Quận</th>
                        <th>Giá trung bình (triệu/m²)</th>
                        <th>Biến động (so với kỳ trước)</th>
                        <th>Số lượng giao dịch</th>
                    </tr>
                </thead>
                <tbody>
                    </tbody>
            </table>
            <h4>Biểu đồ biến động giá <span id="selectedYearChart"></span></h4>
            <div class="chart-placeholder">
                Biểu đồ sẽ được hiển thị ở đây (Placeholder)
            </div>
        </div>
    </div>
`;
// Dữ liệu giả lập
const mockPriceData = {
    "2025": [
        { district: "Quận 1", avgPrice: 250, change: "+5.2%", transactions: 120 },
        { district: "Tân Phú", avgPrice: 75, change: "+3.0%", transactions: 350 },
        { district: "Bình Thạnh", avgPrice: 90, change: "+4.5%", transactions: 280 },
        { district: "Quận 7", avgPrice: 110, change: "+2.8%", transactions: 410 },
    ],
    "2024": [
        { district: "Quận 1", avgPrice: 237.5, change: "+4.8%", transactions: 115 },
        { district: "Tân Phú", avgPrice: 72.8, change: "+2.5%", transactions: 330 },
        { district: "Bình Thạnh", avgPrice: 86.1, change: "+4.1%", transactions: 270 },
        { district: "Quận 7", avgPrice: 107, change: "+2.2%", transactions: 400 },
    ],
    "2023": [
        { district: "Quận 1", avgPrice: 226.6, change: "+3.5%", transactions: 110 },
        { district: "Tân Phú", avgPrice: 71, change: "+2.0%", transactions: 310 },
        { district: "Bình Thạnh", avgPrice: 82.7, change: "+3.8%", transactions: 255 },
        { district: "Quận 7", avgPrice: 104.7, change: "+1.9%", transactions: 385 },
    ]
};


class PriceStatistics extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(priceStatisticsTemplate.content.cloneNode(true));
        this._tabsContainer = this.shadowRoot.getElementById('stats-tabs');
        this._tableBody = this.shadowRoot.querySelector('#priceTable tbody');
        this._areaNameEl = this.shadowRoot.getElementById('areaName');
        this._selectedYearTableEl = this.shadowRoot.getElementById('selectedYearTable');
        this._selectedYearChartEl = this.shadowRoot.getElementById('selectedYearChart');
        this._years = ["2025", "2024", "2023"]; // Các năm có dữ liệu
        this._activeYear = this._years[0]; // Mặc định năm mới nhất
    }

    connectedCallback() {
        const area = this.dataset.area || "Khu vực mặc định";
        this._areaNameEl.textContent = area;
        this.renderTabs();
        this.activateTab(this._activeYear);
    }

    renderTabs() {
        this._tabsContainer.innerHTML = '';
        this._years.forEach(year => {
            const button = document.createElement('button');
            button.classList.add('stat-tab-button');
            button.textContent = `Năm ${year}`;
            button.dataset.year = year;
            button.addEventListener('click', () => this.activateTab(year));
            this._tabsContainer.appendChild(button);
        });
    }

    activateTab(year) {
        this._activeYear = year;
        const buttons = this.shadowRoot.querySelectorAll('.stat-tab-button');
        buttons.forEach(button => {
            if (button.dataset.year === year) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        this._selectedYearTableEl.textContent = `năm ${year}`;
        this._selectedYearChartEl.textContent = `năm ${year}`;
        this.renderTableData(year);
    }

    renderTableData(year) {
        this._tableBody.innerHTML = ''; // Clear existing data
        const dataForYear = mockPriceData[year];

        if (dataForYear && dataForYear.length > 0) {
            dataForYear.forEach(item => {
                const row = this._tableBody.insertRow();
                row.insertCell().textContent = item.district;
                const priceCell = row.insertCell();
                priceCell.textContent = item.avgPrice;
                priceCell.classList.add('price-value');
                row.insertCell().textContent = item.change;
                row.insertCell().textContent = item.transactions;
            });
        } else {
            const row = this._tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = "Không có dữ liệu cho năm này.";
            cell.style.textAlign = "center";
        }
    }

    static get observedAttributes() {
        return ['data-area'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-area' && oldValue !== newValue) {
            this._areaNameEl.textContent = newValue || "Khu vực mặc định";
            // Có thể cần fetch lại dữ liệu nếu khu vực thay đổi và dữ liệu phụ thuộc vào nó
        }
    }
}
customElements.define('price-statistics', PriceStatistics);
