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
import LitUtils from "../../commons/utils/lit-utils.js";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import "../../commons/forms/data-form.js";

export default class VariantInterpreterGridConfig extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            // FIXME Temporary object used to check CellBase version and hide RefSeq filter
            opencgaSession: {
                type: Object
            },
            gridColumns: {
                type: Object
            },
            toolId: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    update(changedProperties) {
        if (changedProperties.has("config")) {
            this.onConfigObserver();
        }
        super.update(changedProperties);
    }

    onConfigObserver() {
        this._highlights = (this.config?.highlights || [])
            .filter(h => h.active)
            .map(h => h.id)
            .join(",");

        // Prepare data for the column select
        this.selectColumnData = [];
        this.selectedColumns = [];
        if (this.gridColumns && Array.isArray(this.gridColumns)) {
            let lastSubColumn = 0;
            for (const gridColumn of this.gridColumns[0]) {
                if (gridColumn.rowspan === 2) {
                    if (!gridColumn.excludeFromSettings) {
                        this.selectColumnData.push({
                            id: gridColumn.id,
                            name: gridColumn.columnTitle || gridColumn.title,
                        });
                        if (typeof gridColumn.visible === "undefined" || gridColumn.visible) {
                            this.selectedColumns.push(gridColumn.id);
                        }
                    }
                } else {
                    const option = {id: gridColumn.id, name: gridColumn.columnTitle || gridColumn.title, fields: []};
                    for (let i = lastSubColumn; i < lastSubColumn + gridColumn.colspan; i++) {
                        if (!this.gridColumns[1][i].excludeFromSettings) {
                            option.fields.push({
                                id: this.gridColumns[1][i].id,
                                name: this.gridColumns[1][i].title,
                            });
                        }
                        if (typeof this.gridColumns[1][i].visible === "undefined" || this.gridColumns[1][i].visible) {
                            this.selectedColumns.push(this.gridColumns[1][i].id);
                        }
                    }
                    if (option.fields[0]?.id) {
                        this.selectColumnData.push(option);
                    }
                    lastSubColumn += gridColumn.colspan;
                }
            }
        }
    }

    onFieldChange(e) {
        switch (e.detail.param) {
            case "columns":
                this.config.columns = e.detail.value?.split(",");
                break;
            case "genotype.type":
                this.config.genotype.type = e.detail.value;
                break;
            case "geneSet.ensembl":
            case "geneSet.refseq":
            case "consequenceType.all":
            case "consequenceType.maneTranscript":
            case "consequenceType.ensemblCanonicalTranscript":
            case "consequenceType.gencodeBasicTranscript":
            case "consequenceType.ccdsTranscript":
            case "consequenceType.lrgTranscript":
            case "consequenceType.ensemblTslTranscript":
            case "consequenceType.illuminaTSO500Transcript":
            case "consequenceType.eglhHaemoncTranscript":
            case "consequenceType.proteinCodingTranscript":
            case "consequenceType.highImpactConsequenceTypeTranscript":
            case "consequenceType.showNegativeConsequenceTypes":
            case "populationFrequenciesConfig.displayMode":
                const fields = e.detail.param.split(".");
                if (!this.config[fields[0]]) {
                    this.config[fields[0]] = {};
                }
                this.config[fields[0]][fields[1]] = e.detail.value;

                if (e.detail.param === "consequenceType.all") {
                    // we need to refresh the form to display disabled checkboxes
                    this.requestUpdate();
                }
                break;
            case "_highlights":
                if (e.detail.value) {
                    const values = e.detail.value.split(",");
                    this.config.highlights.forEach(h => h.active = values.includes(h.id));
                } else {
                    this.config.highlights.forEach(h => h.active = false);
                }
                this._highlights = e.detail.value || "";
                this.requestUpdate();
                break;
        }

        LitUtils.dispatchCustomEvent(this, "configChange", this.config);
    }

    async onSubmit() {
        // const newGridConfig = {...this.config};
        //
        // // Remove highlights and copies configuration from new config
        // if (newGridConfig._highlights) {
        //     delete newGridConfig._highlights;
        // }

        try {
            // Update user configuration
            await OpencgaCatalogUtils
                .updateGridConfig(
                    "IVA",
                    this.opencgaSession,
                    this.toolId,
                    {
                        // All Variant Grids
                        pageSize: this.config.pageSize,
                        columns: this.config.columns,
                        geneSet: this.config.geneSet,
                        consequenceType: this.config.consequenceType,
                        populationFrequenciesConfig: this.config.populationFrequenciesConfig,
                        highlights: this.config.highlights,
                        // Only Variant Interpreter Grids
                        genotype: this.config.genotype,
                    }
                );
            LitUtils.dispatchCustomEvent(this, "settingsUpdate");

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: "Configuration saved",
            });
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        }
    }

    render() {
        return html`
            <data-form
                .data="${this.config}"
                .config="${this.getConfigForm()}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getConfigForm() {
        const isTestEnv = this.opencgaSession?.testEnv ? this.opencgaSession?.testEnv: {};
        return {
            ...isTestEnv,
            id: "interpreter-grid-config",
            title: "",
            icon: "fas fa-user-md",
            type: "pills",
            validation: {
                validate: data => {
                    return data.geneSet?.ensembl || data.geneSet?.refseq;
                }
            },
            display: {
                width: 10,
                titleVisible: false,
                titleAlign: "left",
                titleWidth: 4,
                defaultLayout: "vertical",
                buttonsVisible: true
            },
            sections: [
                {
                    title: "General",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select the page size",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px"
                            }
                        },
                        {
                            field: "pageSize",
                            type: "custom",
                            text: "Page Size",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px",
                                render: (columns, dataFormFilterChange) => {
                                    return html`
                                        <select-field-filter
                                            .data="${this.config?.pageList}"
                                            .value="${this.config?.pageSize}"
                                            .multiple="${false}"
                                            .classes="${"btn-sm"}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </select-field-filter>
                                    `;
                                }
                            }
                        },
                        {
                            type: "text",
                            text: "Select the columns to be displayed",
                            display: {
                                containerStyle: "margin: 20px 5px 5px 0px",
                            }
                        },
                        {
                            field: "columns",
                            type: "custom",
                            text: "Columns",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px",
                                render: (columns, dataFormFilterChange) => {
                                    return html`
                                        <select-field-filter
                                            .data="${this.selectColumnData}"
                                            .value="${this.selectedColumns?.join(",")}"
                                            .title="${"Columns"}"
                                            .multiple="${true}"
                                            .classes="${"btn-sm"}"
                                            @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                        </select-field-filter>
                                    `;
                                }
                            }
                        },
                    ],
                },
                {
                    id: "gt",
                    title: "Genotype Settings",
                    description: "Select some general options",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px",
                        visible: () => !!this.config?.genotype?.type
                    },
                    elements: [
                        {
                            title: "Select how genotypes are displayed",
                            field: "genotype.type",
                            type: "select",
                            allowedValues: ["ALLELES", "VCF_CALL", "ZYGOSITY", "VAF", "ALLELE_FREQUENCY", "ALLELE_FREQUENCY_BAR", "CIRCLE"],
                            display: {
                                width: 6,
                            }
                        },
                    ]
                },
                {
                    title: "Transcript Filter",
                    // description: "Select which transcripts and consequence types are displayed in the variant grid",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px",
                        visible: () => !!this.config?.geneSet
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select the Gene Set to be displayed",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px",
                                visible: () => this.opencgaSession?.project?.cellbase?.version.startsWith("v5")
                            }
                        },
                        {
                            field: "geneSet.ensembl",
                            type: "checkbox",
                            text: "Ensembl",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                visible: () => this.opencgaSession?.project?.cellbase?.version.startsWith("v5")
                            }
                        },
                        {
                            field: "geneSet.refseq",
                            type: "checkbox",
                            text: "RefSeq",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                visible: () => this.opencgaSession?.project?.cellbase?.version.startsWith("v5")
                            }
                        },
                        {
                            type: "text",
                            text: "Select which transcripts and consequence types are displayed in the variant grid",
                            display: {
                                containerStyle: "margin: 20px 5px 5px 0px"
                            }
                        },
                        {
                            field: "consequenceType.all",
                            type: "checkbox",
                            text: "Include All Transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                            }
                        },
                        {
                            type: "separator",
                            display: {
                                style: "margin: 5px 20px"
                            }
                        },
                        {
                            field: "consequenceType.maneTranscript",
                            type: "checkbox",
                            text: "Include MANE Select and Plus Clinical transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.ensemblCanonicalTranscript",
                            type: "checkbox",
                            text: "Include Ensembl Canonical transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.gencodeBasicTranscript",
                            type: "checkbox",
                            text: "Include GENCODE Basic transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.ccdsTranscript",
                            type: "checkbox",
                            text: "Include CCDS transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.lrgTranscript",
                            type: "checkbox",
                            text: "Include LRG transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.ensemblTslTranscript",
                            type: "checkbox",
                            text: "Include Ensembl TSL:1 transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.illuminaTSO500Transcript",
                            type: "checkbox",
                            text: "Include Illumina TSO500 transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.eglhHaemoncTranscript",
                            type: "checkbox",
                            text: "Include EGLH HaemOnc transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.proteinCodingTranscript",
                            type: "checkbox",
                            text: "Include protein coding transcripts",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        },
                        {
                            field: "consequenceType.highImpactConsequenceTypeTranscript",
                            type: "checkbox",
                            text: "Include transcripts with high impact consequence types",
                            display: {
                                containerStyle: "margin: 10px 5px",
                                disabled: () => this.config?.consequenceType?.all
                            }
                        }
                    ]
                },
                {
                    title: "Population Frequencies",
                    // description: "Select which transcripts and consequence types are displayed in the variant grid",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                        descriptionClassName: "help-block",
                        descriptionStyle: "margin: 0px 10px",
                        visible: () => !!this.config?.populationFrequenciesConfig
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select the display mode of the population frequencies",
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px"
                            }
                        },
                        {
                            // title: "Select the display mode of the population frequencies",
                            field: "populationFrequenciesConfig.displayMode",
                            type: "select",
                            multiple: false,
                            allowedValues: ["FREQUENCY_BOX", "FREQUENCY_NUMBER"],
                            display: {
                                containerStyle: "margin: 5px 5px 5px 0px"
                            },
                        },
                    ]
                },
                {
                    title: "Variant Highlight",
                    display: {
                        titleHeader: "h4",
                        titleStyle: "margin: 5px 5px",
                    },
                    elements: [
                        {
                            title: "Configure the highlight to apply to displayed variant rows",
                            field: "_highlights",
                            type: "select",
                            multiple: true,
                            allowedValues: this.config?.highlights?.map(highlight => {
                                return {id: highlight.id, name: highlight.name};
                            }) || [],
                            defaultValue: this._highlights,
                            display: {
                                visible: () => (this.config?.highlights || []).length > 0,
                            },
                        },
                        {
                            type: "notification",
                            text: "No highlight conditions defined.",
                            display: {
                                notificationType: "warning",
                                visible: () => (this.config?.highlights || []).length === 0,
                            },
                        },
                    ],
                },
            ]
        };
    }

}

customElements.define("variant-interpreter-grid-config", VariantInterpreterGridConfig);
