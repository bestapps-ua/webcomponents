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
        let onCSSSet =  properties.onCSSSet;
        properties.onCSSSet = () => {
            if(onCSSSet) {
                onCSSSet();
            }
            let data = this.getAPLData();
            let scale = data.scale;
            let image = this.element.wrapper.querySelector('img');
            switch(scale) {
                case 'fill':
                    image.style.objectFit = 'fill';
                    break;
                case 'best-fill':
                    image.style.objectFit = 'cover';
                    break;
                case 'best-fit':
                    image.style.objectFit = 'contain';
                    break;
                case 'best-fit-down':
                    image.style.objectFit = 'scale-down';
                    break;
                case 'none':
                    image.style.objectFit = 'none';
                    break;
            }
        };
        return properties;
    }

    async initElements() {
        await super.initElements();

    }
}

customElements.define(APLImageComponent.tag, APLImageComponent);