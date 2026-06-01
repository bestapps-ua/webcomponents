class APLDialogComponent extends APLComponent {
    static tag = 'apl-dialog-component';

    loaded;

    getStyle() {
        return `
             :host {
                display: none; /* Hidden by default */
                position: fixed; /* Stay in place */
                z-index: 999; /* Sit on top */
                left: 0;
                top: 0;
                width: 100%; /* Full width */
                height: 100%; /* Full height */
                overflow: auto; /* Enable scroll if needed */
                background-color: rgb(0,0,0); /* Fallback color */
                background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
            }
            
            :host(.active) {
                display: block;
            }
            
            .wrapper {
                background-color: #fefefe;
                margin: 15% auto; /* 15% from the top and centered */
                padding: 20px;
                border: 1px solid #888;
                width: 50%; /* Could be more or less, depending on screen size */
                height: calc(100vh / 2); /* Could be more or less, depending on screen size */
                display: flex;
                flex-direction: column;
                
            }
            
            .content {
                //background-color: black;
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
        this.addEventListener('click', (e) => {
            this.hide();
        });

        this.element.wrapper.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        this._escHandler = (e) => {
            if (e.key === 'Escape' && this.classList.contains('active')) {
                this.hide();
            }
        };
        document.addEventListener('keydown', this._escHandler);

        this.onAfterRefresh()

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