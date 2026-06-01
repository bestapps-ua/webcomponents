class APLTextComponent extends APLComponent {
    static tag = 'apl-text-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {
            color: {
                type: 'text',
                options: {
                    css: true,
                }
            },
            fontFamily: {
                type: 'text',
                options: {
                    css: true,
                }
            },
            fontSize: {
                type: 'dimension',
                options: {
                    css: true,
                }
            },
            fontStyle: {
                type: 'text',
                options: {

                }
            },
            fontWeight: {
                type: 'text',
                options: {
                    css: true,
                }
            },
            letterSpacing: {
                type: 'text',
                options: {

                }
            },
            lineHeight: {
                type: 'dimension',
                options: {

                }
            },
            maxLines: {
                type: 'text',
                options: {

                }
            },
            text: {
                type: 'text',
                options: {

                }
            },
            textAlign: {
                type: 'text',
                options: {

                }
            },
            textAlignVertical: {
                type: 'text',
                options: {

                }
            },
        });
        properties = Object.assign(APLProperties.getContainerProperties(), properties);
        properties = Object.assign(APLProperties.getAlignmentAndPositioningProperties(), properties);
        let onCSSSet = properties.onCSSSet;
        properties.onCSSSet = () => {
            if (onCSSSet) onCSSSet();
            let data = this.getAPLData();
            let screen = this.getFactory().getScreen();
            let div = this.element.wrapper.querySelector('div');
            if(data.height === 'auto') {
                let fontSize = data.fontSize;
                if(fontSize.includes('dp')) {
                    fontSize = parseFloat(fontSize) * screen.getDPSize();
                }else{
                    fontSize = parseFloat(fontSize);
                }
                div.style.height = `${fontSize}px`;
                //this.element.wrapper.style.height = `${fontSize}px`;
                //this.element.wrapper.style.flexDirection = `row`;
                //this.element.wrapper.style.alignItems = `center`;
                this.style.maxHeight = `${fontSize}px`;
            }

            if(data.width === 'auto') {
                //this.element.wrapper.style.width = `${data.text.length}ch`;
            }
        }
        return properties;
    }
}

customElements.define(APLTextComponent.tag, APLTextComponent);