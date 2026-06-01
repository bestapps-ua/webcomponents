class APLFrameComponent extends APLComponent {
    static tag = 'apl-frame-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {
            background: {
                type: 'color',
                options: {
                    css: true,
                }
            },
            backgroundColor: {
                type: 'color',
                options: {
                    css: true,
                }
            },
            borderColor: {
                type: 'color',
                options: {
                    css: true,
                }
            },
            borderRadius: {
                type: 'dimension',
                options: {
                    css: true,
                }
            },
            borderWidth: {
                type: 'dimension',
                options: {}
            },
        });

        properties = Object.assign(APLProperties.getContainerProperties(), properties);
        properties = Object.assign(APLProperties.getAlignmentAndPositioningProperties(), properties);
        let onCSSSet =  properties.onCSSSet;
        properties.onCSSSet = () => {
            if(onCSSSet) {
                onCSSSet();
            }
            let data = this.getAPLData();
            let borderWidth = data.borderWidth;
            if (borderWidth === `${parseFloat(borderWidth)}`) {
                this.style.borderWidth = `${parseFloat(borderWidth)}px`;
                this.style.borderStyle = `solid`;
            }
        };

        return properties;
    }
}

customElements.define(APLFrameComponent.tag, APLFrameComponent);