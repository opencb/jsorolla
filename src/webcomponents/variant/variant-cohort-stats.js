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
        this.active = false;
        this.studyNames = {};
        this.projectToStudyStats = {};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("variantId") || changedProperties.has("active")) {
            this.variantIdObserver();
        }
        if (changedProperties.has("variant") || changedProperties.has("active")) {
            this.variantObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.studyNames = {};
        if (this.opencgaSession?.projects) {
            for (const project of this.opencgaSession?.projects) {
                (project.studies || []).forEach(study => {
                    this.studyNames[study.fqn] = study.name;
                });
            }
        }
    }

    variantIdObserver() {
        if (this.variantId && this.variantId.split(":").length > 2 && this.active) {
            this.opencgaSession.opencgaClient.variants()
                .query({
                    id: this.variantId,
                    study: this.opencgaSession.study.fqn,
                    includeStudy: "all",
                    exclude: "annotation,studies.files,studies.samples,studies.scores,studies.issues",
                    useSearchIndex: "no",
                })
                .then(response => {
                    if (response.responses[0].results[0]) {
                        this.projectToStudyStats[this.opencgaSession.project.name] = response.responses[0].results[0];
                        this.variant = response.responses[0].results[0];
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    variantObserver() {
        if (this.variant && this.active) {
            // Store the stats for the current project
            this.projectToStudyStats[this.opencgaSession.project.name] = this.variant;

            // Fetch stats for the other projects
            for (const project of this.opencgaSession.projects) {
                if (project.id !== this.opencgaSession.project.id && project.studies?.length > 0) {
                    this.opencgaSession.opencgaClient.variants()
                        .query({
                            id: this.variant.id,
                            study: project.studies[0].fqn,
                            includeStudy: "all",
                            exclude: "annotation,studies.files,studies.samples,studies.scores,studies.issues",
                            useSearchIndex: "no",
                        })
                        .then(response => {
                            if (response.responses[0].results[0]) {
                                this.projectToStudyStats[project.name] = response.responses[0].results[0];
                                this.requestUpdate();
                            }
                        })
                        .catch(error => {
                            console.error(error);
                        });
                }
            }
        }
    }

    render() {
        if (!this.variant || !(this.variant?.studies?.length > 0)) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-info-circle pe-1"></i>
                    <span>No studies available for this variant.</span>
                </div>
            `;
        }

        return html`
            <div>
                ${Object.keys(this.projectToStudyStats).map(
                    projectName => html`
                        <h3 class="pt-2">Project: ${projectName}</h3>
                        <hr class="my-1">
                        ${this.projectToStudyStats[projectName].studies.map(study => html`
                            <div class="p-2">
                                <h4 class="py-1">${this.studyNames[study.studyId] || ""}</h4>
                                <variant-cohort-stats-grid
                                    .stats="${study.stats}">
                                </variant-cohort-stats-grid>
                            </div>
                        `)}
                    `
                )}
            </div>
        `;
    }

}

customElements.define("variant-cohort-stats", VariantCohortStats);
