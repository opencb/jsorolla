/*
 * Copyright 2015-2016 OpenCB
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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import DetailTabs from "../commons/view/detail-tabs.js";

export default class ProjectCellbaseInfo extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            projects: {
                type: Object
            },
            opencgaSession: {
                type: Boolean
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.showDownloadButton = true;
        this.active = true;
    }

    update(changedProperties) {
        if (changedProperties.has("projects")) {
            if (!Array.isArray(this.projects)) {
                this.projects = [this.projects];
            }
        }
        super.update(changedProperties);
    }

    #renderCellBaseInfo(cellbaseConfig) {
        const sourceData = {};
        cellbaseConfig.sources?.forEach(source => {
            if (!sourceData[source.data]) {
                sourceData[source.data] = [];
            }
            sourceData[source.data].push(source);
        });

        return html`
            <div class="row">
                <div class="col-md-2">
                    <label class="fw-bold">URL:</label>
                </div>
                <div class="col-md-3">
                    ${cellbaseConfig.url}
                </div>
            </div>
            <div class="row">
                <div class="col-md-2">
                    <label class="fw-bold">Version:</label>
                </div>
                <div class="col-md-3">
                    ${cellbaseConfig.version}
                </div>
            </div>
            <div class="row">
                <div class="col-md-2">
                    <label class="fw-bold">Data Release:</label>
                </div>
                <div class="col-md-3">
                    ${cellbaseConfig.dataRelease}
                </div>
            </div>
            <div class="row pt-3">
                <div class="col-md-2">
                    <label class="fw-bold">Data Category</label>
                </div>
                <div class="col-md-2">
                    <label class="fw-bold">Data Source</label>
                </div>
                <div class="col-md-3">
                    <label class="fw-bold">Version / Date</label>
                </div>
            </div>
            <div class="my-3 mx-2">
                ${Object.keys(sourceData).map(
                    key => {
                        const result = [];
                        let printCategoryHeader = true;
                        for (const source of sourceData[key]) {
                            result.push(html`
                            <div class="row">
                                <div class="col-md-2">
                                    <label class="fw-bold">${printCategoryHeader ? source.data : ""}</label>
                                </div>
                                <div class="col-md-2">
                                    <label class="fw-bold">${source.name}</label>
                                </div>
                                <div class="col-md-3">
                                    ${source.version || source.date}
                                </div>
                            </div>
                        `);
                            printCategoryHeader = false;
                        }
                        return result;
                    })}
            </div>
        `;
    }

    #renderProjectsCellBaseInfo(projects) {
        const sections = [];
        for (const project of projects) {
            // const section = {
            //     title: project.name,
            //     display: {
            //         titleHeader: "h4",
            //         titleStyle: "margin: 5px 5px",
            //     },
            //     elements: [
            //         {
            //             type: "text",
            //             text: "Select the page size",
            //             display: {
            //                 containerStyle: "margin: 5px 5px 5px 0px"
            //             }
            //         },
            //     ]
            // };
            const section = {
                id: project.id,
                name: project.name,
                // icon: "fas fa-notes-medical",
                // active: true,
                render: () => {
                    return html`
                        ${this.#renderCellBaseInfo(project.cellbase)}
                    `;
                }
            };
            sections.push(section);
        }

        const x = {
            id: "interpreter-grid-config",
            title: "aaaa",
            icon: "fas fa-user-md",
            // display: {
            //     width: 10,
            //     titleVisible: false,
            //     titleAlign: "left",
            //     titleWidth: 4,
            //     defaultLayout: "vertical",
            //     buttonsVisible: false
            // },
            items: sections
        };
        return x;
    }

    render() {
        if (this.projects?.length === 0) {
            return html`<h4>No valid data found</h4>`;
        }

        if (this.projects?.length === 1) {
            return html`
                <div>
                    <h4>Project '${this.projects[0].id}'</h4>
                </div>
                <div>
                    ${this.#renderCellBaseInfo(this.projects[0].cellbase)}
                </div>
            `;
        }

        return html`
            <div class="row">
                <detail-tabs
                    .data="${{}}"
                    .mode="${DetailTabs.PILLS_VERTICAL_MODE}"
                    .config="${this.#renderProjectsCellBaseInfo(this.opencgaSession.projects)}"
                    .opencgaSession="${this.opencgaSession}">
                </detail-tabs>
            </div>

        `;
    }

}

customElements.define("project-cellbase-info", ProjectCellbaseInfo);
