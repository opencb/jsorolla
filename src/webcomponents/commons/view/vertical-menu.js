import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";

export default class VerticalMenu extends LitElement {

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
            activeItem: {
                type: String,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this._activeItem = "";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }

        if (changedProperties.has("config") || changedProperties.has("activeItem")) {
            // check if we have to change the active item
            if (this.activeItem && this.activeItem !== this._activeItem) {
                this._activeItem = this.activeItem;
            }
            // initialize the active item if not set
            if (!this._activeItem && !this.activeItem) {
                this._activeItem = this._config.menu[0].submenu[0].id;
            }
        }

        super.update(changedProperties);
    }

    onChangeActiveItem(newActiveItem) {
        this._activeItem = newActiveItem;
        LitUtils.dispatchCustomEvent(this, "changeActiveItem", this._activeItem);
        this.requestUpdate();
    }

    renderMenu() {
        return this._config.menu.map(item => {
            const id = (item.name || item.id).replace(/ /g, "-").toLowerCase();
            return html`
                <div class="">
                    <div class="btn btn-toggle d-inline-flex align-items-center gap-1 border-0 fs-5" aria-expanded="true" data-bs-toggle="collapse" data-bs-target="#${this._prefix}Menu${id}">
                        <span class="fw-bold">${item.name}</span>
                    </div>
                    <div class="collapse show" id="${this._prefix}Menu${id}" data-bs-role="collapse">
                        <div class="d-flex flex-column gap-1 ps-4 pt-1">
                            ${(item.submenu || []).map(subitem => html`
                                <div
                                    class="btn w-full text-start ${subitem.id === this._activeItem ? "btn-primary" : "hover:bg-gray-200"}"
                                    @click="${() => this.onChangeActiveItem(subitem.id)}">
                                    ${subitem.name}
                                </div>     
                            `)}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    renderContent() {
        if (this._activeItem) {
            const activeItem = this._config.menu.flatMap(item => item.submenu).find(subitem => subitem.id === this._activeItem);
            if (activeItem) {
                return activeItem.render(this.opencgaSession);
            }
        }
        // nothing to render
        return nothing;
    }

    render() {
        return html`
            <div class="d-flex flex-nowrap gap-5">
                <div class="d-flex flex-column gap-2 flex-shrink-0" style="${this._config?.display?.menuStyle}">
                    ${this.renderMenu()}
                </div>
                <div class="w-full ${this._config?.display?.contentClassName}" style="${this._config?.display?.contentStyle}">
                    ${this.renderContent()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                menuStyle: "width:200px;",
            },
            menu: [],
        };
    }

}

customElements.define("vertical-menu", VerticalMenu);
