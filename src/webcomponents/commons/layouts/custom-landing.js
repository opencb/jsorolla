/**
 * Copyright 2015-present OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../user/user-login.js";

export default class CustomLanding extends LitElement {

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
                        <a href="#" class="link-body-emphasis" @click="${e => this.onLoginModeChange(e, "CREDENTIALS")}">or login without SSO</a>
                    </div>
                </div>
            `;
        }

        // No SSO and opencgaSession is ready, render the user-login component
        return html`
            <div class="d-flex flex-column gap-2">
                <user-login
                    .opencgaSession="${this.opencgaSession}">
                </user-login>
                ${this.opencgaSession?.opencgaClient?._config?.sso?.active ? html`
                    <div class="text-center">
                        <a href="#" class="link-body-emphasis" @click="${e => this.onLoginModeChange(e, "SSO")}">or login with SSO</a>
                    </div>
                ` : nothing}
            </div>
        `;
    }

    renderStyle() {
        return html`
            <style>
                .landing-wrapper {
                    display: flex;
                    justify-content: center;
                    align-items: stretch;
                    height: 100vh;
                }

                .landing-wrapper > div {
                    flex: 1;
                }

                .landing-wrapper > .landing-company {
                    background-color: var(--main-bg-color);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .landing-wrapper > .landing-company > div {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin: 1em;
                }

                .landing-wrapper > .landing-company > .landing-logo {
                    justify-content: flex-start;
                }

                .landing-wrapper .landing-title {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    font-size: 1.5em;
                    font-weight: 100;
                    letter-spacing: 8px;
                    text-transform: uppercase;
                }

                .landing-wrapper > .landing-company > .landing-title {
                    color: #f2f4f6;
                }

                .landing-wrapper > .landing-company > .landing-ukca {
                    display: flex;
                    align-items: flex-end;
                    flex:0;
                }
                .landing-wrapper > .landing-company > .landing-ukca > .landing-ukca-logo {
                    flex: 0;
                }
                .landing-wrapper > .landing-company > .landing-ukca > .landing-ukca-description {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-self: stretch;
                    justify-content: space-around;
                }


                .landing-wrapper > .landing > .landing-title {
                    flex:0;
                    margin: 0;
                }

                .landing {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .landing-wrapper > .landing > div {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    margin: 1em;
                }

                .landing-wrapper > .landing > .landing-logo {
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    margin-bottom: 0;
                }

                .landing-logo > img {
                    margin: 1em;
                }

                .landing-logo {
                    height: 100px;
                    width: auto;
                }

                .landing-content {
                    max-width: 640px;
                    width: 100%;
                }

                .landing-login button.btn.btn-primary.btn-block {
                    background-color: hsl(222, 20%, 45%);
                    border: 0;
                }
            </style>
        `;
    }

    render() {
        const ukcaSection = this.config?.landingPage?.organisation?.ukca || {};
        return html`
            ${this.renderStyle()}
            <div class="landing-wrapper">
                <div class="landing-company">
                    <!-- Landing company section -->
                    ${this.config?.landingPage?.organisation?.logo?.img ? html`
                        <div class="landing-logo ${this.config.landingPage?.organisation?.display?.logoClass}"
                            style="${this.config.landingPage?.organisation?.display?.logoStyle}">
                            ${this.config?.landingPage?.organisation?.logo?.link ? html `
                                <a href="${this.config?.landingPage?.organisation?.logo?.link}" target="_blank">
                                    <img height="${this.config?.landingPage?.organisation?.logo?.height || "30px"}"
                                        src="${this.config.landingPage?.organisation?.logo?.img}"/>
                                </a>
                            `: html `
                                <img height="${this.config?.landingPage?.organisation?.logo?.height || "30px"}"
                                    src="${this.config.landingPage?.organisation?.logo?.img}"/>
                            `}
                        </div>
                        <div class="landing-title ${this.config.landingPage?.organisation?.display?.titleClass}"
                            style="${this.config.landingPage?.organisation?.display?.titleStyle}">
                            ${this.config.landingPage?.organisation?.title}
                        </div>
                    ` : null}
                    <!-- Landing ukca margin section -->
                    ${ukcaSection?.enabled ? html`
                        <div class="landing-ukca">
                            <div class="landing-ukca-logo">
                                <div class="${ukcaSection.display?.logoClass}">
                                    ${ukcaSection?.logo?.link ? html `
                                        <a href="${ukcaSection?.logo?.link}" target="_blank">
                                            <img height="${ukcaSection?.logo?.height || "100px"}"
                                                src="${ukcaSection?.logo?.img}"
                                                style="${ukcaSection?.display?.logoStyle || "padding: 1em; margin-right: 30px; background-color: white"}"/>
                                        </a>
                                    `: html `
                                        <img height="${ukcaSection?.logo?.height || "100px"}"
                                            src="${ukcaSection?.logo?.img}"
                                            style="${ukcaSection?.display?.logoStyle || "padding: 1em; margin-right: 30px; background-color: white"}"/>
                                    `}
                                </div>
                            </div>
                            <div class="landing-ukca-description">
                                <div class="landing-ukca-title ${ukcaSection?.display?.titleClass}"
                                    style="${ukcaSection?.display?.titleStyle || "color: #f2f4f6; font-size:20px"}">
                                    ${ukcaSection?.title}
                                </div>
                                <div class="landing-ukca-content ${ukcaSection?.display?.contentClass}"
                                    style="${ukcaSection?.display?.contentStyle || "color: #8d9ab8"}">
                                    ${ukcaSection?.content || ""}
                                </div>
                            </div>
                        </div>
                    ` : null}
                </div>
                <div class="landing">
                    <!-- Landing title -->
                    ${this.config?.landingPage?.login?.logo || this.config.landingPage?.login?.title ? html`
                        <div class="landing-logo ${this.config.landingPage?.login?.display?.logoClass}"
                            style="${this.config.landingPage?.login?.display?.logoStyle}">
                            <img height="${this.config?.landingPage?.login?.logo?.height || "30px"}"
                                src="${this.config.landingPage?.login?.logo?.img}"/>
                        </div>
                        <div class="landing-title ${this.config.landingPage?.login?.display?.titleClass}"
                            style="${this.config.landingPage?.login?.display?.titleStyle}">
                            ${this.config.landingPage?.login?.title}
                        </div>
                    ` : null}
                    <!-- Landing description -->
                    ${this.config?.landingPage?.login?.content ? html`
                        <div class="text-center landing-content ${this.config.landingPage?.login?.display?.contentClass}"
                            style="${this.config.landingPage?.login?.display?.contentStyle}">
                            ${UtilsNew.renderHTML(this.config.landingPage?.login?.content)}
                        </div>
                    ` : null}
                    <!-- Landing login -->
                    <div class="landing-login">
                        ${this.renderLogin()}
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("custom-landing", CustomLanding);
