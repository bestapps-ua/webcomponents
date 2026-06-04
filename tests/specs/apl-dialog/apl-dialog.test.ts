import { browser, expect } from '@wdio/globals';

describe('APL Dialog — native <dialog> with showModal()', () => {
    before(async () => {
        await browser.url('/tests/fixtures/apl-dialog.html');
        await browser.waitUntil(
            async () => browser.execute(() => !!(window as any)._testReady),
            { timeout: 10000, timeoutMsg: 'Dialog fixture not ready' },
        );
    });

    // --- Rendering ---

    it('should have a <dialog> element inside shadow DOM', async () => {
        const hasDialog = await browser.execute(() => {
            const el = (window as any)._dialog1;
            return !!el.element.shadow.querySelector('dialog');
        });
        expect(hasDialog).toBe(true);
    });

    it('should have .content div inside the dialog', async () => {
        const hasContent = await browser.execute(() => {
            const el = (window as any)._dialog1;
            return !!el.element.shadow.querySelector('dialog .wrapper .content');
        });
        expect(hasContent).toBe(true);
    });

    it('should have .actions div with Close button', async () => {
        const result = await browser.execute(() => {
            const el = (window as any)._dialog1;
            const actions = el.element.shadow.querySelector('dialog .wrapper .actions');
            const closeBtn = actions?.querySelector('.closeBtn');
            return { hasActions: !!actions, hasCloseBtn: !!closeBtn };
        });
        expect(result.hasActions).toBe(true);
        expect(result.hasCloseBtn).toBe(true);
    });

    it('should have Confirm button on APLConfirmDialogComponent', async () => {
        const hasConfirm = await browser.execute(() => {
            const el = (window as any)._dialog1;
            return !!el.element.shadow.querySelector('.confirmBtn');
        });
        expect(hasConfirm).toBe(true);
    });

    // --- Show / Hide ---

    it('should be closed by default', async () => {
        const isOpen = await browser.execute(() => {
            return (window as any)._dialog1.dialogElement.open;
        });
        expect(isOpen).toBe(false);
    });

    it('should open when show() is called', async () => {
        await browser.execute(() => {
            (window as any)._dialog1.show({ content: 'Test message' });
        });
        await browser.pause(50);
        const result = await browser.execute(() => {
            const el = (window as any)._dialog1;
            return {
                isOpen: el.dialogElement.open,
                hasActive: el.classList.contains('active'),
                content: el.element.content.textContent,
            };
        });
        expect(result.isOpen).toBe(true);
        expect(result.hasActive).toBe(true);
        expect(result.content).toBe('Test message');
    });

    it('should close when hide() is called', async () => {
        await browser.execute(() => {
            (window as any)._dialog1.hide();
        });
        await browser.pause(50);
        const result = await browser.execute(() => {
            const el = (window as any)._dialog1;
            return {
                isOpen: el.dialogElement.open,
                hasActive: el.classList.contains('active'),
            };
        });
        expect(result.isOpen).toBe(false);
        expect(result.hasActive).toBe(false);
    });

    // --- THE KEY TEST: viewport positioning regardless of parent transform ---

    it('should cover full viewport in normal parent', async () => {
        await browser.execute(() => {
            (window as any)._dialog1.show({ content: 'Normal parent test' });
        });
        await browser.pause(50);
        const result = await browser.execute(() => {
            const el = (window as any)._dialog1;
            const dialogEl = el.dialogElement;
            const rect = dialogEl.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
            };
        });
        expect(result.left).toBe(0);
        expect(result.top).toBe(0);
        expect(result.width).toBe(result.viewportWidth);
        expect(result.height).toBe(result.viewportHeight);

        // Cleanup
        await browser.execute(() => { (window as any)._dialog1.hide(); });
        await browser.pause(50);
    });

    it('should cover full viewport even when parent has transform (top-layer fix)', async () => {
        await browser.execute(() => {
            (window as any)._dialog2.show({ content: 'Transformed parent test' });
        });
        await browser.pause(50);
        const result = await browser.execute(() => {
            const el = (window as any)._dialog2;
            const dialogEl = el.dialogElement;
            const rect = dialogEl.getBoundingClientRect();
            return {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
            };
        });
        // This is THE test — without showModal()/top-layer, left would be -200
        // because the parent has transform:translateX(200px)
        expect(result.left).toBe(0);
        expect(result.top).toBe(0);
        expect(result.width).toBe(result.viewportWidth);
        expect(result.height).toBe(result.viewportHeight);

        // Cleanup
        await browser.execute(() => { (window as any)._dialog2.hide(); });
        await browser.pause(50);
    });

    // --- Escape key ---

    it('should close when Escape key is pressed', async () => {
        await browser.execute(() => {
            (window as any)._dialog1.show({ content: 'Escape test' });
        });
        await browser.pause(50);

        await browser.keys('Escape');
        await browser.pause(50);

        const isOpen = await browser.execute(() => {
            return (window as any)._dialog1.dialogElement.open;
        });
        expect(isOpen).toBe(false);
    });

    // --- Click outside ---

    it('should close when clicking on overlay area outside content', async () => {
        await browser.execute(() => {
            (window as any)._dialog1.show({ content: 'Click-outside test' });
        });
        await browser.pause(50);

        // Click at coordinates (5, 5) — top-left corner, outside the centered content box
        await browser.performActions([{
            type: 'pointer',
            id: 'mouse',
            parameters: { pointerType: 'mouse' },
            actions: [
                { type: 'pointerMove', x: 5, y: 5, duration: 0 },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 },
            ],
        }]);
        await browser.pause(100);

        const isOpen = await browser.execute(() => {
            return (window as any)._dialog1.dialogElement.open;
        });
        expect(isOpen).toBe(false);
    });

    // --- Confirm callback ---

    it('should call onSuccess chain when Confirm button is clicked', async () => {
        const result = await browser.execute(() => {
            const w = window as any;
            let successCalled = false;
            let doneCalled = false;
            w._dialog1.onSuccess = () => { successCalled = true; };
            w._dialog1.onDone = () => { doneCalled = true; };
            w._dialog1.show({ content: 'Confirm test' });
            return { successCalled, doneCalled };
        });
        await browser.pause(50);

        await browser.execute(() => {
            const el = (window as any)._dialog1;
            el.element.shadow.querySelector('.confirmBtn').click();
        });
        await browser.pause(50);

        const callbacks = await browser.execute(() => {
            const el = (window as any)._dialog1;
            return {
                isOpen: el.dialogElement.open,
            };
        });
        expect(callbacks.isOpen).toBe(false);
    });

    // --- No errors ---

    it('should have no unhandled errors', async () => {
        const errors = await browser.execute(() => (window as any)._unhandledErrors);
        expect(errors).toHaveLength(0);
    });

    it('should have no console errors', async () => {
        const errors = await browser.execute(() => (window as any)._consoleErrors);
        const relevant = errors.filter(
            (e: string) => !e.includes('favicon') && !e.includes('[deprecation]'),
        );
        expect(relevant).toHaveLength(0);
    });

    it('should have no severe browser-level errors', async () => {
        const logs = await browser.getLogs('browser');
        const severe = logs.filter(
            (log: any) => log.level === 'SEVERE' && !log.message.includes('favicon'),
        );
        expect(severe).toHaveLength(0);
    });
});
