/**
 * Copyright 2015-2022 OpenCB
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
import "./clinical-analysis-browser.js";
import "../disease-panel/disease-panel-browser.js";
import "../commons/tool-header.js";

export default class ClinicalAnalysisPortal extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            settings: {
                type: Object
            },
        };
    }

    #init() {
        this.currentView = "case";
    }

    #onViewChange(newView) {
        this.currentView = newView;
        this.requestUpdate();
    }

    renderToolbarButtons() {
        return html`
            <div>
                <button
                    class="${`btn btn-info ${this.currentView === "case" ? "active" : ""}`}"
                    @click="${() => this.#onViewChange("case")}">
                    <strong>Case Explorer</strong>
                </button>
                <button
                    class="${`btn btn-info ${this.currentView === "panel" ? "active" : ""}`}"
                    @click="${() => this.#onViewChange("panel")}">
                    <strong>Disease Panel Explorer</strong>
                </button>
                <a href="#clinical-analysis-create/" type="button" class="btn btn-default" style="margin-left:16px;">
                    <i class="fas fa-plus icon-padding"></i>
                    <strong>New Case</strong>
                </a>
            </div> 
        `;
    }

    renderViewTitle(title) {
        return html`
            <div style="margin-top:32px;margin-bottom:24px;">
                <h2 style="font-weight:bold;">${title}</h2>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession) {
            return html`
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <tool-header
                .title="${this.settings?.title || "Case Portal"}"
                .icon="${this.settings?.icon || ""}"
                .rhs="${this.renderToolbarButtons()}">
            </tool-header>
            <div class="tab-content">
                <div role="tabpanel" class="${`tab-pane ${this.currentView === "case" ? "active" : ""}`}">
                    ${this.renderViewTitle("Case Explorer")}
                    <clinical-analysis-browser
                        .opencgaSession="${this.opencgaSession}"
                        .settings="${this.settings}"
                        .config="${{
                            showHeader: false,
                        }}">
                    </clinical-analysis-browser>
                </div>
                <div role="tabpanel" class="${`tab-pane ${this.currentView === "panel" ? "active" : ""}`}">
                    ${this.renderViewTitle("Disease Panel Explorer")}
                    <disease-panel-browser
                        .opencgaSession="${this.opencgaSession}"
                        .config="${{
                            showHeader: false,
                        }}">
                    </disease-panel-browser>
                </div>
            </div>
        `;
    }

}

customElements.define("clinical-analysis-portal", ClinicalAnalysisPortal);
