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
            loggedIn: {
                type: Boolean
            },
            app: {
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
            const visibleProjects = this.opencgaSession.projects.filter(project => {
                return project?.studies?.length > 0;
            });
            return html`
                <div class="d-flex dropdown" title="Projects and Studies">
                    <button class="btn d-flex align-items-center gap-1 border border-gray-700 hover:bg-gray-800 text-white dropdown-toggle" data-bs-toggle="dropdown">
                        <div class="project-name">${this.opencgaSession.project?.name}:</div>
                        <div class="fw-bold">${this.opencgaSession.study.name}</div>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        ${visibleProjects.map(project => html`
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
                    </div>
                </div>
                ${this.renderSeparator()}
            `;
        }
        return nothing;
    }

    render() {
        return html`
            <nav class="bg-gray-900 py-2">
                <div class="container-fluid d-flex">
                    <div class="d-flex align-items-center gap-3 me-auto">
                        <a href="#home">
                            ${this.config?.logo ? html`
                                <img src="${this.config?.logo}" height="20px" alt="logo">
                            ` : nothing}
                        </a>
                    </div>
                    <div class="d-flex align-items-stretch gap-2 ms-auto">
                        ${this.renderStudiesDropdown()}
                        <button class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-700 text-white">
                            <i class="fas fa-folder-open lh-1"></i>
                        </button>
                        <button class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-700 text-white">
                            <i class="fas fa-project-diagram lh-1"></i>
                        </button>
                        <button class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-700 text-white">
                            <i class="fas fa-user-cog lh-1"></i>
                        </button>
                        ${this.renderSeparator()}
                        <div class="d-flex dropdown">
                            <button class="d-flex gap-1 align-items-center btn border border-gray-700 hover:bg-gray-800 text-white dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="fas fa-rocket lh-1"></i>
                            </button>
                            <div class="dropdown-menu dropdown-menu-end" style="width:350px;">
                                <job-monitor
                                    .opencgaSession="${this.opencgaSession}">
                                </job-monitor>
                            </div>
                        </div>
                        <a href="#rest-api" class="d-flex align-items-center btn border border-gray-700 hover:bg-gray-800 text-white">
                            <i class="fas fa-code lh-1"></i>
                        </a>
                        ${this.renderSeparator()}
                        <div class="dropdown">
                            <button class="btn d-flex align-items-center gap-2 border border-gray-700 hover:bg-gray-800 text-white dropdown-toggle" data-bs-toggle="dropdown">
                                <i class="fas fa-user lh-1"></i>
                                <span>${this.opencgaSession?.user?.name ?? this.opencgaSession?.user?.id ?? "-"}</span>
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
                                    <span>Log out</span>
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
