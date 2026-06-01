class APLContainerComponent extends APLMultiChildComponent {
    static tag = 'apl-container-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {
            alignItems: {
                type: 'list',
                items: [
                    'stretch',
                    'center',
                    'start',
                    'end',
                    'baseline',
                ],
                default: 'stretch',
                options: {
                    css: true,
                    wrapper: true,
                }
            },
            direction: {
                type: 'list',
                items: [
                    'column',
                    'row',
                    {'column-reverse': 'columnReverse'},
                    {'row-reverse': 'rowReverse'},
                ],
                default: 'column',
                options: {
                    css: 'flexDirection',
                    wrapper: true,
                }
            },
            wrap: {
                type: 'list',
                items: [
                    {'nowrap': 'noWrap'},
                    'wrap',
                    {'wrap-reverse': 'wrapReverse'},
                ],
                default: 'noWrap',
                options: {
                    css: 'flexWrap',
                    wrapper: true,
                }
            },
            justifyContent: {
                type: 'list',
                items: [
                    'start',
                    'end',
                    'center',
                    {'space-between': 'spaceBetween'},
                    {'space-around': 'spaceAround'},
                    {'space-evenly': 'spaceEvenly'},
                ],
                default: 'start',
                options: {
                    wrapper: true,
                    css: true,
                }
            },
            shadowColor: {
                type: 'color',
                options: {

                }
            }
        });
        return properties;
    }
}

customElements.define(APLContainerComponent.tag, APLContainerComponent);