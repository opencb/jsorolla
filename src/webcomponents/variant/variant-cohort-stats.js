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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "./variant-cohort-stats-grid.js";

export default class VariantCohortStats extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variantId: {
                type: String,
            },
            variant: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);
        this.active = false;
    }

    update(changedProperties) {
        if (changedProperties.has("variantId") || changedProperties.has("active")) {
            this.variantIdObserver();
        }

        super.update(changedProperties);
    }

    variantIdObserver() {
        if (this.variantId && this.variantId.split(":").length > 2 && this.active) {
            const params = {
                id: this.variantId,
                study: this.opencgaSession.study.fqn,
                includeStudy: "all",
                exclude: "annotation,studies.files,studies.samples,studies.scores,studies.issues",
                useSearchIndex: "no"
            };
            this.opencgaSession.opencgaClient.variants()
                .query(params)
                .then(response => {
                    if (response.responses[0].results[0]) {
                        this.variant = response.responses[0].results[0];
                        // this.requestUpdate();
                    }
                })
                .catch(reason => {
                    console.error(reason);
                });
        }
    }

    render() {
        const studyNames = {};
        for (const study of this.opencgaSession.project.studies) {
            studyNames[study.id] = study.name;
            studyNames[study.fqn] = study.name;
        }

        return html`
            ${(this.variant?.studies || []).map(study => html`
                <h3>
                    ${studyNames[study.studyId]}
                </h3>
                <div style="padding: 10px">
                    <variant-cohort-stats-grid
                        .stats="${study.stats}">
                    </variant-cohort-stats-grid>
                </div>
            `)}
        `;
    }

}

customElements.define("variant-cohort-stats", VariantCohortStats);
