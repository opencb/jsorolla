import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "./clinical-analysis-grid.js";

export default class ClinicalAnalysisGroup extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            toolId: {
                type: String,
            },
            opencgaSession: {
                type: Object,
            },
            query: {
                type: Object,
            },
            active: {
                type: Boolean,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "clinical-analysis-group";
        this._prefix = UtilsNew.randomString(8);
        this._config = this.getDefaultConfig();
        this._activeGroup = this._config.groups[0];
        this._groups = [];
    }

    updated(changedProperties) {
        if (changedProperties.has("opencgaSession") || changedProperties.has("config") || changedProperties.has("active")) {
            this.propertyObserver();
        }
    }

    propertyObserver() {
        if (this.opencgaSession && this.active) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
            this.updateGroups();
        }
    }

    updateGroups() {
        this._groups = []; // Reset groups
        this.requestUpdate();
        this.opencgaSession.opencgaClient.clinical()
            .distinct(this._activeGroup.distinctField, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                this._groups = response.getResults();
                // Check if a custom sorting function has been provided
                if (typeof this._activeGroup.customSort === "function") {
                    this._groups = this._activeGroup.customSort(this._groups);
                }
                this.requestUpdate();
            });
    }

    onGroupChange(newGroup) {
        this._activeGroup = newGroup;
        this.updateGroups();
    }

    onQueryComplete(event, item) {
        const totalResults = event.detail?.response?.responses[0]?.numTotalResults || 0;
        this.querySelector(`#${this._prefix}GroupCount${item}`).textContent = `(${totalResults} cases)`;
    }

    onRowUpdate() {
        // If a row has been updated, we force a refresh of all groups
        this.updateGroups();
    }

    renderGroupItem(item) {
        const query = {
            ...this.query,
            [this._activeGroup.queryField]: item,
        };
        return html`
            <h3 class="fw-bold">
                <i class="fas ${this._activeGroup.display.icon} icon-padding"></i>
                <strong>${item || this._activeGroup.display.emptyTitle}</strong>
                <span id="${this._prefix}GroupCount${item}"></span>
            </h3>
            <clinical-analysis-grid
                .toolId="${this.toolId}"
                .opencgaSession="${this.opencgaSession}"
                .config="${this._config?.grid}"
                .query="${query}"
                .active="${true}"
                @rowUpdate="${() => this.onRowUpdate()}"
                @queryComplete="${e => this.onQueryComplete(e, item)}">
            </clinical-analysis-grid>
        `;
    }

    render() {
        return html`
            <div class="d-flex">
                <div class="dropdown ms-auto">
                    <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                        <i class="fas fa-layer-group me-1"></i> Group by
                    </button>
                    <div class="dropdown-menu ms-auto me-0">
                        ${this._config.groups.map(group => html`
                            <a class="dropdown-item cursor-pointer" @click="${() => this.onGroupChange(group)}">
                                <div class="form-check">
                                    <input
                                        class="form-check-input"
                                        type="radio"
                                        name="CaseGroupBy"
                                        ?checked="${group.id === this._activeGroup.id}"/>
                                    <label class="form-check-label">${group.display.title}</label>
                                </div>
                            </a>
                        `)}
                    </div>
                </div>
            </div>
            ${this._groups.map(item => this.renderGroupItem(item))}
        `;
    }

    getDefaultConfig() {
        return {
            grid: {
                showToolbar: false,
            },
            groups: [
                {
                    id: "analyst",
                    distinctField: "analysts.id",
                    queryField: "analystId",
                    display: {
                        title: "Analyst",
                        icon: "fa-user-circle",
                        emptyTitle: "Unassigned",
                    },
                },
                {
                    id: "status",
                    title: "Status",
                    distinctField: "status.id",
                    queryField: "status",
                    customSort: items => {
                        // We are assuming values are always sorted from less to most important
                        return items.reverse();
                    },
                    display: {
                        title: "Status",
                        icon: "fa-dot-circle",
                        emptyTitle: "NO_STATUS",
                    },
                },
                {
                    id: "priority",
                    distinctField: "priority.id",
                    queryField: "priority",
                    customSort: items => {
                        // We are assuming values are always sorted from less to most important
                        return items.reverse();
                    },
                    display: {
                        title: "Priority",
                        icon: "fa-flag",
                        emptyTitle: "NO_PRIORITY",
                    },
                },
            ],
        };
    }

}

customElements.define("clinical-analysis-group", ClinicalAnalysisGroup);
