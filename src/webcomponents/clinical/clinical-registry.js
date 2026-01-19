import {LitElement, html, nothing} from "lit";
import CatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import ModalUtils from "../commons/modal/modal-utils.js";
import UtilsNew from "../../core/utils-new.js";
import DataFormElements from "../commons/forms/data-form-elements.js";
import "../commons/forms/data-form.js";
import "../commons/filters/disease-panel-filter.js";
import "../cohort/cohort-create.js";
import "../file/file-folder-create.js";
import "../loading-spinner.js";

export default class ClinicalRegistry extends LitElement {

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
            activeSingleTab: "sample",
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
        this._showCreateCohortModal = false;
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

    createClinicalAnalysis(clinicalAnalysisParams) {
        return this.opencgaSession.opencgaClient.clinical()
            .create(clinicalAnalysisParams, {
                study: this.opencgaSession.study.fqn,
                includeResult: true,
            })
            .then(response => {
                const interpretationId = response?.responses?.[0]?.results?.[0]?.interpretation?.id;
                const interpretationData = {
                    method: {
                        name: "iva-default",
                        version: this.opencgaSession?.about?.Version || "-",
                        dependencies: [
                            {
                                name: "OpenCGA",
                                version: this.opencgaSession?.about?.Version || "-",
                            },
                            {
                                name: "Cellbase",
                                version: this.opencgaSession.project?.cellbase?.version || "-",
                            },
                        ],
                    },
                };
                return this.opencgaSession.opencgaClient.clinical()
                    .updateInterpretation(clinicalAnalysisParams.id, interpretationId, interpretationData, {
                        study: this.opencgaSession.study.fqn,
                        methodsAction: "SET",
                    });
            });
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
        const individualId = this._data.individualId || this._data.individual;
        const individualResponse = await this.opencgaSession.opencgaClient.individuals()
            .info(individualId, {
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
                .update(individualId, individualUpdateParams, {
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
                    const filePath = this._data.relativeFilePath.startsWith("/") ? this._data.relativeFilePath.substring(1) : this._data.relativeFilePath;
                    const fileResult = await this.opencgaSession.opencgaClient.files()
                        .upload({
                            study: this.opencgaSession.study.fqn,
                            file: file.fileObject,
                            fileName: file.fileObject.name, // get the name from the uploaded file
                            relativeFilePath: filePath.endsWith("/") ? filePath : filePath + "/",
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
        const processedSamples = new Set();
        const processedIndividuals = new Set();
        const processedFamilies = new Set();
        const processedClinicalAnalysis = new Set();

        // 2. prepare the samples/individuals/clinical analyses to be created
        for (let i = 0; i < mapping.length; i++) {
            const entry = mapping[i];
            const individualId = entry.individual;
            const sampleId = entry.sample;

            // 2.1. create the individual if needed
            if (individualId && !processedIndividuals.has(individualId)) {
                try {
                    const individualResponse = await this.opencgaSession.opencgaClient.individuals()
                        .search({
                            id: individualId,
                            study: this.opencgaSession.study.fqn,
                            include: "id",
                        });
                    // only create the individual if it does not exist
                    if (individualResponse.responses[0].results.length === 0) {
                        const individualParams = {
                            id: individualId,
                            sex: {
                                id: entry.sex || entry.gender || "UNKNOWN",
                            },
                        };
                        // TODO: add family if present in the mapping file
                        await this.opencgaSession.opencgaClient.individuals()
                            .create(individualParams, {
                                study: this.opencgaSession.study.fqn,
                            });
                    }
                } catch (error) {
                    console.error(`Individual ${individualId} creation failed:`, error);
                    throw new Error(`Failed to create individual ${individualId}. It might already exist or there was an error.`);
                }
                // add this individual to the processed set
                processedIndividuals.add(individualId);
            }

            // 2.2. create the sample if needed
            if (sampleId && !processedSamples.has(sampleId)) {
                try {
                    const sampleResponse = await this.opencgaSession.opencgaClient.samples()
                        .search({
                            id: sampleId,
                            study: this.opencgaSession.study.fqn,
                            include: "id",
                        });
                    // only create the sample if it does not exist
                    if (sampleResponse.responses[0].results.length === 0) {
                        const somatic = entry.somatic ?? false;
                        const sampleParams = {
                            id: sampleId,
                            individualId: individualId,
                            somatic: somatic === "true" || somatic === true || somatic === "yes",
                        };
                        await this.opencgaSession.opencgaClient.samples()
                            .create(sampleParams, {
                                study: this.opencgaSession.study.fqn,
                            });
                    }
                } catch (error) {
                    console.error(`Sample ${sampleId} creation failed:`, error);
                    throw new Error(`Failed to create sample ${sampleId}. It might already exist or there was an error.`);
                }
                // add this sample to the processed set
                processedSamples.add(sampleId);
            }
        }

        // 3. create families
        for (let i = 0; i < mapping.length; i++) {
            const entry = mapping[i];

            // 3.1. create the family if needed
            if (entry.family && !processedFamilies.has(entry.family)) {
                try {
                    const familySearchResponse = await this.opencgaSession.opencgaClient.families()
                        .search({
                            id: entry.family,
                            study: this.opencgaSession.study.fqn,
                            include: "id",
                        });
                    // only create the family if it does not exist
                    if (familySearchResponse.responses[0].results.length === 0) {
                        const members = mapping.filter(e => e.family === entry.family && e.individual);
                        const familyParams = {
                            id: entry.family,
                        };
                        await this.opencgaSession.opencgaClient.families()
                            .create(familyParams, {
                                study: this.opencgaSession.study.fqn,
                                members: members.map(member => member.individual).join(","),
                            });
                    }
                } catch (error) {
                    console.error(`Family ${entry.family} creation failed:`, error);
                    throw new Error(`Failed to create family ${entry.family}. It might already exist or there was an error.`);
                }

                // add this family to the processed set
                processedFamilies.add(entry.family);
            }

            // 3.2. set the relations between family members
            if (entry.family && (entry.mother || entry.father)) {
                // TODO: we would need to check if the mother and the father exist
                const individualUpdateParams = {};
                if (entry.mother) {
                    individualUpdateParams.mother = {
                        id: entry.mother,
                    };
                }
                if (entry.father) {
                    individualUpdateParams.father = {
                        id: entry.father,
                    };
                }
                try {
                    await this.opencgaSession.opencgaClient.individuals()
                        .update(entry.individual, individualUpdateParams, {
                            study: this.opencgaSession.study.fqn,
                        });
                } catch (error) {
                    console.error(`Setting family relations for individual ${entry.individual} failed:`, error);
                    throw new Error(`Failed to set family relations for individual ${entry.individual}. There was an error.`);
                }
            }
        }

        // 4. Upload files and link them to samples
        const selectedFiles = this._data.files || [];
        for (const file of selectedFiles) {
            if (file.status === this.FILE_STATUS.DONE) {
                continue;
            }

            file.status = this.FILE_STATUS.UPLOADING;
            this._data = {...this._data};
            this.requestUpdate();
            await this.updateComplete;

            // check if this file is not in the mapping file --> display an error
            // const mappingEntry = mapping.find(entry => entry.file === file.fileObject.name);
            if (!mapping.some(entry => entry.file === file.fileObject.name)) {
                file.status = this.FILE_STATUS.ERROR;
                console.error(`File ${file.fileObject.name} not found in the mapping file.`);
                throw new Error(`File ${file.fileObject.name} not found in the mapping file.`);
            }

            try {
                let uploadedFileId;
                const entries = mapping.filter(entry => entry.file === file.fileObject.name);
                const relativeFilePath = this._data.relativeFilePath.startsWith("/") ? this._data.relativeFilePath.substring(1) : this._data.relativeFilePath;

                // check if the file is already uploaded?
                const fileSearchResponse = await this.opencgaSession.opencgaClient.files()
                    .search({
                        study: this.opencgaSession.study.fqn,
                        name: file.fileObject.name,
                        directory: relativeFilePath,
                        include: "id",
                    });
                if (fileSearchResponse.responses[0].results.length === 0) {
                    const fileUploadResponse = await this.opencgaSession.opencgaClient.files()
                        .upload({
                            study: this.opencgaSession.study.fqn,
                            file: file.fileObject,
                            fileName: file.fileObject.name,
                            resource: this._data.relativeFilePath.startsWith("/RESOURCES"),
                            relativeFilePath: relativeFilePath.endsWith("/") ? relativeFilePath : relativeFilePath + "/",
                        });
                    uploadedFileId = fileUploadResponse.responses[0].results[0].id;
                } else {
                    // file already exists, get the id
                    uploadedFileId = fileSearchResponse.responses[0].results[0].id;
                }

                // change the status to DONE
                file.status = this.FILE_STATUS.DONE;

                // Link file to the sample
                const sampleUpdateParams = {
                    sampleIds: entries.map(entry => entry.sample),
                };
                await this.opencgaSession.opencgaClient.files()
                    .update(uploadedFileId, sampleUpdateParams, {
                        study: this.opencgaSession.study.fqn,
                        sampleIdsAction: "ADD",
                    });

                // Dispatch an event to notify that a file has been uploaded
                LitUtils.dispatchCustomEvent(this, "fileUpload", null, {
                    relativeFilePath: relativeFilePath,
                    fileName: file.fileObject.name,
                });
            } catch (error) {
                console.error(`Error processing file ${file.fileObject.name}`, error);
                file.status = this.FILE_STATUS.ERROR;
                throw error;
            }
        }

        // 5. Create Cohort if needed
        if (this._data.cohort?.id) {
            const cohortParams = {
                id: this._data.cohort.id,
                name: this._data.cohort.name,
                description: this._data.cohort.description,
                samples: Array.from(processedSamples).map(sampleId => ({
                    id: sampleId,
                })),
            };
            try {
                await this.opencgaSession.opencgaClient.cohorts()
                    .create(cohortParams, {
                        study: this.opencgaSession.study.fqn,
                    });
            } catch (error) {
                console.error(`Cohort ${cohortParams.id} creation failed:`, error);
                throw new Error(`Failed to create cohort ${cohortParams.id}. It might already exist or there was an error.`);
            }
        }

        // 6. create the clinical analysis
        for (let i = 0; i < mapping.length; i++) {
            const entry = mapping[i];
            const clinicalAnalysisId = entry.case;

            // 6.1. check if we have the clinical analysis id and this clinical analysis has not been processed yet
            if (clinicalAnalysisId && !processedClinicalAnalysis.has(clinicalAnalysisId)) {
                // 6.2. check if the clinical analysis already exists
                try {
                    const clinicalAnalysisSearchResponse = await this.opencgaSession.opencgaClient.clinical()
                        .search({
                            id: clinicalAnalysisId,
                            study: this.opencgaSession.study.fqn,
                            include: "id",
                        });
                    if (clinicalAnalysisSearchResponse.responses[0].results.length === 0) {
                        const createCaseParams = {
                            id: clinicalAnalysisId,
                            proband: {
                                id: entry.individual,
                                samples: [],
                            },
                        };

                        // include panels to the clinical analysis
                        if (entry.panel) {
                            createCaseParams.panels = (entry.panel || "")
                                .split(",")
                                .filter(panel => !!panel)
                                .map(panelId => ({ id: panelId }));
                        }

                        // 6.3. check if we have to create a family case or is just a single case
                        const family = mapping.find(m => m.case === clinicalAnalysisId && !!m.family)?.family;
                        if (family) {
                            const familyMembers = mapping.filter(m => m.family === family);
                            const proband = familyMembers.find(member => {
                                return ["yes", "true"].includes((member.proband || "").toLowerCase()) || member.father || member.mother;
                            });
                            createCaseParams.type = "FAMILY";
                            createCaseParams.family = {
                                id: family,
                                members: familyMembers.map(member => {
                                    const familyMember = {
                                        id: member.individual,
                                        samples: [],
                                    };
                                    // assign the samples to the family member
                                    if (member.individual === proband?.individual) {
                                        familyMember.samples.push({
                                            id: member.sample,
                                        });
                                    }
                                    // return the family member object
                                    return familyMember;
                                }),
                            };
                            // assign the proband id and samples
                            createCaseParams.proband.id = proband?.individual;
                            createCaseParams.proband.samples.push({
                                id: proband?.sample,
                            });
                        } else {
                            createCaseParams.type = "SINGLE";
                            createCaseParams.proband.samples.push({
                                id: entry.sample,
                            });
                        }

                        // 6.4. create the clinical analysis
                        await this.createClinicalAnalysis(createCaseParams);
                    }
                } catch (error) {
                    console.error(`Clinical Analysis ${clinicalAnalysisId} creation failed:`, error);
                    throw new Error(`Failed to create clinical analysis ${clinicalAnalysisId}. It might already exist or there was an error.`);
                }
                // add this clinical analysis to the processed set
                processedClinicalAnalysis.add(clinicalAnalysisId);
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

        // display a loading indicator
        const loadingId = NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_LOADING, {
            message: "We are creating the samples, individuals, and clinical analysis and uploading the files. Please wait a moment...",
        });

        try {
            if (this._data.type === "Batch") {
                await this.handleBatchUpload();
            } else {
                await this.handleSingleUpload();
            }

            // If all files are uploaded correctly, show a success message
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: `All Samples, Individuals, and Clinical Analysis have been created and uploaded ${this._data.files.length} files correctly.`,
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
            NotificationUtils.clear(this, loadingId);
            this._uploading = false;
            this._config = this.getDefaultConfig();
            this.requestUpdate();
        }
    }

    onCreateCohortShow() {
        this._showCreateCohortModal = true;
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show("create-cohort-modal");
        });
    }

    onCreateFolderShow() {
        this._showCreateFolderModal = true;
        this.requestUpdate();
        this.updateComplete.then(() => {
            ModalUtils.show("create-folder-modal");
        });
    }

    onActiveSingleTabChange(tabId) {
        this._data = {
            ...this._data,
            activeSingleTab: tabId,
        };
        this.requestUpdate();
    }

    renderCreateCohortModal() {
        return ModalUtils.create(this, "create-cohort-modal", {
            display: {
                modalTitle: "Create Cohort",
                modalSize: "modal-lg",
            },
            render: () => html`
                <cohort-create
                    .opencgaSession="${this.opencgaSession}"
                    .displayConfig="${{
                        buttonsLayout: "bottom",
                    }}"
                    @cohortCreate="${event => {
                        this._showCreateCohortModal = false;
                        this._data = {
                            ...this._data,
                            cohort: event.detail.id,
                        };
                        this.requestUpdate();
                        ModalUtils.close("create-cohort-modal");
                    }}">
                </cohort-create>
            `,
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
            ${this._showCreateCohortModal ? this.renderCreateCohortModal() : nothing}
            ${this._showCreateFolderModal ? this.renderCreateFolderModal() : nothing}
        `;
    }

    getDefaultConfig() {
        return {
            title: "Clinical Registry",
            display: {
                titleVisible: false,
                buttonOkText: "Register",
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
                        id: "single",
                    },
                    {
                        id: "singleTabs",
                        // className: "d-flex",
                    },
                    {
                        className: "border border-top-0 rounded-bottom-4 p-4 mb-4",
                        sections: [
                            {
                                id: "singleSample",
                                className: "w-full",
                            },
                            {
                                id: "singleIndividual",
                                className: "w-full",
                            },
                            {
                                id: "singleClinicalAnalysis",
                                className: "w-full",
                            },
                        ],
                    },
                    {
                        id: "batch",
                    },
                    {
                        id: "files",
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
                                { id: "Single", text: "Single Registry" },
                                { id: "Batch", text: "Batch Registry" },
                            ],
                        }),
                    ],
                },
                {
                    id: "single",
                    title: "Single Configuration",
                    display: {
                        visible: data => data?.type === "Single",
                    },
                    elements: [],
                },
                {
                    id: "singleTabs",
                    display: {
                        visible: data => data?.type === "Single",
                        separationClassName: "mb-0",
                        className: "d-flex w-full"
                    },
                    render: data => {
                        const tabs = [
                            {
                                title: "Configure Sample",
                                id: "sample",
                                active: data?.activeSingleTab === "sample",
                                completed: data?.sample || data?.sampleId,
                            },
                            {
                                title: "Configure Individual",
                                id: "individual",
                                active: data?.activeSingleTab === "individual",
                                completed: data?.individual || data?.individualId,
                            },
                            {
                                title: "Configure Clinical Analysis",
                                id: "clinicalAnalysis",
                                active: data?.activeSingleTab === "clinicalAnalysis",
                                completed: data?.clinicalAnalysis,
                            },
                        ];
                        return tabs.map(tab => {
                            const className = tab.active ? "border border-bottom-0" : "border-bottom cursor-pointer";
                            return html`
                                <div class="d-flex flex-column align-items-center w-full p-3 rounded-top-4 ${className}" @click="${() => this.onActiveSingleTabChange(tab.id)}">
                                    <div class="d-flex justify-content-center mb-1" style="height:20px;">
                                        <i class="fa ${tab.completed ? "fa-check text-success" : "fa-times text-secondary"} fs-4"></i>
                                    </div>
                                    <div class="w-full text-center fs-6 ${tab.active ? "fw-bold" : ""}">
                                        ${tab.title}
                                    </div>
                                </div>
                            `;
                        });
                    },
                },
                {
                    id: "singleSample",
                    title: "Sample Configuration",
                    display: {
                        visible: data => data?.type === "Single" && data?.activeSingleTab === "sample",
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
                                        .query="${{
                                            include: "id,individualId",
                                            individualId: data?.individualId,
                                        }}"
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
                                disabled: data => !!data?.sample || !data?.sampleId,
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
                                            disabled: !!data?.sample || !data?.sampleId,
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
                    id: "singleIndividual",
                    title: "Individual Configuration",
                    display: {
                        visible: data => data?.type === "Single" && data?.activeSingleTab === "individual",
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
                                disabled: data => !!data?.individual || !data?.individualId,
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
                                            disabled: !!data?.individual || !data?.individualId,
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
                    id: "singleClinicalAnalysis",
                    title: "Clinical Analysis Configuration",
                    display: {
                        visible: data => data?.type === "Single" && data?.activeSingleTab === "clinicalAnalysis",
                        titleClassName: "fs-4",
                    },
                    elements: [
                        {
                            title: "Clinical Analysis ID",
                            field: "clinicalAnalysis",
                            type: "input-text",
                            required: true,
                            display: {
                                helpMessage: "Identifier for the clinical analysis to be created.",
                            },
                        },
                        {
                            title: "Analysis Type",
                            field: "clinicalAnalysisType",
                            type: "select",
                            required: true,
                            allowedValues: ["SINGLE", "FAMILY", "CANCER"],
                            display: {
                                disabled: data => !data?.clinicalAnalysis,
                                helpMessage: "Type of analysis for the clinical analysis.",
                            },
                        },
                        {
                            title: "Disease Panels",
                            field: "clinicalAnalysisPanels",
                            type: "custom",
                            display: {
                                render: (panels, onFieldChange, updateParams, data) => {
                                    return html`
                                        <disease-panel-filter
                                            .opencgaSession="${this.opencgaSession}"
                                            .diseasePanels="${this.opencgaSession.study?.panels}"
                                            .panel="${panels}"
                                            .showExtendedFilters="${false}"
                                            .showSelectedPanels="${false}"
                                            .disabled="${!data?.clinicalAnalysis}"
                                            @filterChange="${event => onFieldChange(event.detail.value)}">
                                        </disease-panel-filter>
                                    `;
                                },
                            },
                        },
                    ],
                },
                {
                    id: "batch",
                    title: "Multi Sample Batch Upload Configuration",
                    display: {
                        visible: data => data?.type === "Batch",
                        className: "px-2 py-2",
                    },
                    elements: [
                        DataFormElements.fileContentElement({
                            title: "Mapping Files and Samples",
                            field: "mappingFileContent",
                            required: true,
                            display: {
                                helpMessage: "Upload a CSV or TSV file with columns: File (required), Sample, Individual, Family, Somatic.",
                            },
                        }),
                        {
                            title: "Select or Create Cohort",
                            field: "cohort",
                            type: "custom",
                            display: {
                                render: (cohort, onFieldChange, updateParams, data, item, disabled) => html`
                                    <div class="d-flex align-items-stretch gap-2">
                                        <catalog-search-autocomplete
                                            .value="${cohort}"
                                            .resource="${"COHORT"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{
                                                multiple: false,
                                            }}"
                                            class="flex-grow-1"
                                            @filterChange="${event => onFieldChange(event.detail.value)}">
                                        </catalog-search-autocomplete>
                                        <button class="btn btn-light mb-1 d-flex align-items-center ${disabled ? "disabled" : ""}" title="Create Cohort" @click="${() => this.onCreateCohortShow()}">
                                            <i class="fa fa-plus fs-5"></i>
                                        </button>
                                    </div>
                                `,
                                helpMessage: "Select or create a cohort to which all the samples created during the batch upload will be added.",
                            },
                        },
                    ],
                },
                {
                    id: "files",
                    title: "Select Files",
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
                                    <div class="d-flex align-items-stretch gap-2">
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
                                        <button class="btn btn-light mb-1 d-flex align-items-center ${disabled ? "disabled" : ""}" title="Create Folder" @click="${() => this.onCreateFolderShow()}">
                                            <i class="fa fa-folder-plus fs-5"></i>
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

customElements.define("clinical-registry", ClinicalRegistry);
