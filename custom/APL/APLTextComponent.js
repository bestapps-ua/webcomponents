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
                    css: true,
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
                    css: true,
                }
            },
            lineHeight: {
                type: 'dimension',
                options: {
                    css: true,
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
                    css: true,
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
        return properties;
    }

    onCSSSet() {
        super.onCSSSet();
        let data = this.getAPLData();
        let screen = this.getFactory().getScreen();
        let div = this.element.wrapper.querySelector('div');
        if (data.height === 'auto' && div) {
            let fontSize = data.fontSize;
            if (fontSize.includes('dp')) {
                fontSize = parseFloat(fontSize) * screen.getDPSize();
            } else {
                fontSize = parseFloat(fontSize);
            }
            div.style.height = `${fontSize}px`;
            this.style.maxHeight = `${fontSize}px`;
        }
    }

    shouldCaptureClick() { return true; }

    renderContent() {
        const data = this.getAPLData();
        const div = document.createElement('div');
        div.textContent = data.text;
        this.element.wrapper.replaceChildren(div);
    }
}

customElements.define(APLTextComponent.tag, APLTextComponent);
registerAPLComponent('Text', APLTextComponent);