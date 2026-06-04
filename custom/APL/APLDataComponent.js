class APLDataComponent extends BestAppsComponent {
    static tag = 'apl-data-component';

    static EVENT_DOCUMENT_CHANGED = 'event.document.changed';

    aplDocument;

    /**
     * @property {JSONEditor} jsoneditor
     */
    jsoneditor;

    async initElements() {
        await super.initElements();
        const slot = document.createElement('slot');
        this.element.wrapper.appendChild(slot);

        this.editorDiv = document.createElement('div');
        this.editorDiv.style.width = '100%';
        this.editorDiv.style.height = '100%';
        this.appendChild(this.editorDiv);
    }

    initJSONEditor() {
        this.jsoneditor = new JSONEditor(this.editorDiv, {
            mode: 'code',
            indentation: 2,
            onChangeText: (jsonString) => {
                try {
                    const json = JSON.parse(jsonString);
                    this.sendChanged('document', {
                        type: this.constructor.EVENT_DOCUMENT_CHANGED,
                        json,
                    });
                } catch (e) {
                }
            },
        });
    }

    setDocument(doc) {
        this.aplDocument = doc;
        if (!this.jsoneditor) {
            this.initJSONEditor();
        }
        this.jsoneditor.set(doc);
    }

    refresh() {
        if (this.aplDocument && this.jsoneditor) {
            this.jsoneditor.set(this.aplDocument);
        }
    }

    getStyle() {
        return `
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
            .wrapper {
                width: 100%;
                height: 100%;
            }
        `;
    }
}

customElements.define(APLDataComponent.tag, APLDataComponent);
