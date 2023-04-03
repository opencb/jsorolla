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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";

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
        return html`
            <div style="margin 20px 10px">
                <div class="row" style="margin: 20px 10px">
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>URL:</label>
                        </div>
                        <div class="col-md-3">
                            ${cellbaseConfig.url}
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>Version:</label>
                        </div>
                        <div class="col-md-3">
                            ${cellbaseConfig.version}
                        </div>
                    </div>
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>Data Release:</label>
                        </div>
                        <div class="col-md-3">
                            ${cellbaseConfig.dataRelease}
                        </div>
                    </div>
                </div>
                <div style="margin: 10px 10px">
                    <div class="col-md-12">
                        <div class="col-md-2">
                            <label>Data Sources:</label>
                        </div>
                        <div class="col-md-3">
                            <label>Version / Date</label>
                        </div>
                    </div>
                    <div style="margin: 20px 10px">
                        ${cellbaseConfig.sources.map(source => {
                            return html`
                                <div class="col-md-12">
                                    <div class="col-md-2">
                                        <label>${source.name}:</label>
                                    </div>
                                    <div class="col-md-3">
                                        ${source.version || source.date}
                                    </div>
                                </div>
                            `;
                        })}
                    </div>
                </div>
            </div>
        `;
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
            ${this.projects.map(project => {
                return html`<div>${project.id}</div>`;
            })
            }
        `;
    }

}

customElements.define("project-cellbase-info", ProjectCellbaseInfo);
