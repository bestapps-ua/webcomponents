class BestAppsObjectInspectorTabComponent extends BestAppsComponent {

    static EVENT_PROPERTY_CHANGED = 'property.changed';

    tabName;

    setTabName(tabName) {
        this.tabName = tabName;
    }

    getTabName(){
        return this.tabName;
    }

    async initElements() {
        await super.initElements();
        this.addEventListener('x-' +this.constructor.EVENT_UPDATE, (e) => {
            this.update(e.detail);
        });
    }

    async processOptions(options) {
        let opts = await super.processOptions(options);
        this.setTabName(opts.tabName);
        return opts;
    }

    async sendPropertyChanged(data) {
        const type = this.constructor.EVENT_PROPERTY_CHANGED;
        await this.callWithEvent('processChanged', this.constructor.EVENT_CHANGED, {
            type,
            data,
        });
        await this.callWithEvent('processPropertyChanged', type, {
            type,
            data,
        });
    }

    async processPropertyChanged(type, data){

    }

    async update(data){
        await super.update(data);
    }
}