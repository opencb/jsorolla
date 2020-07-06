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
        this._prefix = "ovcs-" + UtilsNew.randomString(6);
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
            // const _this = this;
            const params = {
                id: this.variantId,
                study: this.opencgaSession.study.fqn,
                includeStudy: "all",
                exclude: "annotation,studies.files,studies.samples,studies.scores,studies.issues",
                useSearchIndex: "no"
            };
            this.opencgaSession.opencgaClient.variants().query(params)
                .then(response => {
                    if (response.responses[0].results[0]) {
                        this.studies = response.responses[0].results[0].studies;
                        this.requestUpdate();
                    }
                })
                .catch(function(reason) {
                    console.error(reason);
                });
        }
    }

    render() {
        let studyNames = {};
        for (let study of this.opencgaSession.project.studies) {
            studyNames[study.id] = study.name;
            studyNames[study.fqn] = study.name;
        }
        return html`
            ${this.studies && this.studies.length && this.studies.map(study => html`
                <h3> 
                    ${studyNames[study.studyId]}
                </h3>
                <div style="padding: 10px">
                    <opencga-cohort-variant-stats .stats="${study.stats}"></opencga-cohort-variant-stats>
                </div>
            `)}
        `;
    }
}

customElements.define("opencga-variant-cohort-stats", OpencgaVariantCohortStats);
