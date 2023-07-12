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
        if (this.config?.footer?.custom) {
            return html`${this.config.footer.custom}`;
        }

        return html `
            ${this.renderStyle()}

            <div class="footer">
                <div class="footer-section-wrapper" id="footer-zetta">
                    <!-- Optional: Organisation -->
                    <div class="footer-section" id="footer-zetta-copyright">
                        ${this.config.footer?.organisation?.logo ? html`
                            <div class="footer-logo">
                                ${this.config.footer.organisation.logo.link ? html `
                                    <a href="${this.config.footer.organisation.logo.link}" target="blank">
                                        <img src="${this.config.footer.organisation.logo.img}" style="height: ${this.config.footer.organisation.logo.height}">
                                    </a>
                                ` : html `
                                    <img src="${this.config.footer.organisation.logo.img}" style="height: ${this.config.footer.organisation.logo.height}">
                                `}
                            </div>
                        ` : null}
                        ${this.config.footer?.organisation?.text ? html`
                            <div class="${this.config.footer?.organisation?.textStyle}">
                                ${this.config.footer.organisation.text};
                            </div>
                        ` : null}
                    </div>

                    <!-- Optional: Project -->
                    <div class="footer-section" id="footer-zetta-product">
                        ${this.config?.footer?.project?.logo?.img ? html`
                            <div class="footer-logo">
                                ${this.config.footer.project.logo.link ? html `
                                    <a href="${this.config.footer.project.logo.link}" target="blank">
                                        <img src="${this.config.footer.project.logo.img}" style="height: ${this.config.footer.project.logo.height}">
                                    </a>
                                ` : html `
                                    <img src="${this.config.footer.project.logo.img}" style="height: ${this.config.footer.project.logo.height}">
                                `}
                                ${this.host?.opencga ? html `
                                    <sup style="margin-left: 0.9rem; color: white">${this.host?.opencga}</sup>` : html`
                                    <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`
                                }
                            </div>
                        `: null}
                    </div>

                    <!-- OpenCB -->
                    <div class="footer-section" id="footer-zetta-versions">
                        <!-- Optional: OpenCB versions logo -->
                        ${this.config.footer?.opencb?.logo ? html `
                            <div class="footer-logo">
                                ${this.config.footer?.opencb?.logo.link ? html `
                                    <a href="${this.config.footer?.opencb?.logo.link}" target="blank">
                                        <img src="${this.config.footer?.opencb?.logo.img}" style="height: ${this.config.footer?.opencb?.logo.height}">
                                    </a>
                                ` : html `
                                    <img src="${this.config.footer?.opencb?.logo.img}" style="height: ${this.config.footer?.opencb?.logo.height}">
                                `}
                            </div>
                        ` : null}
                        <!-- Optional: OpenCB text -->
                        ${this.config.footer?.opencb?.text ? html `
                            <div class="footer-section-text">
                                ${this.config.footer?.opencb?.link ? html `
                                    <a href="${this.config.footer?.opencb?.link}" target="blank">
                                        ${this.config?.footer?.opencb?.text}
                                    </a>
                                ` : html `${this.config?.footer?.opencb?.text}`}
                            </div>
                        ` : null}
                        <!-- Fixed: OpenCB versions -->
                        <div class="footer-section-versions">
                            <div class="footer-item footer-section-text">
                                <a href="https://github.com/opencb/jsorolla" target="blank" style="color: white">
                                    ${this.appName || "IVA (JSorolla)"} <sup style="margin-left: 5px">${this.version || this.config?.version}</sup>
                                </a>
                            </div>
                            ${this.host?.opencga ? html `
                                <div class="footer-item footer-section-text">
                                    <a href="https://github.com/opencb/opencga" target="blank" style="color: white">
                                        OpenCGA <sup style="margin-left: 5px">${this.host?.opencga}</sup>
                                    </a>
                                </div>
                            ` : html`OpenCGA <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`
                            }
                            ${this.host?.cellbase ? html `
                                <div class="footer-item footer-section-text">
                                    <a href="https://github.com/opencb/cellbase" target="blank" style="color: white">
                                        CellBase <sup style="margin-left: 5px">${this.host?.cellbase}</sup>
                                    </a>
                                </div>
                            ` : html`CellBase <i class="fa fa-spinner fa-spin" aria-hidden="true"></i>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("custom-footer", CustomFooter);
