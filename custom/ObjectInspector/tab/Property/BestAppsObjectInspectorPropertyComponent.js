/**
 * TODO: validator before save
 * TODO: options
 * TODO: resize event
 * TODO: send only 1 event? use transport *
 */
class BestAppsObjectInspectorPropertyComponent extends BestAppsComponent {
    static tag = 'ba-object-inspector-property-component';

    name;
    value;
    type;
    options;
    valueEl;
    fieldEl;

    active = false;

    static EVENT_ACTIVATE = 'activate';

    async processOptions(options) {
        options = await super.processOptions(options);
        this.name = options.name;
        this.processData(options.data);
        return options;
    }

    processData(data, refresh = false) {
        if (data.type) {
            this.type = data.type;
            this.value = data.value;
            this.options = data.options || {};
        } else {
            this.type = 'text';
            this.value = data;
        }
        if (refresh) {
            this.refreshValue(this.value);
        }

    }

    async initElements() {
        await super.initElements();
        this.initName();
        this.initValue();
        this.element.wrapper.appendChild(this.nameEl);
        this.element.wrapper.appendChild(this.valueContainerEl);
        this.element.wrapper.onclick = () => {
            if (this.active) {
                return;
            }

            this.initField();
            this.activate();
        };
        this.initTooltip();
    }

    initName() {
        this.nameEl = document.createElement('div');
        this.nameEl.setAttribute('part', 'name');
        this.nameEl.classList.add('name');
        this.nameEl.classList.add('tooltip');

    }

    initValue() {
        this.valueContainerEl = document.createElement('div');
        this.valueEl = document.createElement('div');
        this.valueEl.classList.add('value');
        this.valueEl.tabIndex = 1;
        this.valueContainerEl.classList.add('value-container');
        this.valueContainerEl.setAttribute('part', 'value');
        this.valueContainerEl.appendChild(this.valueEl);

        this.valueEl.onfocus = () => {
            this.onValueFocus();
        }
    }

    onValueFocus() {
        if (this.active) {
            return;
        }
        this.valueEl.innerHTML = '';
        this.initField();
        this.activate();
    }

    initTooltip() {
        //TODO: make special tooltip element?
        this.nameTooltipEl = document.createElement('span');
        this.nameTooltipEl.classList.add('ba-tooltip-text');
        this.nameTooltipEl.style.position = 'fixed';
        this.nameTooltipEl.style.display = 'none';
        this.nameTooltipEl.style.width = '120px';
        this.nameTooltipEl.style.backgroundColor = 'black';
        this.nameTooltipEl.style.color = '#fff';
        this.nameTooltipEl.style.textAlign = 'center';
        this.nameTooltipEl.style.padding = '5px 0';
        this.nameTooltipEl.style.borderRadius = '6px';
        this.nameTooltipEl.style.zIndex = '9999';
        this.element.wrapper.appendChild(this.nameTooltipEl);
        this.nameEl.addEventListener("mouseover", (event) => {
            let rects = this.nameEl.getClientRects();
            this.nameTooltipEl.style.left = `${rects[0].left + 10}px`;
            this.nameTooltipEl.style.top = `${rects[0].top + rects[0].height}px`;
            this.nameTooltipEl.style.display = 'block';
            setTimeout(() => {
                this.nameTooltipEl.style.display = 'none';
            }, 1000);
        });
        this.nameEl.addEventListener("mouseout", (event) => {
            this.nameTooltipEl.style.display = 'none';
        });
    }

    async render() {
        await this.renderName();
        this.nameTooltipEl.innerHTML = this.name;
        await this.renderValue();
    }

    async renderName() {
        //console.log('is array', this.name, this.type);
        if (this.isArray(this.type)) {
            return this.renderNameForArray();
        }
        this.nameEl.innerText = this.name;
    }

    async renderNameForArray() {
        //console.log('renderNameForArray', this.name);
        let name = `<div>${this.name}</div>`;
        let addElement = document.createElement('div');
        addElement.style.textAlign = 'right';
        addElement.innerHTML = ' [+]';
        addElement.addEventListener('click', (e) => {
            this.propertyItemsAdd(e);
        });
        this.nameEl.innerHTML = name;
        this.nameEl.appendChild(addElement);
    }

    isArray() {
        return this.type === 'array';
    }

    async renderValue(value) {
        this.valueEl.innerHTML = value || this.value;
    }

    setValue(value) {
        this.value = value;
        this.refreshValue(value);
    }

    refreshValue(value) {
        if (value) {
            if (this.valueEl) {
                this.renderValue(value);
            }
        } else {
            if (this.valueEl) {
                this.valueEl.innerHTML = '';
            }
        }
    }

    deselect() {
        this.nameEl.classList.remove('name--selected');
        this.valueContainerEl.classList.remove('value-container--selected');
    }

    select() {
        this.nameEl.classList.add('name--selected');
        this.valueContainerEl.classList.add('value-container--selected');
    }

    getStyle() {
        return `
            .wrapper {                
                display: flex;
                flex-direction: row;
                background-color: white;  
                height: 1.5rem;              
            }
            
            .name {            
                position: relative;
                display: inline-flex;    
                border: 1px solid cornflowerblue;    
                padding: 3px;
                
                cursor: pointer;
                width: 45%;
                min-width: 45%;
                color: black;  
                
                flex-direction: row;
                justify-content: space-between; 
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap; 
                
                div {
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap; 
                    min-width: 3ch;              
                }
            }
            
            .name--selected{
                font-weight: bold;
            }
            
            .value-container {
                flex-grow: 1;                
                border: 1px solid cornflowerblue;
                display: flex;
                align-items: center;
                line-height: 1.5rem;
                overflow: hidden;
            }
            
            .value-container--selected {
                padding: 0px;
                border: 0px;
            }            
            
            .value {
                width: 100%;
                max-width: 100%;
                height: 100%;   
                color: cornflowerblue;         
            }
            
            .value *{
                width: 100%;
                max-width: 100%;
                height: 100%;
                border: 1px solid cornflowerblue;
            }
            
            .value *:focus{
                outline: none;
            }
        `;
    }

    isActive() {
        return this.active;
    }

    activate() {
        this.select();
        this.active = true;
        this.publish(this.constructor.EVENT_ACTIVATE, {property: this});
    }

    /**
     * Warning! Using from Parent component
     */
    deactivate() {
        this.deselect();
        this.active = false;
        this.valueEl.dispatchEvent(new Event('focusout'));
    }

    sendValueChanged() {
        this.sendChanged('value', {
            value: this.value,
            options: this.options,
        });
    }

    /**
     * Please override to init your input, select element
     */
    initField() {
        this.valueEl.innerHTML = '';
        this.valueEl.appendChild(this.fieldEl);
        this.fieldEl.focus();
    }

    onDeactivate() {
        if (!this.active) {
            return;
        }
        this.deactivate();
        let inputValue = this.getFieldValue();
        if (this.value !== inputValue) {
            this.setValue(inputValue);
            this.sendValueChanged();
        }
    }

    getFieldValue() {

    }

    /**
     * Use this for array process
     */
    propertyItemsAdd(event) {

    }
}

customElements.define(BestAppsObjectInspectorPropertyComponent.tag, BestAppsObjectInspectorPropertyComponent);