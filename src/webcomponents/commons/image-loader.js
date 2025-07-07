import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../core/utils-new.js";
import LitUtils from "./utils/lit-utils.js";

export default class ImageLoader extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            images: {
                type: Array,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._error = null;
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

    firstUpdated() {
        const dragDropElement = this.querySelector(`[data-role="dragdrop"]`);
        dragDropElement.addEventListener("drop", event => this.onSelectFile(event), false);
        dragDropElement.addEventListener("click", event => {
            event.preventDefault();
            this.querySelector(`input[type="file"]`).click();
        });
    }

    onSelectFile(event) {
        event.preventDefault();
        const files = event.target.files || event.dataTransfer.files || [];
        if (files.length > 0) {
            this._error = null;
            this.requestUpdate();
            const allPromises = Array.from(files).map(file => {
                if (file.size > this._config.maxFileSize) {
                    return Promise.reject(new Error(`File ${file.name} exceeds the maximum size of 5MB.`));
                }
                return UtilsNew.fileToBase64(file);
            });
            Promise.all(allPromises)
                .then(newImages => {
                    console.log("New images loaded:", newImages);
                    LitUtils.dispatchCustomEvent(this, "imagesChange", [...this.images, ...newImages]);
                })
                .catch(error => {
                    console.error(error);
                    this._error = error.message || "An error occurred while processing the files.";
                })
                .finally(() => {
                    this.requestUpdate();
                });
        }
    }

    render() {
        // return html`
        //     <img
        //         class="${this._config.className}"
        //         src="data:${this.type || "image/png"};base64,${this.data}"
        //         style="${this._config.style}" />
        // `;
        return html`
            <input
                class="d-none"
                type="file"
                accept="image/*"
                @change="${event => this.onSelectFile(event)}"
            />
            ${this._error ? html`
                <div class="alert alert-danger d-flex align-items-center gap-2 mb-3">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${this._error}</span>
                </div>
            ` : nothing}
            <div data-role="dragdrop" class="d-flex align-items-center justify-content-center rounded-4 border-2 border-gray-200 p-5 bg-white cursor-pointer">
                <div class="d-flex flex-column gap-2 align-items-center">
                    <div class="d-flex display-4 text-secondary">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="fw-medium fs-4 text-center">
                        ${this._config.title}
                    </div>
                    ${this._config.description ? html`
                        <div class="text-secondary text-center">
                            ${this._config.description}
                        </div>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Drag and Drop or Click to upload an image",
            description: "Select JPEG or PNG images to upload, up to 5MB.",
            maxFileSize: 5 * 1024 * 1024, // 5MB
        };
    }

}

customElements.define("image-loader", ImageLoader);
