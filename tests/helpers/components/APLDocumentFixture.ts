import { ComponentFixture } from './ComponentFixture';

export class APLDocumentFixture extends ComponentFixture {
    testDocument() {
        this.testRenders();
        it('should have black background on wrapper', async () => {
            expect(await this.wrapperStyle('backgroundColor')).toBe('rgb(0, 0, 0)');
        });
        it('should have flex column layout on wrapper', async () => {
            expect(await this.wrapperStyle('flexDirection')).toBe('column');
        });
    }
}
