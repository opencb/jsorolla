import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/tool-header.js";
import "../commons/forms/data-form.js";
import "../commons/view/detail-tabs.js";
import "./user-info.js";
import "./user-projects.js";
import "./user-password-change.js";

export default class UserProfile extends LitElement {

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
        };
    }

    #init() {
        this.updateParams = {};
        this.projectsByUser = {};
        this.currentTab = "projects";
        this.config = this.getDefaultConfig();
    }

    renderTitle(headingType, icon, title) {
        return html`
            <div class="${headingType}" style="color: var(--main-bg-color);margin-bottom:24px;">
                <i class="fas fa-${icon} icon-padding"></i>
                <strong>${title}</strong>
            </div>
        `;
    }

    render() {
        // TODO: check if opencgaSession has been provided
        return html`
            <tool-header title="Your profile" icon="fa fa-user-circle"></tool-header>
            <div class="container" style="margin-top:48px;">
                <div style="display:flex;">
                    <div class="col-md-4">
                        <div style="position:sticky;top:0px">
                            ${this.renderTitle("h3", "user", "User info")}
                            <user-info .opencgaSession="${this.opencgaSession}"></user-info>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <detail-tabs
                            .config="${this.config}"
                            .opencgaSession="${this.opencgaSession}">
                        </detail-tabs>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showTitle: false,
            items: [
                {
                    id: "user-projects",
                    name: "Projects",
                    active: true,
                    render: (data, active, opencgaSession) => html`
                        <div>
                            ${this.renderTitle("h2", "archive", "Projects and Studies")}
                            <user-projects
                                .opencgaSession="${opencgaSession}">
                            </user-projects>
                        </div>
                    `,
                },
                {
                    id: "user-password-change",
                    name: "Change password",
                    active: false,
                    render: (data, active, opencgaSession) => html`
                        <div>
                            ${this.renderTitle("h2", "user-shield", "Change Password")}
                            <user-password-change
                                .opencgaSession="${opencgaSession}">
                            </user-password-change>
                        </div>
                    `,
                },
            ],
        };
    }

}

customElements.define("user-profile", UserProfile);
