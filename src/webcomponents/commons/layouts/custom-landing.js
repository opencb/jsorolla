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
                .landing-top {
                    align-items: center;
                    display: flex;
                    height: calc(16px * 5);
                    justify-content: space-between;
                    padding: 16px;
                    width: 100%;
                }
                .landing-top-logo img {
                    height: 40px;
                    width: auto;
                }
                .landing-content {
                    align-items: center;
                    display: flex;
                    height: calc(100vh - 112px - 70px);
                    justify-content: center;
                    padding: 16px;
                    width: 100%;
                }
            </style>
            <div class="landing">
                <!-- Landing top section -->
                <div class="landing-top">
                    <div class="landing-top-logo">
                        ${this.config?.landing?.logo ? html`
                            <img src="${this.config.landing.logo}" />
                        ` : null}
                    </div>
                </div>
                <div class="landing-content">
                    <!-- Display login buttons -->
                    <div align="center" style="margin-top:50px;">
                        <a class="btn btn-primary" href="${this.getSSOUrl()}">
                            <strong style="color:white;">Login with SSO</strong>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("custom-landing", CustomLanding);
