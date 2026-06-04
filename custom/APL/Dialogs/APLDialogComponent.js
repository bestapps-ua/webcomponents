class APLDialogComponent extends APLComponent {
    static tag = 'apl-dialog-component';

    loaded;

    getStyle() {
        return `
             :host {
                display: block;
            }

            dialog {
                padding: 0;
                border: none;
                background: transparent;
                max-width: 100vw;
                max-height: 100vh;
                width: 100vw;
                height: 100vh;
                margin: 0;
            }

            dialog::backdrop {
                background-color: rgba(0,0,0,0.4);
            }

            .wrapper {
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 50%;
                height: calc(100vh / 2);
                display: flex;
                flex-direction: column;

            }

            .content {
                width: 100%;
                height: 100%;
            }

            .actions {
                width: 100%;
                height: 50px;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: flex-end;

                .btn {
                    margin-right: 5px;
                }
            }


        `;
    }

    async initElements() {
        await super.initElements();

        this.dialogElement = document.createElement('dialog');
        this.element.shadow.appendChild(this.dialogElement);
        this.dialogElement.appendChild(this.element.wrapper);

        this.dialogElement.addEventListener('click', (e) => {
            if (e.target === this.dialogElement) this.hide();
        });

        this.element.wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        this.dialogElement.addEventListener('cancel', (e) => {
            e.preventDefault();
            this.hide();
        });

        await this.onAfterRefresh();

        await this.initContent();
        await this.initActions();

    }

    async initContent() {
        let content = document.createElement('div');
        content.classList.add('content');
        content.setAttribute('part', 'content');
        this.element.content = content;
        this.element.wrapper.appendChild(content);
    }

    async initActions() {
        let actions = document.createElement('div');
        actions.classList.add('actions');
        actions.setAttribute('part', 'actions');
        this.element.actions = actions;
        this.element.wrapper.appendChild(actions);
        await this.initActionsButtons();
    }

    async initActionsButtons() {
        let buttons = [];
        let closeButton = document.createElement('input');
        closeButton.type = 'button';
        closeButton.value = 'Close';
        closeButton.classList.add('btn', 'closeBtn');
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.doClose();
        });
        buttons.push(closeButton);
        this.element.actions.appendChild(closeButton);
        this.element.buttons = buttons;
    }

    async show(data = {}) {
        await this.loadedDefer.promise;
        this.element.content.textContent = data.content || 'Dialog';
        this.classList.add('active');
        this.dialogElement.showModal();
    }

    hide() {
        this.doClose();
    }

    doClose() {
        this.onClose();
        this.doDone();
    }

    onClose() {

    }

    doDone() {
        this.classList.remove('active');
        if (this.dialogElement.open) {
            this.dialogElement.close();
        }
        this.onDone();
    }

    onDone() {

    }

    doSuccess() {
        this.onSuccess();
        this.doDone();
    }

    onSuccess() {

    }

    async render() {

    }
}

customElements.define(APLDialogComponent.tag, APLDialogComponent);
