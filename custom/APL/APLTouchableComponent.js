/**
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-touchable-component.html
 */
class APLTouchableComponent extends APLActionableComponent {
    static tag = 'apl-touchable-component';


    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {

        });
        return properties;
    }

    getAPLEvents() {
        let events = super.getAPLEvents();
        events = Object.assign(events, {
            gesture: {
                type: 'commands',
                options: {
                }
            },
            gestures: {
                type: 'commands',
                options: {
                }
            },
            onCancel: {
                type: 'commands',
                options: {
                }
            },
            onDown: {
                type: 'commands',
                options: {
                }
            },
            onMove: {
                type: 'commands',
                options: {
                }
            },
            onPress: {
                type: 'commands',
                options: {
                }
            },
            onUp: {
                type: 'commands',
                options: {
                }
            },
        });
        return events;
    }
}