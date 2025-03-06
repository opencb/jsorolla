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
            rootDirectoryId: {
                type: String,
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
        this.rootDirectoryId = ":";

        this._rootDirectory = null;
        this._directories = new Map();
        this._expandedDirectories = new Set();
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("opencgaSession") || changedProperties.has("rootDirectoryId")) {
            this.opencgaSessionObserver();
        }

        if (changedProperties.has("currentPath")) {
            this.currentPathObserver();
        }

        if (changedProperties.has("lastCreatedPath")) {
            this.lastCreatedPathObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this._rootDirectory = null;
        this._directories = new Map();
        this._expandedDirectories = new Set();

        if (this.opencgaSession && this.rootDirectoryId) {
            this.fetchDirectory(this.rootDirectoryId).then(() => {
                this.requestUpdate();
            });
        }
    }

    currentPathObserver() {
        const rootDirectory = this.rootDirectoryId;
        // if the current path have changed, make sure to fetch all the parent directories
        // and to include them in the directories map and the expanded directories set
        if (this.currentPath && this.currentPath !== rootDirectory && !this._directories.has(this.currentPath)) {
            const paths = this.currentPath.split("/").filter(Boolean);
            const directoriesPromises = [];
            for (let i = 0; i < paths.length - 1; i++) {
                const directoryId = paths.slice(0, i + 1).join(":") + ":";
                if (!this._directories.has(directoryId)) {
                    directoriesPromises.push(this.fetchDirectory(directoryId));
                }
                this._expandedDirectories.add(directoryId);
            }
            // when all promises are completed, perform a requestUpdate
            Promise.all(directoriesPromises).then(() => {
                this.requestUpdate();
            });
        }
    }

    lastCreatedPathObserver() {
        if (this.lastCreatedPath) {
            const paths = this.lastCreatedPath.split("/").filter(Boolean);
            const directoriesPromises = [];
            for (let i = 0; i < paths.length - 1; i++) {
                const directoryId = paths.slice(0, i + 1).join(":") + ":";
                if (this._directories.has(directoryId)) {
                    directoriesPromises.push(this.fetchDirectory(directoryId));
                }
            }
            // when all promises are completed, perform a requestUpdate
            if (directoriesPromises.length > 0) {
                Promise.all(directoriesPromises).then(() => {
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
                include: "id,name,path,type",
            })
            .then(response => {
                const content = (response.responses?.[0]?.results?.[0]?.children || [])
                    .filter(child => {
                        // if config.showFiles is false, we only show directories
                        return this._config.showFiles || child.file.type.toUpperCase() === "DIRECTORY";
                    });
                    // .map(child => child.file);
                this._directories.set(directoryId, content);

                // make sure to save the root directory info
                if (directoryId === this.rootDirectoryId) {
                    this._rootDirectory = response.responses[0].results[0].file;
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    onExpandCollapseDirectory(directory) {
        if (directory.type === "DIRECTORY") {
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
    }

    onClickItem(item) {
        if (item.path !== this.currentPath) {
            LitUtils.dispatchCustomEvent(this, "pathChange", item.path, item);
        }
    }

    renderItem(item, icon, indent = 0) {
        const isRootDirectory = !item.id || item.id === this.rootDirectoryId;
        const active = this.currentPath === item.path || (!item.path && !this.currentPath);
        const name = (isRootDirectory && !!this._config.rootDirectoryName) ? this._config.rootDirectoryName : item.name;
        const style = `opacity: ${item.type === "DIRECTORY" ? "1" : "0"};`; // terrible hack to keep the same width for all the items

        return html`
            <div class="d-flex align-items-center p-2 rounded-2 user-select-none ${active ? "bg-primary text-white" : "hover:bg-gray-200"}">
                <div class="flex-shrink-0" style="width: ${indent * 10}px"></div>
                ${!isRootDirectory ? html`
                    <div class="flex-shrink-0 d-flex px-2" style="${style}" @click="${() => this.onExpandCollapseDirectory(item)}">
                        <i class="fas ${this._expandedDirectories.has(item.id) ? "fa-angle-down" : "fa-angle-right"} fs-6"></i>
                    </div>
                ` : nothing}
                <div
                    class="d-flex flex-shrink-1 align-items-center gap-2 cursor-pointer"
                    style="min-width:0;"
                    @click="${() => this.onClickItem(item)}"
                    @dblclick="${() => this.onExpandCollapseDirectory(item)}">
                    <i class="fas ${icon} fs-5"></i>
                    <span class="lh-1 text-truncate" title="${name}">
                        ${name}
                    </span>
                </div>
            </div>
        `;
    }

    renderDirectories(directoriesList, indent) {
        return directoriesList.map(item => {
            const isExpanded = this._expandedDirectories.has(item.file.id);
            return html`
                ${this.renderItem(item.file, isExpanded ? "fa-folder-open" : "fa-folder", indent)}
                ${isExpanded ? this.renderTree(item.file.id, indent + 1) : nothing}
            `;
        });
    }

    renderFiles(filesList, indent) {
        return filesList.map(item => {
            return this.renderItem(item.file, "fa-file", indent);
        });
    }

    renderTree(directoryId, indent = 0) {
        const content = this._directories.get(directoryId) || [];
        const filesList = content.filter(child => child.file.type.toUpperCase() === "FILE");
        const directoriesList = content.filter(child => child.file.type.toUpperCase() === "DIRECTORY");

        return html`
            ${this.renderDirectories(directoriesList, indent)}
            ${this.renderFiles(filesList, indent)}
        `;
    }

    render() {
        if (!this.opencgaSession || this._directories.size === 0 || !this._rootDirectory) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-column gap-1 overflow-y-auto" style="${this._config.display.containerStyle}">
                ${this.renderItem(this._rootDirectory, this._config.rootDirectoryIcon || "fa-folder-open", 0)}
                ${this.renderTree(this.rootDirectoryId, 0)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                containerStyle: "max-height:700px",
            },
            rootDirectoryName: "",
            rootDirectoryIcon: "",
            showFiles: false,
        };
    }

}

customElements.define("file-tree", FileTree);
