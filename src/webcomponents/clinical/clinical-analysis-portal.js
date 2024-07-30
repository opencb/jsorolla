/*
 * Copyright 2015-2024 OpenCB
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
import "./clinical-analysis-create.js";
import "../disease-panel/disease-panel-browser.js";
import "../disease-panel/disease-panel-create.js";
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
        this._config = this.getDefaultConfig();
        this.currentView = this._config.views[0].id;
    }

    #onViewChange(newView) {
        this.currentView = newView;
        this.requestUpdate();
    }

    renderToolbarButtons() {
        return html`
            <div>
                ${this._config.views.map(view => html`
                    <button
                        class="${`btn btn-light ${this.currentView === view.id ? "active" : ""}`}"
                        @click="${() => this.#onViewChange(view.id)}">
                        ${view.icon ? html`
                            <i class="${`fas ${view.icon} ps-1`}"></i>
                        ` : null}
                        <strong>${view.name}</strong>
                    </button>
                `)}
            </div>
        `;
    }

    renderViewTitle(title) {
        return html`
            <div class="my-4">
                <h2 class="fw-bold">${title}</h2>
            </div>
        `;
    }

    render() {
        if (!this.opencgaSession) {
            return html`
                <div class="d-flex flex-column justify-content-center align-items-center pt-5">
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
                ${this._config.views.map(view => html`
                    <div role="tabpanel" class="${`tab-pane ${this.currentView === view.id ? "active" : ""}`}">
                        ${view.display?.titleVisible ? this.renderViewTitle(view.name) : null}
                        ${view.render()}
                    </div>
                `)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            views: [
                {
                    id: "case-explorer",
                    name: "Case Explorer",
                    icon: "fa-window-restore",
                    display: {
                        titleVisible: true,
                    },
                    render: () => html`
                        <clinical-analysis-browser
                            .opencgaSession="${this.opencgaSession}"
                            .settings="${this.settings}"
                            .config="${{componentId: "clinicalAnalysisBrowserPortal", showHeader: false}}">
                        </clinical-analysis-browser>
                    `,
                },
                {
                    id: "panel-explorer",
                    name: "Disease Panel Explorer",
                    icon: "fa-search-plus",
                    display: {
                        titleVisible: true,
                    },
                    render: () => html`
                        <disease-panel-browser
                            .opencgaSession="${this.opencgaSession}"
                            .config="${{showHeader: false}}">
                        </disease-panel-browser>
                    `,
                },
                {
                    id: "case-create",
                    name: "New Case",
                    icon: "fa-plus",
                    display: {
                        titleVisible: false,
                    },
                    render: () => html`
                        <div class="content container">
                            ${this.renderViewTitle("New Case")}
                            <clinical-analysis-create
                                .opencgaSession="${this.opencgaSession}">
                            </clinical-analysis-create>
                        </div>
                    `,
                },
                {
                    id: "disease-panel-create",
                    name: "New Disease Panel",
                    icon: "fa-plus",
                    display: {
                        titleVisible: false,
                    },
                    render: () => html`
                        <div class="content container">
                            ${this.renderViewTitle("New Disease Panel")}
                            <disease-panel-create
                                .displayConfig="${{mode: "page", type: "tabs", buttonsLayout: "upper"}}"
                                .opencgaSession="${this.opencgaSession}">
                            </disease-panel-create>
                        </div>
                    `,
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-portal", ClinicalAnalysisPortal);
