import {html, LitElement, nothing} from "lit";

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
            config: {
                type: Object
            }
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

    renderTree(directoryId, indent = 0) {
        return (this._directories.get(directoryId) || []).map(directory => {
            return html`
                <div class="d-flex align-items-center hover:bg-gray-200 p-2 rounded-2">
                    <div class="flex-shrink-0" style="width: ${indent * 10}px"></div>
                    <div class="flex-shrink-0 d-flex cursor-pointer px-2" @click="${() => this.onExpandCollapseDirectory(directory)}">
                        <i class="fas ${this._expandedDirectories.has(directory.id) ? "fa-angle-down" : "fa-angle-right"} fs-7"></i>
                    </div>
                    <div class="d-flex flex-shrink-1 align-items-center gap-2 cursor-pointer" style="min-width:0;">
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
