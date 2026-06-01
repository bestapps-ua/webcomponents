import { browser, expect } from '@wdio/globals';

describe('APL Commands', () => {
    before(async () => {
        await browser.url('/tests/fixtures/apl-commands.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 5000 },
        );
    });

    it('APLCommand should generate a uid', async () => {
        const uid = await browser.execute(() => new APLCommand().uid);
        expect(uid).toBeTruthy();
        expect(uid.length).toBe(12);
    });

    it('APLCommand should store base properties', async () => {
        const keys = await browser.execute(() => {
            return Object.keys(new APLCommand({ type: 'Test' }).getAll());
        });
        expect(keys).toContain('type');
        expect(keys).toContain('description');
        expect(keys).toContain('delay');
        expect(keys).toContain('when');
    });

    it('APLSendEventCommand should return separate arguments and components', async () => {
        const result = await browser.execute(() => {
            const cmd = new APLSendEventCommand({
                arguments: ['a', 'b'],
                components: ['comp1'],
            });
            return {
                args: cmd.arguments,
                comps: cmd.components,
                argsLen: cmd.arguments.length,
                compsLen: cmd.components.length,
            };
        });
        expect(result.argsLen).toBe(2);
        expect(result.compsLen).toBe(1);
        expect(result.args).toEqual(['a', 'b']);
        expect(result.comps).toEqual(['comp1']);
    });

    it('APLSetValueCommand should store componentId, property, value', async () => {
        const result = await browser.execute(() => {
            const cmd = new APLSetValueCommand({
                componentId: 'comp1',
                property: 'text',
                value: 'hello',
            });
            return {
                componentId: cmd.componentId,
                property: cmd.property,
                value: cmd.value,
                type: cmd.type,
            };
        });
        expect(result.componentId).toBe('comp1');
        expect(result.property).toBe('text');
        expect(result.value).toBe('hello');
        expect(result.type).toBe('SetValue');
    });
});
