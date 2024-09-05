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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "./opencga-panel-editor.js";
import "./opencga-panel-grid.js";
import "./opencga-panel-summary.js";
import "./opencga-panel-filter.js";

// TODO check functionalities!

export default class OpencgaPanelBrowser extends LitElement {

    constructor() {
        super();

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
            cellbaseClient: {
                type: Object
            },
            panelEditor: {
                type: Boolean
            },
            panelExamples: {
                type: Array
            },
            eventNotifyName: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "OpencgaPanel" + UtilsNew.randomString(6);

        this.panelDefaultQuery = {sort: "id"};
        this.search = Object.assign({}, this.panelDefaultQuery);
        this._config = this.getDefaultConfig();
        this.eventNotifyName = "messageevent";
        this.panelEditor = false;
    }

    updated(changedProperties) {
        /*
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
        */
    }

    _changeView() {
        this.panelEditor = !this.panelEditor;
        this.installationPanel = {};
    }

    onPanelSelected(e) {
        this.panelSelected = e.detail;
    }

    onImportPanel(e) {
        this._changeView();
        this.installationPanel = e.detail;
    }

    onClear() {
        this._config = Object.assign(this.getDefaultConfig(), this.config);
        this.query = {};
        this.search = {};
    }

    onSearch(e) {
        this.search = Object.assign({}, this.panelDefaultQuery, e.detail.query);
    }

    onActiveFilterChange(e) {
        this.query = e.detail;
        this.search = e.detail;
    }

    getDefaultConfig() {
        return {
            title: "Panel Browser",
            showTitle: true,
            filter: {

            },
            grid: {
                pagination: true,
                pageSize: 5,
                pageList: [5]
            }
        };
    }

    render() {
        return html`
            <div class="col-md-12" style="margin-top: 2%;">
                <div>
                    <button id="${this._prefix}newPanelButton" type="button" class="btn btn-primary variant-prioritization-view-buttons"
                            @click="${this._changeView}" style="float: right;">
                        ${this.panelEditor ? html`
                            <i class="fa fa-undo icon-padding" aria-hidden="true"></i> Back to browser...
                        ` : html`
                            <i class="fa fa-plus icon-padding" aria-hidden="true" ></i> New...
                        `}
                    </button>
                </div>
                <div>
                    ${this.panelEditor ? html`
                        <h3>Preview</h3>
                        <div class="col-md-2 div-margin">
                            <opencga-panel-filter
                                .opencgaClient="${this.opencgaSession.opencgaClient}"
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.query}"
                                @search="${this.onSearch}">
                            </opencga-panel-filter>
                        </div>
                        <div class="col-md-10">
                            <br>
                            <opencga-active-filters
                                .opencgaSession="${this.opencgaSession}"
                                .query="${this.query}"
                                .filters="${this._config.filters}"
                                .defaultStudy="${this.opencgaSession.study.fqn}"
                                .refresh="${this.search}"
                                @activeFilterClear="${this.onClear}"
                                @activeFilterChange="${this.onActiveFilterChange}">
                            </opencga-active-filters>
                            <opencga-panel-grid
                                .opencgaSession="${this.opencgaSession}}"
                                .opencgaClient="${this.opencgaSession.opencgaClient}"
                                @panelselected="${this.onPanelSelected}"
                                @importpanel="${this.onImportPanel}"
                                .query="${this.search}"
                                .config="${this._config}">
                            </opencga-panel-grid>
                        </div>
                    ` : html`
                        <opencga-panel-editor
                            .opencgaSession="${this.opencgaSession}}"
                            .opencgaClient="${this.opencgaSession.opencgaClient}"
                            cellbaseClient="${this.cellbaseClient}"
                            .panel="${this.installationPanel}"
                            eventNotifyName="${this.eventNotifyName}">
                        </opencga-panel-editor>
                    `}
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-panel-browser", OpencgaPanelBrowser);
