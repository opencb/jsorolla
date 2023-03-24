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

import {LitElement, html} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import "../../user/user-login.js";

export default class CustomLanding extends LitElement {

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

    getSSOUrl() {
        if (this.opencgaSession?.opencgaClient) {
            const config = this.opencgaSession?.opencgaClient?._config;
            return `${config.host}/webservices/rest/${config.version}/meta/sso?url=${window.location.href}`;
        } else {
            return "#";
        }
    }

    render() {
        return html`
            <style>
                .landing-wrapper {
                    display: flex;
                    justify-content: center;
                    height: 100vh;
                }

                .landing-wrapper > div {
                    flex: 1;
                }

                .landing-wrapper > .landing-left {
                    background-color: var(--main-bg-color);
                }

                .landing {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    padding: 16px;
                }

                .landing-logo > img{
                    margin: 1em;
                }

                .landing-logo {
                    height: 100px;
                    margin-bottom: 32px;
                    width: auto;
                }
                .landing-title {
                    font-size: 3.5rem;
                    font-weight: bold;
                    margin-bottom: 32px;
                    max-width: 640px;
                    text-align: center;
                    width: 100%;
                }
                .landing-content {
                    margin-bottom: 32px;
                    max-width: 640px;
                    width: 100%;
                }
                .landing-login-sso-helper {
                    color: #909294;
                    font-size: 12px;
                    margin-top: 1rem;
                    max-width: 240px;
                    text-align: center;
                    width: 100%;
                }

                .landing-login button.btn.btn-primary.btn-block {
                    background-color: hsl(222, 20%, 45%);
                    border: 0;
                }


            </style>
            <div class="landing-wrapper">
                <div class="landing-left">
                    <!-- Landing logo section -->
                    ${this.config?.landingPage?.logo ? html`
                    <div class="landing-logo ${this.config.landingPage.display?.logoClass}" style="${this.config.landingPage.display?.logoStyle}">
                        <img height="100%" src="${this.config.landingPage.logo}" />
                    </div>
                ` : null}
                </div>
                <div class="landing">
                    <!-- Landing title -->
                    ${this.config?.landingPage?.title ? html`
                    <div class="landing-title ${this.config.landingPage.display?.titleClass}" style="${this.config.landingPage.display?.titleStyle}">
                        ${this.config.landingPage.title}
                    </div>
                ` : null}
                    <!-- Landing description -->
                    ${this.config?.landingPage?.content ? html`
                    <div align="center" class="landing-content ${this.config.landingPage.display?.contentClass}" style="${this.config.landingPage.display?.contentStyle}">
                        ${UtilsNew.renderHTML(this.config.landingPage.content)}
                    </div>
                ` : null}
                    <!-- Landing login -->
                    <div class="landing-login">
                        ${this.opencgaSession?.opencgaClient?._config?.sso ? html `
                        <div align="center">
                            <a class="btn-group" role="group" href="${this.getSSOUrl()}">
                                <button type="button" class="btn btn-primary btn-lg" style="">
                                    <i class="fas fa-user"></i>
                                </button>
                                <button type="button" class="btn btn-primary btn-lg">
                                    <strong style="color:white;">Login with SSO</strong>
                                </button>
                            </a>
                        </div>
                        <div class="landing-login-sso-helper">
                            By clicking on the <b>Login with SSO</b> button you will be redirected to your SSO login page.
                        </div>
                    ` : html`
                        <user-login
                            .opencgaSession="${this.opencgaSession}">
                        </user-login>
                    `}
                    </div>
                </div>

            </div>
        `;
    }

}

customElements.define("custom-landing", CustomLanding);
