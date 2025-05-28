// js/components/RangeSlider.js
const rangeSliderTemplate = document.createElement('template');
rangeSliderTemplate.innerHTML = `
    <style>
        :host { display: block; margin-top: 10px; }
        .range-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .slider-wrapper {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        input[type="range"] {
            flex-grow: 1;
            cursor: pointer;
        }
        input[type="number"] {
            width: 80px; /* Độ rộng cố định cho ô số */
            padding: 8px;
            border: 1px solid var(--medium-gray-color);
            border-radius: var(--border-radius);
            text-align: right;
        }
        .value-display {
            font-size: 0.9em;
            color: var(--dark-gray-color);
            text-align: center; /* Hoặc căn chỉnh khác tùy ý */
        }
    </style>
    <div class="range-container">
        <div class="slider-wrapper">
            <input type="range" id="sliderMin" />
            <span style="padding: 0 5px;">-</span>
            <input type="range" id="sliderMax" />
        </div>
        <div class="input-wrapper" style="display: flex; justify-content: space-between; align-items:center; gap: 10px;">
            <input type="number" id="inputMin" aria-label="Giá trị nhỏ nhất"/>
            <span>đến</span>
            <input type="number" id="inputMax" aria-label="Giá trị lớn nhất"/>
        </div>
        <div class="value-display" id="display"></div>
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
        this._display = this.shadowRoot.getElementById('display');

        this._min = 0;
        this._max = 100;
        this._step = 1;
        this._unit = ''; // Ví dụ: 'tỷ', 'm²'
    }

    connectedCallback() {
        this._min = parseFloat(this.getAttribute('min') || 0);
        this._max = parseFloat(this.getAttribute('max') || 100);
        this._step = parseFloat(this.getAttribute('step') || 1);
        this._unit = this.getAttribute('unit') || '';
        const defaultMin = parseFloat(this.getAttribute('default-min') || this._min);
        const defaultMax = parseFloat(this.getAttribute('default-max') || this._max);

        this._configureInput(this._sliderMin, this._min, this._max, this._step, defaultMin);
        this._configureInput(this._sliderMax, this._min, this._max, this._step, defaultMax);
        this._configureInput(this._inputMin, this._min, this._max, this._step, defaultMin);
        this._configureInput(this._inputMax, this._min, this._max, this._step, defaultMax);

        this._sliderMin.addEventListener('input', () => this._syncValues(this._sliderMin, this._inputMin, 'min'));
        this._sliderMax.addEventListener('input', () => this._syncValues(this._sliderMax, this._inputMax, 'max'));
        this._inputMin.addEventListener('change', () => this._syncValues(this._inputMin, this._sliderMin, 'min'));
        this._inputMax.addEventListener('change', () => this._syncValues(this._inputMax, this._sliderMax, 'max'));

        this._updateDisplay();
    }

    _configureInput(inputElement, min, max, step, value) {
        inputElement.min = min;
        inputElement.max = max;
        inputElement.step = step;
        inputElement.value = value;
    }

    _syncValues(sourceElement, targetElement, type) {
        let val = parseFloat(sourceElement.value);
        if (type === 'min') {
            if (val > parseFloat(this._sliderMax.value)) {
                val = parseFloat(this._sliderMax.value);
                sourceElement.value = val; // Prevent min from exceeding max
            }
        } else if (type === 'max') {
             if (val < parseFloat(this._sliderMin.value)) {
                val = parseFloat(this._sliderMin.value);
                sourceElement.value = val; // Prevent max from being less than min
            }
        }
        targetElement.value = val;
        this._updateDisplay();
        this.dispatchEvent(new CustomEvent('range-change', {
            detail: {
                min: parseFloat(this._inputMin.value),
                max: parseFloat(this._inputMax.value)
            }
        }));
    }

    _updateDisplay() {
        this._display.textContent = `Từ ${this._inputMin.value}${this._unit} đến ${this._inputMax.value}${this._unit}`;
    }

    static get observedAttributes() {
        return ['min', 'max', 'step', 'unit', 'default-min', 'default-max'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            // Re-initialize if attributes change, could be more granular
            this.connectedCallback();
        }
    }
}
customElements.define('range-slider', RangeSlider);
