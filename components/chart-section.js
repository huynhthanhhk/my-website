// components/chart-section.js
class ChartSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.chartInstance = null; // Để lưu trữ instance của biểu đồ
    }

    connectedCallback() {
        this.render();
        // Đảm bảo Chart.js đã được tải
        if (typeof Chart !== 'undefined') {
            this.renderChart();
        } else {
            console.warn('Chart.js chưa được tải. Biểu đồ sẽ không hiển thị.');
            const canvas = this.shadowRoot.getElementById('priceChart');
            if(canvas) {
                const ctx = canvas.getContext('2d');
                ctx.font = "16px Arial";
                ctx.fillStyle = "gray";
                ctx.textAlign = "center";
                ctx.fillText("Chart.js chưa tải. Không thể hiển thị biểu đồ.", canvas.width / 2, canvas.height / 2);
            }
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                :host {
                    display: block;
                    background-color: var(--background-color-white, #FFFFFF);
                    padding: 1.5rem; /* p-6 */
                    border-radius: var(--border-radius-lg, 8px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                h2 {
                    font-size: 1.75rem; /* text-2xl */
                    font-weight: 700;
                    color: var(--secondary-color, #004238);
                    margin-bottom: 1.5rem; /* mb-6 */
                    border-bottom: 2px solid var(--primary-color, #53b966);
                    padding-bottom: 0.5rem;
                }
                .chart-container {
                    position: relative;
                    height: 300px; /* Điều chỉnh chiều cao nếu cần */
                    width: 100%;
                }
                 @media (min-width: 768px) {
                    .chart-container {
                        height: 400px;
                    }
                }
            </style>
            <section>
                <h2>Biểu Đồ Biến Động Giá (Ví dụ)</h2>
                <div class="chart-container">
                    <canvas id="priceChart"></canvas>
                </div>
                <p class="mt-4 text-sm text-gray-500 italic">Lưu ý: Đây là dữ liệu biểu đồ mẫu.</p>
            </section>
        `;
    }

    renderChart() {
        const canvas = this.shadowRoot.getElementById('priceChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Dữ liệu mẫu cho biểu đồ
        const labels = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7'];
        const data = {
            labels: labels,
            datasets: [{
                label: 'Giá trung bình (triệu VNĐ/m²)',
                data: [45, 47, 46, 50, 52, 55, 53],
                borderColor: 'var(--primary-color, #53b966)',
                backgroundColor: 'color-mix(in srgb, var(--primary-color, #53b966) 30%, transparent)',
                tension: 0.1,
                fill: true,
                borderWidth: 2,
                pointBackgroundColor: 'var(--primary-color, #53b966)',
                pointRadius: 4,
                pointHoverRadius: 6
            },
            {
                label: 'Giá dự kiến (triệu VNĐ/m²)',
                data: [48, 49, 51, 53, 54, 56, 58],
                borderColor: 'var(--secondary-color, #004238)',
                backgroundColor: 'color-mix(in srgb, var(--secondary-color, #004238) 20%, transparent)',
                tension: 0.1,
                fill: false,
                borderWidth: 2,
                borderDash: [5, 5], // Đường nét đứt
                pointBackgroundColor: 'var(--secondary-color, #004238)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };

        // Hủy biểu đồ cũ nếu có để tránh lỗi khi render lại
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, {
            type: 'line', // Loại biểu đồ: line, bar, pie, etc.
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false, // Có thể không bắt đầu từ 0 để rõ biến động nhỏ
                        title: {
                            display: true,
                            text: 'Giá (triệu VNĐ/m²)'
                        }
                    },
                    x: {
                         title: {
                            display: true,
                            text: 'Thời gian'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y + ' tr VNĐ/m²';
                                }
                                return label;
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
}
customElements.define('chart-section', ChartSection);
