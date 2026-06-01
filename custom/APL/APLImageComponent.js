class APLImageComponent extends APLComponent {
    static tag = 'apl-image-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {
            align: {
                type: 'text',
                options: {
                    css: true,
                }
            },
            borderRadius: {
                type: 'text',
                options: {
                    css: true,
                }
            },
            source: {
                type: 'text',
                options: {

                }
            },
            sources: {
                type: 'text',
                options: {

                }
            },
            scale: {
                type: 'list',
                items: [
                    'fill',
                    'best-fill',
                    'best-fit',
                    'best-fit-down',
                    'none',
                ],
                default: 'best-fit',
                options: {

                }
            },
        });
        properties = Object.assign(APLProperties.getContainerProperties(), properties);
        properties = Object.assign(APLProperties.getAlignmentAndPositioningProperties(), properties);
        return properties;
    }

    onCSSSet() {
        super.onCSSSet();
        let data = this.getAPLData();
        let scale = data.scale;
        let image = this.element.wrapper.querySelector('img');
        if (!image) return;
        const scaleMap = {
            'fill': 'fill', 'best-fill': 'cover', 'best-fit': 'contain',
            'best-fit-down': 'scale-down', 'none': 'none',
        };
        if (scaleMap[scale]) image.style.objectFit = scaleMap[scale];
    }

    async initElements() {
        await super.initElements();
    }
}

customElements.define(APLImageComponent.tag, APLImageComponent);