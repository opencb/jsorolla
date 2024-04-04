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
                <div class="row hi-icon-wrap hi-icon-effect-9 hi-icon-animation">
                    ${visibleApps.map(item => html`
                        <a class="icon-wrapper" href="#home" data-id="${item.id}" @click="${this.onChangeApp}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="${item.icon}"/>
                            </div>
                            <div style="margin-top:10px;">
                                <span style="font-weight:bold;">${item.name}</span>
                            </div>
                        </a>
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
                <div class="panel-default-wrapper">
                    ${featuredTools.map(item => {
                        const itemLink = `${item.id}${session?.project ? `/${session?.project?.id}/${session?.study?.id}`: ""}`;
                        return html`
                            <div class="panel panel-default" data-cy-welcome-card-id="${item.id}">
                                <div class="panel-body">
                                    <a href="#${itemLink}" style="text-decoration:none!important;">
                                        <div align="center" class="">
                                            ${ item?.icon.includes("fas") ? html`
                                                <i class="${item.icon}" style="font-size: 5em;"></i>
                                            ` : html`
                                                <img alt="${item.name}" width="100px" src="${item.icon}"/>
                                            `}
                                        </div>
                                        <h4 style="margin-bottom:0; text-align: center">
                                            <div>${item.name}</div>
                                        </h4>
                                    </a>
                                </div>
                                <div class="panel-body">
                                    ${item.description ? UtilsNew.renderHTML(item.description) : ""}
                                </div>
                                <div class="panel-body">
                                    <a class="btn btn-primary btn-block btn-lg" href="#${itemLink}">
                                        <div style="color:white;">Enter</div>
                                    </a>
                                </div>
                            </div>
                        `;
                    })}
                </div>
            `;
        }
    }

    renderStyle() {
        return html`
            <style>
                div#home {
                    display: flex;
                    align-items: center;
                }
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

                .panel-default-wrapper {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 2rem;
                }

                .panel-default-wrapper > .panel-default > .panel-body {
                    display: flex;
                    flex-direction: column;
                    flex: 1
                }

                .panel-default-wrapper > .panel-default > .panel-body:last-child {
                    flex: 0
                }

                .panel.panel-default {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    -webkit-box-shadow: 0 2px 5px #b3b4bd;
                    border: 0;
                    margin: 0 1rem;
                    max-width: 20em;
                }

                .panel-body a.btn.btn-primary.btn-block.btn-lg {
                    background-color: var(--footer-color-payne-blue);
                    border: 0;
                }

                #bottomLogo {
                    display: flex;
                    justify-content: center;
                    margin: 3em 0;
                }

                #welcome-title {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 1em 0;
                }

                #welcome-title h1 {
                    display: inline;
                    margin: 0 0 0 1rem;
                }

            </style>
        `;
    }

    render() {
        const welcomePage = this.getWelcomePageConfig();

        if (!UtilsNew.isNotEmptyArray(this.opencgaSession?.projects) ||
            this.opencgaSession.projects.every(p => !UtilsNew.isNotEmptyArray(p.studies))) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>You don´t have projects or/and studies. Please contact the admin</h3>
                </div>`;
        }

        return html`
            ${this.renderStyle()}

            <div class="container" style="margin: 2em 0;">
                <!-- Welcome page logo -->
                ${welcomePage?.logo ? html`
                    <div align="center">
                        <img
                            alt="${welcomePage.display?.logoAlt || "logo"}"
                            class="${welcomePage.display?.logoClass}"
                            src="${welcomePage.logo}"
                            style="${welcomePage.display?.logoStyle}"
                            width="${welcomePage.display?.logoWidth || "300px"}"
                        />
                    </div>
                ` : null}

                <!-- Welcome page title -->
                ${welcomePage?.title ? html`
                    <div id="welcome-title">
                        <img src="${welcomePage.appLogo?.img}" height="${welcomePage.appLogo?.height || "40px"}"/>
                        <h1 class="${welcomePage.display?.titleClass}" style="${welcomePage.display?.titleStyle}">
                            ${welcomePage.title}
                        </h1>
                    </div>
                `: null}

                <!-- Welcome page subtitle -->
                ${welcomePage?.subtitle ? html`
                    <h4 class="${welcomePage.display?.subtitleClass}" style="${welcomePage.display?.subtitleStyle}">
                        ${welcomePage.subtitle}
                    </h4>
                ` : null}

                <!-- Custom content -->
                ${welcomePage?.content ? html`
                    <div style="${welcomePage.display?.contentStyle || "margin-bottom:16px;"}">
                        ${UtilsNew.renderHTML(welcomePage.content)}
                    </div>
                ` : null}

                <!-- Applications or tools -->
                ${this.renderApplicationsOrTools()}

                <!-- Display custom links -->
                <div align="center" class="row" style="margin-top:50px;">
                    ${(welcomePage?.links || []).map(link => html`
                        <a class="getting-started" href="${link.url}" target="${link.target || "_blank"}"><span>${link.title}</span></a>
                    `)}
                </div>

                <!-- Logo at the bottom of the content -->
                ${welcomePage?.bottomLogo?.img ? html`
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
                ` : null}

            </div>
        `;
    }

}

customElements.define("custom-welcome", CustomWelcome);
