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
import {guardPage} from "../html-utils.js";

export default class CustomWelcome extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            app: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            version: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    onChangeApp(e) {
        this.dispatchEvent(new CustomEvent("changeApp", {
            detail: {
                id: e.currentTarget.dataset.id,
                e: e,
            },
            bubbles: true,
            composed: true,
        }));
    }

    isWelcomeSuite() {
        return !this.app || this.app?.id === "suite";
    }

    getWelcomePageConfig() {
        return this.isWelcomeSuite() ? this.config.welcomePage : this.app.welcomePage;
    }

    renderApplicationsOrTools() {
        const session = this.opencgaSession;

        if (this.isWelcomeSuite()) {
            // Render applications list
            const visibleApps = (this.config.apps || []).filter(app => {
                return UtilsNew.isAppVisible(app, session);
            });

            return html`
            <!-- row hi-icon-wrap hi-icon-effect-9 hi-icon-animation -->
                <div class="d-flex justify-content-around gap-2">
                    ${visibleApps.map(item => html`
                        <div class="w-50 shadow p-3 mb-5 bg-body rounded-5 text-center zetta-animation-pulse">
                            <a class="text-decoration-none" href="#home" data-id="${item.id}" @click="${this.onChangeApp}">
                                    <div class="hi-icon">
                                        <img alt="${item.name}" src="${item.icon}"/>
                                    </div>
                                    <b class="text-decoration-none">${item.name}</b>
                                </a>
                        </div>
                    `)}
                </div>
            `;
        } else {
            // Render tools list
            const featuredTools = [];
            (this.app.menu || []).forEach(item => {
                if (UtilsNew.isAppVisible(item, session)) {
                    // Check if the primary menu item is featured
                    if (item.featured) {
                        featuredTools.push(item);
                    }

                    // Check for submenu items
                    (item.submenu || []).forEach(subitem => {
                        if (UtilsNew.isAppVisible(subitem) && subitem.featured) {
                            featuredTools.push(subitem);
                        }
                    });
                }
            });

            return html`
                <div class="d-flex justify-content-center mt-2 gap-2">
                    ${
                        featuredTools.map(item => {
                            const itemLink = `${item.id}${session?.project ? `/${session?.project?.id}/${session?.study?.id}`: ""}`;
                            return html`
                                <div class="card w-50 shadow p-3 mb-5 bg-body rounded border-0" data-cy-welcome-card-id="${item.id}">
                                    <div class="card-body d-flex flex-column">
                                        <a class="text-decoration-none" href="#${itemLink}">
                                            <div class="text-center">
                                                ${ item?.icon.includes("fas") ? html`
                                                    <i class="${item.icon}" style="font-size: 5em;"></i>
                                                ` : html`
                                                    <img alt="${item.name}" width="100px" src="${item.icon}"/>
                                                `}
                                            </div>
                                            <h4 class="card-title text-center">${item.name}</h4>
                                        </a>
                                        ${item.description ? UtilsNew.renderHTML(item.description) : ""}
                                            <a class="btn btn-primary btn-lg mt-auto text-white" href="#${itemLink}">
                                                Enter
                                            </a>
                                    </div>
                                </div>
                            `;
                        })
                    }
                </div>
            `;
        }
    }

    renderStyle() {
        return html`
            <style>
                .getting-started {
                    display: inline-block;
                    border: 4px var(--main-bg-color) solid;
                    background: white;
                    position: relative;
                    padding: 10px 35px;
                    -webkit-transition: all 0.3s;
                    -moz-transition: all 0.3s;
                    transition: all 0.3s;
                    border-radius: 30px;
                    margin-left: 16px;
                    margin-right: 16px;
                }

                .getting-started:hover {
                    text-decoration: none;
                }

                .getting-started span {
                    color: var(--main-bg-color);
                    font-size: .8em;
                    display: inline-block;
                    -webkit-transition: all 0.3s;
                    -moz-transition: all 0.3s;
                    transition: all 0.3s;
                }

                .getting-started:hover {
                    -webkit-transform: scale(1.2);
                    -moz-transform: scale(1.2);
                    -ms-transform: scale(1.2);
                    transform: scale(1.2);
                    border: 4px #fff solid;
                    background: var(--main-bg-color);
                }

                .getting-started:hover span {
                    -webkit-transform: scale(1);
                    -moz-transform: scale(1);
                    -ms-transform: scale(1);
                    transform: scale(1);
                    color: #fff
                }

                #bottomLogo {
                    display: flex;
                    justify-content: center;
                    margin: 3em 0;
                }
            </style>
        `;
    }

    render() {
        const welcomePage = this.getWelcomePageConfig();

        if (!UtilsNew.isNotEmptyArray(this.opencgaSession?.projects) ||
            this.opencgaSession.projects.every(p => !UtilsNew.isNotEmptyArray(p.studies))) {
            return guardPage("You don't have projects or/and studies. Please contact the admin");
        }

        return html`
            ${this.renderStyle()}

            <div class="container mt-3">
                <!-- Welcome page logo -->

                ${welcomePage?.logo ? html`
                <div class="text-center mt-5">
                    <img
                        alt="${welcomePage.display?.logoAlt || "logo"}"
                        class="${welcomePage.display?.logoClass}"
                        src="${welcomePage.logo}"
                        style="${welcomePage.display?.logoStyle}"
                        width="${welcomePage.display?.logoWidth || "300px"}"
                    />
                </div>
                ` : nothing}

                <!-- Welcome page title -->
                ${welcomePage?.title ? html`
                    <div class="d-flex justify-content-center my-3">
                        <img src="${welcomePage.appLogo?.img}" height="${welcomePage.appLogo?.height || "40px"}"/>
                        <h1 class="${welcomePage.display?.titleClass}" style="${welcomePage.display?.titleStyle}">
                            ${welcomePage.title}
                        </h1>
                    </div>
                `: nothing}

                <!-- Welcome page subtitle -->
                ${welcomePage?.subtitle ? html`
                    <h4 class="${welcomePage.display?.subtitleClass}" style="${welcomePage.display?.subtitleStyle}">
                        ${welcomePage.subtitle}
                    </h4>
                ` : nothing}

                <!-- Custom content -->
                ${welcomePage?.content ? html`
                    <div style="${welcomePage.display?.contentStyle || "margin-bottom:16px;"}">
                        ${UtilsNew.renderHTML(welcomePage.content)}
                    </div>
                ` : nothing}

                <!-- Applications or tools -->
                ${this.renderApplicationsOrTools()}

                <!-- Display custom links -->
                <div class="text-center mt-5">
                    ${(welcomePage?.links || []).map(link => html`
                        <a class="getting-started" href="${link.url}" target="${link.target || "_blank"}"><span>${link.title}</span></a>
                    `)}
                </div>

                <!-- Logo at the bottom of the content -->
                ${welcomePage?.bottomLogo?.img ? html`
                <!-- d-flex justify-content-center mx-3 my-0 -->
                    <div id="bottomLogo">
                        ${welcomePage.bottomLogo.link ? html `
                            <a href="${welcomePage.bottomLogo.link}" target="blank">
                                <img
                                    src="${welcomePage.bottomLogo.img}"
                                    height="${welcomePage.bottomLogo.height || "60px"}"
                                />
                            </a>
                        ` : html `
                            <img
                                src="${welcomePage.bottomLogo.img}"
                                height="${welcomePage.bottomLogo.height || "60px"}"
                            />
                        `}
                    </div>
                ` : nothing}
            </div>
        `;
    }

}

customElements.define("custom-welcome", CustomWelcome);
