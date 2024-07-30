/*
 * Copyright 2015-2024 OpenCB
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
import NotificationUtils from "../commons/utils/notification-utils.js";
import BioinfoUtils from "../../core/bioinfo/bioinfo-utils.js";
import LitUtils from "../commons/utils/lit-utils";
import "../commons/filters/cellbase-search-autocomplete.js";

export default class DiseasePanelCreate extends LitElement {

    constructor() {
        super();

        this.#init();
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
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
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
        this.isLoading = false;
        // NOTE Vero 20231025: Probably not needed.
        this.annotatedGenes = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            buttonOkText: "Create",
            titleWidth: 3,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        // CAUTION 20232310 Vero: I have added the Autocomplete search, so the query  would not be necessary
        //  for "Add Item" but required for "Add Batch". Think about how to take advantage of autocomplete. Discuss with Nacho.
        // Get gene.name and coordinates
        if (e.detail?.data?.genes?.length > 0) {
            for (const gene of e.detail.data.genes) {
                // Checks:
                // 1. gene.name MUST exist to query CellBase
                // 2. the gene MUST NOT being annotated
                // 3. either gene.id DOES NOT exist (first time, not annotated) or have a different gene.id meaning the gene.name has been changed
                if (gene?.name && this.annotatedGenes[gene.name] !== "ANNOTATING" && (!gene?.id || this.annotatedGenes[gene.name] !== gene.id)) {
                    this.annotatedGenes[gene.name] = "ANNOTATING";
                    const params = {
                        exclude: "transcripts,annotation",
                    };
                    this.opencgaSession.cellbaseClient
                        .getGeneClient(gene.name, "info", params)
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
                            console.error(err);
                        })
                        .finally(()=> {
                            this.annotatedGenes[gene.name] = gene.id;
                            this.diseasePanel = {...this.diseasePanel};
                            this.requestUpdate();
                        });
                }
            }
        }
        // Set the region coordinates if needed: location, assembly, and source
        if (e.detail?.data?.regions?.length > 0) {
            for (const region of e.detail.data.regions) {
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
        // Set the variant coordinates if needed: location, assembly, and source
        if (e.detail?.data?.variants?.length > 0) {
            for (const variant of e.detail.data.variants) {
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
        this.diseasePanel = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        // this.diseasePanel = {};
        // this._config = {...this.getDefaultConfig(), ...this.config};
        // this.requestUpdate();
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear disease panel",
            message: "Are you sure to clear?",
            ok: () => {
                this.diseasePanel = {};
                this._config = this.getDefaultConfig();
                this.requestUpdate();
            },
        });
    }

    onSubmit(e) {
        e.stopPropagation();
        this.opencgaSession.opencgaClient.panels()
            .create(this.diseasePanel, {study: this.opencgaSession.study.fqn, includeResult: true})
            .then(res => {
                this.diseasePanel = {};
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "New Disease Panel",
                    message: "New Disease Panel created correctly"
                });
                LitUtils.dispatchCustomEvent(this, "sessionPanelUpdate", res.responses[0].results[0], {action: "CREATE"});
                this.requestUpdate();
            })
            .catch(err => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, err);
            });
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

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
            // type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "General Information",
                    elements: [
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
                                        placeholder: "Add disorder ID...",
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
                                        <div style="margin: 5px 0">MoI: ${gene?.modesOfInheritance?.join(", ") || "-"} (Confidence: ${gene.confidence || "NA"})</div>
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
                                        placeholder: "Add gene name...",
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
                                    title: "Region ID/Location",
                                    field: "regions[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add a region ID/Location (e.g. 1:10100-10110)...",
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
                                    title: "Variant ID/Location",
                                    field: "variants[].id",
                                    type: "input-text",
                                    display: {
                                        placeholder: "Add the variant ID/Location...",
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

customElements.define("disease-panel-create", DiseasePanelCreate);
