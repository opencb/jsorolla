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

import {html, LitElement} from "/web_modules/lit-element.js";
import UtilsNew from "./../../utilsNew.js";
import "../commons/tool-header.js";
import "./study-editor.js";
import "../project/project-editor.js";

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

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.users = this.getProjectPerUser();
        }
        super.update(changedProperties);
    }

    getProjectPerUser() {
        return [...new Set(this.opencgaSession.projects?.map(project => project.fqn.split('@')[0]))];
    }

    // _verifyUserAndProject(pro,user){
    //     return this._getUserProject(pro) == user;
    // }

    // _getUserProject(project){
    //     return project.fqn.split('@')[0];
    // }

    getDefaultConfig() {
        return {
            title: "Study Dashboard",
            icon: "variant_browser.svg",
            active: false
        };
    }

    showModal(type) {
        let modalType = {
            "project": () => {
                $("#newProject").modal("show");
            },
            "study": () => {
                $("#newStudy").modal("show");
            }
        }
        modalType[type]();
    }


    onHide(type) {
        let modalType = {
            "project": () => {
                $("#newProject").modal("hide");
            },
            "study": () => {
                $("#newStudy").modal("hide");
            }
        }
        modalType[type]();
    }

    render() {
        // Check if there is any project available
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

                .panel-body.text-center .text-name {
                    font-size: 16px
                }

                .btn.outline {
                    border: 1px solid black;
                    background-color: white;
                    color: black;
                    padding: 14px 28px;
                    font-size: 16px;
                    cursor: pointer;
                }

                .btn.outline.child {
                    height:85px
                }

                .outline.primary {
                    border-color:#286090;
                    color: #286090;
                }

                .primary:hover {
                    background: #286090;
                    color: white;
                }





            </style>

            <div class="row">
                <!-- Show Project by User-->
                ${this.users.map(user => {
                    return html `
                        <div class="col-md-12">
                            <h3>${user}</h3>
                            <hr>
                            ${this.opencgaSession.projects.filter(proj => proj.fqn.startsWith(user + "@")).map(project => {
                                return html`
                                    <div class="col-md-4">
                                        <div class="panel panel-default">
                                            <div class="panel-body text-center">
                                                <div style="float: right">
                                                    <i class="fas fa-ellipsis-v"></i>
                                                </div>
                                                <h4>${project.name}</h4>
                                                <div>
                                                    <span class="help-text">${project.description || "No description available"}</span>
                                                </div>
                                                <div>
                                                    <span>${project.organism.scientificName} (${project.organism.assembly})</span>
                                                </div>
                                                <div>
                                                    ${project.fqn}
                                                </div>
                                                <div>
                                                    <span>Created on ${UtilsNew.dateFormatter(project.creationDate)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row">
                                            ${project.studies.map(study => html`
                                                <div class="col-md-6">
                                                <!-- TODO: Pass Info Study to the Study admin -->
                                                    <a href="#study-admin/${study.fqn}">
                                                        <div class="panel panel-default child" >
                                                            <div class="panel-body text-center">
                                                            <p class="text-name">${study.name}</p>
                                                            </div>
                                                        </div>
                                                    </a>
                                                </div>`
                                            )}
                                            <div class="col-md-6">
                                            <button type="button" class="btn outline primary btn-lg btn-block child" @click="${() => this.showModal('study')}">
                                                <i class="fas fa-plus"></i>
                                                <p>New Study</p>
                                            </button>
                                            </div>
                                        </div>
                                    </div>
                                `})}
                            <div class="col-md-4">
                                <button type="button" class="btn outline primary btn-lg btn-block" @click="${() => this.showModal('project')}">
                                    <i class="fas fa-plus"></i>
                                    <p>New Project</p>
                                </button>
                            </div>
                        </div>
                    `})}
            </div>
            
            <!-- TODO: These modals can be a single one, the component will be rendered according to whether you have selected: study or project inside div. modal-body -->
            <!-- Modal New Project -->
            <div id="newProject" class="modal fade"  tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">New Project</h4>
                        </div>
                        <div class="modal-body">
                            <project-editor
                                    @hide="${() => this.onHide('project')}">
                            </project-editor>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal New Study -->
            <div id="newStudy" class="modal fade"  tabindex="-1" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">New study</h4>
                        </div>
                        <div class="modal-body">
                            <study-editor
                                    @hide="${() => this.onHide('study')}">
                            </study-editor>
                        </div>
                    </div>
                </div>
            </div>`;
    }
}

customElements.define("study-dashboard", StudyDashboard);
