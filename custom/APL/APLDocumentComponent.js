class APLDocumentComponent extends APLComponent {
    static tag = 'apl-document-component';

    getStyle() {
        //let style = super.getStyle();
        let style = `
            :host {
                display: block;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;

            }
            .wrapper {
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                background-color: black;
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
                flex-shrink: 0;
                overflow: hidden;
                flex-basis: 100%;
            }
        `;
        return style;
    }

}

customElements.define(APLDocumentComponent.tag, APLDocumentComponent);