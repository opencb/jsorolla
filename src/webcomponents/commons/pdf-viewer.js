import {LitElement, html} from "lit";
import * as pdfjsLib from "pdfjs-dist";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";

export default class PdfViewer extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            fileId: {
                type: String,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.active = true;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    updated(changedProperties) {
        if (changedProperties.has("fileId") || changedProperties.has("active")) {
            this.fileIdObserver();
        }
    }

    fileIdObserver() {
        if (this.active && this.fileId) {
            // setting worker path to worker bundle
            pdfjsLib.GlobalWorkerOptions.workerSrc = "js/pdf.worker.js";

            const canvas = this.querySelector("canvas");
            const ctx = canvas.getContext("2d");
            const pdfUrl = OpencgaCatalogUtils.getDownloadFileUrl(this.opencgaSession, this.fileId);

            pdfjsLib.getDocument(pdfUrl).promise
                .then(pdf => pdf.getPage(1))
                .then(page => {
                    // calculate the scale based on the width of the container element
                    // Note page.view is an array with the following values: [x1, y1, x2, y2]
                    const scale = this.querySelector(`div[data-role="container"]`)?.clientWidth / page.view[2];
                    const viewport = page.getViewport({
                        scale: scale,
                    });
                    // set canvas size to match the page size
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    // render the page into the canvas
                    page.render({
                        canvasContext: ctx,
                        viewport: viewport
                    });
                })
                .catch(error => {
                    console.error("Error loading PDF: ", error);
                });
        }
    }

    render() {
        return html`
            <div class="w-full border rounded-2" data-role="container">
                <canvas></canvas>
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("pdf-viewer", PdfViewer);
