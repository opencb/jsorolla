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
import Utils from "../../utils.js";
import UtilsNew from "../../utilsNew.js";
import "./opencga-cohort-variant-stats.js";

export default class OpencgaVariantCohortStats extends LitElement {

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
            variantId: {
                type: String,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "ovcs-" + Utils.randomString(6);
        this.active = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("variantId") || changedProperties.has("active")) {
            this.fetchCohortStats();
        }
    }

    fetchCohortStats() {
        if (typeof this.variantId !== "undefined" && this.variantId.split(":").length > 2 && this.active) {
            // const cohorts = {};
            // for (const studyCohorts in this.config.cohorts[this.opencgaSession.project.id]) {
            //     cohorts[studyCohorts] = new Set();
            //     for (const cohort of this.config.cohorts[this.opencgaSession.project.id][studyCohorts]) {
            //         cohorts[studyCohorts].add(cohort.id);
            //     }
            // }
            const _this = this;
            const params = {
                id: this.variantId,
                study: this.opencgaSession.project.id + ":" + this.opencgaSession.study.id,
                includeStudy: "all",
                exclude: "annotation,studies.files,studies.samples,studies.scores,studies.issues",
                useSearchIndex: "no"
            };
            this.opencgaSession.opencgaClient.variants().query(params)
                .then(function(response) {
                    if (typeof response.responses[0].results[0] !== "undefined") {
                        _this.studies = response.responses[0].results[0].studies;
                        _this.requestUpdate();
                    }
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    // TODO remove this function in OpenCGA 1.4.x since we will use new Study.id instead of Study.alias
    getStudy(study) {
        if (study !== undefined) {
            const fields = study.split(":");
            return fields[fields.length - 1];
        }
        return "";
    }

    render() {
        return html`
                ${this.studies && this.studies.length && this.studies.map(study => html`
                    <h3 > 
                        &nbsp;${this.getStudy(study.studyId)}
                    </h3>
                    
                    <opencga-cohort-variant-stats .stats="${study.stats}"></opencga-cohort-variant-stats>
                `)}
        `;
    }
}

customElements.define("opencga-variant-cohort-stats", OpencgaVariantCohortStats);
