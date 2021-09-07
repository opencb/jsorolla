/**
 * Copyright 2015-2019 OpenCB
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
import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "./../../core/utilsNew.js";
import "../../webcomponents/project/projects-admin.js";

export default class WelcomeAdmin extends LitElement {

    constructor() {
        super();
        this.checkProjects = false;
    }

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
            cellbaseClient: {
                type: Object
            },
            checkProjects: {
                type: Boolean
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }


        super.update(changedProperties);

    }


    isVisible(item) {
        switch (item.visibility) {
            case "public":
                return true;
            case "private":
                return !!this?.opencgaSession?.token;
            case "none":
            default:
                return false;
        }
    }

    opencgaSessionObserver() {
        this._checkProjects();
    }

    _checkProjects() {
        return !!(UtilsNew.isNotUndefinedOrNull(this.opencgaSession) && UtilsNew.isNotUndefinedOrNull(this.opencgaSession.project));
    }


    // <study-dashboard
    // .config=${this.config}
    //                     .opencgaSession=${this.opencgaSession}>
    // </study-dashboard>
    // TODO Add content
    render() {
        return html`
                <h1 style="text-align: center">
                    Administration
                </h1>
                <div style="margin: 20px">
                    ${UtilsNew.renderHTML(this.config.welcomePageContent)}
                </div>

            <div class="row hi-icon-wrap hi-icon-effect-9 hi-icon-animation">
                ${this.app?.menu?.filter(this.isVisible).map(item => html`
                    ${item.submenu ? html`
                        <a class="icon-wrapper" data-title="${item.name}" href="#${item.id}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="${item.icon}" />
                            </div>
                            <div><span style="font-weight: bold">${item.name}</span></div>
                        </a>
                            <span class="smaller"></span>
                        </a>
                    ` : html`
                        <a class="icon-wrapper" href="#${item.id}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="${item.icon}" />
                            </div>
                            <div><span style="font-weight: bold">${item.name}</span></div>
                        </a>
                            <span class="smaller"></span>
                        </a>
                    `}
                `)}
            </div>`;
    }

}

customElements.define("welcome-admin", WelcomeAdmin);
