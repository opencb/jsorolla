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
import UtilsNew from "../../core/utils-new.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter.js";
import FormUtils from "../commons/forms/form-utils.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import "./clinical-analysis-comment-editor.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";

import LitUtils from "../commons/utils/lit-utils";
import NotificationUtils from "../commons/utils/notification-utils.js";
import Types from "../commons/types";

class ClinicalAnalysisUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object,
            },
            clinicalAnalysisId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            }
        };
    }

    #init() {
        this.clinicalAnalysis = {};
        this.clinicalAnalysisId = "";
        // this.updateParams = {};
        // this.isLoading = false;
        // this.displayConfigDefault = {
        //     width: 8,
        //     titleVisible: false,
        //     titleWidth: 4,
        //     defaultLayout: "horizontal",
        //     buttonsVisible: true,
        //     buttonsWidth: 8,
        //     buttonsAlign: "right",
        // };
        this.displayConfig = {
            titleWidth: 3,
            width: 8,
            titleVisible: false,
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "right",
        };
        this._config = this.getDefaultConfig();
    }

    // #setLoading(value) {
    //     this.isLoading = value;
    //     this.requestUpdate();
    // }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        this.users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
    }

    // FIXME: how to refactor "comments"
    onFieldChange(e, field) {
        // Fixme FormUtils: use new methods when https://app.clickup.com/t/36631768/TASK-2037 merged
        // Caution: swapped parameters in FormUtils.<methodName>(original, toUpdate, ...)
        const param = field || e.detail.param;
        switch (param) {
            case "locked":
            case "panelLock":
            case "dueDate":
            case "description":
                this.updateParams = FormUtils.updateScalar(
                    this.clinicalAnalysis,
                    this._clinicalAnalysis,
                    this.updateParams,
                    param,
                    e.detail.value);
                break;
            case "status.id":
            case "disorder.id":
            case "priority.id":
            case "analyst.id":
                this.updateParams = FormUtils.updateObject(
                    this.clinicalAnalysis,
                    this._clinicalAnalysis,
                    this.updateParams,
                    param,
                    e.detail.value);

                break;
            case "panels.id":
            case "flags.id":
                this.updateParams = FormUtils
                    .updateObjectArray(
                        this.clinicalAnalysis,
                        this._clinicalAnalysis,
                        this.updateParams,
                        param,
                        e.detail.value,
                        e.detail.data);
                break;
            case "comments":
                this.updateParams = FormUtils.updateArraysObject(
                    this.clinicalAnalysis,
                    this._clinicalAnalysis,
                    this.updateParams,
                    param,
                    e.detail.value
                );

                // Get new comments and fix tags
                if (this.updateParams.comments) {
                    this.updateParams.comments = this.updateParams.comments
                        .filter(comment => !comment.author)
                        .map(comment => {
                            // eslint-disable-next-line no-param-reassign
                            comment.tags = Array.isArray(comment.tags) ? comment.tags : (comment.tags || "").split(" ");
                            return comment;
                        });
                }

                break;
        }
        this.requestUpdate();
    }

    render() {
        return html`
            <opencga-update
                    .resource="${"CLINICAL-ANALYSIS"}"
                    .component="${this.clinicalAnalysis}"
                    .componentId="${this.clinicalAnalysisId}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}">
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            // return {
            id: "clinical-analysis", // Fixme: clinical-analysis-update.js?
            title: "Case Editor", // Fixme: Clinical Analysis update?
            icon: "fas fa-user-md", // Fixme: to overwrite?
            // buttons: {
            //     clearText: "Cancel",
            //     okText: "Update Case",
            // },
            // display: this.displayConfig || this.displayConfigDefault,
            display: this.displayConfigDefault,
            sections: [
                // {
                //     elements: [
                //         {
                //             type: "notification",
                //             text: "Some changes have been done in the form. Not saved, changes will be lost",
                //             display: {
                //                 visible: () => !UtilsNew.isObjectValuesEmpty(this.updateParams),
                //                 notificationType: "warning",
                //             }
                //         }
                //     ]
                // },
                {
                    id: "summary",
                    title: "Summary",
                    display: {
                        style: "background-color:#f3f3f3;border-left:4px solid #0c2f4c;padding:16px;",
                    },
                    elements: [
                        {
                            title: "Case ID",
                            type: "custom",
                            display: {
                                render: clinicalAnalysis => html`
                                    <label>
                                        ${clinicalAnalysis.id}
                                    </label>
                                    <span style="padding-left: 50px">
                                        <i class="far fa-calendar-alt"></i>
                                        <label>Creation Date:</label> ${UtilsNew.dateFormatter(clinicalAnalysis?.creationDate)}
                                    </span>
                                    <span style="margin: 0 20px">
                                        <i class="far fa-calendar-alt"></i>
                                        <label>Due date:</label> ${UtilsNew.dateFormatter(clinicalAnalysis?.dueDate)}
                                    </span>
                                `,
                            }
                        },
                        {
                            title: "Proband",
                            field: "proband",
                            type: "custom",
                            display: {
                                render: proband => {
                                    const sex = (proband?.sex?.id !== "UNKNOWN") ? `(${proband.sex.id || proband.sex})` : "(Sex not reported)";
                                    const sampleIds = proband.samples.map(sample => sample.id).join(", ");
                                    return html`
                                        <span style="padding-right: 25px">
                                            ${proband.id} ${sex}
                                        </span>
                                        <span style="font-weight: bold; padding-right: 10px">
                                            Sample(s):
                                        </span>
                                        <span>${sampleIds}</span>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Clinical Condition",
                            field: "disorder",
                            type: "custom",
                            display: {
                                render: disorder => UtilsNew.renderHTML(CatalogGridFormatter.disorderFormatter(disorder)),
                            }
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: panels => {
                                    let panelHtml = "-";
                                    if (panels?.length > 0) {
                                        panelHtml = panels.map(panel =>
                                            (panel.source?.project?.toUpperCase() === "PANELAPP") ? html`
                                                <div style="margin: 5px 0">
                                                    <a href="${BioinfoUtils.getPanelAppLink(panel.source.id)}" target="_blank">
                                                        ${panel.name} (${panel.source.project} v${panel.source.version})
                                                    </a>
                                                </div>
                                            ` : html `
                                                    <div>${panel.id}</div>
                                            `
                                        );
                                    }
                                    return html`<div>${panelHtml}</div>`;
                                }
                            }
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                        },
                        {
                            title: "Interpretation ID",
                            field: "interpretation",
                            type: "custom",
                            display: {
                                render: interpretation => html`
                                    <span style="font-weight: bold; margin-right: 10px">
                                        ${interpretation?.id}
                                    </span>
                                    <span style="color: grey; padding-right: 40px">
                                        version ${interpretation?.version}
                                    </span>
                                `,
                            }
                        }
                    ]
                },
                {
                    id: "management",
                    title: "Management",
                    elements: [
                        {
                            title: "Lock",
                            field: "locked",
                            type: "toggle-switch",
                        },
                        {
                            title: "Status",
                            field: "status.id",
                            type: "custom",
                            display: {
                                render: (statusId, dataFormFilterChange, updateParams) => {
                                    // .disabled="${!!this._clinicalAnalysis?.locked}"
                                    return html `
                                    <clinical-status-filter
                                        .status="${statusId}"
                                        .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.status[this.clinicalAnalysis.type.toUpperCase()]}"
                                        .multiple=${false}
                                        .classes="${updateParams?.["status.id"] ? "selection-updated" : ""}"
                                        .disabled="${updateParams?.locked?.after ?? !!this.clinicalAnalysis?.locked}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </clinical-status-filter>
                                `;
                                }
                            }
                        },

                        {
                            title: "Priority",
                            field: "priority.id",
                            type: "custom",
                            display: {
                                render: (priorityId, dataFormFilterChange, updateParams) => html`
                                    <clinical-priority-filter
                                        .priority="${priorityId}"
                                        .priorities="${this.opencgaSession.study.internal?.configuration?.clinical?.priorities}"
                                        .multiple=${false}
                                        .classes="${updateParams?.["priority.id"] ? "selection-updated" : ""}"
                                        .disabled="${updateParams?.locked?.after ?? !!this.clinicalAnalysis?.locked}"
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </clinical-priority-filter>
                                `,
                            }
                        },

                        {
                            title: "Analyst",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.analyst?.id ?? this.clinicalAnalysis?.analyst?.assignee,
                            allowedValues: () => this.users,
                            display: {
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                            }
                        },

                        {
                            title: "Due Date",
                            field: "dueDate",
                            type: "input-date",
                            display: {
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                            },
                        }

                    ]
                },

                {
                    id: "general",
                    title: "General",
                    elements: [
                        {
                            title: "Disorder",
                            field: "disorder.id",
                            type: "select",
                            defaultValue: this.clinicalAnalysis?.disorder?.id,
                            allowedValues: () => {
                                if (this.clinicalAnalysis.proband?.disorders?.length > 0) {
                                    return this.clinicalAnalysis.proband.disorders.map(disorder => disorder.id);
                                } else {
                                    return [];
                                }
                            },
                            display: {
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                                helpMessage: "Case disorder must be one of the proband's disorder",
                            }
                        },

                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: (panels, dataFormFilterChange, updateParams) => {
                                    const handlePanelsFilterChange = e => {
                                        e.detail.value = e.detail.value
                                            ?.split(",")
                                            .filter(panelId => panelId)
                                            .map(panelId => ({id: panelId}));
                                        dataFormFilterChange(e.detail.value);
                                    };
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${this.opencgaSession.study?.panels}"
                                            .panel="${panels?.map(panel => panel.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .classes="${updateParams?.panels ? "selection-updated" : ""}"
                                            .disabled="${(updateParams?.locked?.after || updateParams?.panelLock?.after) ?? (!!this.clinicalAnalysis?.locked || !!this.clinicalAnalysis?.panelLock)}"
                                            @filterChange="${e => handlePanelsFilterChange(e)}">
                                        </disease-panel-filter>
                                    `;
                                }
                            }
                        },

                        {
                            title: "Disease Panel Lock",
                            field: "panelLock",
                            type: "toggle-switch",
                            display: {
                                helpMessage: "All existing interpretations must contain at least one of the Clinical Analysis panels to enable Disease Panel Lock.",
                                disabled: clinicalAnalysis => {
                                    if (clinicalAnalysis?.locked) {
                                        return true;
                                    }

                                    const interpretations = [
                                        clinicalAnalysis.interpretation,
                                        ...clinicalAnalysis.secondaryInterpretations,
                                    ];

                                    return interpretations.some(interpretation => {
                                        // Josemi 20220518 NOTE: interpretations should contain at least one panel from the clinical analysis
                                        // to enable the disease panels lock switch
                                        if (!interpretation?.panels || interpretation?.panels?.length < 1) {
                                            return true;
                                        }

                                        // We only need to find ONE panel in the interpretation that is not in the case panels for disabling
                                        // the disease panels lock
                                        return interpretation?.panels.some(panel => {
                                            return clinicalAnalysis?.panels?.findIndex(p => p.id === panel.id) === -1;
                                        });
                                    });
                                },
                            },
                        },

                        {
                            title: "Flags",
                            field: "flags",
                            type: "custom",
                            display: {
                                render: (flags, dataFormFilterChange, updateParams) => {

                                    const handleFlagsFilterChange = e => {
                                        // We need to convert value from a string wth commas to an array of IDs
                                        // eslint-disable-next-line no-param-reassign
                                        e.detail.value = e.detail.value
                                            ?.split(",")
                                            .filter(flagId => flagId)
                                            .map(flagId => ({id: flagId}));
                                        dataFormFilterChange(e.detail.value);
                                    };

                                    // Note 2022/11/30: currently the form does not allow to change the case type.
                                    //  If allowed, to consider a possible change in updateParams for property .flags.
                                    return html`
                                    <clinical-flag-filter
                                        .flag="${flags?.map(f => f.id).join(",")}"
                                        .flags="${this.opencgaSession.study.internal?.configuration?.clinical?.flags[this.clinicalAnalysis?.type.toUpperCase()]}"
                                        .multiple=${true}
                                        .classes="${updateParams?.flags ? "selection-updated" : ""}"
                                        .disabled="${updateParams?.locked?.after ?? !!this.clinicalAnalysis?.locked}"
                                        @filterChange="${e => handleFlagsFilterChange(e)}">
                                    </clinical-flag-filter>
                                `;
                                }
                            }
                        },
                        /*
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 3,
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                            }
                        },
                        {
                            title: "Comments",
                            field: "comments",
                            type: "object-list",
                            display: {
                                disabled: clinicalAnalysis => !!clinicalAnalysis?.locked,
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                // collapsable: false,
                                // maxNumItems: 5,
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                view: comment => html`
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
                        */
                    ]
                }
            ]
        });
    }

}

customElements.define("clinical-analysis-update", ClinicalAnalysisUpdate);
