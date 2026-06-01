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

                }
            },
        });
        return properties;
    }
}

customElements.define(APLEditTextComponent.tag, APLEditTextComponent);