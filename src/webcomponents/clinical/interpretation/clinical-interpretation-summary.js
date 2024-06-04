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
import UtilsNew from "../../../core/utils-new.js";
import BioinfoUtils from "../../../core/bioinfo/bioinfo-utils.js";

export default class ClinicalInterpretationSummary extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            interpretation: {
                type: Object
            },
            interpretationId: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    #init() {
        this.displayConfigDefault = {
            titleVisible: false,
            titleWidth: 3,
            defaultLayout: "horizontal",
            style: "background-color:#f3f3f3;border-left: 4px solid #0c2f4c;padding:16px",
            buttonsVisible: false,
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("interpretationId")) {
            this.interpretationIdObserver();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    interpretationIdObserver() {
        if (this.opencgaSession && this.interpretationId) {
            this.opencgaSession.opencgaClient.clinical()
                .infoInterpretation(this.interpretationId, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(response => {
                    this.interpretation = response.responses[0].results[0];
                })
                .catch(response => {
                    console.error("An error occurred fetching clinicalAnalysis: ", response);
                });
        }
    }

    renderPrimaryFindingsStats(stats) {
        const fields = [
            {title: "Tier", field: "tierCount"},
            {title: "Gene", field: "geneCount"},
            {title: "Status", field: "statusCount"},
            {title: "Status", field: "variantStatusCount"},
        ];

        return fields
            .filter(value => stats?.primaryFindings?.[value.field])
            .map(value => {
                const items = Object.entries(stats?.primaryFindings?.[value.field])
                    .filter(([, value]) => value > 0)
                    .map(([gene, numVariants]) => `${gene} (${numVariants})`);

                return html`
                    <div style="margin-left: 10px">
                        <span style="width: 120px; display: inline-block;">${value.title}: </span>
                        <span style="margin-left: 20px">
                            ${items.join(", ")}
                        </span>
                    </div>
                `;
            });
    }

    render() {
        return html`
            <data-form
                .data="${this.interpretation}"
                .config="${this._config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis",
            title: "Case Interpretation Summary",
            icon: "fas fa-user-md",
            display: {
                ...this.displayConfigDefault,
                ...(this.displayConfig || {}),
            },
            sections: [
                {
                    id: "summary",
                    display: {},
                    elements: [
                        {
                            // Interpretation ID, analyst and creation date
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    <div class="d-flex">
                                        <div class="d-flex gap-3 me-auto">
                                            <div>
                                                <div class="d-block badge ${interpretation.status?.id ? "text-bg-primary" : "text-bg-secondary"}" style="font-size:1em;">
                                                    <strong>${interpretation.status.id || "NO_STATUS"}</strong>
                                                </div>
                                            </div>
                                            <div>
                                                <span style="font-size:1.2em;">${interpretation.id}</span>
                                                <span style="color:grey;margin-left:8px;">version ${interpretation.version}</span>
                                            </div>
                                        </div>
                                        <div class="d-flex justify-contend-end">
                                            <span title="Analysed by">
                                                <i class="fa fa-user-circle ms-1" aria-hidden="true"></i>
                                                Assigned to
                                                <label class="fw-bold">
                                                    ${interpretation?.analyst?.name ?? "-"}
                                                </label>
                                            </span>
                                            <span class="ms-3" title="Created on">
                                                <i class="far fa-calendar-alt"></i>
                                                Created on
                                                <label class="fw-bold">
                                                    ${UtilsNew.dateFormatter(interpretation?.creationDate)}
                                                </label>
                                            </span>
                                        </div>
                                    </div>
                                `,
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "basic",
                            defaultValue: "No description available",
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    let panelHtml = "-";
                                    if (panels?.length > 0) {
                                        panelHtml = panels.map(panel => {
                                            if (panel.source?.project?.toUpperCase() === "PANELAPP") {
                                                return html`
                                                    <div style="margin: 5px 0">
                                                        <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                                                            ${panel.name} (${panel.source.project} v${panel.source.version})
                                                        </a>
                                                    </div>
                                                `;
                                            } else {
                                                return html`<div style="margin: 5px 0px">${panel.id}</div>`;
                                            }
                                        });
                                    }
                                    return html`<div>${panelHtml}</div>`;
                                }
                            }
                        },
                        {
                            title: "Method",
                            field: "method",
                            type: "custom",
                            display: {
                                visible: interpretation => !!interpretation.method?.name && !!interpretation.method?.version,
                                render: method => html`
                                    <div>
                                        <strong>Name</strong>: ${method.name}
                                    </div>
                                    <div>
                                        <strong>Version</strong>: ${method.version}
                                    </div>
                                    <div>
                                        <strong>Dependencies</strong>:
                                        ${(method.dependencies || []).map(item => html`
                                            <span class="badge text-bg-primary">${item.name} (${item.version})</span>
                                        `)}
                                    </div>
                                `,
                            },
                        },
                        {
                            title: "Primary Findings",
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    ${interpretation?.primaryFindings?.length > 0 ? html`
                                        <div>
                                            <div>
                                                <span style="">${interpretation?.primaryFindings?.length} variants selected, variant stats:</span>
                                            </div>
                                            ${this.renderPrimaryFindingsStats(interpretation?.stats)}
                                        </div>
                                    ` : html`
                                        <div>
                                            <span style="">No variants selected</span>
                                        </div>
                                    `}
                                `,
                            }
                        },
                        {
                            title: "Comments",
                            field: "comments",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                // collapsable: false,
                                // maxNumItems: 5,
                                showAddItemListButton: false,
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                view: comment => html`
                                    <div style="margin-bottom:1rem;">
                                        <div style="display:flex;margin-bottom:0.5rem;">
                                            <div style="padding-right:1rem;">
                                                <i class="fas fa-comment-dots"></i>
                                            </div>
                                            <div style="font-weight:bold">
                                                ${comment.author || "-"} - ${UtilsNew.dateFormatter(comment.date)}
                                            </div>
                                        </div>
                                        <div style="width:100%;">
                                            <div style="margin-bottom:0.5rem;">${comment.message || "-"}</div>
                                            <div class="text-muted">Tags: ${(comment.tags || []).join(" ") || "-"}</div>
                                        </div>
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Message",
                                    field: "comments[].message",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add comment...",
                                        rows: 3
                                    }
                                },
                                {
                                    title: "Tags",
                                    field: "comments[].tags",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add tags..."
                                    }
                                },
                            ]
                        },
                    ]
                }
            ],
        };
    }

}

customElements.define("clinical-interpretation-summary", ClinicalInterpretationSummary);
