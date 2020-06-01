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

import {LitElement, html} from "/web_modules/lit-element.js";
import UtilsNew from "../../../utilsNew.js";
import "./variant-interpreter-qc-variant.js";
import "./variant-interpreter-qc-alignment.js";
import "../../alignment/gene-coverage-view.js";
import "../../clinical/analysis/opencga-rd-tiering-analysis.js";


class VariantInterpreterInterpretation extends LitElement {

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
            clinicalAnalysisId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "vcis-" + UtilsNew.randomString(6);
    }

    connectedCallback() {
        super.connectedCallback();
    }

    firstUpdated(_changedProperties) {
    }

    updated(changedProperties) {

        // if (changedProperties.has("opencgaSession")) {
        //     this.opencgaSessionObserver();
        // }
        // if (changedProperties.has("clinicalAnalysisId")) {
        //     this.clinicalAnalysisIdObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.clinicalAnalysisObserver();
        // }
        // if (changedProperties.has("query")) {
        //     this.queryObserver();
        // }
    }

    onAnalysisChange(e) {
        this.analysis = e.detail.value;
        this.requestUpdate();
    }

    renderAnalysis(type) {
        switch(type) {
            case "rd-tiering":
                return html`<opencga-rd-tiering-analysis .opencgaSession="${this.opencgaSession}"></opencga-rd-tiering-analysis>`
            case "--":
                break;
            default:
        }
    }

    render() {
        // Check Project exists
        if (!this.opencgaSession.project) {
            return html`
                    <div>
                        <h3><i class="fas fa-lock"></i> No public projects available to browse. Please login to continue</h3>
                    </div>`;
        }

        return this.clinicalAnalysis ? html`
            <div>
                <div class="row">
                    <div class="col-md-4 col-md-offset-4 col-sm-12">
                        <h3>Select Analysis</h3>
                        <select-field-filter .data="${[{id: "rd-tiering", name: "RD tiering"}]}" @filterChange="${this.onAnalysisChange}"></select-field-filter>
                    </div>
                </div>
                ${this.renderAnalysis(this.analysis)}
            </div>
        ` : null;
    }

}

customElements.define("variant-interpreter-interpretation", VariantInterpreterInterpretation);
