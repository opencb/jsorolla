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
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import WebUtils from "../commons/utils/web-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/image-viewer.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";


export default class ClinicalAnalysisCreate extends LitElement {

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
            config: {
                type: Object
            }
        };
    }

    _init() {
        this.clinicalAnalysis = {};
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // We store the available users from opencgaSession in 'clinicalAnalysis._users'
            this.clinicalAnalysis._users = [];
            if (this.opencgaSession?.study) {
                this._users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
                this.initClinicalAnalysis();
                this._clinicalAnalysis = UtilsNew.objectClone(this.clinicalAnalysis);
            }

            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {...this.getDefaultConfig(), ...this.config};
        }
        super.update(changedProperties);
    }

    initClinicalAnalysis() {
        this.clinicalAnalysis = {
            // Note 2022 Vero: defaultValue can't be used because part of the form visibility has a dependency with this.
            type: "SINGLE",
            // Note 2022 Vero: priority element does not admit defaultValue. Thus, the key is initialised here.
            //   Question: should defaultValue be implemented in clinical-priority-filter.js for consistency?
            priority: "MEDIUM",
            // Note 2022 Vero: decided to allow empty analyst
            // analyst: {
            //     id: this.opencgaSession?.user?.id
            // },
            _users: this._users,
            comments: [],
            panelLock: false,
        };
    }

    onFieldChange(e) {
        this.clinicalAnalysis = {...this.clinicalAnalysis};

        // If we have changed the type field, we have to reset the 'proband', 'disorder' and ' family' fields of the clinical analysis object
        if (e.detail.param === "type") {
            delete this.clinicalAnalysis["proband"];
            delete this.clinicalAnalysis["disorder"];
            delete this.clinicalAnalysis["family"];
        }

        // In FAMILY, changing the proband only sets the 'proband.id' field of the clinicalAnalysis object
        // We need to save the full member object in proband.
        if (e.detail.param === "proband.id" && this.clinicalAnalysis.type === "FAMILY") {
            // Changing the 'proband.id' means we have to reset the disorder field
            delete this.clinicalAnalysis.disorder;
            if (this.clinicalAnalysis.proband?.id) {
                const proband = this.clinicalAnalysis.family.members.find(member => member.id === this.clinicalAnalysis.proband?.id);
                this.clinicalAnalysis.proband = UtilsNew.objectClone(proband);
                this.clinicalAnalysis.proband.disorders = this.clinicalAnalysis.proband.disorders || [];
            } else {
                // If we have removed the 'proband.id' field, we have to remove also the full proband object
                delete this.clinicalAnalysis.proband;
            }
        }

        this.requestUpdate();
    }

    onCustomFieldChange(field, e) {
        this.onFieldChange({
            detail: {
                value: e.detail.value,
                param: field
            }
        });
    }

    onIndividualChange(e) {
        // Empty proband and disorder fields when a new individual has been selected or removed from the proband field
        delete this.clinicalAnalysis["proband"];
        delete this.clinicalAnalysis["disorder"];

        if (e.detail.value) {
            this.clinicalAnalysis.type = "SINGLE";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.proband = response.responses[0].results[0];

                    if (this.clinicalAnalysis.proband?.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = {
                            id: this.clinicalAnalysis.proband.disorders[0].id
                        };
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            this.clinicalAnalysis = {...this.clinicalAnalysis};
            this.requestUpdate();
        }
    }

    onFamilyChange(e) {
        // Empty proband, disorder and family fields when a family is changed or removed.
        delete this.clinicalAnalysis["proband"];
        delete this.clinicalAnalysis["disorder"];
        delete this.clinicalAnalysis["family"];

        if (e.detail.value) {
            this.clinicalAnalysis.type = "FAMILY";
            this.opencgaSession.opencgaClient.families().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.family = response.responses[0].results[0];

                    // Select as proband the first son/daughter with a disorder
                    if (this.clinicalAnalysis.family && this.clinicalAnalysis.family.members) {
                        for (const member of this.clinicalAnalysis.family.members) {
                            if (member.disorders && member.disorders.length > 0 && member.father.id && member.mother.id) {
                                this.clinicalAnalysis.proband = UtilsNew.objectClone(member);
                                break;
                            }
                        }
                    }

                    if (this.clinicalAnalysis.proband?.disorders?.length === 1) {
                        this.clinicalAnalysis.disorder = {
                            id: this.clinicalAnalysis.proband.disorders[0].id
                        };
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            this.clinicalAnalysis = {...this.clinicalAnalysis};
            this.requestUpdate();
        }
    }

    onCancerChange(e) {
        // Empty proband and disorder fields when a new individual has been selected or removed from the proband field
        delete this.clinicalAnalysis["proband"];
        delete this.clinicalAnalysis["disorder"];

        if (e.detail.value) {
            this.clinicalAnalysis.type = "CANCER";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis = {
                        ...this.clinicalAnalysis,
                        proband: response.responses[0].results[0]
                    };

                    if (this.clinicalAnalysis?.proband?.disorders?.length === 1) {
                        this.clinicalAnalysis = {
                            ...this.clinicalAnalysis,
                            disorder: {
                                id: this.clinicalAnalysis.proband.disorders[0].id
                            }
                        };
                    }

                    this.clinicalAnalysis = {...this.clinicalAnalysis};
                    this.requestUpdate();
                })
                .catch(reason => {
                    console.error(reason);
                });
        } else {
            this.clinicalAnalysis = {...this.clinicalAnalysis};
            this.requestUpdate();
        }
    }

    notifyClinicalAnalysisWrite() {
        LitUtils.dispatchCustomEvent(this, "clinicalAnalysisCreate", null, {
            id: this.clinicalAnalysis.id,
            clinicalAnalysis: this.clinicalAnalysis
        }, null);
    }

    onClear() {
        this.initClinicalAnalysis();
        // This reset all date elements such as dueDate, check TASK-340
        // eslint-disable-next-line no-param-reassign
        Array.from(this.querySelectorAll("input[type='date']")).forEach(el => el.value = "");
        this.requestUpdate();
    }

    onSubmit() {
        // Prepare the data for the REST create
        let data = {...this.clinicalAnalysis};

        // remove private fields
        delete data._users;
        data = {
            ...data,
            proband: {
                id: this.clinicalAnalysis?.proband?.id ? this.clinicalAnalysis?.proband?.id : null
            }
        };

        if (data.type === "FAMILY") {

            data = {
                ...data,
                family: {
                    id: this.clinicalAnalysis.family.id,
                    members: this.clinicalAnalysis.family.members.map(e => ({id: e.id}))
                }
            };
        }

        if (data.comments) {
            data.comments = data.comments
                .filter(comment => !comment.author)
                .map(comment => ({
                    ...comment,
                    tags: UtilsNew.commaSeparatedArray(comment.tags),
                }));
        }

        // Clear dueDate field if not provided a valid value
        if (!data.dueDate) {
            delete data.dueDate;
        }

        this.opencgaSession.opencgaClient.clinical().create(data, {study: this.opencgaSession.study.fqn, createDefaultInterpretation: true})
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Clinical analysis created",
                    message: `The clinical analysis ${data.id} has been created successfully`,
                });
                this.notifyClinicalAnalysisWrite();
                this.onClear();
            })
            .catch(response => {
                // console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    render() {
        if (!this.opencgaSession?.study) {
            return html `
                <div class="guard-page">
                    <i class="fas fa-lock fa-5x"></i>
                    <h3>No public projects available to browse. Please login to continue</h3>
                </div>
            `;
        }

        return html`
            <data-form
                .data="${this.clinicalAnalysis}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            id: "clinical-analysis",
            title: "Create Case",
            icon: "fas fa-user-md",
            requires: "2.0.0",
            description: "Sample Variant Stats description",
            display: {
                buttonsWidth: 10,
                buttonClearText: "Clear",
                buttonOkText: "Create Clinical Analysis",
                width: 10,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => !UtilsNew.objectCompare(this.clinicalAnalysis, this._clinicalAnalysis),
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Case ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            defaultValue: "",
                            display: {
                                placeholder: "eg. AN-3",
                            },
                            validation: {
                                validate: id => id && !id.includes(" "),
                                // FIXME: regexp for not allowed special chars
                                message: "ID must not contain spaces and other special chars",
                            },
                        },
                        {
                            title: "Analysis Type",
                            field: "type",
                            type: "select",
                            required: true,
                            allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                        },
                        {
                            title: "Disease Panels",
                            field: "panels",
                            type: "custom",
                            display: {
                                render: (panels, dataFormFilterChange) => {
                                    const handlePanelsFilterChange = e => {
                                        // eslint-disable-next-line no-param-reassign
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
                                            .panel="${panels?.map(p => p.id).join(",")}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            @filterChange="${e => handlePanelsFilterChange(e, "panels.id")}">
                                        </disease-panel-filter>
                                    `;
                                }
                            },
                        },
                        {
                            title: "Disease Panel Lock",
                            field: "panelLock",
                            type: "toggle-switch",
                            display: {
                                helpMessage: "You must select at least one of the Clinical Analysis panels to enable Disease Panel Lock.",
                                disabled: clinicalAnalysis => {
                                    return !clinicalAnalysis?.panels || clinicalAnalysis?.panels?.length === 0;
                                },
                            },
                        },
                        {
                            title: "Flags",
                            field: "flags",
                            type: "custom",
                            display: {
                                render: (flags, dataFormFilterChange) => {
                                    const handleFlagsFilterChange = e => {
                                        // eslint-disable-next-line no-param-reassign
                                        e.detail.value = e.detail.value
                                            ?.split(",")
                                            .filter(flagId => flagId)
                                            .map(flagId => ({id: flagId}));
                                        dataFormFilterChange(e.detail.value);
                                    };
                                    return html`
                                    <clinical-flag-filter
                                        .flag="${flags?.map(f => f.id).join(",")}"
                                        .flags="${this.opencgaSession.study.internal?.configuration?.clinical?.flags[this.clinicalAnalysis.type?.toUpperCase()]}"
                                        .multiple=${true}
                                        @filterChange="${e => handleFlagsFilterChange(e, "flags.id")}">
                                    </clinical-flag-filter>
                                `;
                                },
                            },
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            defaultValue: "",
                            display: {
                                rows: 2,
                                placeholder: "Add a description to this case..."
                            },
                        }
                    ]
                },
                {
                    title: "Single Analysis Configuration",
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "SINGLE",
                    },
                    elements: [
                        {
                            title: "Select Proband",
                            field: "proband.id",
                            type: "custom",
                            required: true,
                            display: {
                                render: probandId => {
                                    return html`
                                        <catalog-search-autocomplete
                                            .value="${probandId}"
                                            .resource="${"INDIVIDUAL"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config=${{addButton: false, multiple: false}}
                                            @filterChange="${e => this.onIndividualChange(e)}">
                                        </catalog-search-autocomplete>
                                    `;
                                },
                            },
                        },
                        {
                            title: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            display: {
                                apply: disorder => {
                                    return {
                                        id: disorder.id,
                                        name: WebUtils.getDisplayName(disorder),
                                    };
                                },
                                errorMessage: "No disorders available",
                            }
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                // defaultLayout: "vertical",
                                errorMessage: "No proband selected",
                                errorClassName: "",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: sample => html`<span style="font-weight: bold">${sample.id}</span>`,
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "custom",
                                        display: {
                                            render: fileIds => {
                                                const fileVcfs = fileIds.filter(file => file.includes(".vcf")).join("<br>");
                                                return UtilsNew.renderHTML(`${fileVcfs}`);
                                            },
                                        },
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "-",
                                    },
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Family Analysis Configuration",
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "FAMILY",
                    },
                    elements: [
                        {
                            title: "Select Family",
                            field: "family.id",
                            type: "custom",
                            required: true,
                            display: {
                                render: () => html`
                                    <catalog-search-autocomplete
                                        .resource="${"FAMILY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{addButton: false, multiple: false}}"
                                        @filterChange="${e => this.onFamilyChange(e)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Select Proband",
                            field: "proband.id",
                            type: "select",
                            allowedValues: "family.members",
                            required: true,
                            display: {
                                errorMessage: "No family selected",
                            },
                        },
                        {
                            title: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            display: {
                                apply: disorder => {
                                    return {
                                        id: disorder.id,
                                        name: WebUtils.getDisplayName(disorder),
                                    };
                                },
                                errorMessage: "No disorders available",
                            },
                        },
                        {
                            title: "Members",
                            field: "family.members",
                            type: "table",
                            display: {
                                width: 12,
                                // defaultLayout: "vertical",
                                errorMessage: "No family selected",
                                errorClassName: "",
                                columns: [
                                    {
                                        title: "Individual ID",
                                        type: "custom",
                                        display: {
                                            render: individual => html`
                                                <div style="font-weight: bold">${individual.id}</div>
                                                <div class="help-block">
                                                    ${individual?.sex?.id || "Not specified"} (${individual.karyotypicSex || "Not specified"})
                                                </div>
                                            `,
                                        },
                                    },
                                    {
                                        title: "Individual Name",
                                        field: "name",
                                    },
                                    {
                                        title: "Samples",
                                        field: "samples",
                                        type: "custom",
                                        display: {
                                            render: samples => {
                                                if (!samples || samples.length === 0) {
                                                    return "-";
                                                }
                                                return samples.map(sample => html`<div>${sample.id}</div>`);
                                            },
                                        },
                                    },
                                    {
                                        title: "Father",
                                        field: "father.id",
                                    },
                                    {
                                        title: "Mother",
                                        field: "mother.id",
                                    },
                                    {
                                        title: "Disorders",
                                        field: "disorders",
                                        type: "custom",
                                        display: {
                                            render: disorders => {
                                                if (disorders && disorders.length > 0) {
                                                    let id = disorders[0].id;
                                                    const name = disorders[0].name;
                                                    if (id?.startsWith("OMIM:")) {
                                                        id = html`<a href="https://omim.org/entry/${id.split(":")[1]}" target="_blank">${id}</a>`;
                                                    }
                                                    return html`${name} (${id})`;
                                                } else {
                                                    return html`<span>N/A</span>`;
                                                }
                                            }
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            title: "Pedigree",
                            type: "custom",
                            display: {
                                render: data => {
                                    if (data?.family?.pedigreeGraph?.base64) {
                                        return html`
                                            <image-viewer
                                                .data="${data.family?.pedigreeGraph?.base64}">
                                            </image-viewer>
                                        `;
                                    }
                                    return "-";
                                },
                                errorMessage: "No family selected",
                            }
                        }
                    ]
                },
                {
                    title: "Cancer Analysis Configuration",
                    collapsed: false,
                    display: {
                        visible: data => data.type && data.type.toUpperCase() === "CANCER",
                    },
                    elements: [
                        {
                            title: "Select Proband",
                            type: "custom",
                            required: true,
                            display: {
                                render: () => html`
                                    <catalog-search-autocomplete
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config=${{addButton: false, multiple: false}}
                                        @filterChange="${e => this.onCancerChange(e)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            title: "Select Disorder",
                            field: "disorder.id",
                            type: "select",
                            allowedValues: "proband.disorders",
                            display: {
                                apply: disorder => {
                                    return {
                                        id: disorder.id,
                                        name: WebUtils.getDisplayName(disorder),
                                    };
                                },
                                errorMessage: "No disorders available",
                            }
                        },
                        {
                            title: "Samples",
                            field: "proband.samples",
                            type: "table",
                            display: {
                                errorClassName: "",
                                errorMessage: "No proband selected",
                                columns: [
                                    {
                                        title: "ID",
                                        type: "custom",
                                        display: {
                                            render: sample => html`<span style="font-weight: bold">${sample.id}</span>`,
                                        }
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "custom",
                                        display: {
                                            render: fileIds => html`${fileIds.join("\n")}`,
                                        },
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                    },
                                    {
                                        title: "Status",
                                        field: "status.name",
                                        defaultValue: "-",
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    title: "Management Information",
                    elements: [
                        {
                            title: "Priority",
                            field: "priority",
                            type: "custom",
                            required: true,
                            display: {
                                render: (priority, dataFormFilterChange) => html `
                                    <clinical-priority-filter
                                        .priority="${priority}"
                                        .priorities="${this.opencgaSession.study.internal?.configuration?.clinical?.priorities}"
                                        .multiple="${false}"
                                        .forceSelection=${true}
                                        @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                    </clinical-priority-filter>
                                `,
                            }
                        },
                        {
                            title: "Assigned To",
                            field: "analyst.id",
                            type: "select",
                            // defaultValue: this.opencgaSession?.user?.id,
                            allowedValues: "_users",
                        },
                        {
                            title: "Due Date",
                            field: "dueDate",
                            type: "input-date",
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
                            ]
                        },
                    ]
                }
            ]
        };
    }

}

customElements.define("clinical-analysis-create", ClinicalAnalysisCreate);
