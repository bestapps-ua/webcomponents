class BestAppsObjectInspectorPropertyInputComponent extends BestAppsObjectInspectorPropertyComponent {
    static tag = 'ba-object-inspector-property-input-component';

    initField() {
        this.initInput();
    }

    initInput() {
        this.fieldEl = document.createElement('input');
        this.fieldEl.setAttribute('part', 'input');
        this.fieldEl.setAttribute('type', 'text');
        this.fieldEl.value = this.value;
        this.fieldEl.classList.add('input');
        this.fieldEl.addEventListener('keyup', (e) => {
            if (!this.active) {
                return;
            }

            if (e.key === 'Escape') {

                this.deactivate();
                if (this.value !== this.fieldEl.value) {
                    this.setValue(this.fieldEl.value);
                }
            }
            if (e.key === 'Enter') {

                this.deactivate();
                if (this.value !== this.fieldEl.value) {
                    this.setValue(this.fieldEl.value);
                    this.sendValueChanged();
                }
            }
        });

        this.fieldEl.addEventListener('keydown', (e) => {
            if (!this.active) {
                return;
            }
            //this.sendChanged('value', {value: this.fieldEl.value});
        });

        this.fieldEl.addEventListener('blur', (e) => {
            this.onDeactivate();
        });
        super.initField();
    }

    getStyle() {
        let style = super.getStyle();
        style += `        
            
            `;
        return style;
    }

    getFieldValue() {
        return this.fieldEl.value;
    }
}

customElements.define(BestAppsObjectInspectorPropertyInputComponent.tag, BestAppsObjectInspectorPropertyInputComponent);