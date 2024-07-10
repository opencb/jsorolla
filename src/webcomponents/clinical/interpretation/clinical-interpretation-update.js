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

import {html, LitElement} from "lit";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import UtilsNew from "../../../core/utils-new.js";

import "../filters/clinical-status-filter.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/disease-panel-filter.js";

export default class ClinicalInterpretationUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalInterpretation: {
                type: Object
            },
            clinicalInterpretationId: {
                type: String
            },
            clinicalAnalysis: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            mode: {
                type: String
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.clinicalInterpretation = {};
        this.clinicalInterpretationId = "";
        this._users = [];
        this.mode = "";

        this.displayConfig = {
            titleWidth: 3,
            modalButtonClassName: "btn-primary btn-sm",
            titleVisible: false,
            titleAlign: "left",
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "end",
        };
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        // if (changedProperties.has("interpretation")) {
        //     this.interpretationObserver();
        // }
        // if (changedProperties.has("interpretationId")) {
        //     this.interpretationIdObserver();
        // }
        // if (changedProperties.has("clinicalAnalysis")) {
        //     this.config = this.getDefaultConfig();
        // }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("mode")) {
            this._config = this.getDefaultConfig();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    clinicalInterpretationIdObserver(e) {
        this.clinicalInterpretation = e.detail.value;
    }

    opencgaSessionObserver() {
        this._users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
    }

    render() {
        return html`
            <opencga-update
                .resource="${"CLINICAL_INTERPRETATION"}"
                .component="${this.clinicalInterpretation}"
                .componentId="${this.clinicalInterpretationId}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config}"
                @componentIdObserver="${this.clinicalInterpretationIdObserver}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-interpretation",
            title: "Edit Interpretation",
            // icon: "fas fa-edit",
            mode: this.mode,
            description: "Update an interpretation",
            display: this.displayConfig,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        // {
                        //     type: "notification",
                        //     text: "Some changes have been done in the form. Not saved, changes will be lost",
                        //     display: {
                        //         visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                        //         notificationType: "warning",
                        //     }
                        // },
                        {
                            title: "Interpretation ID",
                            field: "id",
                            type: "input-text",
                            defaultValue: this.clinicalInterpretation?.id,
                            display: {
                                disabled: true,
                            },
                        },
                        {
                            title: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: () => this._users,
                        },
                        {
                            title: "Status",
                            field: "status.id",
                            type: "custom",
                            display: {
                                render: (statusId, dataFormFilterChange, updatedFields) => {
                                    // .disabled="${!!this._clinicalAnalysis?.locked}"
                                    return html`
                                        <clinical-status-filter
                                            .status="${statusId}"
                                            .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.interpretation?.status[this.clinicalAnalysis?.type?.toUpperCase()]}"
                                            .multiple=${false}
                                            .classes="${updatedFields?.["status.id"] ? "selection-updated" : ""}"
                                            .disabled="${updatedFields?.locked?.after ?? !! this.clinicalAnalysis?.locked}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </clinical-status-filter>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Lock",
                            type: "toggle-switch",
                            field: "locked",
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: (panels, dataFormFilterChange, updateParams) => {
                                    // CAUTION: check if the panelLock condition is the same as clinical-analysis-update.js
                                    const panelLock = !!this.clinicalAnalysis?.panelLock;
                                    const panelList = panelLock ? this.clinicalAnalysis?.panels : this.opencgaSession.study?.panels;
                                    const handlePanelsFilterChange = e => {
                                        const panelList = (e.detail?.value?.split(",") || [])
                                            .filter(panelId => panelId)
                                            .map(panelId => ({id: panelId}));
                                        dataFormFilterChange(panelList);
                                    };
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${panelList}"
                                            .panel="${panels?.map(panel => panel.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${true}"
                                            .classes="${updateParams.panels ? "selection-updated" : ""}"
                                            .disabled="${panelLock}"
                                            @filterChange="${e => handlePanelsFilterChange(e)}">
                                        </disease-panel-filter>
                                    `;
                                },
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3,
                                placeholder: "Add a description to this interpretation...",
                            },
                        },
                        {
                            title: "Comments",
                            field: "comments",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                // collapsable: false,
                                // maxNumItems: 5,
                                showAddBatchListButton: false,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                view: comment => {
                                    const tags = UtilsNew.commaSeparatedArray(comment.tags)
                                        .join(", ") || "-";
                                    return html `
                                        <div style="margin-bottom:1rem;">
                                            <div style="display:flex;margin-bottom:0.5rem;">
                                                <div style="padding-right:1rem;">
                                                    <i class="fas fa-comment-dots"></i>
                                                </div>
                                                <div style="font-weight:bold">
                                                    ${comment.author || this.opencgaSession?.user?.id || "-"} -
                                                    ${UtilsNew.dateFormatter(comment.date || UtilsNew.getDatetime())}
                                                </div>
                                            </div>
                                            <div style="width:100%;">
                                                <div style="margin-bottom:0.5rem;">${comment.message || "-"}</div>
                                                <div class="text-muted">Tags: ${tags}</div>
                                            </div>
                                        </div>
                                    `;
                                }
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
                            ],
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-interpretation-update", ClinicalInterpretationUpdate);
