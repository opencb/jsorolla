import {LitElement, html, nothing} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/image-viewer.js";
import "../commons/empty-state.js";
import "../loading-spinner.js";

export default class DirectoryPreview extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            directoryId: {
                type: String,
            },
            query: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            active: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._directories = [];
        this._files = [];
        this._loading = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("directoryId") || changedProperties.has("opencgaSession") || changedProperties.has("active")) {
            this.directoryIdObserver();
        }

        if (changedProperties.has("query") || changedProperties.has("opencgaSession") || changedProperties.has("active")) {
            this.queryObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    directoryIdObserver() {
        this._directories = [];
        this._files = [];

        if (this.directoryId && this.opencgaSession && this.active) {
            this._loading = true;
            this.opencgaSession.opencgaClient.files()
                .tree(this.directoryId, {
                    study: this.opencgaSession.study.fqn,
                    maxDepth: 1,
                })
                .then(response => {
                    const content = response.responses?.[0]?.results?.[0]?.children || [];
                    this._directories = content
                        .filter(child => child.file.type.toUpperCase() === "DIRECTORY")
                        .map(child => child.file);
                    this._files = content
                        .filter(child => child.file.type.toUpperCase() === "FILE")
                        .map(child => child.file);
                    this.fetchImagesFiles();
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    this._loading = false;
                    this.requestUpdate();
                });
        }
    }

    queryObserver() {
        this._directories = [];
        this._files = [];

        if (this.query && this.opencgaSession && this.active) {
            this._loading = true;
            let filesResponse = null;
            const filters = {
                study: this.opencgaSession.study.fqn,
                ...this.query,
                limit: 500,
            };

            // check for including directory in the query
            // this is a workaround to request the content of the root directory in strict mode
            if (Object.keys(this.query).length === 0) {
                filters.directory = "";
            }

            this.opencgaSession.opencgaClient.files()
                .search(filters)
                .then(response => {
                    filesResponse = response;
                    this._directories = (response.responses?.[0]?.results || []).filter(item => {
                        return item.type.toUpperCase() === "DIRECTORY";
                    })
                    this._files = (response.responses?.[0]?.results || []).filter(item => {
                        return item.type.toUpperCase() === "FILE";
                    })
                    this.fetchImagesFiles();
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    LitUtils.dispatchCustomEvent(this, "queryComplete", null, {
                        response: filesResponse,
                    });
                    this._loading = false;
                    this.requestUpdate();
                });
        }
    }

    fetchImagesFiles() {
        this._files.forEach(file => {
            if (file.format === "IMAGE") {
                this.opencgaSession.opencgaClient.files()
                    .image(file.id, {
                        study: this.opencgaSession.study.fqn,
                    })
                    .then(response => {
                        file.content = response.responses[0].results[0].content;
                        file.imageType = UtilsNew.getMimeType(file.name.split(".").pop());
                        this.requestUpdate();
                    })
                    .catch(error => {
                        console.error(error);
                    });
            }
        });
    }

    onClickFile(file) {
        LitUtils.dispatchCustomEvent(this, "fileClick", null, file);
    }

    renderDirectories() {
        return this._directories.map(directory => {
            return html`
                <div class="col-3" @click="${() => this.onClickFile(directory)}">
                    <div class="d-flex align-items-center p-3 gap-3 bg-white hover:bg-gray-100 cursor-pointer rounded-2 border">
                        <i class="fas fa-folder fs-3"></i>
                        <div class="">${directory.name}</div>
                    </div>
                </div>
            `;
        });
    }

    renderFiles() {
        return this._files.map(file => {
            return html`
                <div class="col-3" @click="${() => this.onClickFile(file)}">
                    <div class="d-flex flex-column p-3 bg-white hover:bg-gray-100 cursor-pointer rounded-2 border">
                        <div class="d-flex justify-content-center align-items-center bg-gray-200 rounded-1" style="height: 160px;">
                            ${file.format === "IMAGE" && !!file.content ? html`
                                <image-viewer
                                    class="d-flex align-items-center justify-content-center w-full h-full"
                                    type="${file.imageType}"
                                    .data="${file.content}"
                                    .config="${{
                                        style: "height:100%;",
                                    }}">
                                </image-viewer>
                            ` : html`
                                <i class="fas fa-file-alt fs-1 text-gray-500"></i>
                            `}
                        </div>
                        <div class="mt-2">${file.name}</div>
                    </div>
                </div>
            `;
        });
    }

    render() {
        if (!this.opencgaSession || !this.active) {
            return nothing;
        }

        if (this._loading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        if (this._directories.length === 0 && this._files.length === 0) {
            return html`
                <empty-state
                    .icon="${"fa-folder-open"}"
                    .title="${"Empty directory"}"
                    .description="${"This directory is empty."}">
                </empty-state>
            `;
        }

        return html`
            <div class="d-flex flex-column">
                ${this._directories.length > 0 ? html`
                    <div class="fs-5 fw-bold mb-2">Folders</div>
                    <div class="row g-3 mb-5">
                        ${this.renderDirectories()}
                    </div>    
                ` : nothing}
                ${this._files.length > 0 ? html`
                    <div class="fs-5 fw-bold mb-2">Files</div>
                    <div class="row g-3">
                        ${this.renderFiles()}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("directory-preview", DirectoryPreview);
