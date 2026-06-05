import { APLComponentFixture } from './APLComponentFixture';

export class APLTextFixture extends APLComponentFixture {
    testText() {
        this.testBase();
        this.testHasProperties([
            'text', 'color', 'fontSize', 'fontFamily', 'fontWeight',
            'fontStyle', 'letterSpacing', 'lineHeight', 'maxLines',
            'textAlign', 'textAlignVertical',
        ]);
        this.testPositionProperties();
        this.testPropertyType('fontSize', 'dimension');
        this.testPropertyType('color', 'color');
    }
}
