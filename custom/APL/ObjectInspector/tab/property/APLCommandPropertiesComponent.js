class APLCommandPropertiesComponent extends BestAppsObjectInspectorPropertiesTabComponent {
    static tag = 'apl-command-properties-component';

    static EVENT_ACTION_CLOSE = 'action::close'
    static EVENT_ACTION_SAVE = 'action::save'


    /**
     * @property {HTMLSelectElement} typeSelector
     */
    typeSelector;

    /**
     * @property {HTMLDivElement} actionsContainer
     */
    actionsContainer;

    /**
     * @property {boolean} isNew
     */
    isNew;

    async initElements() {
        await super.initElements();
        this.selectorContainer = document.createElement('div');
        this.selectorContainer.classList.add('type-container');
        this.selectorContainer.classList.add('type-container');
        this.typeSelector = document.createElement('select');
        this.typeSelector.classList.add('type');
        this.typeSelector.setAttribute('part', 'type');
        let selected = this.options.type;
        let items = [
            'SendEvent',
            'SetValue',
        ];
        for (const item of items) {
            this.addOption(this.typeSelector, item, item, selected);
        }
        this.selectorContainer.appendChild(this.typeSelector);
        this.element.wrapper.prepend(this.selectorContainer);
        this.typeSelector.addEventListener('change', () => {
            let value = this.typeSelector.value;
            if(selected !== value) {
                this.sendPropertyChanged({key: 'type', data: {value}});
            }
        });
        this.initActions();
    }

    initActions() {
        this.actionsContainer = document.createElement('div');
        this.actionsContainer.classList.add('actions');

        this.closeButton = document.createElement('div');
        this.closeButton.classList.add('action');
        this.closeButton.innerHTML = 'CLOSE';
        this.closeButton.addEventListener('click', () => {
            this.publish(this.constructor.EVENT_ACTION_CLOSE);
        });

        this.saveButton = document.createElement('div');
        this.saveButton.classList.add('action');
        this.saveButton.innerHTML = 'SAVE';
        this.saveButton.addEventListener('click', () => {
            this.publish(this.constructor.EVENT_ACTION_SAVE, {properties: this.properties});
        });
        this.actionsContainer.appendChild(this.closeButton);
        this.actionsContainer.appendChild(this.saveButton);
        this.element.wrapper.append(this.actionsContainer);
    }

    addOption(element, name, value, selected) {
        let option = document.createElement("option");
        option.value = value;
        option.innerHTML = `${name}`;
        if (selected === value) {
            option.selected = true;
        }
        element.appendChild(option);
    }

    getStyle() {
        let style = super.getStyle();
        style += `
            .wrapper {
                padding: 5px;
                border: 1px solid black;
            }
            .type {
                width: 100%;
                padding: 10px;
            }
            .type-container {
                width: 100%;
                margin-bottom: 10px;
            }
            
            .actions {
                display: flex;
                flex-direction: column;
                height: 30px;
                flex-wrap: wrap;
                align-content: space-between;
            }
            
            .action {
                width: 35%;
                height: 80%;
                border: 1px solid black;
                align-self: center;
                cursor: hand;
                padding: 3px;
                margin: 3px;
            }
        `;
        return style;
    }

}


customElements.define(APLCommandPropertiesComponent.tag, APLCommandPropertiesComponent);