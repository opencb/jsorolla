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
import {guardPage} from "../commons/html-utils.js";
import "../commons/forms/data-form.js";
import "../commons/forms/select-token-filter.js";
import "../commons/filters/disease-panel-filter.js";
import "../commons/filters/catalog-search-autocomplete.js";
import "../commons/image-viewer.js";
import "./filters/clinical-priority-filter.js";
import "./filters/clinical-flag-filter.js";
import "./filters/clinical-analyst-filter.js";
import CatalogGridFormatter from "../commons/catalog-grid-formatter";

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
                type: Object,
            },
            config: {
                type: Object,
            },
            displayConfig: {
                type: Object,
            },
        };
    }

    _init() {
        this.clinicalAnalysis = {};
        this._users = [];

        this.displayConfigDefault = {
            style: "margin: 10px",
            buttonsWidth: 8,
            buttonClearText: "Clear",
            buttonOkText: "Create Clinical Analysis",
            width: 8,
            titleVisible: false,
            titleAlign: "left",
            titleWidth: 3,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            // We store the available users from opencgaSession in 'clinicalAnalysis._users'
            if (this.opencgaSession?.study) {
                this._users = OpencgaCatalogUtils.getUsers(this.opencgaSession.study);
                this.initClinicalAnalysis();
            }

            this.requestUpdate();
        }

        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
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
            comments: [],
            panelLock: false,
            samples: [],
        };
    }

    initSamples(samples, isSomatic) {
        // 1 Check if there is a sample with status READY
        const readySample = samples.find(sample => {
            return sample.somatic === isSomatic && sample?.internal?.status?.id === "READY";
        });
        if (readySample) {
            return [readySample];
        }
        // 2. If not, select the first sample in the list instead
        const firstSample = samples.find(sample => sample.somatic === isSomatic);
        if (firstSample) {
            return [firstSample];
        }
        // 3. Other case, no samples are available
        return [];
    }

    onFieldChange(e) {
        this.clinicalAnalysis = {...this.clinicalAnalysis};

        // If we have changed the type field, we have to reset the 'proband', 'disorder' and ' family' fields of the clinical analysis object
        if (e.detail.param === "type") {
            delete this.clinicalAnalysis["proband"];
            delete this.clinicalAnalysis["disorder"];
            delete this.clinicalAnalysis["family"];

            // We would need also to reset samples
            this.clinicalAnalysis.samples = [];
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
                this.clinicalAnalysis.samples = this.initSamples(this.clinicalAnalysis?.proband?.samples || [], false);

            } else {
                // If we have removed the 'proband.id' field, we have to remove also the full proband object and reset samples
                delete this.clinicalAnalysis.proband;
                this.clinicalAnalysis.samples = [];
            }
        }

        this.requestUpdate();
    }

    onIndividualChange(e) {
        // Empty proband and disorder fields when a new individual has been selected or removed from the proband field
        delete this.clinicalAnalysis["proband"];
        delete this.clinicalAnalysis["disorder"];

        // Reset samples
        this.clinicalAnalysis.samples = [];

        if (e.detail.value) {
            this.clinicalAnalysis.type = "SINGLE";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.proband = response.responses[0].results[0];
                    this.clinicalAnalysis.samples = this.initSamples(this.clinicalAnalysis?.proband?.samples || [], false);

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

        // Reset samples
        this.clinicalAnalysis.samples = [];

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
                                this.clinicalAnalysis.samples = this.initSamples(this.clinicalAnalysis?.proband?.samples || [], false);
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

        // Reset selected samples
        this.clinicalAnalysis.samples = [];

        if (e.detail.value) {
            this.clinicalAnalysis.type = "CANCER";
            this.opencgaSession.opencgaClient.individuals().info(e.detail.value, {study: this.opencgaSession.study.fqn})
                .then(response => {
                    this.clinicalAnalysis.proband = response?.responses?.[0]?.results?.[0] || {};
                    this.clinicalAnalysis.samples = this.initSamples(this.clinicalAnalysis?.proband?.samples || [], true);

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

    onSampleChange(e) {
        this.clinicalAnalysis.samples = (e.detail.value || "")
            .split(",")
            .filter(s => !!s)
            .map(sampleId => {
                return this.clinicalAnalysis.proband?.samples?.find(sample => sample.id === sampleId);
            });
        this.clinicalAnalysis = {...this.clinicalAnalysis};
        this.requestUpdate();
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
        const data = {
            ...this.clinicalAnalysis,
            proband: {
                id: this.clinicalAnalysis?.proband?.id ? this.clinicalAnalysis?.proband?.id : null,
                samples: this.clinicalAnalysis.samples.map(sample => {
                    return {
                        id: sample.id,
                    };
                }),
            },
        };

        // Remove private fields
        delete data.samples;

        // For FAMILY case, we need to include the family id and the members
        if (data.type === "FAMILY") {
            data.family = {
                id: this.clinicalAnalysis.family.id,
                members: this.clinicalAnalysis.family.members.map(member => {
                    const familyMember = {
                        id: member.id,
                    };

                    // We need to include the selected samples for the member of the family that is also
                    // the proband in the clinical analysis
                    if (member.id === this.clinicalAnalysis.proband.id) {
                        familyMember.samples = this.clinicalAnalysis.samples.map(sample => {
                            return {
                                id: sample.id,
                            };
                        });
                    }

                    return familyMember;
                }),
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

        this.opencgaSession.opencgaClient.clinical()
            .create(data, {
                study: this.opencgaSession.study.fqn,
                includeResult: true
            })
            .then(response => {
                const interpretationId = response?.responses?.[0]?.results?.[0]?.interpretation?.id;
                const interpretationData = {
                    method: {
                        name: "opencga-default",
                        version: this.opencgaSession.opencgaClient?._config?.version || "-",
                        dependencies: [
                            {
                                name: "Cellbase",
                                version: this.opencgaSession.project?.cellbase?.version || "-",
                            },
                        ],
                    },
                };
                return this.opencgaSession.opencgaClient.clinical()
                    .updateInterpretation(data.id, interpretationId, interpretationData, {
                        study: this.opencgaSession.study.fqn,
                        methodsAction: "SET",
                    });
            })
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

    renderSamplesSelection(samples = [], isMultiple, somatic = false) {
        // Check for no available samples
        if (this.clinicalAnalysis?.proband?.id) {
            if (samples.length === 0 || !samples.some(sample => sample.somatic === somatic)) {
                return `No ${somatic ? "somatic" : "germline"} samples availabe for proband '${this.clinicalAnalysis.proband.id}'.`;
            }
        }
        const selectedSamples = (this.clinicalAnalysis?.samples || [])
            .map(sample => sample.id)
            .join(",");
        const data = (samples || []).map(sample => {
            return {
                id: sample.id,
                name: `${sample.name || sample.id} (${sample.somatic ? "Somatic" : "Germline"})`,
                disabled: sample.somatic && !somatic,
            };
        });
        return html`
            <select-field-filter
                .data="${data}"
                .value=${selectedSamples}
                .config="${{
                    multiple: isMultiple,
                }}"
                @filterChange="${e => this.onSampleChange(e)}">
            </select-field-filter>
        `;
    }

    render() {
        if (!this.opencgaSession?.study) {
            return guardPage();
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
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
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
                                        const panelList = (e.detail?.value?.split(",") || [])
                                            .filter(panelId => panelId)
                                            .map(panelId => ({id: panelId}));
                                        dataFormFilterChange(panelList);
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
                                        const flagList = (e.detail?.value?.split(",") || [])
                                            .filter(flagId => flagId)
                                            .map(flagId => ({id: flagId}));
                                        dataFormFilterChange(flagList);
                                    };
                                    return html`
                                        <clinical-flag-filter
                                            .flag="${flags?.map(f => f.id).join(",")}"
                                            .flags="${this.opencgaSession.study.internal?.configuration?.clinical?.flags[this.clinicalAnalysis.type?.toUpperCase()]}"
                                            .multiple="${true}"
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
                            title: "Select Samples",
                            field: "proband.samples",
                            type: "custom",
                            required: true,
                            validation: {
                                validate: () => {
                                    return this.clinicalAnalysis?.samples?.length === 1;
                                },
                                message: "A germline sample must be selected.",
                            },
                            display: {
                                render: samples => {
                                    return this.renderSamplesSelection(samples, false, false);
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
                            title: "Selected Samples",
                            field: "samples",
                            type: "table",
                            display: {
                                defaultValue: "No proband or sample selected.",
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                        display: {
                                            defaultValue: "-",
                                            style: {
                                                "font-weight": "bold"
                                            }
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            contentLayout: "vertical",
                                            transform: values => (values || []).filter(file => file?.includes(".vcf")),
                                        },
                                    },
                                    {
                                        id: "Status",
                                        title: "Status",
                                        field: "internal.status.id",
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
                            title: "Select Samples",
                            field: "proband.samples",
                            type: "custom",
                            required: true,
                            validation: {
                                validate: () => {
                                    return this.clinicalAnalysis?.samples?.length === 1;
                                },
                                message: "A germline sample must be selected.",
                            },
                            display: {
                                render: samples => {
                                    return this.renderSamplesSelection(samples, false, false);
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
                                        type: "complex",
                                        display: {
                                            defaultValue: "-",
                                            template: "${id} ${sex}",
                                            format: {
                                                "sex": (sex, member) => `${sex?.id ?? sex}(${member.karyotypicSex})`
                                            },
                                            className: {
                                                "sex": "form-text"
                                            },
                                            style: {
                                                "id": {
                                                    "font-weight": "bold"
                                                },
                                                "sex": {
                                                    "margin": "5px 0"
                                                },
                                            }
                                        },
                                    },
                                    {
                                        id: "samples",
                                        title: "Samples",
                                        field: "samples",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            contentLayout: "vertical",
                                            template: "${id}"
                                        }
                                    },
                                    {
                                        id: "fatherId",
                                        title: "Father",
                                        field: "father.id",
                                    },
                                    {
                                        id: "motherId",
                                        title: "Mother",
                                        field: "mother.id",
                                    },
                                    {
                                        title: "Disorders",
                                        field: "disorders",
                                        type: "list",
                                        display: {
                                            defaultValue: "N/A",
                                            format: disorder => CatalogGridFormatter.disorderFormatter([disorder])
                                        }
                                    },
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
                            title: "Select Samples",
                            field: "proband.samples",
                            type: "custom",
                            required: true,
                            validation: {
                                validate: () => {
                                    // Case :: Only one sample has been selected, check if this sample is somatic
                                    if (this.clinicalAnalysis?.samples?.length === 1) {
                                        return this.clinicalAnalysis.samples[0].somatic;
                                    }
                                    // Case 2: two samples selected: verify that one sample is somatic and the other
                                    // sample is germline
                                    if (this.clinicalAnalysis?.samples?.length === 2) {
                                        const hasSomatic = this.clinicalAnalysis.samples.some(s => s.somatic);
                                        const hasGermline = this.clinicalAnalysis.samples.some(s => !s.somatic);
                                        return hasSomatic && hasGermline;
                                    }
                                    // Case 3: no samples or more than two samples selected.
                                    return false;
                                },
                                message: "At least a somatic sample must be selected. Only one somatic and one germline samples are allowed.",
                            },
                            display: {
                                render: samples => {
                                    return this.renderSamplesSelection(samples, true, true);
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
                            field: "samples",
                            type: "table",
                            display: {
                                defaultValue: "No proband or sample(s) selected.",
                                columns: [
                                    {
                                        title: "ID",
                                        field: "id",
                                        display: {
                                            style: {
                                                "font-weight": "bold"
                                            }
                                        },
                                    },
                                    {
                                        title: "Files",
                                        field: "fileIds",
                                        type: "list",
                                        display: {
                                            defaultValue: "-",
                                            contentLayout: "vertical",
                                            transform: values => (values || []).filter(file => file?.includes(".vcf")),
                                        },
                                    },
                                    {
                                        title: "Somatic",
                                        field: "somatic",
                                    },
                                    {
                                        title: "Status",
                                        field: "internal.status.id",
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
                            field: "analysts",
                            type: "custom",
                            display: {
                                render: (analysts, dataFormFilterChange) => {
                                    const handleAnalystsFilterChange = e => {
                                        const analystList = (e.detail?.value?.split(",") || [])
                                            .filter(analystId => analystId)
                                            .map(analystId => ({id: analystId}));
                                        dataFormFilterChange(analystList);
                                    };
                                    return html`
                                        <clinical-analyst-filter
                                            .analyst="${analysts?.map(f => f.id).join(",")}"
                                            .analysts="${this._users}"
                                            .multiple="${true}"
                                            @filterChange="${e => handleAnalystsFilterChange(e, "analyst.id")}">
                                        </clinical-analyst-filter>
                                    `;
                                },
                            }
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
