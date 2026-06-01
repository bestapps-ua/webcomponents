/**
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-edittext.html
 */
class APLEditTextComponent extends APLActionableComponent {
    static tag = 'apl-edit-text-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {
            text: {
                type: 'text',
                options: {

                }
            },
            color: {
                type: 'color',
                options: {
                    css: true,
                }
            },
        });
        return properties;
    }

    async initElements() {
        await super.initElements();
        this.inputEl = document.createElement('input');
        this.inputEl.type = 'text';
        this.inputEl.style.width = '100%';
        this.inputEl.style.height = '100%';
        this.inputEl.style.boxSizing = 'border-box';
        this.inputEl.style.border = 'none';
        this.inputEl.style.outline = 'none';
        this.element.wrapper.appendChild(this.inputEl);
    }

    getStyle() {
        let style = super.getStyle();
        style += `
            .wrapper {
                display: flex;
                align-items: center;
            }
        `;
        return style;
    }
}

customElements.define(APLEditTextComponent.tag, APLEditTextComponent);
registerAPLComponent('EditText', APLEditTextComponent);
