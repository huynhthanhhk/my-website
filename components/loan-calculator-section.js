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
                :host {
                    display: block;
                    background-color: var(--background-color-white, #FFFFFF);
                    padding: 1.5rem; /* p-6 */
                    border-radius: var(--border-radius-lg, 8px);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                h2 {
                    font-size: 1.5rem; /* text-xl */
                    font-weight: 700;
                    color: var(--secondary-color, #004238);
                    margin-bottom: 1.5rem; /* mb-6 */
                    text-align: center;
                }
                label {
                    display: block;
                    font-weight: 500; /* font-medium */
                    color: var(--text-color-medium, #4b5563);
                    margin-bottom: 0.5rem; /* mb-2 */
                }
                input[type="number"], input[type="text"] {
                    width: 100%;
                    padding: 0.75rem; /* p-3 */
                    border: 1px solid #d1d5db; /* border-gray-300 */
                    border-radius: var(--border-radius-md, 6px);
                    margin-bottom: 1rem; /* mb-4 */
                    box-sizing: border-box;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                }
                input[type="number"]:focus, input[type="text"]:focus {
                    outline: none;
                    border-color: var(--primary-color, #53b966);
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color, #53b966) 30%, transparent);
                }
                .calculate-button {
                    width: 100%;
                    background-color: var(--primary-color, #53b966);
                    color: var(--text-color-light, #FFFFFF);
                    font-weight: 600; /* font-semibold */
                    padding: 0.75rem; /* p-3 */
                    border: none;
                    border-radius: var(--border-radius-md, 6px);
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .calculate-button:hover {
                    background-color: color-mix(in srgb, var(--primary-color, #53b966) 85%, black);
                }
                .results {
                    margin-top: 1.5rem; /* mt-6 */
                    padding: 1rem; /* p-4 */
                    background-color: color-mix(in srgb, var(--primary-color, #53b966) 10%, transparent); /* màu nền nhẹ */
                    border-left: 4px solid var(--primary-color, #53b966);
                    border-radius: var(--border-radius-sm, 4px);
                }
                .results p {
                    margin-bottom: 0.5rem; /* mb-2 */
                    color: var(--text-color-dark, #1f2937);
                }
                .results span {
                    font-weight: 600; /* font-semibold */
                }
                .error-message {
                    color: #ef4444; /* text-red-500 */
                    font-size: 0.875rem; /* text-sm */
                    margin-top: -0.5rem;
                    margin-bottom: 1rem;
                }
            </style>
            <section>
                <h2>Công Cụ Tính Lãi Vay</h2>
                <form id="loan-form">
                    <div>
                        <label for="loan-amount">Số tiền vay (VNĐ):</label>
                        <input type="number" id="loan-amount" placeholder="Ví dụ: 500000000" required>
                        <p class="error-message" id="loan-amount-error"></p>
                    </div>
                    <div>
                        <label for="interest-rate">Lãi suất hàng năm (%):</label>
                        <input type="number" id="interest-rate" step="0.1" placeholder="Ví dụ: 7.5" required>
                         <p class="error-message" id="interest-rate-error"></p>
                    </div>
                    <div>
                        <label for="loan-term">Thời hạn vay (năm):</label>
                        <input type="number" id="loan-term" placeholder="Ví dụ: 15" required>
                        <p class="error-message" id="loan-term-error"></p>
                    </div>
                    <button type="submit" class="calculate-button">Tính Toán</button>
                </form>
                <div id="loan-results" class="results hidden">
                    <h3 class="text-lg font-semibold mb-2 text-secondary">Kết quả ước tính:</h3>
                    <p>Số tiền trả hàng tháng: <span id="monthly-payment"></span> VNĐ</p>
                    <p>Tổng số tiền phải trả: <span id="total-payment"></span> VNĐ</p>
                    <p>Tổng lãi phải trả: <span id="total-interest"></span> VNĐ</p>
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
        if (isNaN(value) || value <= 0) {
            errorElement.textContent = errorMessage;
            return false;
        }
        errorElement.textContent = "";
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
        isValid &= this.validateInput(loanAmount, "loan-amount", "Vui lòng nhập số tiền vay hợp lệ.");
        isValid &= this.validateInput(annualInterestRate, "interest-rate", "Vui lòng nhập lãi suất hợp lệ.");
        isValid &= this.validateInput(loanTermYears, "loan-term", "Vui lòng nhập thời hạn vay hợp lệ.");

        if (!isValid) {
            this.shadowRoot.getElementById('loan-results').classList.add('hidden');
            return;
        }

        const monthlyInterestRate = (annualInterestRate / 100) / 12;
        const numberOfPayments = loanTermYears * 12;

        // Công thức tính trả góp hàng tháng (annuity)
        // M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1]
        // M: Monthly payment
        // P: Principal loan amount
        // i: Monthly interest rate
        // n: Total number of payments

        const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
        
        if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
             this.shadowRoot.getElementById('loan-amount-error').textContent = "Không thể tính toán với các giá trị này. Vui lòng kiểm tra lại.";
             this.shadowRoot.getElementById('loan-results').classList.add('hidden');
             return;
        }

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;

        this.shadowRoot.getElementById('monthly-payment').textContent = monthlyPayment.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
        this.shadowRoot.getElementById('total-payment').textContent = totalPayment.toLocaleString('vi-VN', { maximumFractionDigits: 0 });
        this.shadowRoot.getElementById('total-interest').textContent = totalInterest.toLocaleString('vi-VN', { maximumFractionDigits: 0 });

        this.shadowRoot.getElementById('loan-results').classList.remove('hidden');
    }
}
customElements.define('loan-calculator-section', LoanCalculatorSection);
