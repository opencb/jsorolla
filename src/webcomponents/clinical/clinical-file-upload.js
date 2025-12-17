import {LitElement, html, nothing} from "lit";
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import UtilsNew from "../../core/utils-new.js";
import DataFormElements from "../commons/forms/data-form-elements.js";
import "../commons/forms/data-form.js";
import "../file/file-folder-create.js";
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
        this.DEFAULT_DATA = {
            type: "Single",
            relativeFilePath: "/" + (this.path || ""),
            confirmSampleCreation: true,
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
        this._showCreateFolderModal = false;
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
        // 1. Create Sample if needed
        if (this._data.sampleId && !this._data.sample) {
            const sampleParams = {
                id: this._data.sampleId,
                somatic: !!this._data.sampleSomatic,
            };
            await this.opencgaSession.opencgaClient.samples()
                .create(sampleParams, {
                    study: this.opencgaSession.study.fqn,
                });
        }

        // 2. Create Individual if needed
        if (this._data.individualId && !this._data.individual) {
            const individualParams = {
                id: this._data.individualId,
                sex: {
                    id: this._data.individualSex || "UNKNOWN"
                },
            };
            await this.opencgaSession.opencgaClient.individuals()
                .create(individualParams, {
                    study: this.opencgaSession.study.fqn,
                });
        }

        // 3. we have to check if the individual already includes the sample
        const individualResponse = await this.opencgaSession.opencgaClient.individuals()
            .info(this._data.individualId, {
                study: this.opencgaSession.study.fqn,
                include: "samples.id",
            });
        const individual = individualResponse?.responses?.[0]?.results?.[0];
        if (!(individual?.samples || []).find(sample => sample.id === this._data.sampleId)) {
            const individualUpdateParams = {
                samples: [
                    {
                        id: this._data.sampleId,
                    }
                ],
            };
            await this.opencgaSession.opencgaClient.individuals()
                .update(individual.id, individualUpdateParams, {
                    study: this.opencgaSession.study.fqn,
                    samplesAction: "ADD",
                });
        }

        // 4. upload the files
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
                    const sampleUpdateParams = {
                        sampleIds: [
                            this._data.sampleId,
                        ],
                    };
                    await this.opencgaSession.opencgaClient.files()
                        .update(uploadedFileId, sampleUpdateParams, {
                            study: this.opencgaSession.study.fqn,
                            sampleIdsAction: "ADD",
                        });

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
        const mapping = CatalogUtils.parseMappingFile(this._data.mappingFileContent);

        const study = this.opencgaSession.study.fqn;
        const processedSamples = new Set();
        const processedIndividuals = new Set();

        const selectedFiles = this._data.files || [];
        // 2. Iterate over the selected files and process them. Create samples and individuals as needed.
        for (const file of selectedFiles) {
            if (file.status === this.FILE_STATUS.DONE) {
                continue;
            }

            file.status = this.FILE_STATUS.UPLOADING;
            this._data = {...this._data};
            this.requestUpdate();
            await this.updateComplete;

            const mappingEntry = mapping.find(entry => entry.file === file.fileObject.name);
            if (!mappingEntry) {
                file.status = this.FILE_STATUS.ERROR;
                console.error(`File ${file.fileObject.name} not found in the mapping file.`);
                throw new Error(`File ${file.fileObject.name} not found in the mapping file.`);
            }

            try {
                // Determine IDs
                const sampleId = mappingEntry.sample;
                const individualId = mappingEntry.individual;
                const individualSex = mappingEntry.sex || "";
                const familyId = mappingEntry.family || "";
                const somatic = !!mappingEntry.somatic ?? false;

                // Create Individual if needed
                if (individualId && !processedIndividuals.has(individualId)) {
                    let individualExists = false;
                    try {
                        const indResponse = await this.opencgaSession.opencgaClient.individuals()
                            .search({id: individualId, study, include: "id"});
                        if (indResponse.responses[0].results.length > 0) {
                            individualExists = true;
                        }
                    } catch (e) {
                        console.error("Error searching for individual:", e);
                    }

                    if (!individualExists) {
                        try {
                            await this.opencgaSession.opencgaClient.individuals()
                                .create({
                                    id: individualId,
                                    sex: {id: individualSex || "UNKNOWN"},
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
                        const sampleResponse = await this.opencgaSession.opencgaClient.samples()
                            .search({id: sampleId, study, include: "id"});
                        if (sampleResponse.responses[0].results.length > 0) {
                            sampleExists = true;
                        }
                    } catch (e) {
                        console.error("Error searching for sample:", e);
                    }

                    if (!sampleExists) {
                        try {
                            await this.opencgaSession.opencgaClient.samples()
                                .create({
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
                const fileResult = await this.opencgaSession.opencgaClient.files()
                    .upload({
                        study,
                        file: file.fileObject,
                        fileName: file.fileObject.name,
                        relativeFilePath: this._data.relativeFilePath.startsWith("/") ?
                            this._data.relativeFilePath.substring(1) :
                            this._data.relativeFilePath,
                        resource: this._data.relativeFilePath.startsWith("/RESOURCES"),
                    });

                file.status = this.FILE_STATUS.DONE;

                // Link file to the sample
                const uploadedFileId = fileResult.responses[0].results[0].id;
                const sampleUpdateParams = {
                    sampleIds: [
                        sampleId,
                    ],
                };
                await this.opencgaSession.opencgaClient.files()
                    .update(uploadedFileId, sampleUpdateParams, {
                        study: study,
                        sampleIdsAction: "ADD",
                    });

                // Dispatch an event to notify that a file has been uploaded
                LitUtils.dispatchCustomEvent(this, "fileUpload", null, {
                    relativeFilePath: this._data.relativeFilePath,
                    fileName: file.fileObject.name,
                });
            } catch (error) {
                console.error(`Error processing file ${file.fileObject.name}`, error);
                file.status = this.FILE_STATUS.ERROR;
                throw error;
            }
        }

        // 3. Create Cohort if needed
        if (this._data.cohort?.id) {
            const samplesInCohort = [];
            for (const sampleId of processedSamples) {
                samplesInCohort.push({id: sampleId});
            }

            const cohortParams = {
                id: this._data.cohort.id,
                name: this._data.cohort.name,
                description: this._data.cohort.description,
                samples: samplesInCohort,
            };
            try {
                await this.opencgaSession.opencgaClient.cohorts()
                    .create(cohortParams, {
                        study: this.opencgaSession.study.fqn,
                    });
            } catch (e) {
                console.warn(`Cohort ${cohortParams.id} creation failed:`, e);
            }
        }

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
            this.querySelector(`input#files-input[type="file"]`).click();
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

        // if the sample is selected, fill the sample information
        if (event.detail.param === "sample") {
            if (event.detail.value) {
                this.opencgaSession.opencgaClient.samples()
                    .info(event.detail.value, {
                        study: this.opencgaSession.study.fqn,
                        include: "id,somatic,cohortIds",
                        includeIndividual: true,
                    })
                    .then(response => {
                        const result = response?.responses?.[0]?.results?.[0];
                        if (result) {
                            this._data.sampleId = result.id;
                            this._data.sampleSomatic = !!result.somatic;
                            this._data.sampleCohort = result.cohortIds?.length > 0 ? result.cohortIds[0] : null;
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
                delete this._data.sampleCohort;
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

        // If sample or sampleId are empty, clear sample and individual fields as well
        if (event.detail.param === "sample" || event.detail.param === "sampleId") {
            if (!this._data.sample && !this._data.sampleId) {
                delete this._data.sampleSomatic;
                delete this._data.sampleCohort;
                delete this._data.individual;
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
                this._data = UtilsNew.objectClone(this.DEFAULT_DATA);
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
        debugger
        try {
            if (this._data.type === "Batch") {
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

            // reset the form
            this._data = UtilsNew.objectClone(this.DEFAULT_DATA);
        } catch (error) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
        } finally {
            this._uploading = false;
            this._config = this.getDefaultConfig();
            this.requestUpdate();
        }
    }

    onCreateFolderShow() {
        this._showCreateFolderModal = true;
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show("create-folder-modal");
        });
    }

    renderCreateFolderModal() {
        return ModalUtils.create(this, "create-folder-modal", {
            display: {
                modalTitle: "Create Folder",
                modalSize: "modal-lg",
            },
            render: () => html`
                <file-folder-create
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                        buttonsLayout: "bottom",
                    }}"
                    @folderCreate="${event => {
                        this._showCreateFolderModal = false;
                        this._data = {
                            ...this._data,
                            relativeFilePath: event.detail.path,
                        };
                        this.requestUpdate();
                        ModalUtils.close("create-folder-modal");
                    }}">
                </file-folder-create>
            `,
        });
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
            ${this._showCreateFolderModal ? this.renderCreateFolderModal() : nothing}
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
                                className: "w-full px-3",
                            },
                            {
                                id: "singleUploadSeparator",
                                className: "bg-gray-200",
                                style: "width:1px;"
                            },
                            {
                                id: "singleUploadIndividual",
                                className: "w-full px-3",
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
                    id: "type",
                    elements: [
                        DataFormElements.tabsElement({
                            field: "type",
                            tabs: [
                                { id: "Single", text: "Single Upload" },
                                { id: "Batch", text: "Batch Upload" },
                            ],
                        }),
                    ],
                },
                {
                    id: "singleUpload",
                    title: "Single Sample Upload Configuration",
                    // description: "Configure the single upload settings.",
                    display: {
                        visible: data => data?.type === "Single",
                    },
                    elements: [],
                },
                {
                    id: "singleUploadSample",
                    title: "Sample Configuration",
                    display: {
                        visible: data => data?.type === "Single",
                        titleClassName: "fs-4",
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
                                containerClassName: "px-3",
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
                                containerClassName: "px-3",
                                disabled: data => !!data?.sample,
                                helpMessage: "Identifier for the sample to be created and associated to the uploaded files. "
                            },
                        },
                        {
                            title: "Somatic",
                            field: "sampleSomatic",
                            type: "checkbox",
                            display: {
                                containerClassName: "px-3",
                                disabled: data => !!data?.sample,
                                helpMessage: "Check if the sample is somatic.",
                            },
                        },
                        {
                            title: "Select Cohort",
                            type: "custom",
                            field: "sampleCohort",
                            display: {
                                containerClassName: "px-3",
                                render: (sample, onFieldChange, updateParams, data) => html`
                                    <catalog-search-autocomplete
                                        .value="${sample}"
                                        .resource="${"COHORT"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                        }}"
                                        @filterChange="${event => onFieldChange(event.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                                helpMessage: "Optionally, select a cohort to which the sample will be added. No need to select cohort ALL, as it is automatically updated.",
                            },
                        },
                    ],
                },
                {
                    id: "singleUploadSeparator",
                    elements: [],
                },
                {
                    id: "singleUploadIndividual",
                    title: "Individual Configuration",
                    display: {
                        visible: data => data?.type === "Single",
                        titleClassName: "fs-4",
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
                                containerClassName: "px-3",
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
                                containerClassName: "px-3",
                                disabled: data => !!data?.individual,
                                helpMessage: "Identifier for the individual to be created and associated to the uploaded files. "
                            },
                        },
                        {
                            title: "Individual Sex",
                            field: "individualSex",
                            type: "input-text",
                            display: {
                                containerClassName: "px-3",
                                disabled: data => !!data?.individual,
                                helpMessage: "Sex of the patient.",
                            },
                        },
                        {
                            title: "Family",
                            field: "individualFamily",
                            type: "custom",
                            display: {
                                containerClassName: "px-3",
                                render: (family, onFieldChange, updateParams, data) => html`
                                    <catalog-search-autocomplete
                                        .value="${family}"
                                        .resource="${"FAMILY"}"
                                        .opencgaSession="${this.opencgaSession}"
                                        .config="${{
                                            multiple: false,
                                            disabled: !!data?.individual,
                                        }}"
                                        @filterChange="${event => onFieldChange(event.detail.value)}">
                                    </catalog-search-autocomplete>
                                `,
                                helpMessage: "Family to which the individual belongs.",
                            },
                        },
                    ],
                },
                {
                    id: "batchUpload",
                    title: "Multi Sample Batch Upload Configuration",
                    // description: "Configure the batch upload settings.",
                    display: {
                        visible: data => data?.type === "Batch",
                        className: "px-2 py-2",
                    },
                    elements: [
                        {
                            title: "Confirm Sample Creation",
                            field: "confirmSampleCreation",
                            type: "checkbox",
                            display: {
                                // defaultValue: true,
                                helpMessage: "Check this box to confirm the creation of samples and individuals during batch upload.",
                            },
                        },
                        DataFormElements.fileContentElement({
                            title: "Mapping Files and Samples",
                            field: "mappingFileContent",
                            required: false,
                            display: {
                                helpMessage: "Upload a CSV or TSV file with columns: File (required), Sample, Individual, Family, Somatic.",
                            },
                        }),
                        {
                            title: "Cohort",
                            field: "cohort",
                            type: "object",
                            elements: [
                                {
                                    type: "text",
                                    text: "Select an existing cohort from the following list to associate all created samples to it.",
                                },
                                {
                                    title: "Select Cohort",
                                    type: "custom",
                                    field: "cohort.id",
                                    display: {
                                        defaultLayout: "horizontal",
                                        containerClassName: "px-3",
                                        render: (cohort, onFieldChange, updateParams, data) => html`
                                            <catalog-search-autocomplete
                                                .value="${cohort}"
                                                .resource="${"COHORT"}"
                                                .opencgaSession="${this.opencgaSession}"
                                                .config="${{
                                                    multiple: false,
                                                    // disabled: !data?.individual && data?.individualId,
                                                }}"
                                                @filterChange="${event => onFieldChange(event.detail.value)}">
                                            </catalog-search-autocomplete>
                                        `,
                                    },
                                },
                                {
                                    type: "text",
                                    text: "Or create a new cohort by providing the following information:",
                                },
                                {
                                    title: "Cohort ID",
                                    field: "cohort.id",
                                    type: "input-text",
                                    display: {
                                        defaultLayout: "horizontal",
                                        containerClassName: "px-3",
                                        helpMessage: "Identifier for the cohort to be created and associated to the uploaded files.",
                                    },
                                },
                                {
                                    title: "Cohort Name",
                                    field: "cohort.name",
                                    type: "input-text",
                                    display: {
                                        containerClassName: "px-3",
                                        helpMessage: "Name for the cohort to be created and associated to the uploaded files.",
                                    },
                                },
                                {
                                    title: "Cohort Description",
                                    field: "cohort.description",
                                    type: "input-text",
                                    display: {
                                        containerClassName: "px-3",
                                        helpMessage: "Description for the cohort to be created and associated to the uploaded files.",
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    id: "uploadFiles",
                    title: "Upload Files",
                    description: html`<span>Upload one or more files to the selected study. <b>Note:</b> if the path already exists, the files will be overwritten.</span>`,
                    display: {
                        className: "px-2 py-2",
                    },
                    elements: [
                        {
                            title: "Upload Destination Path",
                            field: "relativeFilePath",
                            type: "custom",
                            display: {
                                disabled: () => this._uploading,
                                render: (path = "/", onFieldChange, updatedFields, data, item, disabled) => html`
                                    <div class="d-flex align-items-center gap-2">
                                        <catalog-search-autocomplete
                                            .value="${path}"
                                            .resource="${"DIRECTORY"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{
                                                disabled: disabled,
                                                multiple: false,
                                            }}"
                                            class="flex-grow-1"
                                            @filterChange="${event => onFieldChange(event.detail.value)}">
                                        </catalog-search-autocomplete>
                                        <button class="btn btn-primary d-flex align-items-center gap-2 mb-1 ${disabled ? "disabled" : ""}" title="Create Folder"
                                                @click="${() => this.onCreateFolderShow()}">
                                            <i class="fa fa-folder-plus"></i>
                                        </button>
                                    </div>
                                `,
                                helpMessage: "Path where the files will be uploaded.",
                            },
                        },
                        {
                            title: "Tag Name",
                            field: "tagName",
                            type: "input-text",
                            display: {
                                helpMessage: "Enter a tag name for all the files in the batch upload.",
                            },
                        },
                        {
                            title: "Select Files",
                            field: "files",
                            type: "custom",
                            required: true,
                            display: {
                                render: () => html`
                                    <input id="files-input" class="d-none" type="file" multiple="true" @change="${event => this.onFilesChange(event)}">
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
