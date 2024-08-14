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
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import "../filters/clinical-status-filter.js";
import "../../commons/forms/data-form.js";
import "../../commons/filters/disease-panel-filter.js";

import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import UtilsNew from "../../../core/utils-new.js";

export default class ClinicalInterpretationCreate extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
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

    _init() {
        this.mode = "";
        this.interpretation = {};
        this._users = [];

        this.displayConfigDefault = {
            width: 12,
            buttonsAlign: "end",
            buttonClearText: "Clear",
            buttonOkText: "Create Interpretation",
            titleVisible: true,
            defaultLayout: "horizontal"
        };
        this.config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();

        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("clinicalAnalysis")) {
            this.initClinicalInterpretation();
            this.config = this.getDefaultConfig();
        }
        if (changedProperties.has("opencgaSession")) {
            this._users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
            this.initClinicalInterpretation();
        }
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this.config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    initClinicalInterpretation() {
        this.interpretation = {
            clinicalAnalysisId: this.clinicalAnalysis.id,
            analyst: {
                id: this.opencgaSession?.user?.id
            },
            panels: this.clinicalAnalysis.panels?.length > 0 ? this.clinicalAnalysis?.panels.map(panel => {
                return {id: panel.id};
            }) : [],
            comments: [],
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.interpretation = {...this.interpretation};
        this.requestUpdate();
    }

    notifyClinicalAnalysisWrite() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisUpdate", null, {
            clinicalAnalysis: this.clinicalAnalysis,
        });
    }

    onClear() {
        this.initClinicalInterpretation();
        this.requestUpdate();
    }

    onSubmit() {
        const data = {
            ...this.interpretation,
            method: {
                // eslint-disable-next-line no-undef
                version: process.env.VERSION,
                name: "iva-dss",
                dependencies: [
                    {
                        name: "OpenCGA",
                        version: this.opencgaSession.opencgaClient?._config?.version || "-",
                    },
                    {
                        name: "Cellbase",
                        version: this.opencgaSession.project?.cellbase?.version || "-",
                    },
                ],
            },
        };

        this.opencgaSession.opencgaClient.clinical().createInterpretation(this.clinicalAnalysis.id, data, {
            study: this.opencgaSession.study.fqn
        })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Clinical Interpretation created",
                    // message: `The clinical interpretation ${response.responses[0].results[0].id} has been created successfully`,
                    message: "The new clinical interpretation has been created successfully",
                });
                this.notifyClinicalAnalysisWrite();
                this.onClear();
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    render() {
        return html`
            <data-form
                .data="${this.interpretation}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-interpretation",
            title: "Create Interpretation",
            icon: "fas fa-file-medical",
            mode: this.mode,
            requires: "2.2.0",
            description: "Create a new interpretation for this case",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Interpretation ID",
                            field: "id",
                            type: "input-text",
                            defaultValue: this.clinicalAnalysis?.id,
                            display: {
                                disabled: true,
                                helpMessage: "The interpretation ID is generated automatically",
                            },
                        },
                        {
                            title: "Interpretation Name",
                            field: "name",
                            type: "input-text",
                        },
                        {
                            title: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: () => this._users,
                            display: {},
                        },
                        {
                            title: "Status",
                            field: "status",
                            type: "custom",
                            display: {
                                render: (status, dataFormFilterChange) => html`
                                    <clinical-status-filter
                                        .status="${status?.id}"
                                        .statuses="${this.opencgaSession.study.internal?.configuration?.clinical?.interpretation?.status || []}"
                                        .multiple=${false}
                                        @filterChange="${e => dataFormFilterChange({id: e.detail.value})}">
                                    </clinical-status-filter>
                                `,
                            }
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: (panels, dataFormFilterChange) => {
                                    const panelLock = !!this.clinicalAnalysis?.panelLocked;
                                    const panelList = panelLock ? this.clinicalAnalysis.panels : this.opencgaSession.study?.panels;
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
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            .disabled="${panelLock}"
                                            @filterChange="${e => handlePanelsFilterChange(e)}">
                                        </disease-panel-filter>
                                    `;
                                }
                            }
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2,
                                placeholder: "Add a description to this case..."
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
                                showEditItemListButton: false,
                                showDeleteItemListButton: false,
                                view: comment => {
                                    // eslint-disable-next-line no-param-reassign
                                    comment.tags = Array.isArray(comment.tags) ? comment.tags : (comment.tags || "").split(/,\s*/);
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
                                                <div class="text-muted">Tags: ${(comment.tags || []).join(" ") || "-"}</div>
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
                    ]
                },
            ]
        };
    }

}

customElements.define("clinical-interpretation-create", ClinicalInterpretationCreate);
