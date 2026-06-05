import { browser } from '@wdio/globals';
import { ComponentFixture } from './ComponentFixture';

export class AppYearMonthFixture extends ComponentFixture {
    async getYear(): Promise<number> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getYear();
        }, this.selector);
    }

    async getMonth(): Promise<string> {
        return browser.execute((sel: string) => {
            return (document.querySelector(sel) as any).getMonth();
        }, this.selector);
    }

    async getSelectorDisplay(component: string): Promise<string> {
        return browser.execute((sel: string, comp: string) => {
            const el = document.querySelector(sel) as any;
            return el.element.shadow.querySelector(comp).style.display;
        }, this.selector, component);
    }

    async shadowInput() {
        const el = await this.el();
        return el.shadow$('input.year-month-input');
    }

    async clickInput(): Promise<void> {
        const input = await this.shadowInput();
        await input.click();
    }

    async getInputValue(): Promise<string> {
        const input = await this.shadowInput();
        return input.getValue();
    }

    async isInputReadOnly(): Promise<boolean> {
        const input = await this.shadowInput();
        return (await input.getAttribute('readonly')) !== null;
    }
}
