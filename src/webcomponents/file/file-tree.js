import {html, LitElement, nothing} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";

export default class FileTree extends LitElement {

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
                type: Object
            },
            query: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._directories = new Map();
        this._expandedDirectories = new Set();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._directories = new Map();
        this._expandedDirectories = new Set();

        if (this.opencgaSession) {
            this.fetchDirectory(":");
        }
    }

    fetchDirectory(directoryId) {
        this.opencgaSession.opencgaClient.files()
            .tree(directoryId, {
                study: this.opencgaSession.study.fqn,
                maxDepth: 1,
                include: "id,name,path",
            })
            .then(response => {
                const subDirectories = (response.responses?.[0]?.results?.[0]?.children || [])
                    .filter(child => child.file.type.toUpperCase() === "DIRECTORY")
                    .map(child => child.file);
                this._directories.set(directoryId, subDirectories);
                this.requestUpdate();
            })
            .catch(error => {
                console.error(error);
            });
    }

    onExpandCollapseDirectory(directory) {
        if (this._expandedDirectories.has(directory.id)) {
            this._expandedDirectories.delete(directory.id);
        } else {
            this._expandedDirectories.add(directory.id);
        }
        // check if we have to fetch this directory
        if (!this._directories.has(directory.id)) {
            this.fetchDirectory(directory.id);
        }
        this.requestUpdate();
    }

    onClickDirectory(directory) {
        LitUtils.dispatchCustomEvent(this, "queryChange", null, {
            query: {
                ...this.query,
                path: "~^" + directory.path,
                // directory: directory.path,
            },
        });
    }

    renderTree(directoryId, indent = 0) {
        return (this._directories.get(directoryId) || []).map(directory => {
            const active = this.query?.directory === directory.path || (this.query?.path || "").slice(2) === directory.path;
            return html`
                <div class="d-flex align-items-center p-2 rounded-2 ${active ? "bg-primary text-white" : "hover:bg-gray-200"}">
                    <div class="flex-shrink-0" style="width: ${indent * 10}px"></div>
                    <div class="flex-shrink-0 d-flex cursor-pointer px-2" @click="${() => this.onExpandCollapseDirectory(directory)}">
                        <i class="fas ${this._expandedDirectories.has(directory.id) ? "fa-angle-down" : "fa-angle-right"} fs-7"></i>
                    </div>
                    <div class="d-flex flex-shrink-1 align-items-center gap-2 cursor-pointer" style="min-width:0;" @click="${() => this.onClickDirectory(directory)}">
                        <i class="fas fa-folder fs-5"></i>
                        <span class="lh-1 text-truncate" title="${directory.name}">
                            ${directory.name}
                        </span>
                    </div>
                </div>
                ${this._expandedDirectories.has(directory.id) ? this.renderTree(directory.id, indent + 1) : nothing}
            `;
        });
    }

    render() {
        if (!this.opencgaSession || !this._directories.has(":")) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-column overflow-y-auto" style="${this._config.display.containerStyle}">
                ${this.renderTree(":", 0)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                containerStyle: "max-height:700px",
            },
        };
    }

}

customElements.define("file-tree", FileTree);
