import {LitElement, html, nothing} from "lit";
import "../../user/user-login.js";

export default class LoginPage extends LitElement {

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
        // Josemi 2024-05-15 NOTE: this internal variable is only used when the SSO login is enabled
        // This allows us to switch between the login with sso and login with credentials mode
        // Allowed values:
        // - "SSO": we will display the login with SSO button
        // - "CREDENTIALS": we will display the default login with credentials form
        this.loginMode = "SSO";
    }

    getSSOUrl() {
        if (this.opencgaSession?.opencgaClient) {
            const config = this.opencgaSession?.opencgaClient?._config;
            return `${config.host}/webservices/rest/${config.version}/meta/sso/login?url=${window.location.href}`;
        } else {
            return "#";
        }
    }

    onLoginModeChange(event, newMode) {
        event.preventDefault();
        this.loginMode = newMode;
        this.requestUpdate();
    }

    renderLogin() {
        // Check if opencgaSession and opencgaClient have been initialized
        // This prevents displaying the login form before checkig if SSO is enabled.
        if (!this.opencgaSession?.opencgaClient) {
            return html`
                <div align="center" style="font-size:2.5rem;">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
            `;
        }

        // Check if SSO is active. In this case, we will render the SSO button instead of the login form
        if (this.opencgaSession?.opencgaClient?._config?.sso?.active && this.loginMode === "SSO") {
            return html`
                <div class="d-flex flex-column gap-2">
                    <div align="center">
                        <a class="btn-group text-decoration-none" role="group" href="${this.getSSOUrl()}">
                            <button type="button" class="btn btn-primary btn-lg" style="">
                                <i class="fas fa-user"></i>
                            </button>
                            <button type="button" class="btn btn-primary btn-lg">
                                <strong>Login with SSO</strong>
                            </button>
                        </a>
                    </div>
                    <div class="text-center">
                        <a href="#" class="text-gray-600 hover:text-gray-900" @click="${e => this.onLoginModeChange(e, "CREDENTIALS")}">
                            or login without SSO
                        </a>
                    </div>
                </div>
            `;
        }

        // No SSO and opencgaSession is ready, render the user-login component
        return html`
            <div class="d-flex flex-column gap-3">
                <user-login
                    .opencgaSession="${this.opencgaSession}">
                </user-login>
                ${this.opencgaSession?.opencgaClient?._config?.sso?.active ? html`
                    <div class="text-center">
                        <a href="#" class="text-gray-600 hover:text-gray-900" @click="${e => this.onLoginModeChange(e, "SSO")}">
                            or login with SSO
                        </a>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    renderLoginSection() {
        const config = this.config?.loginPage?.login || {};

        return html`
            <div class="d-flex flex-column align-items-center">
                <!-- Login logo -->
                ${config?.logo ? html`
                    <div class="${config?.display?.logoClass}" style="${config?.display?.logoStyle}">
                        <img height="${config?.display?.logoHeight || "30px"}" src="${config?.logo}"/>
                    </div>
                ` : nothing}

                <!-- Login title -->
                ${config?.title ? html`
                    <div class="text-center ${config?.display?.titleClass}" style="${config?.display?.titleStyle}">
                        <span>${config?.title}</span>
                    </div>
                ` : nothing}

                <!-- Login subtitle -->
                ${config?.subtitle ? html`
                    <div class="text-center ${config?.display?.subtitleClass}" style="${config?.display?.subtitleStyle}">
                        <span>${config.subtitle}</span>
                    </div>
                ` : nothing}

                <!-- Login form -->
                ${this.renderLogin()}
            </div>
        `;
    }

    renderOrganisationSection() {
        const config = this.config?.loginPage?.organisation || {};

        return html`
            <div class="w-full h-full d-flex flex-column justify-content-center text-white p-5">
                <!-- Landing company section -->
                <div class="w-full d-flex flex-column align-items-center justify-content-center h-full">
                    ${config?.logo ? html`
                        <div class="${config.display?.logoClass}" style="${config.display?.logoStyle}">
                            <a href="${config.link || ""}" target="_blank">
                                <img height="${config.display?.logoHeight || "30px"}" src="${config.logo}"/>
                            </a>
                        </div>
                    ` : nothing}
                    ${config?.title ? html`
                        <div class="text-center ${config.display?.titleClass}" style="${config.display?.titleStyle}">
                            <span>${config.title}</span>
                        </div>
                    ` : nothing}
                </div>

                <!-- landing regulatory section -->
                ${(config.regulatory || []).length > 0 ? html`
                    <div class="d-flex gap-4">
                        ${config.regulatory.map(item => html`
                            <div class="d-flex gap-4">
                                ${item?.logo ? html`
                                    <div class="d-flex flex-column ${item.display?.logoClass}" style="${item.display?.logoStyle}">
                                        <img height="${item.display?.logoHeight || "100px"}" src="${item.logo}">
                                        ${item?.caption ? html`
                                            <div class="${item.display?.captionClass}" style="${item.display?.captionStyle}">
                                                ${item.caption}
                                            </div>
                                        ` : nothing}
                                    </div>
                                ` : nothing}
                                ${(item.title || item.description) ? html`
                                    <div class="d-flex flex-column gap-2 justify-content-center">
                                        ${item.title ? html`
                                            <div class="${item.display?.titleClass}" style="${item.display?.titleStyle}">
                                                <span>${item.title}</span>
                                            </div>
                                        ` : nothing}
                                        ${item.description ? html`
                                            <div class="${item.display?.descriptionClass}" style="${item.display?.descriptionStyle}">
                                                <span>${item.description}</span>
                                            </div>
                                        ` : nothing}
                                    </div>
                                ` : nothing}
                            </div>
                        `)}
                    </div>
                ` : nothing}
            </div>
        `;
    }

    render() {
        return html`
            <div class="d-flex w-full h-screen" style="background-color:#030F30;">
                <div class="w-full h-full">
                    ${this.renderOrganisationSection()}
                </div>
                <div class="w-full d-flex align-items-center justify-content-center bg-gray-100 rounded-start-5" style="max-width:800px;">
                    ${this.renderLoginSection()}
                </div>
            </div>
        `;
    }

}

customElements.define("login-page", LoginPage);
