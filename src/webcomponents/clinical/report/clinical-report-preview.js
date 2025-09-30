import {LitElement, html, nothing} from "lit";
import "../../commons/forms/data-form.js";
import "../../commons/empty-state.js";

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
        this._editingTemplate = false;
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
                                return this.loadTemplateFromFile(file, fileContent);
                            })
                            .catch(error => {
                                console.error(`Error loading template from file ${file.name}:`, error);
                                this._invalidTemplates.push(file.name);
                                return null; // Return null for failed templates
                            });
                    }));
                })
                .then(templates => {
                    this._templates = templates.filter(Boolean); // Filter out invalid templates
                    // if there are only one template, set it as the current active
                    if (this._templates.length === 1) {
                        this._activeTemplate = this._templates[0];
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

    loadTemplateFromFile(file, content) {
        return this.evaluateTemplate(content).then(data => {
            return {
                id: file.id,
                path: file.path,
                name: file.name,
                content: content,
                originalContent: content,
                data: data,
            };
        });
    }

    onTemplateChange(event) {
        const selectedTemplate = this._templates.find(template => {
            return template.id === event.target.value;
        });
        this._activeTemplate = selectedTemplate || null;
        this._activeTemplate.content = this._activeTemplate.originalContent; // reset content to original
        this.evaluateTemplate(this._activeTemplate.content).then(data => {
            this._activeTemplate.data = data;
            this.requestUpdate();
        });
    }

    render() {
        if (!this.opencgaSession || !this.clinicalAnalysis || !this._templates) {
            return nothing;
        }
        
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
            ${this._templates.length > 1 ? html`
                <div class="form-group mb-5">
                    <label for="templateSelect" class="fw-bold">Select Template:</label>
                    <select class="form-control" @change="${event => this.onTemplateChange(event)}">
                        <option disabled selected value> -- select a template -- </option>
                        ${this._templates.map(template => html`
                            <option value="${template.id}" ?selected="${this._activeTemplate?.id === template.id}">
                                ${template.data?.title || template.data?.name || template.name} ${template.data?.version ? html` - ${template.data?.version}` : nothing}
                            </option>
                        `)}
                    </select>
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
                <data-form
                    .data="${this.clinicalAnalysis}"
                    .config="${{
                        ...this._activeTemplate?.data?.config,
                        display: {
                            buttonsVisible: false,
                            ...this._activeTemplate?.data?.config?.display,
                        },
                    }}">
                </data-form>
            ` : nothing}
        `;
    }

}

customElements.define("clinical-report-preview", ClinicalReportPreview);
