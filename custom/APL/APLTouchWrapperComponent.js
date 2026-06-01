/**
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-touchwrapper.html
 */
class APLTouchWrapperComponent extends APLTouchableComponent {
    static tag = 'apl-touch-wrapper-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {

        });
        properties = Object.assign(APLProperties.getContainerProperties(), properties);
        properties = Object.assign(APLProperties.getAlignmentAndPositioningProperties(), properties);
        return properties;
    }

    onCSSSet() {
        super.onCSSSet();
        let data = this.getAPLData();
        let width = data.width;
        let minWidth = data.minWidth;
        let maxWidth = data.maxWidth;
        let minHeight = data.minHeight;
        let height = data.height;
        let maxHeight = data.maxHeight;
        if (width) {
            if (!minWidth) this.style.minWidth = `${width}`;
            if (!maxWidth) this.style.maxWidth = `${width}`;
        }
        if (height) {
            if (!minHeight) this.style.minHeight = `${height}`;
            if (!maxHeight) this.style.maxHeight = `${height}`;
        }
    }
}

customElements.define(APLTouchWrapperComponent.tag, APLTouchWrapperComponent);
