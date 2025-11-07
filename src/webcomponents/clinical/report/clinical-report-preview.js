import {LitElement, html, nothing} from "lit";
import OpencgaCatalogUtils from "../../../core/clients/opencga/opencga-catalog-utils.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import "../../commons/forms/data-form.js";
import "../../commons/empty-state.js";
import "../../file/file-editor.js";

export default class ClinicalReportPreview extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            clinicalAnalysis: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
        };
    }

    #init() {
        this.active = true;
        this._templates = null;
        this._invalidTemplates = [];
        this._activeTemplate = null;
        this._activeTemplateConfig = null; // Configuration of the active template

        this._editingTemplate = false;
        this._editingTemplateUnsavedChanges = false;
        this._editingTemplateTimer = null;
        this._editingTemplateError = null;
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("clinicalAnalysis")) {
            this.clinicalAnalysisObserver();
        }

        super.update(changedProperties);
    }

    clinicalAnalysisObserver() {
        this._templates = null;
        this._invalidTemplates = [];
        this._activeTemplate = null;
        this._activeTemplateConfig = null;
        this._editingTemplate = false;

        if (this.opencgaSession && this.clinicalAnalysis) {
            // 1. fetch all .js files inside the clinical report templates folder
            this.opencgaSession.opencgaClient.files()
                .search({
                    study: this.opencgaSession.study.fqn,
                    directory: "RESOURCES/clinical/report/templates",
                    include: "id,name,path",
                })
                .then(response => {
                    const files = (response.responses?.[0]?.results || []).filter(file => {
                        return file.name.endsWith(".js");
                    });
                    // 2. download each file and load the templates
                    return Promise.all(files.map(file => {
                        return this.opencgaSession.opencgaClient.files()
                            .download(file.id, {
                                study: this.opencgaSession.study.fqn,
                            })
                            .then(fileContent => {
                                // return this.loadTemplateFromFile(file, fileContent);
                                return this.evaluateTemplate(fileContent);
                            })
                            .then(template => {
                                return {
                                    id: file.id,
                                    invalid: false,
                                    title: template?.name || template?.title || file.name.replace(".js", ""),
                                    description: template?.description || "",
                                    version: template?.version || "",
                                    config: template?.config || template?.template || null,
                                };
                            })
                            .catch(error => {
                                console.error(`Error loading template from file ${file.name}:`, error);
                                // this._invalidTemplates.push(file.name);
                                // return null; // Return null for failed templates
                                return {
                                    id: file.id,
                                    invalid: true,
                                    title: file.name.replace(".js", ""),
                                    config: null,
                                };
                            });
                    }));
                })
                .then(templates => {
                    this._templates = templates.filter(Boolean); // Filter out invalid templates
                    // set the first template as the active one by default
                    if (this._templates.length > 0) {
                        this._activeTemplate = this._templates[0];
                        this._activeTemplateConfig = this._activeTemplate.config;
                    }
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error("Error loading templates:", error);
                });
        }
    }

    evaluateTemplate(templateString) {
        const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
        const fn = new AsyncFunction(templateString);
        return Promise.resolve(fn());
    }

    // loadTemplateFromFile(file, content) {
    //     return this.evaluateTemplate(content).then(data => {
    //         return {
    //             id: file.id,
    //             content: content,
    //             title: data?.name || data?.title || file.name.replace(".js", ""),
    //             description: data?.description || "",
    //             version: data?.version || "",
    //             config: data?.config || data?.template || {}
    //         };
    //     });
    // }

    onTemplateChange(event) {
        const selectedTemplate = this._templates.find(template => {
            return template.id === event.target.value;
        });
        this._activeTemplate = selectedTemplate || null;
        this._activeTemplateConfig = this._activeTemplate ? this._activeTemplate.config : null;
        this.requestUpdate();
    }

    onToggleTemplateEdition(event) {
        this._editingTemplate = event.target.checked;
        this._editingTemplateError = null; // reset previous error
        this._editingTemplateUnsavedChanges = false; // reset unsaved changes flag

        // when enabling edition mode, load the latest template content from the server
        if (this._activeTemplate) {
            this._activeTemplateConfig = this._activeTemplate.config;
        }

        // dispatch a templateEditionToggle event
        LitUtils.dispatchCustomEvent(this, "templateEditionToggle", this._editingTemplate);
        this.requestUpdate();
    }

    onTemplateContentChange(event) {
        const newContent = event.detail.value;
        this._editingTemplateUnsavedChanges = true; // there are unsaved changes

        // evaluate the new template content after a debounce timer
        if (this._editingTemplateTimer) {
            clearTimeout(this._editingTemplateTimer);
        }

        this._editingTemplateTimer = setTimeout(() => {
            this._editingTemplateTimer = null;
            this._editingTemplateError = null;
            this.evaluateTemplate(newContent)
                .then(data => {
                    this._activeTemplateConfig = data?.config || data?.template || {};
                })
                .catch(error => {
                    console.error("Error evaluating template:", error);
                    this._editingTemplateError = error?.message || "Error evaluating template";
                })
                .finally(() => {
                    this.requestUpdate();
                });
        }, 1000);
    }

    onTemplateContentSave(event) {
        this._editingTemplateUnsavedChanges = false;
        // this._activeTemplate.config = this._activeTemplateConfig; // save the current config in the active template
        // this.requestUpdate();
        // evaluate the current template content to ensure it's valid and update the template config
        this.evaluateTemplate(event.detail.value)
            .then(template => {
                Object.assign(this._activeTemplate, {
                    invalid: false,
                    title: template?.name || template?.title || this._activeTemplate.name,
                    description: template?.description || this._activeTemplate.description,
                    version: template?.version || this._activeTemplate.version,
                    config: template?.config || template?.template || this._activeTemplate.config,
                });
                this._activeTemplateConfig = this._activeTemplate.config;
                this._editingTemplateError = null;
            })
            .catch(error => {
                console.error("Error evaluating template:", error);
                this._activeTemplate.invalid = true;
                this._editingTemplateError = error?.message || "Error evaluating template";
            })
            .finally(() => {
                this.requestUpdate();
            });
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis || !this._templates) {
            return nothing;
        }

        // check if the user has permissions to edit the template
        // note: study admin is required to write templates into RESOURCES folder of the study
        const isStudyAdmin = OpencgaCatalogUtils.isAdmin(this.opencgaSession.study, this.opencgaSession.user.id);
        const hasWritePermission = OpencgaCatalogUtils.hasPermissionInCurrentStudy(this.opencgaSession, "FILES_WRITE");
        const hasDownloadPermission = OpencgaCatalogUtils.hasPermissionInCurrentStudy(this.opencgaSession, "FILES_DOWNLOAD");
        
        return html`
            ${this._invalidTemplates?.length > 0 ? html`
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    <span>
                        The following templates could not be loaded: 
                        ${this._invalidTemplates.map(name => html` <code>${name}</code>`)}. 
                        Please, contact your administrator.
                    </span>
                </div>
            ` : nothing}
            ${this._templates.length > 0 ? html`
                <div class="p-4 rounded-4 mb-5 bg-white border border-gray-200 d-flex align-items-start gap-4">
                    <div class="form-group flex-grow-1">
                        <label for="templateSelect" class="fw-bold mb-1">Select a Template to generate the preview</label>
                        <select class="form-select" @change="${event => this.onTemplateChange(event)}">
                            ${this._templates.map(template => html`
                                <option value="${template.id}" ?selected="${this._activeTemplate?.id === template.id}">
                                    ${template.title} ${template.version ? html` - ${template.version}` : nothing}
                                </option>
                            `)}
                        </select>
                        <div class="mt-1 small text-muted">
                            <span>The templates are located in the folder <span class="fw-bold font-monospace small">RESOURCES/clinical/report/templates</span> of this study.</span>
                        </div>
                    </div>
                    ${isStudyAdmin && hasWritePermission && hasDownloadPermission ? html`
                        <div class="form-group flex-shrink-0" style="width:320px;">
                            <div class="fw-bold mb-1">Template Options</div>
                            <div class="form-check form-switch">
                                <input
                                    class="form-check-input"
                                    type="checkbox"
                                    id="templateEdition"
                                    ?checked="${this._editingTemplate}"
                                    ?disabled="${!isStudyAdmin || !hasWritePermission || !hasDownloadPermission}"
                                    @change="${event => this.onToggleTemplateEdition(event)}">
                                <label class="form-check-label" for="templateEdition">Edition Mode</label>
                            </div>
                            <div class="mt-1 small text-muted">
                                <span>Enable or disable the live template editing.</span>
                            </div>
                        </div>
                    ` : nothing}
                </div>
            ` : nothing}
            ${this._templates && this._templates.length === 0 ? html`
                <empty-state
                    .icon="${"fa-folder-open"}"
                    .title="${"No Templates Available"}"
                    .description="${html`
                        <span>No templates found in the folder <span class="fw-bold font-monospace small">RESOURCES/clinical/report/templates</span> of this study. </span>
                        <span>Please, contact your administrator to add templates.</span>
                    `}">
                </empty-state>
            ` : nothing}
            ${this._activeTemplate && this.active ? html`
                <div class="row">
                    <div class="${this._editingTemplate ? "col-7" : "col-12"}">
                        ${this._activeTemplateConfig ? html`
                            <data-form
                                .data="${this.clinicalAnalysis}"
                                .config="${{
                                    ...this._activeTemplateConfig,
                                    display: {
                                        buttonsVisible: false,
                                        ...this._activeTemplateConfig?.display,
                                    },
                                }}">
                            </data-form>
                        ` : nothing}
                    </div>
                    ${this._editingTemplate ? html`
                        <div class="col-5" style="min-height:100vh;">
                            <div class="sticky-top">
                                <file-editor
                                    .path="${this._activeTemplate.id}"
                                    .opencgaSession="${this.opencgaSession}"
                                    .config="${{
                                        editorStyle: "height:calc(100vh - 8rem);",
                                    }}"
                                    @fileContentChange="${event => this.onTemplateContentChange(event)}"
                                    @fileContentDiscard="${event => this.onTemplateContentChange(event)}"
                                    @fileContentSave="${event => this.onTemplateContentSave(event)}">
                                </file-editor>
                            </div>
                        </div>
                    ` : nothing}
                </div>
            ` : nothing}
        `;
    }

}

customElements.define("clinical-report-preview", ClinicalReportPreview);
