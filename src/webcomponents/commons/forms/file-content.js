import {LitElement, html} from "lit";
import * as XLSX from "xlsx";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";
import "../filters/catalog-search-autocomplete.js";

export default class FileContent extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object,
            },
            value: {
                type: String,
            },
            disabled: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._mode = "upload";
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

    onModeChange(mode) {
        this._mode = mode;
        this.value = "";
        this.requestUpdate();
    }

    onFileClear() {
        if (this.value) {
            const fileInput = this.querySelector(`input[type="file"]`);
            if (fileInput) {
                fileInput.value = null;
            }
            this.value = "";
            LitUtils.dispatchCustomEvent(this, "fieldChange", this.value);
        }
    }

    async onFileChange(event) {
        const file = event.target.files[0];
        if (file) {
            let content = "";
            try {
                if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                    const data = await file.arrayBuffer();
                    const workbook = XLSX.read(data, {type: "array"});
                    if (workbook.SheetNames.length > 0) {
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        content = XLSX.utils.sheet_to_csv(sheet);
                    }
                } else {
                    content = await file.text();
                }
            } catch (error) {
                console.error("Error reading file:", error);
                content = "Error reading file: " + error.message;
            }
            this.value = content;
            LitUtils.dispatchCustomEvent(this, "fieldChange", this.value);
        }
    }

    onOpenCgaFileChange(fileId) {
        this.value = "";
        if (fileId) {
            this.opencgaSession.opencgaClient.files()
                .head(fileId, {
                    study: this.opencgaSession.study.fqn,
                    lines: 500,
                })
                .then(response => {
                    this.value = response.getResult(0)?.content ?? "No content";
                    LitUtils.dispatchCustomEvent(this, "fieldChange", this.value);
                })
                .catch(response => {
                    console.error(response);
                    this.value = response.getEvents("ERROR").map(_ => _.message).join("\n");
                    LitUtils.dispatchCustomEvent(this, "fieldChange", this.value);
                });
        }
    }

    render() {
        const availableModes = [
            {id: "upload", text: "Upload", icon: "fa-upload"},
            {id: "opencga", text: "OpenCGA", icon: "fa-database"}
        ];

        return html`
            <div class="mb-2 d-flex align-items-center gap-2">
                <div class="btn-group">
                    ${availableModes.map(mode => html`
                        <button class="btn btn-light ${this._mode === mode.id ? "active" : ""}" @click="${() => this.onModeChange(mode.id)}">
                            <i class="fa ${mode.icon}"></i>
                        </button>
                    `)}
                </div>
                ${this._mode === "upload" ? html`
                    <div class="input-group">
                        <input type="file"
                            class="form-control"
                            ?disabled="${this.disabled}"
                            @change="${event => this.onFileChange(event)}">
                        <button class="btn" @click="${() => this.onFileClear()}">
                            <i class="fa fa-times"></i>
                        </button>
                    </div>
                ` : html`
                    <catalog-search-autocomplete
                        .opencgaSession="${this.opencgaSession}"
                        .resource="${"FILE"}"
                        .config="${{
                            multiple: false,
                            disabled: this.disabled,
                        }}"
                        @filterChange="${e => this.onOpenCgaFileChange(e.detail.value)}">
                    </catalog-search-autocomplete>
                `}
            </div>
            <div class="form-control overflow-auto ${this.disabled ? "bg-gray-200" : "bg-gray-100"}" style="min-height:40px; max-height: ${this._config.maxHeight}px;">
                <div class="font-monospace fs-7" style="white-space:pre-wrap;">${this.value || ""}</div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            maxHeight: 300,
        };
    }

}

customElements.define("file-content", FileContent);
