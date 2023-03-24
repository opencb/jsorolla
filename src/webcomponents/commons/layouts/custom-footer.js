/**
 * Copyright 2015-2021 OpenCB
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

export default class CustomFooter extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            appName: {
                type: String,
            },
            version: {
                type: String,
            },
            host: {
                type: Object,
            },
            config: {
                type: Object,
            },
        };
    }

    renderStyle() {
        return html`
            <style>
                .footer {
                    display: flex;
                    flex-direction: column;
                    bottom: 0;
                    width: 100%;
                    min-height: 50px;
                }

                .footer-section-wrapper,
                .footer-section {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    align-items: center;
                    align-content: center;
                    flex: 1;
                }

                #footer-zetta{
                    background-color: ${this.config.footer?.display?.backgroundColor || html `var(--footer-color-bg)` };
                }

                #footer-zetta-copyright{
                    justify-content: flex-start;
                }

                #footer-zetta-product{
                    justify-content: center;
                }

                #footer-zetta-versions{
                    justify-content: flex-end;
                }

                .footer-section-versions {
                    display: flex;
                    margin: 0 1rem;
                }

                .footer-item {
                    /*background-color: var(--footer-color-bg-dark);*/
                    color: var(--main-color-white);
                    padding: 0.4rem 0.6rem;
                    margin: 0 0.4rem;
                    border-radius: 4px;
                    font-variant: all-small-caps;
                    text-transform: uppercase;
                }

                .footer-logo{
                    margin: 0 1rem;
                }

                .footer-section-text,
                .footer-section-text > a,
                .footer-section-text > a:visited,
                .footer-section-text > a:hover {
                    text-decoration: none;
                    color: ${this.config.footer?.versions?.display?.textColor || html `var(--main-color-white)` };
                }

            </style>
        `;
    }

    render() {
        return html `
            ${this.renderStyle()}

            <div class="footer">
                <!-- CUSTOM FOOTER -->
                ${this.config?.footer?.custom ? html `
                    ${this.config.footer?.custom}
                ` : html `
                    <!-- ZETTA FOOTER -->
                    <div class="footer-section-wrapper" id="footer-zetta">
                        <!-- Optional: Copyright -->
                       <div class="footer-section" id="footer-zetta-copyright">
                            ${this.config?.footer?.copyright ? html`
                                ${this.config.footer?.copyright?.logos.map(logo => html `
                                    <div class="footer-logo">
                                        ${logo.link ? html `
                                        <a href="${logo.link}" target="blank"><img src="${logo.img}" style="height: ${logo.height}"></a>
                                    ` : html `
                                        <img src="${logo.img}" style="height: ${logo.height}">
                                    `}
                                    </div>
                                `)}
                        ` : null}
                       </div>
                        <!-- Optional: Product -->
                        <div class="footer-section" id="footer-zetta-product">
                            ${this.config?.footer?.product?.logos ? html`
                            ${this.config?.footer?.product.logos.map(logo => html `
                                ${logo.img ? html `
                                    <div class="footer-logo">
                                        ${logo.link ? html `
                                        <a href="${logo.link}" target="blank"><img src="${logo.img}" style="height: ${logo.height}"></a>
                                    ` : html `
                                        <img src="${logo.img}" style="height: ${logo.height}">
                                    `}
                                        ${this.host?.opencga ? html `
                                        <sup style="margin-left: 0.9rem; color: white">${this.host?.opencga}</sup>
                                    ` : html`
                                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
                                    `}
                                    </div>
                                `: null}
                            `)}
                        ` : null}
                        </div>
                        <!-- OpenCB versions -->
                        <div class="footer-section" id="footer-zetta-versions">
                            <!-- Optional: OpenCB versions logo -->
                            ${this.config.footer?.versions?.logo ? html `
                                <div class="footer-logo">
                                    ${this.config.footer?.versions?.logo.link ? html `
                                        <a href="${this.config.footer?.versions?.logo.link}" target="blank">
                                            <img
                                                src="${this.config.footer?.versions?.logo.img}"
                                                style="height: ${this.config.footer?.versions?.logo.height}">
                                        </a>
                                    ` : html `
                                        <img
                                            src="${this.config.footer?.versions?.logo.img}"
                                            style="height: ${this.config.footer?.versions?.logo.height}">
                                    `}
                                </div>
                            ` : null}
                            <!-- Optional: OpenCB text -->
                            ${this.config.footer?.versions?.text ? html `
                                <div class="footer-section-text">
                                    ${this.config.footer?.versions?.link ? html `
                                        <a href="${this.config.footer?.versions?.link}" target="blank">
                                            ${this.config?.footer?.versions?.text}
                                        </a>
                                    ` : html `${this.config?.footer?.versions?.text}`}
                                </div>
                            ` : null}
                            <!-- Fixed: OpenCB versions -->
                            <div class="footer-section-versions">
                                <div class="footer-item">
                                    ${this.appName || "JSorolla"} <sup style="margin-left: 0.9rem">${this.version || this.config?.version}</sup>
                                </div>
                                <div class="footer-item">
                                    OpenCGA
                                    ${this.host?.opencga ? html `
                                        <sup style="margin-left: 0.9rem">${this.host?.opencga}</sup>
                                    ` : html`
                                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
                                    `}
                                </div>
                                ${this.host?.cellbase ? html `
                                    <div class="footer-item">
                                    CellBase
                                    ${this.host?.cellbase ? html `
                                        <sup style="margin-left: 0.9rem">${this.host?.cellbase}</sup>
                                    ` : html`
                                        <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>
                                    `}
                                    </div>
                                ` : null}
                            </div>
                        </div>
                    </div>
                ` }
            </div>
        `;
    }

}

customElements.define("custom-footer", CustomFooter);
