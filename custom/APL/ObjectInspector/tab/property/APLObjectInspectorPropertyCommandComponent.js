class APLObjectInspectorPropertyCommandComponent extends BestAppsObjectInspectorPropertyComponent {
    static tag = 'apl-object-inspector-property-command-component';

    commands = [];

    /**
     * @property {APLCommandPropertiesComponent} commandContainer;
     */
    commandContainer;

    /**
     * @property {APLCommand} command
     */
    command;

    /**
     * @property {APLObjectInspectorEventsTabComponent} tab
     */
    tab;


    static EVENT_COMMAND_EVENT_REMOVED = 'command.event.removed';
    static EVENT_COMMAND_EVENT_ADDED = 'command.event.added';
    static EVENT_COMMAND_EVENT_SAVED = 'command.event.saved';

    async processOptions(options) {
        options = await super.processOptions(options);
        this.tab = options.tab;
        this.name = options.name;
        let values = options.data.value || [];
        for (const commandData of values) {
            let command = this.initCommand(commandData);
            this.commands.push(command);
        }
        return options;
    }

    renderCommands() {
        this.valueEl.innerHTML = '';
        //console.log(this.commands);
        for (const command of this.commands) {
            this.renderCommand(command);
        }
    }

    getStyle() {
        let style = super.getStyle();
        style += `
            .value {
                display: flex;
                flex-direction: column;
                cursor: pointer;
            }
            
            .wrapper {
                height: auto;
            }
            
            .command {
                display: inline-flex;
                flex-direction: row;
                
                .remove {
                    width: 3ch;
                }
            }
            .command--selected {
                border: 1px solid black;
                color: black;
                font-weight: bold;
            }
            
            .command-container {
                position: absolute;
                width: 200px;
                max-height: 300px;
                overflow: auto;
                background-color: white;
                z-index: 2;
                top: 0px;
                left: 0px;
            }
        `;
        return style;
    }

    renderCommand(command) {
        let contentEl = document.createElement('div');
        contentEl.innerHTML = `${command.type}`;
        let minusEl = document.createElement('div');
        minusEl.classList.add('remove');
        minusEl.innerHTML = '<div>[-]</div>';
        let commandEl = document.createElement('div');
        minusEl.addEventListener('click', (e) => {

            e.stopPropagation();
            e.preventDefault();
            this.dialog = document.createElement(APLConfirmDialogComponent.tag);
            this.element.wrapper.appendChild(this.dialog);
            this.dialog.show({
                content: `Are you sure you want to delete command ${command.type}?`,
            });
            this.dialog.onSuccess = () => {
                this.valueEl.removeChild(commandEl);
                this.removeCommand(command);
                this.tab.sendPropertyChanged({
                    tabName: this.tab.options.tabName,
                    key: this.name,
                    type: this.constructor.EVENT_COMMAND_EVENT_REMOVED,
                    data: {
                        command
                    }
                });
            }
            console.log(this.dialog);


        });


        commandEl.setAttribute('part', 'command');
        commandEl.classList.add('command');
        commandEl.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.removeCommandContainer();
            this.deactivate();
            this.onCommandFocus(command, commandEl);
        });
        commandEl.appendChild(contentEl);
        commandEl.appendChild(minusEl);
        this.valueEl.appendChild(commandEl);
    }

    /**
     *
     * @param commandData
     * @returns APLCommand
     */
    initCommand(commandData) {
        let command = new APLCommand(commandData);
        switch (commandData.type) {
            case "SendEvent":
                command = new APLSendEventCommand(commandData);
                break;
            case "SetValue":
                command = new APLSetValueCommand(commandData);
                break;
        }
        return command;
    }

    addCommand(commandData) {
        let command = this.initCommand(commandData);
        this.commands.push(command);
        this.renderCommand(command);
    }

    removeCommand(command) {
        for (let i = 0; i < this.commands.length; i++) {
            if (this.commands[i] === command) {
                this.deactivate();
                this.commands.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    initValue() {
        super.initValue();
        this.renderCommands();
    }

    refreshValue(value) {

    }

    async renderValue() {
        this.renderCommands();
    }

    initField() {

    }

    onValueFocus() {
        if (this.active) {
            return;
        }
        this.tab.onCommandOpen(this);
        this.activate();
        if (this.commands.length === 0) {
            this.showCommand();
        }
    }

    onCommandFocus(command, commandEl) {
        this.tab.onCommandOpen(this);
        this.commandsUnselect();
        this.showCommand(command, commandEl);
    }

    deactivate() {
        super.deactivate();
        this.commandsUnselect();
    }

    commandsUnselect() {
        let commandElements = this.valueEl.getElementsByClassName('command');
        for (const commandElement of commandElements) {
            commandElement.classList.remove('command--selected');
        }
    }

    /**
     *
     * @param {APLCommand} command
     * @param commandEl
     */
    showCommand(command = undefined, commandEl = undefined) {
        //console.trace();
        let isNew = typeof command === 'undefined';
        command = command || new APLSendEventCommand();
        if (commandEl && commandEl.classList) {
            commandEl.classList.add('command--selected');
        }
        this.command = command;
        this.showProperties(command, isNew);
    }

    showProperties(command, isNew = false) {
        //console.trace();
        this.removeCommandContainer();
        if (this.command.type === command.type) {
            command = this.command;
        }
        this.commandContainer = document.createElement(APLCommandPropertiesComponent.tag);
        this.commandContainer.isNew = isNew;
        let rect = this.getBoundingClientRect();
        this.commandContainer.style.top = `${rect.top + rect.height}px`;
        this.commandContainer.style.left = `${rect.left}px`;
        let props = command.getAll();
        let keys = Object.keys(props);
        let properties = {};
        for (const key of keys) {
            let value = command[key];
            if (key === 'type') {
                continue;
            }

            properties[key] = {
                type: props[key].type,
                default: value,
            }
        }

        //console.log(JSON.stringify(properties));
        props = command.getOther();
        keys = Object.keys(props);
        for (const key of keys) {
            if(properties[key]) continue;
            properties[key] = {
                type: props[key].type,
                default: command[key],
            }
        }

        this.commandContainer.setOptions({
            properties: APLProperties.decode(properties),
            type: command['type'],
        });

        this.commandContainer.classList.add('command-container');
        this.commandContainer.setAttribute('part', 'command-container');
        this.element.wrapper.appendChild(this.commandContainer);
        this.commandContainer.subscribe(APLCommandPropertiesComponent.EVENT_PROPERTY_CHANGED, (data) => {
            if (data.data.key === 'type') {
                let command = this.initCommand({type: data.data.data.value});
                this.showProperties(command, isNew);
            }
        });

        this.commandContainer.subscribe(APLCommandPropertiesComponent.EVENT_ACTION_CLOSE, () => {
            this.removeCommandContainer();
            this.deactivate();
        });

        this.commandContainer.subscribe(APLCommandPropertiesComponent.EVENT_ACTION_SAVE, (data) => {
            let isChangedCommand = this.command.uid !== command.uid;
            let cmd = isChangedCommand ? command : this.command;
            for (const key in data.properties) {
                let property = data.properties[key];
                cmd[property.name] = property.value;
            }
            console.log(this.commandContainer.isNew);
            if (this.commandContainer.isNew) {
                this.commands.push(cmd);
                this.tab.sendPropertyChanged({
                    tabName: this.tab.options.tabName,
                    key: this.name,
                    type: this.constructor.EVENT_COMMAND_EVENT_ADDED,
                    data: {
                        command: this.command,
                        commandCurrent: cmd,
                    }
                });
            } else {
                this.tab.sendPropertyChanged({
                    tabName: this.tab.options.tabName,
                    key: this.name,
                    type: this.constructor.EVENT_COMMAND_EVENT_SAVED,
                    data: {
                        command: this.command,
                        commandCurrent: command,
                    }
                });
                if (isChangedCommand) {
                    for (let i = 0; i < this.commands.length; i++) {
                        if (this.command.uid === this.commands[i].uid) {
                            this.commands[i] = cmd;
                        }
                    }
                }
            }
            this.removeCommandContainer();
            this.deactivate();
            console.log('RENDER COMMANDS');
            this.renderCommands();
        });
    }

    removeCommandContainer() {
        if (this.commandContainer) {
            this.element.wrapper.removeChild(this.commandContainer);
        }
        this.commandContainer = undefined;
    }

    isArray() {
        let isArr = super.isArray();
        if (isArr) {
            return isArr;
        }
        return this.type === 'commands';
    }

    propertyItemsAdd(event) {
        this.tab.onCommandOpen(this);
        this.showCommand(undefined, true);
    }

}

customElements.define(APLObjectInspectorPropertyCommandComponent.tag, APLObjectInspectorPropertyCommandComponent);