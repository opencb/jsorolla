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

import {html, LitElement} from "lit";
import Types from "../commons/types.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/filters/catalog-search-autocomplete.js";


export default class DiseasePanelUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            diseasePanelId: {
                type: String
            },
            active: {
                type: Boolean,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._diseasePanel = {};
        this.diseasePanelId = "";
        this.annotatedGenes = {};
        this.displayConfig = {
            titleWidth: 3,
            width: 8,
            titleVisible: false,
            defaultLayout: "horizontal",
            buttonsVisible: true,
            buttonsWidth: 8,
            buttonsAlign: "end",
        };

        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onComponentIdObserver(e) {
        this._diseasePanel = UtilsNew.objectClone(e.detail.value);
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onComponentFieldChange(e) {
        // Get gene name and coordinates
        if (e.detail?.component?.genes?.length > 0) {
            for (const gene of e.detail.component.genes) {
                // Checks:
                // 1. gene.name MUST exist to query CellBase
                // 2. the gene MUST NOT being annotated
                // 3. either gene.id DOES NOT exist (first time, not annotated) or have a different gene.id meaning the gene.name has been changed
                if (gene?.name && this.annotatedGenes[gene.name] !== "ANNOTATING" && (!gene?.id || this.annotatedGenes[gene.name] !== gene.id)) {
                    this.annotatedGenes[gene.name] = "ANNOTATING";
                    const params = {
                        exclude: "transcripts,annotation",
                    };
                    this.opencgaSession.cellbaseClient.getGeneClient(gene.name, "info", params)
                        .then(res => {
                            const g = res.responses[0].results[0];
                            gene.id = g.id;
                            gene.coordinates = [
                                {
                                    location: `${g.chromosome}:${g.start}-${g.end}`,
                                    assembly: this.opencgaSession?.project?.organism?.assembly || "",
                                    source: g.source || ""
                                }
                            ];
                        })
                        .catch(err => {
                            // FIXME Vero 2022/12/05: handle error
                            console.error(err);
                        })
                        .finally(()=> {
                            this.annotatedGenes[gene.name] = gene.id;
                            this._config = {...this._config};
                            this.requestUpdate();
                        });
                }
            }
        }

        // Set the region coordinates if needed: location, assembly, and source
        if (e.detail?.component?.regions?.length > 0) {
            for (const region of e.detail.component.regions) {
                if (region.id) {
                    if (region.id !== region.coordinates?.[0]?.location) {
                        region.coordinates = [
                            {
                                location: region.id,
                                assembly: this.opencgaSession?.project?.organism?.assembly || "",
                                // source: region.source || "",
                            }
                        ];
                    }
                } else {
                    if (region.coordinates) {
                        region.coordinates = null;
                    }
                }
            }
        }

        if (e.detail?.component?.variants?.length > 0) {
            for (const variant of e.detail.component.variants) {
                if (variant.id) {
                    if (variant.id !== variant.coordinates?.[0]?.location) {
                        variant.coordinates = [
                            {
                                location: variant.id,
                                assembly: this.opencgaSession?.project?.organism?.assembly || "",
                                // source: region.source || "",
                            }
                        ];
                    }
                } else {
                    if (variant.coordinates) {
                        variant.coordinates = null;
                    }
                }
            }
        }
    }

    render() {
        return html`
            <opencga-update
                .resource="${"DISEASE_PANEL"}"
                .componentId="${this.diseasePanelId}"
                .opencgaSession="${this.opencgaSession}"
                .active="${this.active}"
                .config="${this._config}"
                @componentIdObserver = ${this.onComponentIdObserver}
                @componentFieldChange = ${this.onComponentFieldChange}>
            </opencga-update>
        `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            id: "disease-panel-update",
            title: "Disease Panel Update",
            display: this.displayConfig,
            sections: [
                {
                    title: "General Information",
                    elements: [
                        {
                            title: "Disease Panel ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                                placeholder: "Add a short ID...",
                                helpMessage: this._diseasePanel?.creationDate ? `Created on ${UtilsNew.dateFormatter(this._diseasePanel.creationDate)}` : "No creation date",
                                help: {
                                    text: "Add a disease panel ID"
                                }
                            }
                        },
                        {
                            title: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add the disease panel name..."
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
                                        placeholder: "Add panel source id...",
                                    }
                                },
                                {
                                    title: "Name",
                                    field: "source.name",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add panel source name..."
                                    }
                                },
                                {
                                    title: "Version",
                                    field: "source.version",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add panel source version...",
                                    }
                                },
                                {
                                    title: "Author",
                                    field: "source.author",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add panel source author name...",
                                    }
                                },
                                {
                                    title: "Project",
                                    field: "source.project",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add panel project source name...",
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
                                showAddItemListButton: true,
                                showAddBatchListButton: true,
                                view: gene => html`
                                    <div>
                                        <div>${gene?.name} (<a href="${BioinfoUtils.getGeneLink(gene?.id)}" target="_blank">${gene?.id}</a>)</div>
                                        <div style="margin: 5px 0">MoI: ${gene?.modesOfInheritance?.join(", ") || "NA"} (Confidence: ${gene.confidence || "NA"})</div>
                                        <div class="d-block text-secondary">${gene.coordinates?.[0]?.location}</div>
                                        <div class="d-block text-secondary">
                                            Location: ${gene.coordinates?.[0]?.location || "-"},
                                            Assembly: ${gene.coordinates?.[0]?.assembly || "-"},
                                        </div>
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Gene Name",
                                    field: "genes[].name",
                                    type: "custom",
                                    display: {
                                        placeholder: "Add gene...",
                                        render: (data, dataFormFilterChange) => html`
                                            <cellbase-search-autocomplete
                                                .resource="${"GENE"}"
                                                .cellbaseClient="${this.opencgaSession.cellbaseClient}"
                                                @filterChange="${e => dataFormFilterChange(e.detail.data.name)}">
                                            </cellbase-search-autocomplete>
                                        `,
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "genes[].modesOfInheritance",
                                    type: "select",
                                    multiple: true,
                                    save: value => value?.split(",") || [], // Array when select and multiple
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
                                    title: "Role In Cancer",
                                    field: "genes[].cancer.roles",
                                    type: "select",
                                    multiple: true,
                                    save: value => value?.split(",") || [], // Array when select and multiple
                                    allowedValues: ROLE_IN_CANCER,
                                    display: {
                                        placeholder: "Select role in cancer..."
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
                                view: region => html `
                                    <div>
                                        <div>${region?.id}</div>
                                        <div style="margin: 5px 0">MoI: ${region?.modesOfInheritance?.join(", ") || "-"} (Confidence: ${region?.confidence || "NA"})</div>
                                        <div class="d-block text-secondary">
                                            Location: ${region.coordinates?.[0]?.location || "-"},
                                            Assembly: ${region.coordinates?.[0]?.assembly || "-"},
                                        </div>
                                    </div>
                                `,
                            },
                            elements: [
                                {
                                    title: "Region ID",
                                    field: "regions[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a region location (e.g. 1:10100-10110)...",
                                    }
                                },
                                {
                                    title: "Mode of Inheritance",
                                    field: "regions[].modesOfInheritance",
                                    type: "select",
                                    multiple: true,
                                    save: value => value?.split(",") || [], // Array when select and multiple
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
                                    <div>
                                        <div>${variant.id}</div>
                                        <div style="margin: 5px 0">MoI: ${variant?.modesOfInheritance?.join(", ") || "-"}</div>
                                        <div class="d-block text-secondary">
                                            Location: ${variant.coordinates?.[0]?.location || "-"},
                                            Assembly: ${variant.coordinates?.[0]?.assembly || "-"},
                                        </div>
                                    </div>
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
                                    field: "variants[].modesOfInheritance",
                                    type: "select",
                                    multiple: true,
                                    save: value => value?.split(",") || [], // Array when select and multiple
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

customElements.define("disease-panel-update", DiseasePanelUpdate);
