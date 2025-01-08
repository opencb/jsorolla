import {LitElement, html, nothing} from "lit";

export default class GridNotifications extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            notifications: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    renderNotification(notification) {
        return html`
            <div class="d-flex gap-3 alert alert-warning mb-0 p-2">
                <div class="flex-grow-0">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="flex-grow-1">
                    <span>${notification.message}</span>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="dropdown">
                <button class="btn ${this._config.display?.buttonClass}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                    <i class="fa ${this._config.icon}"></i> 
                    <span>(${this.notifications?.length ?? 0})</span>
                </button>
                <div class="dropdown-menu dropdown-menu-end shadow ${this._config?.display?.contentClass}" style="${this._config.display?.contentStyle}">
                    ${this._config.title ? html`
                        <div class="fw-bold fs-5 mb-1">${this._config.title}</div>
                    ` : nothing}
                    ${this.notifications?.length > 0 ? html`
                        <div class="d-flex flex-column gap-2">
                            ${this.notifications?.map(notification => this.renderNotification(notification))}
                        </div>
                    ` : html`
                        <div class="d-flex flex-column align-items-center py-5 px-4 bg-gray-100 rounded">
                            <div class="mb-2">
                                <i class="fas fa-bell-slash fs-2"></i>
                            </div>
                            <div class="fw-bold lh-sm">You do not have any notification.</div>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "fa-bell",
            title: "Notifications",
            display: {
                buttonClass: "btn-light",
                contentClass: "p-2",
                contentStyle: "width: 400px;",
            },
        };
    }

}

customElements.define("grid-notifications", GridNotifications);
