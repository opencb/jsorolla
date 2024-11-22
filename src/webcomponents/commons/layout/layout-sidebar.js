import {html, LitElement, nothing} from "lit";
import LitUtils from "../utils/lit-utils";

export default class LayoutSidebar extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            app: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    onChangeApp(app) {
        LitUtils.dispatchCustomEvent(this, "changeApp", app.id);
    }

    renderLink(link) {
        const url = link.url || `#${link.id}`;
        return html`
            <a class="dropdown-item" data-cy="${link.id}" href="${url}" target="${link.tab ? "_blank" : "_self"}">
                ${link.icon ? `` : nothing}
                <span>${link.name}</span>
            </a>
        `;
    }

    renderSectionSeparator(text) {
        return html`<div class="mt-2 text-gray-500 fw-bold fs-7 text-center">${text}</div>`;
    }

    renderLinkButton(item, active = false) {
        return html`
            <a class="d-flex align-items-center flex-column gap-2 p-2 rounded-2 text-decoration-none ${active ? "bg-gray-200" : "hover:bg-gray-200 cursor-pointer"}" href="${item.url}">
                <i class="fas ${item?.icon || ""} lh-1 fs-4 text-gray-900"></i>
                <div class="fw-bold lh-1 fs-8 text-center text-gray-600">${item?.name || "-"}</div>
            </a>
        `;
    }

    renderAppButton(item, active = false) {
        return html`
            <div
                class="d-flex align-items-center flex-column gap-2 p-2 rounded-2 ${active ? "bg-gray-200" : "hover:bg-gray-200 cursor-pointer"}"
                @click="${() => this.onChangeApp(item)}"
            >
                <i class="fas ${item?.icon || ""} lh-1 fs-4 text-gray-900"></i>
                <div class="fw-bold lh-1 fs-8 text-center text-gray-600">${item?.name || "-"}</div>
            </div>
        `;
    }

    render() {
        // Note: dashboard app is always the first one and is not included in the Apps section of the sidebar
        const dashboardApp = this.config?.apps?.find(app => app.id === "dashboard");
        const otherApps = (this.config?.apps || []).filter(app => app.id !== "dashboard");
        return html`
            <div class="d-flex flex-column justify-content-between flex-shrink-0 border-end bg-gray-100 position-relative h-full" style="width:72px">
                <div class="d-flex flex-column">
                    <div class="d-flex flex-column gap-1 user-select-none p-2">
                        ${dashboardApp ? this.renderAppButton(dashboardApp, this.app?.id === dashboardApp?.id) : nothing}
                        ${otherApps.length > 0 ? html`
                            ${this.renderSectionSeparator("Apps")}
                            ${otherApps.map(app => this.renderAppButton(app, this.app?.id === app.id))}
                        `: nothing}
                        <!--
                        <div class="mt-2 text-gray-500 fw-bold small">Favourites</div>
                        <div class="d-flex flex-column align-items-center gap-2 hover:bg-gray-200 p-2 rounded-2 cursor-pointer">
                            <i class="fas fa-project-diagram lh-1 fs-4"></i>
                            <div class="fw-medium lh-1 fs-8 text-center text-gray-600">Workflows</div>
                        </div>
                        <div class="d-flex flex-column align-items-center gap-2 hover:bg-gray-200 p-2 rounded-2 cursor-pointer">
                            <i class="fas fa-database lh-1 fs-4"></i>
                            <div class="fw-medium lh-1 fs-8 text-center text-gray-600">CVDB</div>
                        </div>
                        -->
                    </div>
                </div>
                <div class="d-flex flex-column gap-1 px-2 py-3 mt-auto">
                    ${this.config?.about?.dropdown && this.config?.about?.links?.length > 0 ? html`
                        <div class="d-flex flex-column dropup dropend">
                            <div class="d-flex flex-column justify-content-center align-items-center p-2 gap-2 hover:bg-gray-200 rounded-2 cursor-pointer" data-bs-toggle="dropdown">
                                <i class="fas fa-question-circle rounded-1 lh-1 fs-4"></i>
                                <div class="fw-medium lh-1 fs-8 text-center text-gray-600">About</div>
                            </div>
                            <div class="dropdown-menu">
                                ${this.config.about.links.map(link => this.renderLink(link))}
                            </div>
                        </div>
                    ` : nothing}
                    <div class="d-flex flex-column">
                        <div class="d-flex align-items-center justify-content-center gap-1 hover:bg-gray-200 p-2 rounded-2 cursor-pointer border">
                            <div class="d-flex py-1">
                                <img src="./img/zetta-logo.png" height="14px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("layout-sidebar", LayoutSidebar);
