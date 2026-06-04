class APLObjectInspectorPropertyScaleComponent extends BestAppsObjectInspectorPropertyListComponent {
    static tag = 'apl-object-inspector-property-scale-component';

    static SCALE_ICONS = {
        'none': `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="42" height="34" rx="2"
        fill="none" stroke="#555" stroke-width="1.5" stroke-dasharray="3,2"/>
  <rect x="8" y="8" width="20" height="13" rx="1"
        fill="cornflowerblue" opacity=".9"/>
  <line x1="28" y1="8" x2="33" y2="8"
        stroke="#FF5722" stroke-width="1" opacity=".7"/>
  <line x1="33" y1="8" x2="33" y2="21"
        stroke="#FF5722" stroke-width="1" opacity=".7"/>
  <text x="22" y="31" font-size="5.5" fill="#888"
        text-anchor="middle" font-family="sans-serif">none</text>
</svg>`,

        'fill': `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="42" height="34" rx="2"
        fill="cornflowerblue" opacity=".9"/>
  <rect x="1" y="1" width="42" height="34" rx="2"
        fill="none" stroke="#555" stroke-width="1.5"/>
  <line x1="1" y1="1" x2="43" y2="35"
        stroke="white" stroke-width=".8" opacity=".3"/>
  <line x1="43" y1="1" x2="1" y2="35"
        stroke="white" stroke-width=".8" opacity=".3"/>
</svg>`,

        'best-fit': `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="42" height="34" rx="2"
        fill="#1a1a2e" stroke="#555" stroke-width="1.5" stroke-dasharray="3,2"/>
  <rect x="4" y="7" width="36" height="22" rx="1"
        fill="cornflowerblue" opacity=".9"/>
  <text x="22" y="31" font-size="5.5" fill="#888"
        text-anchor="middle" font-family="sans-serif">best-fit</text>
</svg>`,

        'best-fill': `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="scale-bf-clip">
      <rect x="1" y="1" width="42" height="34" rx="2"/>
    </clipPath>
  </defs>
  <rect x="-4" y="1" width="52" height="34" rx="1"
        fill="cornflowerblue" opacity=".9" clip-path="url(#scale-bf-clip)"/>
  <rect x="1" y="1" width="42" height="34" rx="2"
        fill="none" stroke="#555" stroke-width="1.5"/>
  <line x1="1" y1="1" x2="1" y2="35"
        stroke="#FF5722" stroke-width="1.5" opacity=".6"/>
  <line x1="43" y1="1" x2="43" y2="35"
        stroke="#FF5722" stroke-width="1.5" opacity=".6"/>
</svg>`,

        'best-fit-down': `<svg viewBox="0 0 44 36" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="42" height="34" rx="2"
        fill="#1a1a2e" stroke="#555" stroke-width="1.5" stroke-dasharray="3,2"/>
  <rect x="10" y="9" width="24" height="14" rx="1"
        fill="cornflowerblue" opacity=".9"/>
  <path d="M22 24 L18 28 L26 28 Z"
        fill="#4CAF50" opacity=".9"/>
  <path d="M22 9 L18 5 L26 5 Z"
        fill="#888" opacity=".5"/>
  <text x="22" y="35" font-size="4.5" fill="#888"
        text-anchor="middle" font-family="sans-serif">fit-down</text>
</svg>`
    };

    static SCALE_TITLES = {
        'none': 'Native size — no resizing',
        'fill': 'Stretch to fill — aspect ratio lost',
        'best-fit': 'Fit within box — letterbox/pillarbox (default)',
        'best-fill': 'Fill box, preserve ratio — may crop edges',
        'best-fit-down': 'Shrink only — never upscales',
    };

    pickerEl;

    async renderValue() {
        if (!this.pickerEl) {
            this.renderScalePicker();
        } else {
            this.syncActiveButton(this.value);
        }
    }

    renderScalePicker() {
        this.pickerEl = document.createElement('div');
        this.pickerEl.classList.add('scale-picker');

        for (const item of this.items) {
            const value = (typeof item === 'object') ? Object.keys(item)[0] : item;
            const label = (typeof item === 'object') ? item[Object.keys(item)[0]] : item;
            const btn = this.createScaleButton(value, label);
            this.pickerEl.appendChild(btn);
        }

        this.valueEl.innerHTML = '';
        this.valueEl.appendChild(this.pickerEl);
    }

    createScaleButton(value, label) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('scale-btn');
        if (value === this.value) btn.classList.add('scale-btn--active');
        btn.dataset.scaleValue = value;

        const tooltip = document.createElement('span');
        tooltip.classList.add('scale-tooltip');
        tooltip.textContent = this.constructor.SCALE_TITLES[value] || value;

        const iconWrap = document.createElement('span');
        iconWrap.innerHTML = this.constructor.SCALE_ICONS[value] || '';

        const labelEl = document.createElement('span');
        labelEl.classList.add('scale-label');
        labelEl.textContent = label;

        btn.append(tooltip, iconWrap, labelEl);

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (value === this.value) return;
            this.syncActiveButton(value);
            this.value = value;
            this.sendValueChanged();
        });

        return btn;
    }

    syncActiveButton(value) {
        if (!this.pickerEl) return;
        this.pickerEl.querySelectorAll('.scale-btn').forEach(b => b.classList.remove('scale-btn--active'));
        const target = this.pickerEl.querySelector(`[data-scale-value="${value}"]`);
        if (target) target.classList.add('scale-btn--active');
    }

    refreshValue(value) {
        if (value) {
            this.syncActiveButton(value);
        }
    }

    initField() {}

    onValueFocus() {}

    getFieldValue() {
        return this.value;
    }

    getStyle() {
        let style = super.getStyle();
        style += `
            .wrapper {
                height: auto;
            }

            .value {
                height: auto;
            }

            .scale-picker {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                padding: 4px 2px;
                border: none;
                height: auto;
            }

            .scale-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1 1 0px;
                min-width: 44px;
                padding: 4px 3px 2px;
                background: #1c1c2e;
                border: 2px solid #333;
                border-radius: 6px;
                cursor: pointer;
                position: relative;
                transition: border-color 0.15s, background 0.15s, transform 0.1s;
            }

            .scale-btn:hover {
                border-color: cornflowerblue;
                background: #1a2540;
                transform: translateY(-1px);
            }

            .scale-btn--active {
                border-color: cornflowerblue;
                background: #0d2040;
                box-shadow: 0 0 0 2px rgba(100, 149, 237, 0.35);
            }

            .scale-btn svg {
                width: 44px;
                height: 36px;
                display: block;
                pointer-events: none;
            }

            .scale-label {
                display: block;
                font-size: 9px;
                color: #aaa;
                margin-top: 2px;
                text-align: center;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 48px;
                line-height: 1.2;
                pointer-events: none;
            }

            .scale-btn--active .scale-label {
                color: cornflowerblue;
            }

            .scale-tooltip {
                position: absolute;
                bottom: calc(100% + 6px);
                left: 50%;
                transform: translateX(-50%);
                background: #222;
                color: #eee;
                font-size: 10px;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #444;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
                white-space: nowrap;
                opacity: 0;
                transition: opacity 0.15s;
                pointer-events: none;
                z-index: 9999;
            }

            .scale-btn:hover .scale-tooltip {
                opacity: 1;
            }
        `;
        return style;
    }
}

customElements.define(APLObjectInspectorPropertyScaleComponent.tag, APLObjectInspectorPropertyScaleComponent);
