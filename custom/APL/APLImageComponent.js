class APLImageComponent extends APLComponent {
    static tag = 'apl-image-component';

    getAPLProperties() {
        let properties = super.getAPLProperties();
        properties = Object.assign(properties, {
            align: {
                type: 'text',
                options: {
                    css: true,
                }
            },
            borderRadius: {
                type: 'dimension',
                options: {
                    css: true,
                }
            },
            source: {
                type: 'text',
                options: {

                }
            },
            sources: {
                type: 'text',
                options: {

                }
            },
            scale: {
                type: 'list',
                items: [
                    'fill',
                    'best-fill',
                    'best-fit',
                    'best-fit-down',
                    'none',
                ],
                default: 'best-fit',
                options: {
                    visual: 'scale-picker',
                }
            },
        });
        properties = Object.assign(APLProperties.getContainerProperties(), properties);
        properties = Object.assign(APLProperties.getAlignmentAndPositioningProperties(), properties);
        return properties;
    }

    static SVG_NS = 'http://www.w3.org/2000/svg';
    static XLINK_NS = 'http://www.w3.org/1999/xlink';

    _naturalWidth = 0;
    _naturalHeight = 0;

    onCSSSet() {
        super.onCSSSet();
        if (!this._naturalWidth) return;
        this._applyScale();
    }

    _applyScale() {
        const svg = this.element.wrapper.querySelector('svg');
        if (!svg) return;

        const data = this.getAPLData();
        const scale = data.scale || 'best-fit';
        const cw = this.element.wrapper.offsetWidth;
        const ch = this.element.wrapper.offsetHeight;
        const dppx = this.getFactory()?.getScreen()?.getDPSize() || 1;
        const nw = this._naturalWidth * dppx;
        const nh = this._naturalHeight * dppx;
        if (!cw || !ch || !nw || !nh) return;

        let sw, sh, sx, sy;

        switch (scale) {
            case 'fill':
                sw = cw; sh = ch;
                sx = 0; sy = 0;
                break;
            case 'best-fill': {
                const r = Math.max(cw / nw, ch / nh);
                sw = nw * r; sh = nh * r;
                sx = (cw - sw) / 2; sy = (ch - sh) / 2;
                break;
            }
            case 'best-fit': {
                const r = Math.min(cw / nw, ch / nh);
                sw = nw * r; sh = nh * r;
                sx = (cw - sw) / 2; sy = (ch - sh) / 2;
                break;
            }
            case 'best-fit-down': {
                const r = Math.min(1, Math.min(cw / nw, ch / nh));
                sw = nw * r; sh = nh * r;
                sx = (cw - sw) / 2; sy = (ch - sh) / 2;
                break;
            }
            case 'none':
                sw = nw; sh = nh;
                sx = (cw - nw) / 2; sy = (ch - nh) / 2;
                break;
            default:
                sw = cw; sh = ch;
                sx = 0; sy = 0;
        }

        svg.setAttribute('width', Math.round(sw));
        svg.setAttribute('height', Math.round(sh));
        svg.style.position = 'relative';
        svg.style.display = 'block';
        svg.style.left = `${Math.round(sx)}px`;
        svg.style.top = `${Math.round(sy)}px`;
    }

    shouldCaptureClick() { return true; }

    renderContent() {
        const data = this.getAPLData();
        const NS = this.constructor.SVG_NS;

        const svg = document.createElementNS(NS, 'svg');
        svg.style.display = 'block';
        svg.style.position = 'relative';

        const image = document.createElementNS(NS, 'image');
        image.setAttribute('href', data.source);
        image.setAttributeNS(this.constructor.XLINK_NS, 'xlink:href', data.source);
        image.setAttribute('x', '0%');
        image.setAttribute('y', '0%');
        image.setAttribute('width', '100%');
        image.setAttribute('height', '100%');
        image.setAttribute('preserveAspectRatio', 'none');

        svg.appendChild(image);
        this.element.wrapper.replaceChildren(svg);

        const probe = new Image();
        probe.onload = () => {
            this._naturalWidth = probe.naturalWidth;
            this._naturalHeight = probe.naturalHeight;
            this._applyScale();
        };
        probe.src = data.source;

        if (this._naturalWidth) {
            this._applyScale();
        }
    }

    async initElements() {
        await super.initElements();
    }
}

customElements.define(APLImageComponent.tag, APLImageComponent);
registerAPLComponent('Image', APLImageComponent);