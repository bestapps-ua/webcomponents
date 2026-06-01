class BestAppsObjectInspectorPropertyListComponent extends BestAppsObjectInspectorPropertyComponent {
    static tag = 'ba-object-inspector-property-list-component';

    items = [];

    async processOptions(options) {
        options = await super.processOptions(options);
        this.items = options.data.items;
        return options;
    }

    initField() {
        this.initSelect();
    }

    initSelect() {
        this.fieldEl = document.createElement('select');
        this.addOption('', '');
        for (const item of this.items) {
            let name = item;
            let value = item;
            if (typeof item === 'object') {
                const keys = Object.keys(item);
                value = keys[0];
                name = item[keys[0]];
            }
            this.addOption(name, value);
        }
        this.fieldEl.addEventListener('change', async (data) => {
            this.deactivate();
            if (this.value !== this.getFieldValue()) {
                this.setValue(this.getFieldValue());
                this.sendValueChanged();
            }
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

    addOption(name, value) {
        let option = document.createElement("option");
        option.value = value;
        option.innerHTML = `<div>${name}</div>`;
        if (name === this.value) {
            option.selected = true;
        }
        this.fieldEl.appendChild(option);
    }

    getFieldValue() {
        let key = this.fieldEl.value;
        if(this.items.includes(key)) {
            return key;
        }
        let item  = this.items.find((item) => {
            if(typeof item !== 'object') {
                return;
            }
            let keys = Object.keys(item);
            if(keys[0] === key) {
                return item;
            }
        });
        if(item) {
            let keys = Object.keys(item);
            return item[keys[0]];
        }
    }
}

customElements.define(BestAppsObjectInspectorPropertyListComponent.tag, BestAppsObjectInspectorPropertyListComponent);