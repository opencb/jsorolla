
import {html, LitElement, nothing} from "lit";
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../utils/lit-utils.js";
import "../../job/job-monitor.js";

export default class LayoutPrimaryBar extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            version: {
                type: String,
            },
            config: {
                type: Object
            }
        };
    }

    onSearch(e) {
        const value = document.querySelector("#PrimaryBarInputSearch")?.value;
        if (value?.length > 3) {
            // if (value.include(":")) {
            //
            // }
        }
        // debugger
    }

    onStudySelect(e, study) {
        LitUtils.dispatchCustomEvent(this, "studySelect", "", {event: e, study: study}, null);
    }

    logout() {
        LitUtils.dispatchCustomEvent(this, "logout");
    }

    getVisibleUserMenuItems() {
        return (this.config?.userMenu || []).filter(item => UtilsNew.isAppVisible(item, this.opencgaSession));
    }

    renderSeparator() {
        return html`<div class="bg-gray-700 w-px"></div>`;
    }

    renderStudiesDropdown() {
        if (this.opencgaSession?.projects?.length > 0) {
            // Note: in the study selection we only display projects with at least one study
            const visibleProjects = this.opencgaSession.projects
                .filter(project => {
                    return project?.studies?.length > 0;
                });

            // Check if there are federated projects
            const [localProjects, federatedProjects] = visibleProjects.reduce((projects, itemProject) => {
                if (!itemProject.internal.federated) {
                    projects[0].push(itemProject);
                } else {
                    projects[1].push(itemProject);
                }
                return projects;
            }, [[], []]);

            return html`
                <div class="d-flex dropdown" title="Projects and Studies">
                    <button class="btn d-flex align-items-center gap-1 border border-gray-700 hover:bg-gray-800 text-white dropdown-toggle" data-bs-toggle="dropdown">
                        <div class="project-name lh-1 fw-bold">${this.opencgaSession.project?.name}:</div>
                        <div class="fw-bold lh-1">${this.opencgaSession.study?.name}</div>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end" style="min-width: 175px">
                        ${localProjects.length > 0 ? html`
                            <label class="fw-bold">Organisation '${localProjects[0].fqn.split("@")[0]}'</label>
                            ${localProjects.map(project => html`
                                <div class="dropdown-header user-select-none" title="${project.fqn}">
                                    <b>${project.name}</b>
                                </div>
                                ${project.studies.map(study => html`
                                    <div
                                        class="dropdown-item cursor-pointer ${study.fqn === this.opencgaSession?.study?.fqn ? "active" : ""}"
                                        title="${study.fqn}"
                                        @click="${e => this.onStudySelect(e, study)}">
                                        <span>${study.name}</span>
                                    </div>
                                `)}
                            `)}
                        `: nothing}

                        ${federatedProjects.length > 0 ? html`
                            <hr>
                            <label class="fw-bold">Federated Organisations</label>
                            ${federatedProjects.map(project => html`
                                <div class="dropdown-header user-select-none" title="${project.fqn}">
                                    <b>${project.name} [${project.fqn.split("@")[0]}]</b>
                                </div>
                                ${project.studies.map(study => html`
                                    <div
                                        class="dropdown-item cursor-pointer ${study.fqn === this.opencgaSession?.study?.fqn ? "active" : ""}"
                                        title="${study.fqn}"
                                        @click="${e => this.onStudySelect(e, study)}">
                                        <span>${study.name}</span>
                                    </div>
                                `)}
                            `)}
                        `: nothing}
                    </div>
                </div>
            `;
        }
        return nothing;
    }

    render() {
        return html`
            <nav class="bg-gray-900 py-2">
                <div class="container-fluid d-flex">
                    <div class="d-flex align-items-center gap-3 me-auto">
                        <div class="d-flex">
                            <a href="#home">
                                ${this.config?.logo ? html`
                                    <img src="${this.config?.logo}" height="20px" alt="logo">
                                ` : nothing}
                            </a>
                        </div>
                    </div>

                        <!--
                    <div class="d-flex align-items-stretch gap-2 ms-auto">
                        <div class="input-group">
                            <div class="input-group-text" id="btnGroupAddon">
                                <i class="fas fa-search" aria-hidden="true"></i>
                            </div>
                            <input
                                id="PrimaryBarInputSearch"
                                type="text"
                                class="form-control"
                                placeholder="Search ..."
                                aria-label="Input group example" aria-describedby="btnGroupAddon"
                                style="width: 240px;"
                                @input="${this.onSearch}">
                        </div>
                    </div>
                    -->

                    <div class="d-flex align-items-stretch gap-2 ms-auto">
                        ${this.renderStudiesDropdown()}

                        ${this.renderSeparator()}
                        <div class="d-flex" title="Variant Browser">
                            <a href="#research/variant-browser" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">
                                <i class="fas fa-dna lh-1"></i>
                            </a>
                        </div>
                        <div class="d-flex" title="File Manager">
                            <a href="#research/file-browser" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">
                                <i class="fas fa-folder lh-1"></i>
                            </a>
                        </div>
                        <div class="d-flex" title="Nextflow Workflow Manager">
                            <a href="#research/workflow-manager" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">
                                <img src="https://raw.githubusercontent.com/nextflow-io/trademark/refs/heads/master/nextflow-icon.svg" height="16px">
                            </a>
                        </div>
                        <div class="d-flex" title="Jupyter Lab Notebook">
                            <a href="#research/jupyter-notebook" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">
                                <img src="https://raw.githubusercontent.com/jupyter/design/refs/heads/main/logos/Logo%20Mark/logomark-whitebody-whitemoons/logomark-whitebody-whitemoons.svg" height="16px">
                            </a>
                        </div>
                        <div class="d-flex" title="Swagger UI - REST API">
                            <a href="#swagger-ui" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">
                                <img src="https://raw.githubusercontent.com/swagger-api/swagger-ui/refs/heads/master/dist/favicon-16x16.png">
                            </a>
                        </div>
<!--                        <div class="d-flex">-->
<!--                            <a href="#rest-api" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">-->
<!--                                <i class="fas fa-code lh-1"></i>-->
<!--                            </a>-->
<!--                        </div>-->

                        ${this.renderSeparator()}
                        <div class="d-flex dropdown">
                            <button class="d-flex gap-1 align-items-center btn border border-gray-700 hover:bg-gray-800 text-white" data-bs-toggle="dropdown">
                                <i class="fas fa-rocket lh-1"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end" style="width:320px;">
                                <job-monitor
                                    .opencgaSession="${this.opencgaSession}">
                                </job-monitor>
                            </div>
                        </div>
                        <div class="d-flex dropdown">
                            <button class="d-flex gap-1 align-items-center btn border border-gray-700 hover:bg-gray-800 text-white" data-bs-toggle="dropdown">
                                <i class="fas fa-bell lh-1"></i>
                            </button>
                        </div>

                        ${this.renderSeparator()}
                        <div class="d-flex dropdown">
                            <button class="btn d-flex align-items-center gap-2 border border-gray-700 hover:bg-gray-800 text-white dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="fas fa-user lh-1"></i>
                                <span class="lh-1">${this.opencgaSession?.user?.name ?? this.opencgaSession?.user?.id ?? "-"}</span>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end">
                                ${this.getVisibleUserMenuItems().map(item => html`
                                    <a class="dropdown-item" href="${item.url}" data-user-menu="${item.id}">
                                        <i class="${item.icon} me-1"></i>
                                        <span>${item.name}</span>
                                    </a>
                                `)}
                                <hr class="dropdown-divider">
                                <a class="dropdown-item cursor-pointer" data-user-menu="logout" @click="${() => this.logout()}">
                                    <i class="fa fa-sign-out-alt me-1"></i>
                                    <span>Sign out</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

}

customElements.define("layout-primary-bar", LayoutPrimaryBar);
