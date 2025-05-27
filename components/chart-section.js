// components/chart-section.js
class ChartSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chartInstance = null;
    }

    connectedCallback() {
        this.render();
        // Đảm bảo Chart.js đã được tải (kiểm tra lại vì có thể render trễ)
        const checkChartInterval = setInterval(() => {
            if (typeof Chart !== 'undefined') {
                clearInterval(checkChartInterval);
                this.renderChart();
            }
        }, 100);

        // Fallback nếu Chart.js không tải được sau 1 thời gian
        setTimeout(() => {
            clearInterval(checkChartInterval);
            if (typeof Chart === 'undefined' && this.shadowRoot && !this.chartInstance) {
                console.warn('Chart.js chưa được tải. Biểu đồ sẽ không hiển thị.');
                const canvas = this.shadowRoot.getElementById('priceTrendChart');
                if(canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.font = "16px var(--font-family-default, Arial)";
                    ctx.fillStyle = "var(--text-color-medium, gray)";
                    ctx.textAlign = "center";
                    ctx.fillText("Không thể tải thư viện biểu đồ.", canvas.width / 2, canvas.height / 2);
                }
            }
        }, 3000);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                /* Sử dụng class section-card từ global.css */
                .chart-card {
                    /* Kế thừa từ .section-card */
                }
                .chart-card h2 {
                    /* Kế thừa từ .section-card h2 */
                }
                .chart-container {
                    position: relative;
                    height: 300px;
                    width: 100%;
                }
                 @media (min-width: 768px) { /* md breakpoint */
                    .chart-container {
                        height: 350px; /* Điều chỉnh chiều cao nếu cần */
                    }
                }
            </style>
            <section class="section-card chart-card">
                <h2>Xu Hướng Giá Bất Động Sản Khu Vực</h2>
                <div class="chart-container">
                    <canvas id="priceTrendChart"></canvas>
                </div>
                <p class="mt-4 text-xs text-gray-500 italic text-center">Ghi chú: Dữ liệu chỉ mang tính chất minh họa.</p>
            </section>
        `;
    }

    renderChart() {
        const canvas = this.shadowRoot.getElementById('priceTrendChart');
        if (!canvas || typeof Chart === 'undefined') return; // Kiểm tra lại Chart
        const ctx = canvas.getContext('2d');

        const labels = ['2020', '2021', '2022', '2023', '2024', '2025 (Dự kiến)'];
        const data = {
            labels: labels,
            datasets: [{
                label: 'Giá trung bình căn hộ (VNĐ/m²)',
                data: [35000000, 38000000, 42000000, 45000000, 48000000, 52000000],
                borderColor: 'var(--primary-color, #53b966)',
                backgroundColor: 'color-mix(in srgb, var(--primary-color, #53b966) 20%, transparent)',
                tension: 0.2,
                fill: true,
                borderWidth: 2.5,
                pointBackgroundColor: 'var(--primary-color, #53b966)',
                pointBorderColor: 'var(--background-color-white, #fff)',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            },
            {
                label: 'Giá trung bình đất nền (VNĐ/m²)',
                data: [55000000, 60000000, 68000000, 72000000, 75000000, 80000000],
                borderColor: 'var(--secondary-color, #004238)',
                backgroundColor: 'color-mix(in srgb, var(--secondary-color, #004238) 20%, transparent)',
                tension: 0.2,
                fill: true,
                borderWidth: 2.5,
                pointBackgroundColor: 'var(--secondary-color, #004238)',
                pointBorderColor: 'var(--background-color-white, #fff)',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        };

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: 'Giá (VNĐ/m²)' },
                        ticks: {
                            callback: function(value, index, values) {
                                return (value / 1000000) + ' Tr';
                            }
                        }
                    },
                    x: { title: { display: true, text: 'Năm' } }
                },
                plugins: {
                    legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) { label += ': '; }
                                if (context.parsed.y !== null) {
                                    label += (context.parsed.y / 1000000).toFixed(1) + ' Triệu VNĐ/m²';
                                }
                                return label;
                            }
                        }
                    }
                },
                interaction: { mode: 'nearest', axis: 'x', intersect: false },
                elements: { line: { borderWidth: 2.5 } }
            }
        });
    }
}
customElements.define('chart-section', ChartSection);
