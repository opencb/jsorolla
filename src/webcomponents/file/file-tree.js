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
            currentPath: {
                type: String,
            },
            lastCreatedPath: {
                type: String,
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

        if (changedProperties.has("currentPath")) {
            this.currentPathObserver();
        }

        if (changedProperties.has("lastCreatedPath")) {
            this.lastCreatedPathObserver();
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
            this.fetchDirectory(":").then(() => {
                this.requestUpdate();
            });
        }
    }

    currentPathObserver() {
        // if the current path have changed, make sure to fetch all the parent directories
        // and to include them in the directories map and the expanded directories set
        if (this.currentPath && this.currentPath !== ":" && !this._directories.has(this.currentPath)) {
            const paths = this.currentPath.split("/").filter(Boolean);
            const directoriesPromises = [];
            for (let i = 0; i < paths.length - 1; i++) {
                const directoryId = paths.slice(0, i + 1).join(":") + ":";
                if (!this._directories.has(directoryId)) {
                    directoriesPromises.push(this.fetchDirectory(directoryId));
                }
                this._expandedDirectories.add(directoryId);
            }
            // when all promises are complited, perform a requestUpdate
            Promise.all(directoriesPromises).then(() => {
                this.requestUpdate();
            });
        }
    }

    lastCreatedPathObserver() {
        if (this.lastCreatedPath) {
            const parentDirectoryId = this.lastCreatedPath.split("/")
                .filter(Boolean)
                .slice(0, -1)
                .join(":") + ":";
            // check if the parent directory is already in the directories map, so we have to fetch it again
            if (this._directories.has(parentDirectoryId)) {
                this.fetchDirectory(parentDirectoryId).then(() => {
                    this.requestUpdate();
                });
            }
        }
    }

    fetchDirectory(directoryId) {
        this._directories.set(directoryId, []); // initialize directories map
        return this.opencgaSession.opencgaClient.files()
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
            this.fetchDirectory(directory.id).then(() => {
                this.requestUpdate();
            });
        }
        this.requestUpdate();
    }

    onClickDirectory(directory) {
        if (directory.path !== this.currentPath) {
            if (directory.path) {
                // if the directory.path exists, it means that we have clicked on a directory
                LitUtils.dispatchCustomEvent(this, "pathChange", directory.path);
            } else {
                // if the directory.path does not exist, it means that we have clicked on the root directory
                LitUtils.dispatchCustomEvent(this, "pathClear");
            }
        }
    }

    renderDirectoryItem(directory, icon, indent = 0) {
        const active = this.currentPath === directory.path || (!directory.path && !this.currentPath);
        return html`
            <div class="d-flex align-items-center p-2 rounded-2 user-select-none ${active ? "bg-primary text-white" : "hover:bg-gray-200"}">
                <div class="flex-shrink-0" style="width: ${indent * 10}px"></div>
                ${directory.id ? html`
                    <div class="flex-shrink-0 d-flex cursor-pointer px-2" @click="${() => this.onExpandCollapseDirectory(directory)}">
                        <i class="fas ${this._expandedDirectories.has(directory.id) ? "fa-angle-down" : "fa-angle-right"} fs-7"></i>
                    </div>
                ` : nothing}
                <div
                    class="d-flex flex-shrink-1 align-items-center gap-2 cursor-pointer"
                    style="min-width:0;"
                    @click="${() => this.onClickDirectory(directory)}"
                    @dblclick="${() => this.onExpandCollapseDirectory(directory)}">
                    <i class="fas ${icon} fs-5"></i>
                    <span class="lh-1 text-truncate" title="${directory.name}">
                        ${directory.name}
                    </span>
                </div>
            </div>
        `;
    }

    renderTree(directoryId, indent = 0) {
        return (this._directories.get(directoryId) || []).map(directory => {
            const isExpanded = this._expandedDirectories.has(directory.id);
            return html`
                ${this.renderDirectoryItem(directory, isExpanded ? "fa-folder-open" : "fa-folder", indent)}
                ${isExpanded ? this.renderTree(directory.id, indent + 1) : nothing}
            `;
        });
    }

    render() {
        if (!this.opencgaSession || !this._directories.has(":")) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-column gap-1 overflow-y-auto" style="${this._config.display.containerStyle}">
                ${this.renderDirectoryItem({name: this._config.rootDirectoryName}, "fa-hdd", 0)}
                ${this.renderTree(":", 0)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                containerStyle: "max-height:700px",
            },
            rootDirectoryName: "DATA",
        };
    }

}

customElements.define("file-tree", FileTree);
