/**
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-actionable-component.html
 */
class APLActionableComponent extends APLComponent {
    static tag = 'apl-actionable-component';

    APLEvents = {
        onFocus: {
            type: 'commands',
            options: {
            }
        },
        onBlur: {
            type: 'commands',
            options: {
            }
        },
        handleKeyDown: {
            type: 'commands',
            options: {
            }
        },
        handleKeyUp: {
            type: 'commands',
            options: {
            }
        },
    };

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {

        });
        return properties;
    }
}