class AppYearMonthComponent extends BestAppsComponent {
    static tag = 'ba-app-year-month-component';

    async initProps() {
        await super.initProps();
        this.year = this.getAttribute("year") * 1;
        this.month = this.getAttribute("month");
    }

    async initElements() {
        await super.initElements();
        this.yearSelector = document.createElement('year-month-select-year-component');

        this.addEventListener('year-selected', this.onYearSelected);
        this.addEventListener('month-selected', this.onMonthSelected);

        this.yearSelector.setAttribute('year', this.year);
        this.yearSelector.hide();

        this.monthSelector = document.createElement('year-month-select-month-component');

        this.monthSelector.setAttribute('year', this.year);
        this.monthSelector.setAttribute('month', this.month);
        this.monthSelector.hide();

        this.input = document.createElement("input");
        this.input.type = 'text';
        this.input.className = 'year-month-input';
        this.input.readOnly = true;

        this.input.addEventListener('click', () => {
            if (this.yearSelector.isActive() || this.monthSelector.isActive()) {
                this.yearSelector.hide();
                this.monthSelector.hide();
            } else {
                this.yearSelector.activate(this.year);
            }

        });

        this._mouseUpHandler = (event) => {
            if (!(event.target.closest("ba-app-year-month-component"))) {
                this.yearSelector.hide();
                this.monthSelector.hide();
            }
        };
        window.addEventListener('mouseup', this._mouseUpHandler);

        this.element.wrapper.appendChild(this.input);
        this.element.wrapper.appendChild(this.yearSelector);
        this.element.wrapper.appendChild(this.monthSelector);
    }

    getStyle() {
        return `
            input {
               text-align: center;
            }    
        `;
    }

    onYearSelected(event) {
        this.year = event.detail.year;
        this.yearSelector.hide();
        this.monthSelector.activate(this.year, this.month);
    }

    async onMonthSelected(event) {
        this.year = event.detail.year;
        this.month = event.detail.month;
        this.monthSelector.hide();
        await this.render();
        await this.callWithEvent('processChanged', BestAppsComponent.EVENT_CHANGED, {
                type: 'monthSelected', data: {
                    year: this.getYear(),
                    month: this.getMonth(),
                }
            }
        );
    }

    async render() {
        await super.render();
        this.renderInput();
    }

    renderInput() {
        this.input.value = `${this.month} ${this.year}`;
    }

    getYear() {
        return this.year;
    }

    getMonth() {
        return this.month;
    }

    async processDisconnected() {
        window.removeEventListener('mouseup', this._mouseUpHandler);
    }

}

class AppYearMonthSelectComponent extends BestAppsComponent {

    static observedAttributes = [...this.defaultObservedAttributes, 'year', 'month'];

    constructor() {
        super();
    }

    // basic selector
    static tag = 'ba-year-month-component';

    initProps() {
        this.year = this.getAttribute("year") * 1;
    }

    isActive() {
        return this.style.display === 'block';
    }

    activate(year) {
        this.year = year;
        this.show();
        this.render();
    }

    hide() {
        this.style.display = 'none';
    }

    show() {
        this.style.display = 'block';
        this._positionToParent();
    }

    _positionToParent() {
        const root = this.getRootNode();
        const host = root?.host;
        if (!host) return;
        const rect = host.getBoundingClientRect();
        const wrapper = this.shadowRoot?.querySelector('.wrapper');
        if (!wrapper) return;
        wrapper.style.left = `${rect.left}px`;
        wrapper.style.visibility = 'hidden';
        wrapper.style.top = `${rect.bottom}px`;
        const popupRect = wrapper.getBoundingClientRect();
        if (popupRect.bottom > window.innerHeight) {
            wrapper.style.top = `${rect.top - popupRect.height}px`;
        }
        wrapper.style.visibility = '';
    }

    getStyle() {
        return `
            .wrapper {
                position: fixed;
                width: 200px;
                padding: 5px;
                background-color: rgb(233, 232, 236);
                border-radius: 10px;
                z-index: 9999;
            }
            .container {               
               position: relative;                
               display: flex;
               flex-wrap: wrap;
               
               align-content: center;
               justify-content: center;
            }
            .year-container {
                position: relative;
                width: 30%;
                text-align: center;
            }
            .year {
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .year:hover {
                background-color: rgb(217,216,219);
                border-radius: 999px;
                cursor: pointer;
            }
            .selected {
                background-color: rgb(0,92,187) !important;
                border-radius: 999px;
                color: white;
                font-weight: bold;
            }
            .header {
                width: 100%;
                display: flex;
                flex-direction: row;
                flex-wrap: nowrap;
                justify-content: space-around;
                padding-top: 5px;
                align-items: center;
            }
            .header-actions {
                display: flex;
                flex-direction: row;
                justify-content: space-around;
            }
            
            .header-action-container {
                //width: 30%;
               
                text-align: center;
            }
            
            .header-action-button {
                border: none;
                background-color: rgb(233, 232, 236);
                
                height: 30px;
                width: 30px;
            }
            .header-action-button:hover {
                background-color: rgb(217,216,219);
                border-radius: 999px;
            }
            
            hr {
                width: 95%;
            }
        `;
    }

    async initElements() {
        await super.initElements();
        this.container = document.createElement("div");
        this.container.setAttribute("class", "container");
        this.header = document.createElement("div");
        this.header.setAttribute('class', 'header');
        this.element.wrapper.appendChild(this.header);
        this.element.wrapper.appendChild(document.createElement("hr"));
        this.element.wrapper.appendChild(this.container);
    }

    renderActionButton(title, onCLick) {
        let container = document.createElement("div");
        container.setAttribute('class', 'header-action-container');
        let button = document.createElement("button");
        button.setAttribute('class', 'header-action-button');
        button.textContent = title;
        button.addEventListener('click', () => {
            onCLick();
        })
        container.appendChild(button);
        this.actions.appendChild(container);
    }
}

class AppYearMonthSelectYearComponent extends AppYearMonthSelectComponent {

    initProps() {
        super.initProps();
        this.yearStart = this.year - 4;
        this.yearEnd = this.year + 5;
    }

    initElements() {
        super.initElements();
    }

    getYears() {
        return this.numberRange(this.yearStart, this.yearEnd);
    }

    renderYears() {
        let years = this.getYears();
        this.container.innerHTML = '';
        for (const year of years) {
            let yearContainerEl = document.createElement("div");
            yearContainerEl.setAttribute("class", "year-container");
            let yearEl = document.createElement("div");
            yearEl.setAttribute("class", "year");
            if (this.year === year) {
                yearEl.classList.add("selected");
            }
            yearEl.innerHTML = year;
            yearContainerEl.appendChild(yearEl);
            yearContainerEl.addEventListener('click', () => {
                const myEvent = new CustomEvent('year-selected', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        year,
                    }
                });
                this.parentNode.dispatchEvent(myEvent);
            });
            this.container.appendChild(yearContainerEl);
        }
    }

    renderHeader() {
        this.header.innerHTML = '';
        let years = document.createElement("div");
        years.setAttribute('class', 'header-years');
        years.innerHTML = `${this.yearStart} - ${this.yearEnd - 1}`;
        this.header.appendChild(years);
        this.actions = document.createElement("div");
        this.actions.setAttribute('class', 'header-actions');
        this.renderActionButton('<', () => {
            [this.yearStart, this.yearEnd] = [this.yearStart - 8, this.yearStart + 1];
            this.renderHeader();
            this.renderYears();
        });
        this.renderActionButton('>', () => {
            [this.yearStart, this.yearEnd] = [this.yearEnd - 1, this.yearEnd + 8];
            this.renderHeader();
            this.renderYears();
        });
        this.header.appendChild(this.actions);
    }

    render() {
        this.renderHeader();
        this.renderYears();
    }

    numberRange(start, end) {
        return new Array(end - start).fill().map((d, i) => i + start);
    }
}

class AppYearMonthSelectMonthComponent extends AppYearMonthSelectComponent {

    initProps() {
        super.initProps()
        this.setMonth(this.getAttribute("month"));
    }

    setYear(year) {
        this.year = year;
        this.yearSelected = this.year;
    }

    setMonth(month) {
        this.month = month;
    }

    activate(year, month) {
        this.setYear(year);
        this.setMonth(month);
        this.render();
        this.show();
    }

    getStyle() {
        let style = super.getStyle();
        style += `            
            .month-container {
                position: relative;
                width: 30%;
                text-align: center;
            }
            .month {
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .month:hover {
                background-color: rgb(217,216,219);
                border-radius: 999px;
                cursor: pointer;
            }
        `;
        return style;
    }

    getMonths() {
        return [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec'
        ];
    }

    render() {
        this.renderHeader();
        this.renderMonths();
    }

    renderMonths() {
        let months = this.getMonths();
        this.container.innerHTML = '';
        for (const month of months) {
            let monthContainerEl = document.createElement("div");
            monthContainerEl.setAttribute("class", "month-container");
            let monthEl = document.createElement("div");
            monthEl.setAttribute("class", "month");
            if (this.month === month && this.year === this.yearSelected) {
                monthEl.classList.add("selected");
            }
            monthEl.innerHTML = month;
            monthContainerEl.appendChild(monthEl);
            monthContainerEl.addEventListener('click', () => {
                const myEvent = new CustomEvent('month-selected', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        month,
                        year: this.yearSelected,
                    }
                });
                this.parentNode.dispatchEvent(myEvent);
            });
            this.container.appendChild(monthContainerEl);
        }
    }

    renderHeader() {
        this.header.innerHTML = '';
        let year = document.createElement("div");
        year.setAttribute('class', 'header-years');
        year.innerHTML = `${this.yearSelected}`;
        this.header.appendChild(year);
        this.actions = document.createElement("div");
        this.actions.setAttribute('class', 'header-actions');
        this.renderActionButton('<', () => {
            this.yearSelected--;
            this.render();
        });
        this.renderActionButton('>', () => {
            this.yearSelected++;
            this.render();
        });
        this.header.appendChild(this.actions);
    }

}

customElements.define(AppYearMonthComponent.tag, AppYearMonthComponent);
customElements.define("year-month-select-year-component", AppYearMonthSelectYearComponent);
customElements.define("year-month-select-month-component", AppYearMonthSelectMonthComponent);

