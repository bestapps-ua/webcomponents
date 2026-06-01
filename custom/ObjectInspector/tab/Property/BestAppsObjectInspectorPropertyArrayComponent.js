class BestAppsObjectInspectorPropertyArrayComponent extends BestAppsObjectInspectorPropertyComponent {
    static tag = 'ba-object-inspector-property-array-component';

    async processOptions(options) {
        options = await super.processOptions(options);

        return options;
    }

    initField() {
        this.initValues();
    }

    initValueItem(value) {
        if (!this.fieldEl) {
            this.initValues();
        }
        let containerEl = document.createElement('div');
        containerEl.classList.add('array-item');
        containerEl.setAttribute('part', 'array-item');
        let input = document.createElement('input');
        input.type = 'text';
        if (value) {
            input.value = value;
        }
        input.addEventListener('change', (e) => {
            if (!value) {
                this.value.push(input.value);
                value = input.value;
            } else {
                const index = this.value.indexOf(value);
                if (index !== -1) {
                    this.value[index] = input.value;
                    this.setValue(this.value);
                    this.deactivate();
                    this.sendValueChanged();
                }
            }
        });
        containerEl.appendChild(input);
        let minusEl = document.createElement('div');
        minusEl.classList.add('remove');
        minusEl.innerHTML = '<div>[-]</div>';
        minusEl.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.dialog = document.createElement(APLConfirmDialogComponent.tag);
            this.element.wrapper.appendChild(this.dialog);
            this.dialog.show({
                content: `Are you sure you want to delete ${value}?`,
            });
            this.dialog.onSuccess = () => {
                if (!value) {
                    this.fieldEl.removeChild(containerEl);
                } else {
                    const index = this.value.indexOf(value);
                    if (index !== -1) {
                        this.value.splice(index, 1);
                        this.setValue(this.value);
                        this.deactivate();
                        this.sendValueChanged();
                    }
                }
            }
        });
        containerEl.appendChild(minusEl);
        this.fieldEl.appendChild(containerEl);
    }

    initValues() {
        this.fieldEl = document.createElement('div');
        for (let i = 0; i < this.value.length; i++) {
            this.initValueItem(this.value[i]);
        }
        super.initField();
    }

    getFieldValue() {
        let key = this.fieldEl.value;
        console.log('hhh');
        return 'zzz';
        //TODO: return array ?
        return key;
        if (this.items.includes(key)) {
            return key;
        }
        let item = this.items.find((item) => {
            if (typeof item !== 'object') {
                return;
            }
            let keys = Object.keys(item);
            if (keys[0] === key) {
                return item;
            }
        });
        if (item) {
            let keys = Object.keys(item);
            return item[keys[0]];
        }
    }

    getStyle() {
        let style = super.getStyle();
        style += `
            .array-item {
                display: flex;
                flex-direction: row;
                align-items: center;
                height: auto;
                input {
                    height: auto;
                }
            }
            
            .remove {
                width: 3ch;
                height: auto;
            }
            
            .value {
                display: flex;
                flex-direction: column;
                cursor: pointer;
            }
        
            .wrapper {
                height: auto;
            }
            
        `;

        return style;
    }

    /**
     * Use this for array process
     */
    propertyItemsAdd(event) {
        this.initValueItem();
    }
}

customElements.define(BestAppsObjectInspectorPropertyArrayComponent.tag, BestAppsObjectInspectorPropertyArrayComponent);
