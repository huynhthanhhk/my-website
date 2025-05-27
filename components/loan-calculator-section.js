// components/loan-calculator-section.js
class LoanCalculatorSection extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://cdn.tailwindcss.com');
                /* Sử dụng class section-card từ global.css, nhưng tùy chỉnh lại padding cho form nhỏ hơn */
                .calculator-card {
                    background-color: var(--background-color-white, #FFFFFF);
                    padding: calc(var(--spacing-unit) * 2.5); /* p-5, nhỏ hơn section-card mặc định */
                    border-radius: var(--border-radius-xl, 12px);
                    box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
                }
                .calculator-card h2 { /* Tiêu đề bên trong card */
                    font-size: 1.25rem; /* text-xl */
                    font-weight: 700;
                    color: var(--secondary-color, #004238);
                    margin-bottom: calc(var(--spacing-unit) * 2); /* mb-4 */
                    text-align: center;
                    border-bottom: 2px solid var(--primary-color, #53b966);
                    padding-bottom: calc(var(--spacing-unit) * 1); /* pb-2 */
                }
                label {
                    display: block;
                    font-weight: 500; /* font-medium */
                    color: var(--text-color-medium, #4b5563);
                    margin-bottom: 0.25rem; /* mb-1 */
                    font-size: 0.875rem; /* text-sm */
                }
                input[type="number"], input[type="text"] {
                    width: 100%;
                    padding: 0.625rem; /* p-2.5 */
                    border: 1px solid #d1d5db; /* border-gray-300 */
                    border-radius: var(--border-radius-md, 6px);
                    margin-bottom: 0.75rem; /* mb-3 */
                    box-sizing: border-box;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    font-size: 0.875rem; /* text-sm */
                }
                input[type="number"]:focus, input[type="text"]:focus {
                    outline: none;
                    border-color: var(--primary-color, #53b966);
                    box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #53b966) 25%, transparent);
                }
                .calculate-button {
                    width: 100%;
                    background-color: var(--primary-color, #53b966);
                    color: var(--text-color-light, #FFFFFF);
                    font-weight: 600; /* font-semibold */
                    padding: 0.625rem; /* p-2.5 */
                    border: none;
                    border-radius: var(--border-radius-md, 6px);
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                    font-size: 0.9375rem; /* text-sm+ */
                }
                .calculate-button:hover {
                    background-color: color-mix(in srgb, var(--primary-color, #53b966) 85%, black);
                }
                .results {
                    margin-top: 1rem; /* mt-4 */
                    padding: 0.75rem; /* p-3 */
                    background-color: color-mix(in srgb, var(--primary-color, #53b966) 10%, transparent);
                    border-left: 3px solid var(--primary-color, #53b966);
                    border-radius: var(--border-radius-sm, 4px);
                    font-size: 0.875rem; /* text-sm */
                }
                .results p {
                    margin-bottom: 0.25rem; /* mb-1 */
                    color: var(--text-color-dark, #1f2937);
                }
                .results span {
                    font-weight: 600; /* font-semibold */
                    color: var(--secondary-color);
                }
                .error-message {
                    color: #ef4444; /* text-red-500 */
                    font-size: 0.75rem; /* text-xs */
                    margin-top: -0.25rem;
                    margin-bottom: 0.5rem;
                }
            </style>
            <section class="calculator-card">
                <h2>Ước Tính Khoản Vay</h2>
                <form id="loan-form">
                    <div>
                        <label for="loan-amount">Số tiền vay (VNĐ):</label>
                        <input type="number" id="loan-amount" placeholder="VD: 1000000000" required>
                        <p class="error-message" id="loan-amount-error"></p>
                    </div>
                    <div>
                        <label for="interest-rate">Lãi suất/năm (%):</label>
                        <input type="number" id="interest-rate" step="0.1" placeholder="VD: 6.8" required>
                         <p class="error-message" id="interest-rate-error"></p>
                    </div>
                    <div>
                        <label for="loan-term">Thời hạn vay (năm):</label>
                        <input type="number" id="loan-term" placeholder="VD: 20" required>
                        <p class="error-message" id="loan-term-error"></p>
                    </div>
                    <button type="submit" class="calculate-button">Tính Ngay</button>
                </form>
                <div id="loan-results" class="results hidden">
                    <h3 class="text-md font-semibold mb-1 text-secondary">Kết quả tham khảo:</h3>
                    <p>Trả hàng tháng: <span id="monthly-payment"></span></p>
                    <p>Tổng tiền trả: <span id="total-payment"></span></p>
                    <p>Tổng lãi: <span id="total-interest"></span></p>
                </div>
            </section>
        `;
    }

    attachEventListeners() {
        const form = this.shadowRoot.getElementById('loan-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.calculateLoan();
        });
    }

    validateInput(value, id, errorMessage) {
        const errorElement = this.shadowRoot.getElementById(id + "-error");
        const inputElement = this.shadowRoot.getElementById(id);
        if (isNaN(value) || value <= 0) {
            errorElement.textContent = errorMessage;
            inputElement.classList.add('border-red-500');
            inputElement.classList.remove('border-gray-300');
            return false;
        }
        errorElement.textContent = "";
        inputElement.classList.remove('border-red-500');
        inputElement.classList.add('border-gray-300');
        return true;
    }

    calculateLoan() {
        const loanAmountInput = this.shadowRoot.getElementById('loan-amount');
        const interestRateInput = this.shadowRoot.getElementById('interest-rate');
        const loanTermInput = this.shadowRoot.getElementById('loan-term');

        const loanAmount = parseFloat(loanAmountInput.value);
        const annualInterestRate = parseFloat(interestRateInput.value);
        const loanTermYears = parseInt(loanTermInput.value);

        let isValid = true;
        isValid &= this.validateInput(loanAmount, "loan-amount", "Số tiền vay không hợp lệ.");
        isValid &= this.validateInput(annualInterestRate, "interest-rate", "Lãi suất không hợp lệ.");
        isValid &= this.validateInput(loanTermYears, "loan-term", "Thời hạn vay không hợp lệ.");

        if (!isValid) {
            this.shadowRoot.getElementById('loan-results').classList.add('hidden');
            return;
        }

        const monthlyInterestRate = (annualInterestRate / 100) / 12;
        const numberOfPayments = loanTermYears * 12;

        const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        
        if (isNaN(monthlyPayment) || !isFinite(monthlyPayment) || monthlyPayment <=0) {
             this.shadowRoot.getElementById('loan-amount-error').textContent = "Giá trị không hợp lệ để tính toán.";
             this.shadowRoot.getElementById('loan-results').classList.add('hidden');
             return;
        }

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;

        const formatCurrency = (value) => value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

        this.shadowRoot.getElementById('monthly-payment').textContent = formatCurrency(monthlyPayment);
        this.shadowRoot.getElementById('total-payment').textContent = formatCurrency(totalPayment);
        this.shadowRoot.getElementById('total-interest').textContent = formatCurrency(totalInterest);

        this.shadowRoot.getElementById('loan-results').classList.remove('hidden');
    }
}
customElements.define('loan-calculator-section', LoanCalculatorSection);
