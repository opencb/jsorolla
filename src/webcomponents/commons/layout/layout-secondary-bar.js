import {html, LitElement} from "lit";

export default class LayoutSecondaryBar extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            app: {
                type: Object,
            },
            currentUrl: {
                type: String,
            },
        };
    }

    renderTool(tool) {
        const active = this.currentUrl.startsWith(`#${this.app.id}/${tool.id}`);
        return html`
            <li class="nav-item">
                <a class="nav-link text-body ${active ? "active" : ""}" style="${active ? `border-color:${this.app.color || ""};border-width: 2px` : ""}" href="#${this.app.id}/${tool.id}">
                    <div class="px-2 py-1 rounded ${active ? "bg-gray-100 fw-bolder" : "hover:bg-gray-100"}">
                        ${tool.name || tool.id || "-"}
                    </div>
                </a>
            </li>
        `;
    }

    render() {
        return html`
            <div class="d-flex align-items-stretch w-full mb-3 px-1 border-bottom" style="border-color:${this.app.color || ""}!important;border-width: 2px!important">
                <a class="d-flex align-items-center gap-2 me-5 user-select-none text-body text-decoration-none" href="#${this.app.id}/home">
                    <i class="fas ${this.app.icon || ""} fs-3"></i>
                    <span class="fs-3 fw-bold">${this.app.title || this.app.name || "-"}</span>
                </a>
                <ul class="nav nav-underline">
                    ${(this.app?.menu || []).map(tool => this.renderTool(tool))}
                </ul>
            </div>
        `;
    }

}

customElements.define("layout-secondary-bar", LayoutSecondaryBar);
