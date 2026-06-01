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
        return properties;
    }

    onCSSSet() {
        super.onCSSSet();
        let data = this.getAPLData();
        let borderWidth = data.borderWidth;
        if (borderWidth) {
            let bw = this.getFactory()?.getScreen()?.getSizePixels(borderWidth) || borderWidth;
            if (!isNaN(parseFloat(bw)) && !`${bw}`.includes('px')) {
                bw = `${parseFloat(bw)}px`;
            }
            this.style.borderWidth = bw;
            this.style.borderStyle = 'solid';
        }
    }
}

customElements.define(APLFrameComponent.tag, APLFrameComponent);