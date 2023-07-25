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
import {classMap} from "lit/directives/class-map.js";
import GridCommons from "../../../commons/grid-commons.js";
import UtilsNew from "../../../../core/utils-new.js";
import "../../../commons/analysis/opencga-analysis-tool.js";
import AnalysisRegistry from "./analysis-registry.js";
import "../../../commons/forms/select-field-filter.js";
import "./opencga-knockout-analysis/knockout-gene-grid.js";
import "./opencga-knockout-analysis/knockout-individual-view.js";
import "./opencga-knockout-analysis/knockout-variant-view.js";


export default class OpencgaKnockoutAnalysisResult extends LitElement {

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
            config: {
                type: Object
            },
            jobId: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "oga-" + UtilsNew.randomString(6);

        this._config = this.getDefaultConfig();
        this.activeTab = {gene: true};

    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.gridCommons = new GridCommons(this.gridId, this, this._config);

    }

    updated(changedProperties) {
        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
            this.requestUpdate();
        }
    }

    _changeTab(e) {
        e.preventDefault();
        const tabId = e.currentTarget.dataset.id;
        // the selectors are strictly defined to avoid conflics in tabs in children components
        $("#opencga-knockout-analysis-result > div > .content-pills", this).removeClass("active");
        $("#opencga-knockout-analysis-result > .content-tab-wrapper > .content-tab", this).hide();
        $("#" + this._prefix + tabId, this).show();
        $("#" + this._prefix + tabId, this).addClass("active");
        for (const tab in this.activeTab) {
            this.activeTab[tab] = false;
        }
        this.activeTab[tabId] = true;
        this.requestUpdate();
    }

    getDefaultConfig() {
        // return AnalysisRegistry.get("knockout").config;
    }

    render() {
        // wait for opencgaSession to be available because inner components use it
        return this.opencgaSession ? html`
            <div class="container" style="margin-top: 60px">
                <div id="opencga-knockout-analysis-result">
                    <div class="btn-group content-pills" role="toolbar" aria-label="toolbar">
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["gene"]})}" @click="${this._changeTab}" data-id="gene">
                            <i class="fas fa-table icon-padding" aria-hidden="true"></i> Summary (genes)
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["individual"]})}" @click="${this._changeTab}" data-id="individual">
                            <i class="fas fa-table icon-padding" aria-hidden="true"></i> Individuals
                        </button>
                        <button type="button" class="btn btn-success ripple content-pills ${classMap({active: this.activeTab["variant"]})}" @click="${this._changeTab}" data-id="variant">
                            <i class="fas fa-table icon-padding" aria-hidden="true"></i> Variants
                        </button>
                    </div>
                    <div class="content-tab-wrapper">
                        <div id="${this._prefix}gene" class="content-tab active">
                            <knockout-gene-grid .jobId="${this.jobId}" .opencgaSession="${this.opencgaSession}"></knockout-gene-grid>
                        </div>
                        <div id="${this._prefix}individual" class="content-tab">
                            <knockout-individual-view .jobId="${this.jobId}" .opencgaSession="${this.opencgaSession}"></knockout-individual-view>
                        </div>
                        <div id="${this._prefix}variant" class="content-tab">
                            <knockout-variant-view .jobId="${this.jobId}" .opencgaSession="${this.opencgaSession}" .cellbaseClient="${this.cellbaseClient}"></knockout-variant-view>
                        </div>
                    </div>
                </div>
                <div class="v-space"></div>
            </div>
        ` : null;
    }

}

customElements.define("opencga-knockout-analysis-result", OpencgaKnockoutAnalysisResult);
