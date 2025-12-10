import {LitElement, html, nothing} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";
import "../loading-spinner.js";

export default class ClinicalFileUpload extends LitElement {

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
                type: Object,
            },
        };
    }

    #init() {
        // list of available statuses for the file
        this.DEFAULT_DATA = {
            type: "Single Upload",
            relativeFilePath: "/" + (this.path || ""),
            files: [],
        };
        this.FILE_STATUS = {
            PENDING: "PENDING",
            UPLOADING: "UPLOADING",
            DONE: "DONE",
            ERROR: "ERROR",
        };

        this._data = UtilsNew.objectClone(this.DEFAULT_DATA);
        this._uploading = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("path")) {
            this._data = UtilsNew.objectClone(this.DEFAULT_DATA);
        }
        if (changedProperties.has("displayConfig") || changedProperties.has("path")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    async handleSingleUpload() {
        // 1. Create Individual if needed
        if (this._data.individualId && !this._data.individual) {
            await this.opencgaSession.opencgaClient.individuals()
                .create({
                    id: this._data.individualId,
                    sex: {id: this._data.individualSex || "UNKNOWN"}
                }, {study: this.opencgaSession.study.fqn});
        }

        // 2. Create Sample if needed
        if (this._data.sampleId && !this._data.sample) {
            await this.opencgaSession.opencgaClient.samples()
                .create({
                    id: this._data.sampleId,
                    individualId: this._data.individualId,
                    somatic: !!this._data.sampleSomatic
                }, {study: this.opencgaSession.study.fqn});
        }

        // 3. Upload the files
        const files = this._data.files || [];
        for (const file of files) {
            // check the status of the file: if it is done, skip it
            if (file.status !== this.FILE_STATUS.DONE) {
                file.status = this.FILE_STATUS.UPLOADING;
                this._data = {...this._data};
                this.requestUpdate();
                await this.updateComplete;

                try {
                    // 3.1. perform the request to OpenCGA for uploading the file
                    const fileResult = await this.opencgaSession.opencgaClient.files()
                        .upload({
                            study: this.opencgaSession.study.fqn,
                            file: file.fileObject,
                            fileName: file.fileObject.name, // get the name from the uploaded file
                            relativeFilePath: this._data.relativeFilePath.startsWith("/") ? this._data.relativeFilePath.substring(1) : this._data.relativeFilePath,
                            resource: this._data.relativeFilePath.startsWith("/RESOURCES"),
                        });
                    // 3.2. if everything is ok, set the status to DONE
                    file.status = this.FILE_STATUS.DONE;
                    
                    // 3.3. Link file to the sample
                    const uploadedFileId = fileResult.responses[0].results[0].id;
                    await this.opencgaSession.opencgaClient.files().update(uploadedFileId, {
                        sampleIds: [this._data.sampleId],
                    }, {study: this.opencgaSession.study.fqn});

                    // 3.4. dispatch an event to notify that a file has been uploaded
                    LitUtils.dispatchCustomEvent(this, "fileUpload", null, {
                        relativeFilePath: this._data.relativeFilePath,
                        fileName: file.fileObject.name,
                    });
                } catch (error) {
                    // if there is an error, set the status to ERROR and stop the upload process
                    file.status = this.FILE_STATUS.ERROR;
                    return Promise.reject(error);
                }
            }
        }
    }

    async handleBatchUpload() {
        // 1. Parse the mapping file
        const mapping = this.parseMappingFile(this._data.mappingFileContent);

        const study = this.opencgaSession.study.fqn;
        const processedSamples = new Set();
        const processedIndividuals = new Set();

        const files = this._data.files || [];
        for (const file of files) {
            if (file.status === this.FILE_STATUS.DONE) {
                continue;
            }

            file.status = this.FILE_STATUS.UPLOADING;
            this.requestUpdate();
            await this.updateComplete;

            const mappingEntry = mapping.find(entry => entry.file === file.fileObject.name);
            if (!mappingEntry) {
                file.status = this.FILE_STATUS.ERROR;
                throw new Error(`File ${file.fileObject.name} not found in the mapping file.`);
            }

            try {
                // Determine IDs
                let sampleId = mappingEntry.sample;
                let individualId = mappingEntry.individual;
                const familyId = mappingEntry.family;
                const somatic = mappingEntry.somatic;

                // if sample is missing, use filename without extension
                if (!sampleId) {
                    sampleId = file.fileObject.name.replace(/\.[^/.]+$/, "");
                }
                
                // if individual is missing, use sampleId instead
                if (!individualId) {
                    individualId = sampleId;
                }

                // Create Individual if needed
                if (individualId && !processedIndividuals.has(individualId)) {
                    let individualExists = false;
                    try {
                        const indResponse = await this.opencgaSession.opencgaClient.individuals().search({id: individualId, study, include: "id"});
                        if (indResponse.responses[0].results.length > 0) {
                            individualExists = true;
                        }
                    } catch (e) {
                        console.error("Error searching for individual:", e);
                    }

                    if (!individualExists) {
                        try {
                            await this.opencgaSession.opencgaClient.individuals().create({
                                id: individualId,
                                sex: {id: "UNKNOWN"}, // Default sex
                                family: familyId ? {id: familyId} : undefined,
                            }, {study});
                        } catch (e) {
                            console.warn(`Individual ${individualId} creation failed:`, e);
                            throw new Error(`Failed to create individual ${individualId}. It might already exist or there was an error.`);
                        }
                    }
                    processedIndividuals.add(individualId);
                }

                // Create Sample if needed
                if (sampleId && !processedSamples.has(sampleId)) {
                    let sampleExists = false;
                    try {
                        const sampleResponse = await this.opencgaSession.opencgaClient.samples().search({id: sampleId, study, include: "id"});
                        if (sampleResponse.responses[0].results.length > 0) {
                            sampleExists = true;
                        }
                    } catch (e) {
                         console.error("Error searching for sample:", e);
                    }

                    if (!sampleExists) {
                        try {
                            await this.opencgaSession.opencgaClient.samples().create({
                                id: sampleId,
                                individualId: individualId,
                                somatic: somatic === "true" || somatic === true || somatic === "yes",
                            }, {study});
                        } catch (e) {
                            console.warn(`Sample ${sampleId} creation failed:`, e);
                            throw new Error(`Failed to create sample ${sampleId}. It might already exist or there was an error.`);
                        }
                    }
                    processedSamples.add(sampleId);
                }

                // Upload File
                const fileResult = await this.opencgaSession.opencgaClient.files().upload({
                    study,
                    file: file.fileObject,
                    fileName: file.fileObject.name,
                    relativeFilePath: this._data.relativeFilePath.startsWith("/") ?
                        this._data.relativeFilePath.substring(1) :
                        this._data.relativeFilePath,
                    resource: this._data.relativeFilePath.startsWith("/RESOURCES"),
                });

                const uploadedFileId = fileResult.responses[0].results[0].id;

                await this.opencgaSession.opencgaClient.files().update(uploadedFileId, {
                    sampleIds: [sampleId],
                }, {study});

                file.status = this.FILE_STATUS.DONE;

            } catch (error) {
                console.error(`Error processing file ${file.fileObject.name}`, error);
                file.status = this.FILE_STATUS.ERROR;
                throw error;
            }
        }
    }

    parseMappingFile(content) {
        if (!content) {
            throw new Error("Mapping content is empty");
        }
        const lines = content.trim().split(/\r?\n/);
        if (lines.length < 2) {
            throw new Error("Mapping file must have a header and at least one row");
        }

        const headerLine = lines[0];
        // Detect separator: tab or comma
        const separator = headerLine.includes("\t") ? "\t" : ",";
        const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());

        // Validate File column
        if (!headers.includes("file")) {
            throw new Error("Mapping file must contain a 'File' column");
        }

        const mapping = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const values = line.split(separator).map(v => v.trim());
            const entry = {};
            headers.forEach((header, index) => {
                entry[header] = values[index];
            });
            if (entry.file) {
                mapping.push(entry);
            }
        }
        return mapping;
    }

    reset() {
        this._data = UtilsNew.objectClone(this.DEFAULT_DATA);
        this._uploading = false;
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    addFiles(files) {
        if (files.length > 0 && !this._uploading) {
            // TODO: check for maximum file size or duplicated files?
            Array.from(files).forEach(file => {
                this._data.files.push({
                    fileObject: file,
                    status: this.FILE_STATUS.PENDING,
                });
            });
            this._data = {...this._data};
            this.requestUpdate();
        }
    }

    onSelectFilesClick(event) {
        event.preventDefault();
        if (!this._uploading) {
            this.querySelector(`input[type="file"]`).click();
        }
    }

    onDropFiles(event) {
        event.preventDefault();
        this.addFiles(event.dataTransfer?.files || []);
    }

    onFilesChange(event) {
        event.preventDefault();
        this.addFiles(event.target.files || []);

        // note: reset the value of the input file to allow uploading the same file again
        event.target.value = null;
    }

    onFileRemove(event, file) {
        this._data.files = this._data.files.filter(f => f !== file);
        this._data = {...this._data};
        this.requestUpdate();
    }

    onFieldChange(event) {
        this._data = {...event.detail.data};

        // if the sample is selected, fille the sample information
        if (event.detail.param === "sample") {
            if (event.detail.value) {
                this.opencgaSession.opencgaClient.samples()
                    .info(event.detail.value, {
                        study: this.opencgaSession.study.fqn,
                        includeIndividual: true,
                        include: "id,somatic",
                    })
                    .then(response => {
                        const result = response?.responses?.[0]?.results?.[0];
                        if (result) {
                            this._data.sampleId = result.id;
                            this._data.sampleSomatic = !!result.somatic;
                            if (result?.attributes?.OPENCGA_INDIVIDUAL) {
                                this._data.individual = result.attributes.OPENCGA_INDIVIDUAL.id;
                                this._data.individualId = result.attributes.OPENCGA_INDIVIDUAL.id;
                                this._data.individualSex = result.attributes.OPENCGA_INDIVIDUAL.sex?.id || "";
                            }
                        }
                        this._data = {...this._data};
                        this.requestUpdate();
                    });
            } else {
                delete this._data.sampleId;
                delete this._data.sampleSomatic;
                // delete this._data.individualId;
                // delete this._data.individualSex;
            }
        }

        // if the individual is selected, fetch the individual data
        if (event.detail.param === "individual") {
            if (event.detail.value) {
                this.opencgaSession.opencgaClient.individuals()
                    .info(event.detail.value, {
                        study: this.opencgaSession.study.fqn,
                    })
                    .then(response => {
                    const result = response?.responses?.[0]?.results?.[0];
                    if (result) {
                        this._data.individualId = result.id;
                        this._data.individualSex = result.sex?.id || "";
                    }
                    this._data = {...this._data};
                    this.requestUpdate();
                });
            } else {
                delete this._data.individualId;
                delete this._data.individualSex;
            }
        }

        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear File Upload",
            message: "Are you sure to clear?",
            ok: () => {
                this._data = {
                    type: "Single Upload",
                    singleUploadType: "Create New Sample",
                    relativeFilePath: "/" + (this.path || ""),
                    files: [],
                };
                this.requestUpdate();
            },
        });
    }

    async onSubmit() {
        // avoid multiple submissions
        if (this._uploading || !this._data.files || this._data.files.length === 0) {
            return;
        }

        // start uploading the selected files
        this._uploading = true;
        this._config = this.getDefaultConfig();
        this.requestUpdate();

        try {
            if (this._data.type === "Batch Upload") {
                await this.handleBatchUpload();
            } else {
                await this.handleSingleUpload();
            }

            // If all files are uploaded correctly, show a success message
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: `Uploaded ${this._data.files.length} files correctly.`,
            });
            // dispatch an event to notify that a file has been uploaded
            LitUtils.dispatchCustomEvent(this, "fileUploadAll", null, {
                relativeFilePath: this._data.relativeFilePath,
                files: this._data.files.map(file => {
                    return file.fileObject.name;
                }),
            });

        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        } finally {
            this.reset();
        }
    }

    render() {
        return html`
            <tool-header
                .title="${this._config.title}">
            </tool-header>
            <div class="container py-4">
                <data-form
                    .data="${this._data}"
                    .config="${this._config}"
                    @fieldChange="${event => this.onFieldChange(event)}"
                    @clear="${event => this.onClear(event)}"
                    @submit="${event => this.onSubmit(event)}">
                </data-form>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Upload Files",
            display: {
                titleVisible: false,
                buttonOkText: "Upload Files",
                buttonClearText: "Discard",
                buttonOkDisabled: () => {
                    return this._uploading || (this._data?.files?.length === 0) || this._data?.files?.every(f => f.status === this.FILE_STATUS.DONE);
                },
                buttonClearDisabled: () => this._uploading || (this._data?.files?.length === 0),
                layout: [
                    {
                        id: "type",
                    },
                    {
                        id: "singleUpload",
                    },
                    {
                        className: "d-flex gap-5 align-items-stretch",
                        sections: [
                            {
                                id: "singleUploadSample",
                                className: "w-full",
                            },
                            {
                                id: "singleUploadSeparator",
                                className: "bg-gray-200",
                                style: "width:1px;"
                            },
                            {
                                id: "singleUploadIndividual",
                                className: "w-full",
                            },
                        ],
                    },
                    {
                        id: "batchUpload",
                    },
                    {
                        id: "uploadFiles",
                    },
                ],
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Configure Upload",
                    id: "type",
                    elements: [
                        {
                            title: "Upload Mode",
                            field: "type",
                            type: "toggle-buttons",
                            allowedValues: ["Single Upload", "Batch Upload"],
                            defaultValue: "Single Upload",
                            display: {
                                helpMessage: "Select whether to perform a single upload or a batch upload.",
                            },
                        },
                    ],
                },
                {
                    title: "Single Upload Configuration",
                    id: "singleUpload",
                    display: {
                        visible: data => data?.type === "Single Upload",
                    },
                    elements: [],
                },
                {
                    id: "singleUploadSeparator",
                    elements: [],
                },
                {
                    title: "Sample Configuration",
                    id: "singleUploadSample",
                    display: {
                        visible: data => data?.type === "Single Upload",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select a sample from the following list to associate the uploaded files to it.",
                        },
                        {
                            title: "Select Sample",
                            type: "custom",
                            field: "sample",
                            display: {
                                render: (sample, onFieldChange, updateParams, data) => html`
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"SAMPLE"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                            disabled: !data?.sample && data?.sampleId,
                                        }}"
                                        @filterChange="${event => onFieldChange(event.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            type: "text",
                            text: "Or create a new sample by providing the following information:",
                        },
                        {
                            title: "Sample ID",
                            field: "sampleId",
                            type: "input-text",
                            required: true,
                            display: {
                                disabled: data => !!data?.sample,
                                helpMessage: "Identifier for the sample to be created and associated to the uploaded files. "
                            },
                        },
                        {
                            title: "Somatic",
                            field: "sampleSomatic",
                            type: "checkbox",
                            display: {
                                disabled: data => !!data?.sample,
                                helpMessage: "Check if the sample is somatic.",
                            },
                        },
                    ],
                },
                {
                    title: "Individual Configuration",
                    id: "singleUploadIndividual",
                    display: {
                        visible: data => data?.type === "Single Upload",
                    },
                    elements: [
                        {
                            type: "text",
                            text: "Select a individual from the following list to associate the uploaded files to it.",
                        },
                        {
                            title: "Select Individual",
                            type: "custom",
                            field: "individual",
                            display: {
                                render: (individual, onFieldChange, updateParams, data) => html`
                                    <catalog-search-autocomplete
                                        .value="${individual}"
                                        .resource="${"INDIVIDUAL"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                            disabled: !data?.individual && data?.individualId,
                                        }}"
                                        @filterChange="${event => onFieldChange(event.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                            },
                        },
                        {
                            type: "text",
                            text: "Or create a new individual by providing the following information:",
                        },
                        {
                            title: "Individual ID",
                            field: "individualId",
                            type: "input-text",
                            required: true,
                            display: {
                                disabled: data => !!data?.individual,
                                helpMessage: "Identifier for the individual to be created and associated to the uploaded files. "
                            },
                        },
                        {
                            title: "Individual Sex",
                            field: "individualSex",
                            type: "input-text",
                            display: {
                                disabled: data => !!data?.individual,
                                helpMessage: "Sex of the patient.",
                            },
                        },
                    ],
                },
                {
                    title: "Batch Upload Configuration",
                    description: "Configure the batch upload settings.",
                    id: "batchUpload",
                    display: {
                        visible: data => data?.type === "Batch Upload",
                    },
                    elements: [
                        {
                            title: "Confirm Sample Creation",
                            field: "confirmSampleCreation",
                            type: "checkbox",
                            display: {
                                // defaultValue: true,
                                helpMessage: "Check this box to confirm the creation of samples during batch upload.",
                            },
                        },
                        {
                            title: "Tag Name",
                            field: "tagName",
                            type: "input-text",
                            required: true,
                            display: {
                                helpMessage: "Enter a tag name for all the files in the batch upload.",
                            },
                        },
                        {
                            title: "Mapping Files and Samples",
                            field: "mappingFileContent",
                            type: "file-content",
                            required: true,
                            display: {
                                helpMessage: "Upload a CSV or TSV file with columns: File (required), Sample, Individual, Family, Somatic.",
                            },
                        },
                    ],
                },
                {
                    title: "Upload Files",
                    description: html`<span>Upload one or more files to the selected study. <b>Note:</b> if the path already exists, the files will be overwritten.</span>`,
                    id: "uploadFiles",
                    elements: [
                        {
                            title: "Upload Destination Path",
                            field: "relativeFilePath",
                            type: "custom",
                            display: {
                                disabled: () => this._uploading,
                                render: (path = "/", onFieldChange) => html`
                                    <div>
                                        <catalog-search-autocomplete
                                            .value="${path}"
                                            .resource="${"DIRECTORY"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false}}"
                                            @filterChange="${e => onFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    </div>
                                `,
                                helpMessage: "Path where the files will be uploaded.",
                            },
                        },
                        {
                            title: "Select Files",
                            field: "files",
                            type: "custom",
                            required: true,
                            display: {
                                render: () => html`
                                    <input class="d-none" type="file" multiple="true" @change="${event => this.onFilesChange(event)}">
                                    <div @click="${event => this.onSelectFilesClick(event)}" @drop="${event => this.onDropFiles(event)}" @dragover="${event => event.preventDefault()}">
                                        <div class="d-flex align-items-center justify-content-center rounded-3 border border-gray-200 p-4 cursor-pointer">
                                            <div class="d-flex flex-column gap-2 align-items-center">
                                                <div class="d-flex fs-1 text-secondary">
                                                    <i class="fas fa-cloud-upload-alt"></i>
                                                </div>
                                                <div class="fw-bold fs-6 text-center">
                                                    <span>Drag and Drop your files here or Click to select your files.</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `,
                            },
                        },
                        {
                            title: " ",
                            field: "files",
                            type: "custom",
                            display: {
                                visible: data => data?.files?.length > 0,
                                render: (selectedFiles) => html`
                                    <div class="d-flex flex-column gap-2 overflow-y-auto" style="max-height:320px;">
                                        ${(selectedFiles || []).map(file => html`
                                            <div class="d-flex align-items-center justify-content-between border rounded-3 p-2">
                                                <div class="d-flex align-items-center gap-2">
                                                    <i class="fa fa-file"></i>
                                                    <div class="d-inline-block text-truncate fw-bold" style="max-width:320px;" title="${file.fileObject.name}">
                                                        <span>${file.fileObject.name}</span>
                                                    </div>
                                                    <div class="text-muted">(${UtilsNew.getDiskUsage(file.fileObject.size)})</div>
                                                </div>
                                                <div class="d-flex align-items-center gap-1">
                                                    ${file.status === this.FILE_STATUS.UPLOADING ? html`
                                                        <div class="d-flex align-items-center px-1" title="Uploading...">
                                                            <i class="fa fa-spinner fa-spin text-primary"></i>
                                                        </div>
                                                    ` : nothing}
                                                    ${file.status === this.FILE_STATUS.DONE ? html`
                                                        <div class="d-flex align-items-center px-1" title="File uploaded">
                                                            <i class="fa fa-check text-success"></i>
                                                        </div>
                                                    ` : nothing}
                                                    ${file.status === this.FILE_STATUS.ERROR ? html`
                                                        <div class="d-flex align-items-center px-1" title="Error uploading file">
                                                            <i class="fa fa-exclamation-triangle text-danger"></i>
                                                        </div>
                                                    ` : nothing}
                                                    ${(!this._uploading && file.status !== this.FILE_STATUS.DONE) ? html`
                                                        <button class="btn btn-sm" @click="${(event) => this.onFileRemove(event, file)}">
                                                            <i class="fa fa-times"></i>
                                                        </button>
                                                    ` : nothing}
                                                </div>
                                            </div>
                                        `)}
                                    </div>
                                    <div class="small text-muted mt-2">
                                        <span>Total files: ${selectedFiles.length}</span>
                                    </div>
                                `,
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("clinical-file-upload", ClinicalFileUpload);
