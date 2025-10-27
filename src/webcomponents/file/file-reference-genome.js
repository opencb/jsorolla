/**
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
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";
import "../commons/filters/catalog-search-autocomplete.js";

export default class FileReferenceGenome extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            path: {
                type: String,
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
        this.JOB_ID = "fetch-reference-genome";
        this.GENOME_ALIASES = [
            {
                id: "Ensembl v115",
                description: "Ensembl release 115 (GRCh38)",
                url: "https://ftp.ensembl.org/pub/release-115/fasta/homo_sapiens/dna/Homo_sapiens.GRCh38.dna.primary_assembly.fa.gz"
            },
            {
                id: "Custom",
                description: "Ensembl release 115 (GRCh38)",
            },
        ];

        this._data = {};
        this._config = this.getDefaultConfig();
        this.initOriginalObjects();
    }

    initOriginalObjects() {
        this._data = {
            outdir: this.path || "/",
            alignerIndexes: true,
            jobId: `${this.JOB_ID}-${UtilsNew.getDatetime()}`,
        };
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("path")) {
            this.initOriginalObjects();
        }

        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onFieldChange(e) {
        this._data = {...e.detail.data}; // force to refresh the object-list

        if (e.detail.param === "referenceGenomeAlias") {
            const genome = this.GENOME_ALIASES.find(item => item.id === e.detail.value);
            if (genome) {
                this._data.referenceGenome = genome.url;
            }
        }

        if (e.detail.param === "referenceGenome") {
            delete this._data.referenceGenomeAlias;
        }

        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear Form",
            message: "Are you sure?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        const body = {
            outdir: this._data.outdir,
            pipelineParams: {
                referenceGenome: this._data.referenceGenome,
                alignerIndexes: this._data.alignerIndexes ? ["reference-genome", "bwa", "bwa-mem2", "minimap2"] : [],
            },
        }

        this.#setLoading(true);
        this.opencgaSession.opencgaClient.clinical()
            .runPipelinePrepare(body, {
                study: this.opencgaSession.study.fqn,
                jobId: this._data?.jobId ?? `${this.JOB_ID}-${UtilsNew.getDatetime()}`,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Fetch Reference Genome Job has been launched successfully`,
                });
                LitUtils.dispatchCustomEvent(this, "fileReferenceGenome", this._data);
                this.initOriginalObjects();
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    render() {
        if (this.isLoading) {
            return html`
                <loading-spinner></loading-spinner>
            `;
        }

        return html`
            <data-form
                .data="${this._data}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                titleWidth: 3,
                defaultLayout: "horizontal",
                buttonOkText: "Fetch Reference Genome",
                buttonClearText: "Clear",
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "",
                    elements: [
                        {
                            title: "Output Directory",
                            field: "outdir",
                            type: "custom",
                            display: {
                                render: (outdir, onFieldChange) => html`
                                    <catalog-search-autocomplete
                                        .value="${outdir}"
                                        .resource="${"DIRECTORY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${e => onFieldChange(e.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                                helpMessage: "Directory where the indexes will be saved.",
                            },
                        },
                        {
                            title: "Select Reference Genome",
                            field: "referenceGenomeAlias",
                            type: "select",
                            allowedValues: this.GENOME_ALIASES.map(item => item.id),
                            display: {
                                placeholder: "https://",
                                helpMessage: "URL where the file is located."
                            },
                        },
                        {
                            title: "Custom Reference Genome URL",
                            field: "referenceGenome",
                            type: "input-text",
                            display: {
                                placeholder: "https://",
                                helpMessage: "URL where the file is located."
                            },
                        },
                        {
                            title: "Aligner Indexes (BWA, BWA-MEM2, etc.)",
                            field: "alignerIndexes",
                            type: "checkbox",
                            defaultValue: true,
                            display: {
                                multiple: true,
                                helpMessage: "Select the aligner indexes to be downloaded along with the reference genome. Please note that not all aligners are compatible with all genome versions.",
                            },
                        },
                        /*
                        Note 20241210 Vero: It has been discussed and decided not to utilise the analysis-utils component for
                        populating the job parameters. It has issues, such as invoking the onClear() method after submitting
                        the query or using the button name "Run Analysis".
                        If the analysis-tools component is intended to be reusable for endpoints that execute jobs but are not
                        true analysis tools, it will need to be refactored.
                        */
                        {
                            title: "Job ID",
                            field: "jobId",
                            type: "input-text",
                            display: {
                                placeholder: `${this.JOB_ID}-${UtilsNew.getDatetime()}`,
                                helpMessage: "If empty then it is automatically initialized with the tool ID and current date"
                            },
                        },
                    ],
                },
            ],
        };
    }
}

customElements.define("file-reference-genome", FileReferenceGenome);
