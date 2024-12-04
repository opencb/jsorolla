import {html, LitElement, nothing} from "lit";

export default class LayoutSidebar extends LitElement {

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
            currentUrl: {
                type: String,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    renderSectionSeparator(text) {
        return html`<div class="mt-2 fw-bold text-gray-700 fs-9 text-center">${text}</div>`;
    }

    renderLink(link) {
        const url = link.url || `#${link.id}`;
        return html`
            <a class="dropdown-item" data-cy="${link.id}" href="${url}" target="${link.tab ? "_blank" : "_self"}">
                ${link.icon ? html`<i class="fas ${link.icon} pe-1"></i>` : nothing}
                <span>${link.name}</span>
            </a>
        `;
    }

    renderButton(app) {
        const active = this.currentUrl.startsWith(`#${app.id}/`); // url always start with the app ID
        return html`
            <a
                class="text-decoration-none d-flex align-items-center flex-column gap-2 p-2 rounded-2 cursor-pointer ${active ? "bg-gray-200" : "hover:bg-gray-100"}"
                href="#${app.id}"
            >
                <i class="fas ${app?.icon || "fa-screwdriver-wrench"} lh-1 fs-4 text-gray-900"></i>
                <div class="fw-bold lh-1 fs-8 text-center text-gray-600">${app?.name || "-"}</div>
            </a>
        `;
    }

    render() {
        // TODO: get favourites from user configuration
        const favourites = this._config.favourites;
        return html`
            <div class="d-flex flex-column justify-content-between flex-shrink-0 border-end bg-white position-relative h-full" style="width:72px">
                <!-- TOP options -->
                <div class="d-flex flex-column">
                    <div class="d-flex flex-column gap-1 user-select-none p-2">
                        ${this.renderButton({id: "study-dashboard", name: "Dashboard", icon: "fa-home"})}
                        ${this.config?.apps?.length > 0 ? html`
                            ${this.renderSectionSeparator("Apps")}
                            ${this.config.apps.map(app => this.renderButton(app))}
                        `: nothing}
                    </div>
                </div>

                <!-- BOTTOM options -->
                <div class="d-flex flex-column gap-1 px-2 py-3 mt-auto">
                    ${favourites.length > 0 ? html`
                        <div class="d-flex flex-column dropup dropend">
                            <div class="d-flex flex-column justify-content-center align-items-center p-2 gap-2 hover:bg-gray-100 rounded-2 cursor-pointer" data-bs-toggle="dropdown">
                                <i class="fas fa-star rounded-1 lh-1 fs-4"></i>
                                <div class="fw-medium lh-1 fs-8 text-center text-gray-600">Favourites</div>
                            </div>
                            <div class="dropdown-menu">
                                ${favourites.map(link => this.renderLink(link))}
                            </div>
                        </div>
                    ` : nothing}

                    ${this.config?.about?.dropdown && this.config?.about?.links?.length > 0 ? html`
                        <div class="d-flex flex-column dropup dropend">
                            <div class="d-flex flex-column justify-content-center align-items-center p-2 gap-2 hover:bg-gray-100 rounded-2 cursor-pointer" data-bs-toggle="dropdown">
                                <i class="fas fa-question-circle rounded-1 lh-1 fs-4"></i>
                                <div class="fw-medium lh-1 fs-8 text-center text-gray-600">About</div>
                            </div>
                            <div class="dropdown-menu">
                                ${this.config.about.links.map(link => this.renderLink(link))}
                            </div>
                        </div>
                    ` : nothing}

                    ${this.config?.sidebar?.organisation ? html`
                        <div class="d-flex flex-column dropup dropend">
                            <div class="d-flex align-items-center justify-content-center gap-1 hover:bg-gray-100 py-2 rounded-2 cursor-pointer border" data-bs-toggle="dropdown">
                                <div class="d-flex">
                                    <img src="${this.config.sidebar.organisation.logo?.img || ""}" height="32px" />
                                </div>
                            </div>
                            ${this.config.sidebar.organisation.menu?.length > 0 ? html`
                                <div class="dropdown-menu">
                                    ${this.config.sidebar.organisation.menu.map(link => this.renderLink(link))}
                                </div>
                            ` : nothing}
                        </div>
                    ` : nothing}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            favourites: [
                {id: "file-data-manager", name: "File Data Manager"},
                {id: "workflow-manager", name: "Workflow Manager"},
            ],
        };
    }

}

customElements.define("layout-sidebar", LayoutSidebar);
