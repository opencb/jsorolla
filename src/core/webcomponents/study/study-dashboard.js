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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import "../commons/tool-header.js";

export default class StudyDashboard extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
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

    _init() {
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = { ...this.getDefaultConfig(), ...this.config };
    }

    // update(changedProperties) {
    //     if (changedProperties.has("config")) {
    //         this._config = { ...this.getDefaultConfig(), ...this.config };
    //     }
    //     super.update(changedProperties);
    // }

    getDefaultConfig() {
        return {
            title: "Study Dashboard",
            icon: "variant_browser.svg",
            active: false
        };
    }

    render() {
        // Check if there is any project available
        console.log(this.opencgaSession)
        if (!this.opencgaSession?.study) {
            return html`
                <div class="guard-page">
                <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>`;
        }

        return html`

            <style>
            .panel.panel-default:hover {
                background-color: #eee;
                text-decoration: none;
            }

            .panel.panel-default.child {
                height: 85px
            }
            </style>


            <tool-header title="${this._config.title}"></tool-header>
            <div class="row"> 
                    ${this.opencgaSession.projects.map(project => html`    
                        <div class="col-md-4">
                            <div class="panel panel-default">
                                <div class="panel-body text-center">
                                    <h4>${project.name}</h4>
                                </div>
                            </div>
                            
                            <div class="row">
                                ${project.studies.map(study => html`    
                                    <div class="col-md-4">
                                        <div class="panel panel-default child">
                                            <div class="panel-body text-center">
                                                ${study.name}
                                            </div>
                                        </div>
                                    </div>`
        )}
                                <div class="col-md-4">
                                    <div class="panel panel-default child">
                                        <div class="panel-body text-center">
                                            <i class="fas fa-plus"></i>
                                            <p>New Study</p>
                                        </div>
                                    </div>              
                                </div>       
                            </div>
                        </div>`
        )}
                <div class="col-md-4">
                    <div class="panel panel-default">
                        <div class="panel-body text-center">
                            <i class="fas fa-plus"></i>
                            <p>Project</p>
                        </div>
                    </div>              
                </div>
            </div>
            


            <!-- <div class="row hi-icon-wrap hi-icon-effect-9 hi-icon-animation">
                ${this.app?.menu?.filter(this.isVisible).map(item => html`
                    ${item.submenu ? html`
                        <a class="icon-wrapper" data-cat-id="cat-${item.id}" data-title="${item.name}" href="#cat-${item.id}/${this._checkProjects() ? `${this.opencgaSession.project.id}/${this.opencgaSession.study.id}` : ""}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="img/tools/icons/${item.icon}" />
                            </div>
                            <p>${item.name}</p>
                            <span class="smaller"></span>
                        </a>
                    ` : html`
                        <a class="icon-wrapper" href="#${item.id}/${this._checkProjects() ? `${this.opencgaSession.project.id}/${this.opencgaSession.study.id}` : ""}">
                            <div class="hi-icon">
                                <img alt="${item.name}" src="${item.logo}" />
                            </div>
                            <p>${item.name}</p>
                            <span class="smaller"></span>
                        </a>
                    `}
                `)}
            </div> -->
            </div>
        `;
    }

}

customElements.define("study-dashboard", StudyDashboard);
