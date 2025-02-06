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
        this._tree = null;
        this._treeExpandedNodes = new Set();
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
        this._tree = null;
        this._treeExpandedNodes = new Set();

        if (this.opencgaSession) {
            this.opencgaSession.opencgaClient.files()
                .tree(":", {
                    study: this.opencgaSession.study.fqn,
                    include: "id,name,path",
                })
                .then(response => {
                    this._tree = response.responses?.[0]?.results?.[0] || null;
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    onExpandCollapseNode(node) {
        if (this._treeExpandedNodes.has(node.file.id)) {
            this._treeExpandedNodes.delete(node.file.id);
        } else {
            this._treeExpandedNodes.add(node.file.id);
        }
        this.requestUpdate();
    }

    renderTree(children, indent = 0) {
        return children
            .filter(child => child.file.type.toUpperCase() === "DIRECTORY")
            .map(child => {
                return html`
                    <div class="d-flex align-items-center hover:bg-gray-200 p-2 rounded-2">
                        <div class="flex-shrink-0" style="width: ${indent * 10}px"></div>
                        <div class="flex-shrink-0 d-flex cursor-pointer px-2" @click="${() => this.onExpandCollapseNode(child)}">
                            <i class="fas ${this._treeExpandedNodes.has(child.file.id) ? "fa-angle-down" : "fa-angle-right"} fs-7"></i>
                        </div>
                        <div class="d-flex flex-shrink-1 align-items-center gap-2 cursor-pointer" style="min-width:0;">
                            <i class="fas fa-folder fs-5"></i>
                            <span class="lh-1 text-truncate" title="${child.file.name}">
                                ${child.file.name}
                            </span>
                        </div>
                    </div>
                    ${this._treeExpandedNodes.has(child.file.id) ? this.renderTree(child.children, indent + 1) : nothing}
                `;
            });
    }

    render() {
        if (!this.opencgaSession || !this._tree) {
            return nothing;
        }

        return html`
            <div class="d-flex flex-column">
                ${this.renderTree(this._tree.children, 0)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {};
    }

}

customElements.define("file-tree", FileTree);
