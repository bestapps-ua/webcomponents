/**
 * https://developer.amazon.com/en-US/docs/alexa/alexa-presentation-language/apl-scrollview.html
 */
class APLScrollViewComponent extends APLActionableComponent {
    static tag = 'apl-scroll-view-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {

        });
        return properties;
    }

    getStyle() {
        let style = super.getStyle();
        style += `
            .wrapper {
                overflow: auto;
            }
        `;
        return style;
    }
}

customElements.define(APLScrollViewComponent.tag, APLScrollViewComponent);
