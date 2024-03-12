import {LitElement, html} from "lit";
import "../commons/tool-header.js";
import "../commons/view/detail-tabs.js";
import "./user-info.js";
import "./user-projects.js";
import "./user-password-change.js";
import ExtensionsManager from "../extensions-manager.js";

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
            settings: {
                type: Object
            }
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("settings")) {
            this.settingsObserver();
        }
        super.update(changedProperties);
    }

    settingsObserver() {
        if (this.settings?.items) {
            this.config = this.getDefaultConfig();
            // this.config.items = UtilsNew.mergeConfigById(this.config.items, this.settings?.items);
            this.requestUpdate();
        }
    }

    render() {
        // TODO: check if opencgaSession has been provided
        return html`
            <tool-header title="Your profile" icon="fa fa-user-circle"></tool-header>
            <div class="container" style="margin-top:48px;">
                <div style="display:flex;">
                    <div class="col-md-4">
                        <div style="position:sticky;top:0">
                            <user-info
                                .user="${this.opencgaSession?.user}">
                            </user-info>
                        </div>
                    </div>
                    <div class="col-md-8">
                        <detail-tabs
                            .data="${{}}"
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
                            <user-projects
                                .projects="${opencgaSession?.projects}">
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
                            <user-password-change
                                .opencgaSession="${opencgaSession}">
                            </user-password-change>
                        </div>
                    `,
                },
                ...ExtensionsManager.getDetailTabs("user-profile"),
            ],
        };
    }

}

customElements.define("user-profile", UserProfile);
