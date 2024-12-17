import {LitElement, html, nothing} from "lit";

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
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._activeItem = "";
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            // initialize the active item
            if (!this._activeItem) {
                this._activeItem = this._config.menu[0].submenu[0].id;
            }
        }

        super.update(changedProperties);
    }

    firstUpdated() {
        // register listeners to bootstrap collapse events
        Array.from(this.querySelectorAll(`[data-bs-role="collapse"]`)).forEach(el => {
            el.addEventListener("show.bs.collapse", e => {
                e.target.previousElementSibling.querySelector("i").classList.remove("fa-chevron-down");
                e.target.previousElementSibling.querySelector("i").classList.add("fa-chevron-up");
            });
            el.addEventListener("hide.bs.collapse", e => {
                e.target.previousElementSibling.querySelector("i").classList.remove("fa-chevron-up");
                e.target.previousElementSibling.querySelector("i").classList.add("fa-chevron-down");
            });
        });
    }

    onChangeActiveItem(newActiveItem) {
        this._activeItem = newActiveItem;
        this.requestUpdate();
    }

    renderMenu() {
        return this._config.menu.map(item => {
            const id = (item.name || item.id).replace(/ /g, "-").toLowerCase();
            return html`
                <div class="">
                    <div class="d-flex align-items-center gap-2 text-gray-700 fs-9 user-select-none py-1 cursor-pointer" data-bs-toggle="collapse" data-bs-target="#menu-${id}">
                        <i class="fa fa-chevron-up"></i>
                        <span class="fw-bold">${item.name}</span>
                    </div>
                    <div class="collapse show" id="menu-${id}" data-bs-role="collapse">
                        <div class="d-flex flex-column gap-1">
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
                <div class="d-flex flex-column gap-3 flex-shrink-0" style="${this._config?.display?.menuStyle}">
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
