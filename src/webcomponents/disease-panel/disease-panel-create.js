/**
 * Copyright 2015-2021 OpenCB
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
import FormUtils from "../commons/forms/form-utils.js";
import Types from "../commons/types.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import "../commons/filters/catalog-search-autocomplete.js";


export default class DiseasePanelCreate extends LitElement {

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
        this._config = this.getDefaultConfig();
        this.diseasePanel = {
            // disorders: [
            //     {
            //         id: "disease",
            //     }
            // ],
            // variants: [
            //     {
            //         id: "1:1:A:T",
            //         reference: "A",
            //         alternate: "T"
            //     }
            // ],
            // genes: [
            //     {
            //         id: "BRCA2"
            //     }
            // ]
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        if (param) {
            this.diseasePanel = {
                ...FormUtils.createObject(
                    this.diseasePanel,
                    param,
                    e.detail.value,
                )};
        }

        // Get gene name and coordinates
        if (this.diseasePanel?.genes?.length > 0) {
            for (const gene of this.diseasePanel?.genes) {
                if (!gene.id) {
                    this.opencgaSession.cellbaseClient.getGeneClient(gene.name, "info", {exclude: "transcripts,annotation"})
                        .then(res => {
                            const g = res.responses[0].results[0];
                            gene.id = g.id;
                            gene.coordinates = [
                                {
                                    location: `${g.chromosome}:${g.start}-${g.end}`
                                }
                            ];
                            this.diseasePanel = {...this.diseasePanel};
                            this.requestUpdate();
                        })
                        .catch(err => {
                            console.error(err);
                        });
                }
            }
        }
        this.requestUpdate();
    }

    onClear() {
        this.diseasePanel = {};
        this._config = {...this.getDefaultConfig(), ...this.config};
        this.requestUpdate();
    }

    onSubmit(e) {
        e.stopPropagation();
        this.opencgaSession.opencgaClient.panels()
            .create(this.diseasePanel, {study: this.opencgaSession.study.fqn})
            .then(res => {
                this.diseasePanel = {};
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Disease Panel",
                    message: "New Disease Panel created correctly"
                });
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    render() {
        return html`
            <data-form
                .data="${this.diseasePanel}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: {
                buttonsVisible: true,
                buttonOkText: "Create",
                titleWidth: 3,
                width: "8",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            // validation: {
            //     validate: individual => (UtilsNew.isEmpty(individual.father) || UtilsNew.isEmpty(individual.mother)) || individual.father !== individual.mother,
            //     message: "The father and mother must be different individuals",
            // },
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            type: "notification",
                            text: "Some changes have been done in the form. Not saved, changes will be lost",
                            display: {
                                visible: () => Object.keys(this.diseasePanel).length > 0,
                                notificationType: "warning",
                            }
                        },
                        {
                            title: "Disease Panel ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                help: {
                                    text: "Add a disease panel ID"
                                }
                            }
                        },
                        {
                            title: "Disease Panel Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the diseae panel name..."
                            }
                        },
                        {
                            title: "Disorders",
                            field: "disorders",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: disorder => html`
                                    <div>${disorder.id} ${disorder?.name ? `- ${disorder?.name}` : ""}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Disorder ID",
                                    field: "disorders[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add variant ID...",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "disorders[].name",
                                    type: "input-text",
                                    display: {
                                    }
                                },
                                {
                                    title: "Description",
                                    field: "disorders[].description",
                                    type: "input-text",
                                    display: {
                                    }
                                },
                            ]
                        },
                        {
                            title: "Source",
                            field: "source",
                            type: "object",
                            elements: [
                                {
                                    title: "ID",
                                    field: "source.id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel name...",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "source.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel name..."
                                    }
                                },
                                {
                                    title: "Version",
                                    field: "source.version",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel version...",
                                    }
                                },
                                {
                                    title: "Author",
                                    field: "source.author",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel author name...",
                                    }
                                },
                                {
                                    title: "Project",
                                    field: "source.project",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add disease panel project name...",
                                    }
                                }
                            ]
                        },
                        {
                            title: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Add a description...",
                                rows: 3,
                            }
                        },
                    ]
                },
                {
                    title: "Genes",
                    elements: [
                        {
                            title: "Genes",
                            field: "genes",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: gene => html`
                                    <div>
                                        <div>${gene?.name} (<a href="${BioinfoUtils.getGeneLink(gene?.id)}" target="_blank">${gene?.id}</a>)</div>
                                        <div style="margin: 5px 0">MoI: ${gene?.modeOfInheritance || "NA"} (Confidence: ${gene.confidence || "NA"})</div>
                                        <div class="help-block">${gene.coordinates?.[0]?.location}</div>
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Gene",
                                    field: "genes[].name",
                                    type: "custom",
                                    display: {
                                        placeholder: "Add gene...",
                                        render: (data, dataFormFilterChange) => {
                                            return html`
                                                <feature-filter
                                                    .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                                    @filterChange="${e => dataFormFilterChange(e.detail.value)}">
                                                </feature-filter>
                                            `;
                                        },
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "genes[].modeOfInheritance",
                                    type: "select",
                                    allowedValues: MODE_OF_INHERITANCE,
                                    display: {
                                        placeholder: "Select a mode of inheritance..."
                                    }
                                },
                                {
                                    title: "Confidence",
                                    field: "genes[].confidence",
                                    type: "select",
                                    allowedValues: DISEASE_PANEL_CONFIDENCE,
                                    display: {
                                        placeholder: "Select a confidence..."
                                    }
                                },
                                {
                                    title: "Imprinted",
                                    field: "genes[].imprinted",
                                    type: "select",
                                    allowedValues: DISEASE_PANEL_IMPRINTED,
                                    display: {
                                        placeholder: "Select imprinted..."
                                    }
                                },
                            ]
                        },
                    ]
                },
                {
                    title: "Regions",
                    elements: [
                        {
                            title: "Regions",
                            field: "regions",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: region => html`
                                    <div>${region.id} - ${region?.modeOfInheritance || "-"}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Region ID",
                                    field: "regions[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add region...",
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "regions[].modeOfInheritance",
                                    type: "select",
                                    allowedValues: MODE_OF_INHERITANCE,
                                    display: {
                                        placeholder: "Select a mode of inheritance..."
                                    }
                                },
                                {
                                    title: "Confidence",
                                    field: "regions[].confidence",
                                    type: "select",
                                    allowedValues: DISEASE_PANEL_CONFIDENCE,
                                    display: {
                                        placeholder: "Select a confidence..."
                                    }
                                },
                            ]
                        },
                    ]
                },
                {
                    title: "Variants",
                    elements: [
                        {
                            title: "Variants",
                            field: "variants",
                            type: "object-list",
                            display: {
                                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                                collapsedUpdate: true,
                                view: variant => html`
                                    <div>${variant.id} - ${variant?.modeOfInheritance || "-"}</div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Variant ID",
                                    field: "variants[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add variant ID...",
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "variants[].modeOfInheritance",
                                    type: "select",
                                    allowedValues: MODE_OF_INHERITANCE,
                                    display: {
                                        placeholder: "Select a mode of inheritance..."
                                    }
                                },
                                {
                                    title: "Confidence",
                                    field: "variants[].confidence",
                                    type: "select",
                                    allowedValues: DISEASE_PANEL_CONFIDENCE,
                                    display: {
                                        placeholder: "Select a confidence..."
                                    }
                                },
                            ]
                        },
                    ]
                },
            ]
        });
    }

}

customElements.define("disease-panel-create", DiseasePanelCreate);
