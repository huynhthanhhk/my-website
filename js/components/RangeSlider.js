// js/components/RangeSlider.js
const rangeSliderTemplate = document.createElement('template');
rangeSliderTemplate.innerHTML = `
    <style>
        :host { 
            display: block; 
            margin-top: 10px; 
        }
        .range-slider-container { 
            display: flex; 
            flex-direction: column; 
            gap: 10px;
        }
        
        .number-inputs-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .number-inputs-wrapper label {
            font-size: 0.9em;
            color: var(--text-color-light, #555);
            white-space: nowrap;
        }
        .number-inputs-wrapper input[type="number"] {
            width: 70px; 
            padding: 7px 8px;
            border: 1px solid var(--medium-gray-color, #ccc);
            border-radius: var(--border-radius, 5px);
            text-align: right;
            font-size: 0.9em;
            -moz-appearance: textfield;
        }
        .number-inputs-wrapper input[type="number"]::-webkit-outer-spin-button,
        .number-inputs-wrapper input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none; 
            margin: 0;
        }
        .number-inputs-wrapper .unit-display {
            font-size: 0.9em;
            color: var(--dark-gray-color, #6c757d);
            margin-left: 2px;
        }

        .sliders-wrapper {
            position: relative;
            display: flex; /* Giữ lại flex để căn chỉnh nếu cần sau này */
            align-items: center;
            height: 20px; /* Chiều cao cho khu vực chứa thanh trượt và track */
            padding-top: 6px; /* Tạo không gian cho thumb của slider */
            padding-bottom: 6px;
        }

        .slider-container { /* Container cho 2 thanh trượt và track */
            position: relative;
            width: 100%;
            height: 8px; /* Chiều cao của track (line) */
        }

        /* Track nền (phần xám toàn bộ chiều dài) */
        .slider-track {
            position: absolute;
            width: 100%;
            height: 100%; /* Bằng chiều cao của slider-container */
            background: var(--medium-gray-color, #ddd); /* Màu nền của track */
            border-radius: 4px; /* Bo tròn track */
            top: 0;
            left: 0;
            z-index: 1; /* Nằm dưới cùng */
        }

        /* Track fill (phần được chọn, có màu chính) */
        .slider-track-fill {
            position: absolute;
            height: 100%; /* Bằng chiều cao của slider-container */
            background: var(--primary-color, #53b966); /* Màu chính cho phần được chọn */
            border-radius: 4px; /* Bo tròn */
            top: 0;
            z-index: 2; /* Nằm trên track nền, dưới thumb */
        }

        input[type="range"].range-slider-control {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 100%; /* Chiều cao của input range bằng chiều cao track */
            background: transparent; /* Nền của input range trong suốt */
            pointer-events: none; /* Chỉ thumb mới bắt sự kiện chuột */
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            z-index: 3; /* Nằm trên cùng để thumb có thể kéo */
        }
        input[type="range"].range-slider-control::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 18px; /* Kích thước thumb */
            height: 18px;
            background: var(--primary-color, #53b966); /* Màu của thumb */
            border-radius: 50%;
            cursor: pointer;
            pointer-events: auto; /* Thumb bắt sự kiện chuột */
            margin-top: 0; /* Không cần margin-top nếu height của input range đã đúng */
            border: 2px solid var(--background-color, #fff); /* Viền trắng cho thumb để nổi bật */
            box-shadow: 0 0 3px rgba(0,0,0,0.2); /* Bóng nhẹ cho thumb */
        }
        input[type="range"].range-slider-control::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: var(--primary-color, #53b966);
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid var(--background-color, #fff);
            box-shadow: 0 0 3px rgba(0,0,0,0.2);
            pointer-events: auto;
        }
        
        /* Loại bỏ value-display-range */
        /* .value-display-range { ... } */ 
    </style>
    <div class="range-slider-container">
        <div class="number-inputs-wrapper">
            <label for="inputMin">Từ:</label>
            <input type="number" id="inputMin" aria-label="Giá trị tối thiểu"/>
            <label for="inputMax" style="margin-left: 5px;">Đến:</label>
            <input type="number" id="inputMax" aria-label="Giá trị tối đa"/>
            <span class="unit-display" id="unitText"></span>
        </div>
        <div class="sliders-wrapper">
            <div class="slider-container">
                <div class="slider-track"></div>
                <div class="slider-track-fill" id="trackFill"></div>
                <input type="range" class="range-slider-control" id="sliderMin" aria-label="Thanh trượt giá trị tối thiểu"/>
                <input type="range" class="range-slider-control" id="sliderMax" aria-label="Thanh trượt giá trị tối đa"/>
            </div>
        </div>
        </div>
`;

class RangeSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(rangeSliderTemplate.content.cloneNode(true));

        this._sliderMin = this.shadowRoot.getElementById('sliderMin');
        this._sliderMax = this.shadowRoot.getElementById('sliderMax');
        this._inputMin = this.shadowRoot.getElementById('inputMin');
        this._inputMax = this.shadowRoot.getElementById('inputMax');
        // this._displayRangeText = this.shadowRoot.getElementById('displayRangeText'); // ĐÃ BỎ
        this._unitText = this.shadowRoot.getElementById('unitText');
        this._trackFill = this.shadowRoot.getElementById('trackFill');

        this._minRange = 0; 
        this._maxRange = 100; 
        this._step = 1;
        this._unit = '';
        this._currentMinVal = 0;
        this._currentMaxVal = 100;

        this._handleMinSliderInput = this._handleMinSliderInput.bind(this);
        this._handleMaxSliderInput = this._handleMaxSliderInput.bind(this);
        this._handleMinInputChange = this._handleMinInputChange.bind(this);
        this._handleMaxInputChange = this._handleMaxInputChange.bind(this);
    }

    connectedCallback() {
        this._minRange = parseFloat(this.getAttribute('min') || 0);
        this._maxRange = parseFloat(this.getAttribute('max') || 100);
        this._step = parseFloat(this.getAttribute('step') || 1);
        this._unit = this.getAttribute('unit') || '';
        
        const defaultMin = parseFloat(this.getAttribute('default-min') || this._minRange);
        const defaultMax = parseFloat(this.getAttribute('default-max') || this._maxRange);

        // Đảm bảo giá trị mặc định nằm trong khoảng minRange và maxRange
        this._currentMinVal = Math.max(this._minRange, Math.min(defaultMin, this._maxRange));
        this._currentMaxVal = Math.min(this._maxRange, Math.max(defaultMax, this._minRange));

        // Đảm bảo min luôn nhỏ hơn hoặc bằng max
        if (this._currentMinVal > this._currentMaxVal) {
            // Nếu min > max, có thể đặt chúng bằng nhau hoặc hoán đổi, hoặc đặt min = max - step
            // Tạm thời đặt min = max nếu defaultMin > defaultMax
             this._currentMinVal = this._currentMaxVal;
        }
        // Đảm bảo min không vượt quá max - step (để có ít nhất 1 step cách biệt nếu cần)
        // Tuy nhiên, cho phép min = max
        // if (this._currentMinVal > this._currentMaxVal - this._step && this._currentMaxVal > this._minRange + this._step) {
        //     this._currentMinVal = this._currentMaxVal - this._step;
        // }


        this._unitText.textContent = this._unit;

        this._configureInput(this._sliderMin, this._minRange, this._maxRange, this._step, this._currentMinVal);
        this._configureInput(this._sliderMax, this._minRange, this._maxRange, this._step, this._currentMaxVal);
        this._configureInput(this._inputMin, this._minRange, this._maxRange, this._step, this._currentMinVal);
        this._configureInput(this._inputMax, this._minRange, this._maxRange, this._step, this._currentMaxVal);

        this._sliderMin.addEventListener('input', this._handleMinSliderInput);
        this._sliderMax.addEventListener('input', this._handleMaxSliderInput);
        this._inputMin.addEventListener('change', this._handleMinInputChange);
        this._inputMax.addEventListener('change', this._handleMaxInputChange);
        
        this._updateVisuals();
        this._dispatchRangeChangeEvent(); 
    }

    disconnectedCallback() {
        this._sliderMin.removeEventListener('input', this._handleMinSliderInput);
        this._sliderMax.removeEventListener('input', this._handleMaxSliderInput);
        this._inputMin.removeEventListener('change', this._handleMinInputChange);
        this._inputMax.removeEventListener('change', this._handleMaxInputChange);
    }
    
    _configureInput(inputElement, min, max, step, value) {
        inputElement.min = min;
        inputElement.max = max;
        inputElement.step = step;
        inputElement.value = value;
    }

    _handleMinSliderInput() {
        this._currentMinVal = parseFloat(this._sliderMin.value);
        if (this._currentMinVal > this._currentMaxVal) { // Cho phép min = max
            this._currentMinVal = this._currentMaxVal;
            this._sliderMin.value = this._currentMinVal; 
        }
        this._inputMin.value = this._currentMinVal;
        this._updateVisualsAndDispatch();
    }

    _handleMaxSliderInput() {
        this._currentMaxVal = parseFloat(this._sliderMax.value);
        if (this._currentMaxVal < this._currentMinVal) { // Cho phép max = min
            this._currentMaxVal = this._currentMinVal;
            this._sliderMax.value = this._currentMaxVal; 
        }
        this._inputMax.value = this._currentMaxVal;
        this._updateVisualsAndDispatch();
    }

    _handleMinInputChange() {
        let val = parseFloat(this._inputMin.value);
        if (isNaN(val) || val < this._minRange) val = this._minRange;
        if (val > this._currentMaxVal) val = this._currentMaxVal; // Cho phép min = max
        if (val > this._maxRange) val = this._maxRange; // Không vượt quá max của slider

        this._inputMin.value = val; 
        this._currentMinVal = val;
        this._sliderMin.value = this._currentMinVal;
        this._updateVisualsAndDispatch();
    }
    
    _handleMaxInputChange() {
        let val = parseFloat(this._inputMax.value);
        if (isNaN(val) || val > this._maxRange) val = this._maxRange;
        if (val < this._currentMinVal) val = this._currentMinVal; // Cho phép max = min
        if (val < this._minRange) val = this._minRange; // Không nhỏ hơn min của slider
        
        this._inputMax.value = val; 
        this._currentMaxVal = val;
        this._sliderMax.value = this._currentMaxVal;
        this._updateVisualsAndDispatch();
    }

    _updateVisualsAndDispatch() {
        this._updateVisuals();
        this._dispatchRangeChangeEvent();
    }

    _dispatchRangeChangeEvent() {
        this.dispatchEvent(new CustomEvent('range-change', {
            detail: { 
                min: this._currentMinVal, 
                max: this._currentMaxVal, 
                unit: this._unit 
            },
            bubbles: true,
            composed: true
        }));
    }

    _updateVisuals() {
        // this._displayRangeText.textContent = `...`; // ĐÃ BỎ
        
        const minPercent = Math.max(0, Math.min(100, ((this._currentMinVal - this._minRange) / (this._maxRange - this._minRange)) * 100));
        const maxPercent = Math.max(0, Math.min(100, ((this._currentMaxVal - this._minRange) / (this._maxRange - this._minRange)) * 100));
        
        if (this._trackFill) {
            this._trackFill.style.left = `${minPercent}%`;
            this._trackFill.style.width = `${Math.max(0, maxPercent - minPercent)}%`; // Đảm bảo width không âm
        }
    }

    _formatValue(value) { // Hàm này không còn được dùng trực tiếp để hiển thị text dưới slider
        return parseFloat(value).toLocaleString(undefined, { 
            minimumFractionDigits: (this._step < 1 && this._step > 0 ? String(this._step).split('.')[1].length : 0), 
            maximumFractionDigits: (this._step < 1 && this._step > 0 ? String(this._step).split('.')[1].length : 0) 
        });
    }
    
    getCurrentValues() { 
        return { min: this._currentMinVal, max: this._currentMaxVal, unit: this._unit };
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'unit', 'default-min', 'default-max'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue && this.isConnected) {
             this.connectedCallback(); 
        }
    }
}
customElements.define('range-slider', RangeSlider);