class APLConfirmDialogComponent extends APLDialogComponent {
    static tag = 'apl-confirm-dialog-component';

    getStyle() {
        let style = super.getStyle();
        style += `
            .wrapper {
                width: 200px;
                height: auto;
            }
        `;
        return style;
    }

    async initActionsButtons() {
        await super.initActionsButtons();
        let confirmButton = document.createElement('input');
        confirmButton.type = 'button';
        confirmButton.value = 'Confirm';
        confirmButton.classList.add('btn', 'confirmBtn');
        confirmButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.doConfirm();
        });
        this.element.buttons.push(confirmButton);
        this.element.actions.appendChild(confirmButton);
    }

    doConfirm() {
        this.onConfirm();
        this.doSuccess();
    }

    onConfirm() {

    }
}

customElements.define(APLConfirmDialogComponent.tag, APLConfirmDialogComponent);