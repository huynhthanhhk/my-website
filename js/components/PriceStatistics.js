// js/components/PriceStatistics.js
import processedDataByAreaRange from '../../data/listingsByAreaRange.js';
import { areaRanges } from '../../data/listingsByAreaRange.js'; // Import areaRanges
import { getUnitPriceChartDataForYear } from '../../data/chartDataProcessor.js'; // Import hàm xử lý data cho chart

const priceStatisticsTemplate = document.createElement('template');
priceStatisticsTemplate.innerHTML = `
    <style>
        :host { display: block; margin-top: 20px; }
        .statistics-container h3 { 
            font-size: 1.5rem; margin-bottom: 20px; color: var(--secondary-color); 
            padding-bottom: 10px; border-bottom: 1px solid var(--light-gray-color);
        }

        /* Tabs chọn năm cho BẢNG */
        .table-year-tabs-container { 
            display: flex; flex-wrap: wrap; 
            border-bottom: 2px solid var(--medium-gray-color); margin-bottom: 25px; 
        }
        .table-year-tab-button {
            padding: 10px 18px; cursor: pointer; border: none;
            border-bottom: 3px solid transparent; background-color: transparent;
            font-size: 1rem; font-weight: 500; color: var(--text-color-light); 
            margin-right: 5px; margin-bottom: -2px; /* Để border active đè lên */
            transition: color 0.2s, border-bottom-color 0.2s;
        }
        .table-year-tab-button:hover { color: var(--primary-color); }
        .table-year-tab-button.active { /* Chỉ có 1 tab active cho bảng */
            color: var(--primary-color); 
            border-bottom-color: var(--primary-color); 
            font-weight: 600; 
        }
        
        .stats-content h4 { font-size: 1.2rem; margin-top: 30px; margin-bottom: 10px; color: var(--text-color); }

        /* Bảng cha và con (style giữ nguyên như trước) */
        .parent-stats-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 0.95em; box-shadow: var(--box-shadow); }
        .parent-stats-table th, .parent-stats-table td { border: 1px solid var(--medium-gray-color); padding: 10px 12px; text-align: left; vertical-align: middle; }
        .parent-stats-table th { background-color: var(--light-gray-color); color: var(--secondary-color); font-weight: 600; }
        .parent-stats-table td.price-min-max, .parent-stats-table td.unit-price-min-max { color: var(--primary-color); }
        .expand-details-btn { background: none; border: none; font-size: 1.2em; cursor: pointer; color: var(--primary-color); padding: 5px; line-height: 1; transition: transform 0.2s ease; }
        .expand-details-btn.open { transform: rotate(45deg); }
        .child-table-row.hidden { display: none !important; }
        .child-table-container { padding: 15px; background-color: #f9f9f9; border-left: 3px solid var(--primary-color); }
        .child-stats-table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
        .child-stats-table th, .child-stats-table td { border: 1px solid var(--medium-gray-color); padding: 8px 10px; text-align: left; }
        .child-stats-table th { background-color: #e9e9e9; } .child-stats-table td { background-color: var(--background-color); }
        .view-more-child-btn { display: block; margin: 10px auto 0 auto; padding: 6px 12px; font-size: 0.85em; color: var(--primary-color); background-color: transparent; border: 1px solid var(--primary-color); border-radius: var(--border-radius); cursor: pointer; }
        .view-more-child-btn:hover { background-color: var(--light-gray-color); }
        .no-data-message { padding: 20px; text-align: center; color: var(--text-color-light); background-color: var(--light-gray-color); border-radius: var(--border-radius); }
        
        /* Options cho Biểu đồ */
        .chart-controls-wrapper {
            display: flex;
            flex-wrap: wrap;
            gap: 20px; /* Khoảng cách giữa nhóm chọn năm và nhóm chọn diện tích */
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            background-color: var(--light-gray-color);
            border-radius: var(--border-radius);
        }
        .chart-year-toggles, .chart-area-range-selector {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        .chart-year-toggles label, .chart-area-range-selector label {
            font-weight: 500;
            color: var(--text-color-light);
            font-size: 0.95rem;
        }
        .chart-year-toggle-btn {
            padding: 6px 12px; cursor: pointer;
            border: 1px solid var(--medium-gray-color);
            background-color: var(--background-color);
            color: var(--text-color-light);
            font-size: 0.9rem; border-radius: var(--border-radius);
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        }
        .chart-year-toggle-btn:hover { border-color: var(--primary-color); }
        .chart-year-toggle-btn.active {
            background-color: var(--primary-color); color: var(--text-color-inverted);
            border-color: var(--primary-color); font-weight: 500;
        }
        #chartAreaRangeSelect {
            padding: 6px 10px; border-radius: var(--border-radius);
            border: 1px solid var(--medium-gray-color); min-width: 180px; /* Giảm min-width */
        }

        .chart-container { 
            width: 100%; margin: 0 auto; padding: 10px; 
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius); background-color: var(--background-color);
            min-height: 350px; position: relative; /* Cho thông báo lỗi */
        }
        .chart-container .no-data-message { /* Style lại cho thông báo trong chart */
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background-color: transparent; border: none;
        }
    </style>
    <div class="statistics-container">
        <h3>Thống kê chi tiết tại <span id="areaNameDisplay">Khu vực</span></h3>
        
        <div class="table-year-tabs-container" id="tableYearTabs"></div>

        <div class="stats-content">
            <h4 id="tableTitle">Bảng tổng hợp theo nhóm diện tích <span id="selectedYearTableTitle"></span></h4>
            <table class="parent-stats-table" id="areaGroupSummaryTable">
                <thead><tr><th>Nhóm diện tích</th><th>Giá (tỷ) Min - Max</th><th>Đơn giá (trđ/m²) Min - Max</th><th>Chi tiết</th></tr></thead>
                <tbody></tbody>
            </table>
            
            <h4 id="chartDynamicTitle">Biểu đồ biến động đơn giá</h4>
            <div class="chart-controls-wrapper">
                <div class="chart-year-toggles" id="chartYearToggles">
                    <label>Chọn năm (biểu đồ):</label>
                    </div>
                <div class="chart-area-range-selector">
                    <label for="chartAreaRangeSelect">Nhóm diện tích:</label>
                    <select id="chartAreaRangeSelect">
                        <option value="all">Tất cả diện tích</option>
                        </select>
                </div>
            </div>
            <div class="chart-container">
                <canvas id="unitPriceChartCanvas"></canvas>
            </div>
        </div>
    </div>
`;

class PriceStatistics extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).appendChild(priceStatisticsTemplate.content.cloneNode(true));

        this._tableYearTabsContainer = this.shadowRoot.getElementById('tableYearTabs');
        this._parentTableBody = this.shadowRoot.querySelector('#areaGroupSummaryTable tbody');
        this._areaNameEl = this.shadowRoot.getElementById('areaNameDisplay');
        this._yearTableTextEl = this.shadowRoot.getElementById('selectedYearTableTitle');
        
        this._chartDynamicTitleEl = this.shadowRoot.getElementById('chartDynamicTitle');
        this._chartAreaRangeSelect = this.shadowRoot.getElementById('chartAreaRangeSelect');
        this._chartYearTogglesContainer = this.shadowRoot.getElementById('chartYearToggles');
        this._chartCanvas = this.shadowRoot.getElementById('unitPriceChartCanvas');
        this._chartContainer = this.shadowRoot.querySelector('.chart-container');
        
        this._allAvailableYears = Object.keys(processedDataByAreaRange).sort((a, b) => parseInt(b) - parseInt(a));
        this._activeYearForTable = null; // Năm hiển thị bảng
        this._selectedYearsForChart = new Set(); // Các năm hiển thị trên chart
        
        this._unitPriceChartInstance = null;
        this._childTableStates = {};
        this._activeChartAreaRangeKey = "all"; 
    }

    connectedCallback() {
        const area = this.dataset.area || "TP. Hồ Chí Minh"; 
        this._areaNameEl.textContent = area;
        
        this._populateChartAreaRangeSelect(); 

        if (this._allAvailableYears.length > 0) {
            this._activeYearForTable = this._allAvailableYears[0]; // Mặc định năm mới nhất cho bảng
            this._selectedYearsForChart.add(this._allAvailableYears[0]); // Mặc định năm mới nhất cho chart
        }
        
        this.renderTableYearTabs(); 
        this.renderChartYearToggles();
        this.updateTableDisplay(); 
        this.updateChart(); 

        this._chartAreaRangeSelect.addEventListener('change', (event) => {
            this._activeChartAreaRangeKey = event.target.value;
            this.updateChart(); 
        });
    }
    
    _populateChartAreaRangeSelect() { /* ... Giữ nguyên ... */
        while (this._chartAreaRangeSelect.options.length > 1) this._chartAreaRangeSelect.remove(1);
        for (const rangeKey in areaRanges) {
            if (areaRanges.hasOwnProperty(rangeKey)) {
                const option = document.createElement('option');
                option.value = rangeKey; option.textContent = areaRanges[rangeKey].label;
                this._chartAreaRangeSelect.appendChild(option);
            }
        }
    }

    renderTableYearTabs() {
        this._tableYearTabsContainer.innerHTML = '';
        if (!this._allAvailableYears || this._allAvailableYears.length === 0) return;

        this._allAvailableYears.forEach(year => {
            const button = document.createElement('button');
            button.classList.add('table-year-tab-button');
            button.textContent = `Năm ${year}`;
            button.dataset.year = year;
            if (year === this._activeYearForTable) {
                button.classList.add('active'); // Chỉ có 1 active cho bảng
            }
            button.addEventListener('click', () => this.activateTableYearTab(year));
            this._tableYearTabsContainer.appendChild(button);
        });
    }

    activateTableYearTab(year) { 
        this._activeYearForTable = year;
        this.renderTableYearTabs(); // Cập nhật class active cho tab bảng
        this.updateTableDisplay();
        // Không tự động thay đổi lựa chọn năm của biểu đồ khi chỉ click tab bảng
    }

    renderChartYearToggles() {
        // Xóa các nút cũ trừ label
        const label = this._chartYearTogglesContainer.querySelector('label');
        this._chartYearTogglesContainer.innerHTML = '';
        if(label) this._chartYearTogglesContainer.appendChild(label);

        if (!this._allAvailableYears || this._allAvailableYears.length === 0) return;

        this._allAvailableYears.forEach(year => {
            const button = document.createElement('button');
            button.classList.add('chart-year-toggle-btn');
            button.textContent = year;
            button.dataset.year = year;
            if (this._selectedYearsForChart.has(year)) {
                button.classList.add('active');
            }
            button.addEventListener('click', () => this.handleChartYearToggle(year));
            this._chartYearTogglesContainer.appendChild(button);
        });
    }

    handleChartYearToggle(yearString) {
        const year = String(yearString);
        if (this._selectedYearsForChart.has(year)) {
            this._selectedYearsForChart.delete(year);
        } else {
            this._selectedYearsForChart.add(year);
        }
        this.renderChartYearToggles(); // Cập nhật UI của nút toggle
        this.updateChart();
    }
    
    updateTableDisplay() { /* ... Giữ nguyên như trước, sử dụng this._activeYearForTable ... */ 
        if (this._activeYearForTable) {
            this._yearTableTextEl.textContent = `cho năm ${this._activeYearForTable}`;
            this.renderParentTable(this._activeYearForTable);
        } else {
            this._yearTableTextEl.textContent = '';
            if(this._parentTableBody) this._parentTableBody.innerHTML = `<tr><td colspan="4"><p class="no-data-message">Vui lòng chọn năm để xem bảng.</p></td></tr>`;
        }
    }

    _updateChartTitle() { /* ... Giữ nguyên như trước, sử dụng this._selectedYearsForChart ... */
        const sortedSelectedYears = Array.from(this._selectedYearsForChart).map(y => parseInt(y)).sort((a,b) => a - b).map(y => String(y));
        let title = "Biểu đồ biến động đơn giá ";
        if (sortedSelectedYears.length === 0) { title += "(Vui lòng chọn năm)"; }
        else if (sortedSelectedYears.length === 1) { title += `năm ${sortedSelectedYears[0]}`; }
        else {
            let isConsecutive = true;
            for (let i = 0; i < sortedSelectedYears.length - 1; i++) {
                if (parseInt(sortedSelectedYears[i+1]) - parseInt(sortedSelectedYears[i]) !== 1) {
                    isConsecutive = false; break;
                }
            }
            if (isConsecutive) { title += `${sortedSelectedYears[0]} – ${sortedSelectedYears[sortedSelectedYears.length - 1]}`; }
            else { title += sortedSelectedYears.join(', '); }
        }
        const areaLabel = this._chartAreaRangeSelect.options[this._chartAreaRangeSelect.selectedIndex].text;
        if (this._activeChartAreaRangeKey !== "all" && areaLabel !== "Tất cả diện tích") {
            title += ` (Nhóm: ${areaLabel})`;
        }
        this._chartDynamicTitleEl.textContent = title;
    }

    updateChart() { /* ... Logic vẽ chart giữ nguyên như trước, nhưng sẽ lặp qua this._selectedYearsForChart ... */
        this._updateChartTitle();
        const canvasContainer = this._chartContainer;
        const canvas = this._chartCanvas;
        const existingNoDataMsg = canvasContainer.querySelector('.no-data-message');
        if(existingNoDataMsg) existingNoDataMsg.remove();

        if (this._selectedYearsForChart.size === 0) {
            if (this._unitPriceChartInstance) { this._unitPriceChartInstance.destroy(); this._unitPriceChartInstance = null; }
            canvas.style.display = 'none';
            const noDataMsg = document.createElement('p'); noDataMsg.classList.add('no-data-message');
            noDataMsg.textContent = "Vui lòng chọn ít nhất một năm để vẽ biểu đồ.";
            canvasContainer.appendChild(noDataMsg); return;
        }
        canvas.style.display = 'block';

        const datasets = [];
        const chartColors = ['#53b966', '#004238', '#ff9f40', '#36a2eb', '#cc65fe', '#ffcd56', '#4bc0c0', '#ff6384'];
        let colorIndex = 0;
        const sortedYearsForChartDisplay = Array.from(this._selectedYearsForChart).sort((a, b) => parseInt(a) - parseInt(b));

        sortedYearsForChartDisplay.forEach(year => { // Sử dụng mảng đã sắp xếp để thứ tự dataset ổn định
            const yearlyChartData = getUnitPriceChartDataForYear(year, this._activeChartAreaRangeKey);
            if (yearlyChartData.some(d => d.avgUnitPrice !== null)) {
                const baseColor = chartColors[colorIndex % chartColors.length];
                // Avg Unit Price (Area Chart)
                datasets.push({
                    label: `TB ${year}`, data: yearlyChartData.map(d => d.avgUnitPrice),
                    borderColor: baseColor, backgroundColor: `${baseColor}4D`, // Opacity 0.3 (hex 4D)
                    fill: true, tension: 0.3, type: 'line', pointRadius: 3, pointHoverRadius: 5
                });
                // Min Unit Price (Line Chart)
                datasets.push({
                    label: `Min ${year}`, data: yearlyChartData.map(d => d.minUnitPrice),
                    borderColor: baseColor, fill: false, borderDash: [5, 5], pointRadius: 2, pointStyle: 'rect', hidden: true, type: 'line'
                });
                // Max Unit Price (Line Chart)
                datasets.push({
                    label: `Max ${year}`, data: yearlyChartData.map(d => d.maxUnitPrice),
                    borderColor: baseColor, fill: false, borderDash: [2, 2], pointRadius: 2, pointStyle: 'triangle', hidden: true, type: 'line'
                });
                colorIndex++;
            }
        });

        if (datasets.length === 0) {
            if (this._unitPriceChartInstance) { this._unitPriceChartInstance.destroy(); this._unitPriceChartInstance = null; }
            canvas.style.display = 'none';
            const noDataMsg = document.createElement('p'); noDataMsg.classList.add('no-data-message');
            noDataMsg.textContent = `Không có đủ dữ liệu đơn giá cho lựa chọn hiện tại để vẽ biểu đồ.`;
            canvasContainer.appendChild(noDataMsg); return;
        }

        const chartConfig = {
            type: 'line', 
            data: {
                labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: datasets
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    x: { title: { display: true, text: 'Tháng' } },
                    y: { title: { display: true, text: 'Đơn giá (triệu/m²)' }, beginAtZero: false, stacked: false }
                },
                plugins: { 
                    legend: { position: 'bottom', labels: { usePointStyle: true } }, // Sử dụng pointStyle trong legend
                    tooltip: { mode: 'index', intersect: false } 
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false }
            }
        };

        if (typeof Chart === 'undefined') {
            console.error("Thư viện Chart.js chưa được tải.");
            canvasContainer.innerHTML = '<p class="no-data-message">Lỗi: Thư viện vẽ biểu đồ chưa được tải.</p>';
            return;
        }
        if (this._unitPriceChartInstance) {
            this._unitPriceChartInstance.data = chartConfig.data;
            this._unitPriceChartInstance.options = chartConfig.options;
            this._unitPriceChartInstance.update();
        } else {
            this._unitPriceChartInstance = new Chart(this._chartCanvas, chartConfig);
        }
    }
    
    // Các hàm render bảng (giữ nguyên): _getMinMaxValues, renderParentTable, _toggleChildTable, _populateAndShowChildTable
    _getMinMaxValues(items, property) { /* ... */ 
        if (!items || items.length === 0) return { min: 'N/A', max: 'N/A' };
        const values = items.map(item => parseFloat(String(item[property]).replace(',', '.'))).filter(val => !isNaN(val));
        if (values.length === 0) return { min: 'N/A', max: 'N/A' };
        const formatter = (value) => value.toLocaleString(undefined, { 
            minimumFractionDigits: value % 1 === 0 ? 0 : 1,
            maximumFractionDigits: 2 
        });
        return { min: formatter(Math.min(...values)), max: formatter(Math.max(...values)) };
    }
    renderParentTable(year) { /* ... */ 
        if (!this._parentTableBody) return;
        this._parentTableBody.innerHTML = ''; 
        this._childTableStates[year] = this._childTableStates[year] || {}; 
        const dataForYearByArea = processedDataByAreaRange[year];
        if (!dataForYearByArea || Object.keys(dataForYearByArea).length === 0) {
            this._parentTableBody.innerHTML = `<tr><td colspan="4"><p class="no-data-message">Không có dữ liệu cho năm ${year}.</p></td></tr>`;
            return;
        }
        for (const rangeKey in dataForYearByArea) {
            if (dataForYearByArea.hasOwnProperty(rangeKey)) {
                const rangeData = dataForYearByArea[rangeKey];
                const priceStats = this._getMinMaxValues(rangeData.allItems, 'price');
                const unitPriceStats = this._getMinMaxValues(rangeData.allItems, 'unitPrice');
                const parentRow = this._parentTableBody.insertRow();
                parentRow.insertCell().textContent = rangeData.label;
                parentRow.insertCell().textContent = `${priceStats.min} - ${priceStats.max}`;
                parentRow.cells[1].classList.add('price-min-max');
                parentRow.insertCell().textContent = `${unitPriceStats.min} - ${unitPriceStats.max}`;
                parentRow.cells[2].classList.add('unit-price-min-max');
                const detailCell = parentRow.insertCell(); detailCell.style.textAlign = 'center';
                const expandBtn = document.createElement('button');
                expandBtn.classList.add('expand-details-btn'); expandBtn.innerHTML = '+';
                expandBtn.dataset.year = year; expandBtn.dataset.rangeKey = rangeKey;
                expandBtn.setAttribute('aria-expanded', 'false'); expandBtn.setAttribute('aria-label', `Xem chi tiết nhóm ${rangeData.label}`);
                expandBtn.addEventListener('click', (e) => this._toggleChildTable(e.currentTarget, year, rangeKey));
                detailCell.appendChild(expandBtn);
                const childRow = this._parentTableBody.insertRow();
                childRow.classList.add('child-table-row', 'hidden');
                childRow.dataset.childForRow = `${year}-${rangeKey}`; 
                const childCell = childRow.insertCell(); childCell.colSpan = 4; 
                const childContainer = document.createElement('div');
                childContainer.classList.add('child-table-container');
                childCell.appendChild(childContainer);
                if (this._childTableStates[year][rangeKey] && this._childTableStates[year][rangeKey].isOpen) {
                    this._populateAndShowChildTable(childContainer, year, rangeKey, this._childTableStates[year][rangeKey].showAll);
                    childRow.classList.remove('hidden');
                    expandBtn.classList.add('open'); expandBtn.innerHTML = '−';
                    expandBtn.setAttribute('aria-expanded', 'true');
                }
            }
        }
    }
    _toggleChildTable(button, year, rangeKey) { /* ... */ 
        const childRow = this.shadowRoot.querySelector(`tr[data-child-for-row="${year}-${rangeKey}"]`);
        if(!childRow) return;
        const childContainer = childRow.querySelector('.child-table-container');
        this._childTableStates[year][rangeKey] = this._childTableStates[year][rangeKey] || { isOpen: false, showAll: false };
        const isNowHidden = childRow.classList.toggle('hidden');
        button.classList.toggle('open', !isNowHidden);
        button.innerHTML = !isNowHidden ? '−' : '+';
        button.setAttribute('aria-expanded', (!isNowHidden).toString());
        this._childTableStates[year][rangeKey].isOpen = !isNowHidden;
        if (!isNowHidden && childContainer && childContainer.innerHTML.trim() === '') { // Check childContainer exists
            this._populateAndShowChildTable(childContainer, year, rangeKey, false);
        }
    }
    _populateAndShowChildTable(containerDiv, year, rangeKey, showAll = false) { /* ... */ 
        const rangeData = processedDataByAreaRange[year]?.[rangeKey]; // Thêm optional chaining
        if (!rangeData) { 
            containerDiv.innerHTML = '<p class="no-data-message">Lỗi: Không tìm thấy dữ liệu cho nhóm này.</p>';
            return;
        }
        this._childTableStates[year][rangeKey] = this._childTableStates[year][rangeKey] || {};
        this._childTableStates[year][rangeKey].showAll = showAll;
        const itemsToDisplay = showAll ? rangeData.allItems : rangeData.previewItems;
        containerDiv.innerHTML = '';
        if (!itemsToDisplay || itemsToDisplay.length === 0) {
            containerDiv.innerHTML = '<p class="no-data-message">Không có tin đăng chi tiết.</p>'; return;
        }
        const table = document.createElement('table'); table.classList.add('child-stats-table');
        const thead = table.createTHead(); const headerRow = thead.insertRow();
        const headers = ['Tháng', 'Diện tích (m²)', 'Giá (tỷ)', 'Đơn giá (trđ/m²)', 'Pháp lý', 'Nội thất'];
        headers.forEach(text => { const th = document.createElement('th'); th.textContent = text; headerRow.appendChild(th); });
        const tbody = table.createTBody();
        itemsToDisplay.forEach(item => {
            const row = tbody.insertRow();
            row.insertCell().textContent = item.month;
            row.insertCell().textContent = item.area;
            const priceCell = row.insertCell(); priceCell.textContent = parseFloat(String(item.price).replace(',','.')).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:2});
            const unitPriceCell = row.insertCell(); unitPriceCell.textContent = parseFloat(String(item.unitPrice).replace(',','.')).toLocaleString(undefined, {minimumFractionDigits:1, maximumFractionDigits:2});
            row.insertCell().textContent = item.legal;
            row.insertCell().textContent = item.furniture;
        });
        containerDiv.appendChild(table);
        // Sửa điều kiện hiển thị nút "Xem thêm"
        if (!showAll && rangeData.allItems.length > (rangeData.previewItems ? rangeData.previewItems.length : 0) && rangeData.allItems.length > 5) {
            const viewMoreBtn = document.createElement('button');
            viewMoreBtn.classList.add('view-more-child-btn');
            const remainingItems = rangeData.allItems.length - (rangeData.previewItems ? rangeData.previewItems.length : 0);
            viewMoreBtn.textContent = `Xem thêm (${remainingItems > 0 ? remainingItems : rangeData.allItems.length - 5} mục)`;
            viewMoreBtn.addEventListener('click', () => { this._populateAndShowChildTable(containerDiv, year, rangeKey, true); });
            containerDiv.appendChild(viewMoreBtn);
        }
    }

    static get observedAttributes() { return ['data-area']; }
    attributeChangedCallback(name, oldValue, newValue) { /* ... */ 
         if (name === 'data-area' && oldValue !== newValue && this.isConnected) {
            this._areaNameEl.textContent = newValue || "TP. Hồ Chí Minh";
        }
    }
}
customElements.define('price-statistics', PriceStatistics);