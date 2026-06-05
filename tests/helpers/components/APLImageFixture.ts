import { APLComponentFixture } from './APLComponentFixture';

export class APLImageFixture extends APLComponentFixture {
    testImage() {
        this.testBase();
        this.testHasProperties(['source', 'sources', 'scale', 'align', 'borderRadius']);
        this.testPositionProperties();
        this.testPropertyType('scale', 'list');
        this.testPropertyDefault('scale', 'best-fit');
        this.testPropertyType('borderRadius', 'dimension');
    }
}
