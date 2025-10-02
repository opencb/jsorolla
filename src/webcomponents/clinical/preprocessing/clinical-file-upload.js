import {LitElement, html, nothing} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";
import "../../loading-spinner.js";

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
        this.FILE_STATUS = {
            PENDING: "PENDING",
            UPLOADING: "UPLOADING",
            DONE: "DONE",
            ERROR: "ERROR",
        };

        this._data = {
            select: true,
            files: [],
        };
        this._uploading = false;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("path")) {
            this._data = {
                ...this._data,
                relativeFilePath: "/" + (this.path || ""),
            };
        }
        if (changedProperties.has("displayConfig") || changedProperties.has("path")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    async createSample() {
        if (this._data.select === true && this._data.sampleId && this._data.individualId) {
            await this.opencgaSession.opencgaClient.individuals()
                .create({id: this._data.individualId}, {study: this.opencgaSession.study.fqn});

            await this.opencgaSession.opencgaClient.samples()
                .create({id: this._data.sampleId, individualId: this._data.individualId}, {study: this.opencgaSession.study.fqn});

            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: `Individual and Sample created successfully.`,
            });
        }
    }

    async uploadFiles() {
        const files = this._data.files || [];
        for (const file of files) {
            // check the status of the file: if it is done, skip it
            if (file.status !== this.FILE_STATUS.DONE) {
                file.status = this.FILE_STATUS.UPLOADING;
                this._data = {...this._data};
                this.requestUpdate();
                await this.updateComplete;
                debugger
                try {
                    // 1. perform the request to OpenCGA for uploading the file
                    await this.opencgaSession.opencgaClient.files()
                        .upload({
                            study: this.opencgaSession.study.fqn,
                            file: file.fileObject,
                            fileName: file.fileObject.name, // get the name from the uploaded file
                            relativeFilePath: this._data.relativeFilePath.startsWith("/") ? this._data.relativeFilePath.substring(1) : this._data.relativeFilePath,
                            resource: this._data.relativeFilePath.startsWith("/RESOURCES"),
                        });
                    // 2. if everything is ok, set the status to DONE
                    file.status = this.FILE_STATUS.DONE;

                    // 3. dispatch an event to notify that a file has been uploaded
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

    async updateFiles() {
        const files = this._data.files || [];
        for (const file of files) {
            try {
                let fileId = this._data.relativeFilePath.replaceAll("/", ":") + file.fileObject.name;
                let dataBody = {
                    sampleIds: [this._data.sampleId],
                };
                await this.opencgaSession.opencgaClient.files()
                    .update(fileId, dataBody, {study: this.opencgaSession.study.fqn});
            } catch (error) {
                return Promise.reject(error);
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
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear File Upload",
            message: "Are you sure to clear?",
            ok: () => {
                this._data = {
                    select: true,
                    relativeFilePath: "/" + (this.path || ""),
                    files: [],
                };
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        // avoid multiple submissions
        if (this._uploading || !this._data.files || this._data.files.length === 0) {
            return;
        }

        // start uploading the selected files
        this._uploading = true;
        this._config = this.getDefaultConfig();
        this.requestUpdate();

        // Upload the files
        this.createSample()
            // 1. Check if we need to create a new sample
            .then(() => {
                return this.uploadFiles()
            })
            // 2. Set the sampleId for the uploaded files
            .then(() => {
                return this.updateFiles();
            })
            // 3. If all files are uploaded correctly, show a success message
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `Uploaded ${this._data.files.length} files correctly.`,
                });

                // dispatch an event to notify that all files have been uploaded
                LitUtils.dispatchCustomEvent(this, "fileUploadAll", null, {
                    relativeFilePath: this._data.relativeFilePath,
                    files: this._data.files.map(file => {
                        return file.fileObject.name;
                    }),
                });
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                // TODO move to init function?
                this._data = {
                    select: true,
                    relativeFilePath: "/" + (this.path || ""),
                    files: [],
                };

                this._uploading = false;
                this._config = this.getDefaultConfig();
                this.requestUpdate();
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
                    @fieldChange="${e => this.onFieldChange(e)}"
                    @clear="${e => this.onClear(e)}"
                    @submit="${e => this.onSubmit(e)}">
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
                buttonOkDisabled: () => this._uploading || (this._data?.files?.length === 0) || this._data?.files?.every(f => f.status === this.FILE_STATUS.DONE),
                buttonClearText: "Discard",
                buttonClearDisabled: () => this._uploading || (this._data?.files?.length === 0),
                ...this.displayConfig,
            },
            sections: [
                {
                    title: "Select Sample",
                    description: "",
                    elements: [
                        {
                            title: "Create or Select Sample",
                            field: "select",
                            type: "toggle-switch",
                            display: {
                                onText: "Create Sample",
                                offText: "Search",
                                helpMessage: "Create a new one sample or Select an existing one.",
                            },
                        }
                    ]
                },
                {
                    title: "Create New Patient and Sample",
                    description: "",
                    display: {
                        visible: data => data?.select !== false,
                    },
                    elements: [
                        {
                            title: "Patient",
                            field: "individualId",
                            type: "input-text",
                            required: true,
                            display: {
                                helpMessage: "Map the individual names in the uploaded files to existing individuals in the study. " +
                                    "If the individual does not exist, it will be created automatically.",
                            },
                        },
                        {
                            title: "Sample",
                            field: "sampleId",
                            type: "input-text",
                            required: true,
                            display: {
                                helpMessage: "Identifier for the sample to be created and associated to the uploaded files. "
                            },
                        }
                    ]
                },
                {
                    title: "Search Sample",
                    description: "Select the sample to which the files will be associated.",
                    display: {
                        visible: data => data?.select === false,
                    },
                    elements: [
                        {
                            title: "Select a Sample",
                            field: "sampleId",
                            type: "custom",
                            display: {
                                render: (sampleId, onFieldChange) => html`
                                    <div>
                                        <catalog-search-autocomplete
                                            .value="${sampleId}"
                                            .resource="${"SAMPLE"}"
                                            .opencgaSession="${this.opencgaSession}"
                                            .config="${{multiple: false}}"
                                            @filterChange="${e => onFieldChange(e.detail.value)}">
                                        </catalog-search-autocomplete>
                                    </div>
                                `,
                                helpMessage: "Path where the files will be uploaded.",
                            },
                        },
                    ]
                },
                {
                    title: "Upload Files",
                    description: html`<span>Upload one or more files to the selected study. <b>Note:</b> if the path already exists, the files will be overwritten.</span>`,
                    elements: [
                        {
                            title: "Path",
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
                                    <input class="d-none" type="file" multiple @change="${event => this.onFilesChange(event)}">
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
