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
        this.activeGroup = this._config.groups[0];
        this.groups = [];
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
                showCreate: false, // Caution: force create false independently of admin/default decision.
            };

            this.updateGroups();
        }
    }

    updateGroups() {
        this.groups = []; // Reset groups
        this.requestUpdate();
        this.opencgaSession.opencgaClient.clinical()
            .distinct(this.activeGroup.distinctField, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                this.groups = response.getResults();

                // Check if a custom sorting function has been provided
                if (typeof this.activeGroup.customSort === "function") {
                    this.groups = this.activeGroup.customSort(this.groups);
                }

                this.requestUpdate();
            });
    }

    onGroupChange(newGroup) {
        this.activeGroup = newGroup;
        this.updateGroups();
    }

    onQueryComplete(event, item) {
        const totalResults = event.detail.value?.responses[0]?.numTotalResults || 0;
        this.querySelector(`#${this._prefix}GroupCount${item}`).textContent = `(${totalResults} cases)`;
    }

    onRowUpdate() {
        // If a row has been updated, we force a refresh of all groups
        this.updateGroups();
    }

    renderGroupItem(item) {
        const query = {
            ...this.query,
            [this.activeGroup.queryField]: item,
        };
        return html`
            <div>
                <h3>
                    <i class="fas ${this.activeGroup.display.icon} icon-padding"></i>
                    <strong>${item || this.activeGroup.display.emptyTitle}</strong>
                    <span id="${this._prefix}GroupCount${item}"></span>
                </h3>
                <clinical-analysis-grid
                    .toolId="${this.toolId}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    .query="${query}"
                    .active="${true}"
                    @rowUpdate="${() => this.onRowUpdate()}"
                    @queryComplete="${e => this.onQueryComplete(e, item)}">
                </clinical-analysis-grid>
            </div>
        `;
    }

    render() {
        return html`
            <div>
                <div class="d-flex">
                    ${this.config?.showCreate ? html`
                        <a type="button" href="#clinical-analysis-create/" class="btn btn-light">
                            <i class="fas fa-columns icon-padding"></i>
                            <span>New</span>
                        </a>
                    ` : null}
                    <div class="dropdown ms-auto">
                        <button type="button" class="btn btn-light dropdown-toggle" data-bs-toggle="dropdown">
                            <i class="fas fa-layer-group me-1"></i>
                            Group by
                        </button>
                        <ul class="dropdown-menu ms-auto me-0">
                            ${this._config.groups.map(group => html`
                                <li>
                                    <a class="dropdown-item" style="cursor:pointer;" @click="${() => this.onGroupChange(group)}">
                                        <div class="form-check">
                                            <input
                                                class="form-check-input"
                                                type="radio"
                                                name="CaseGroupBy"
                                                ?checked="${group.id === this.activeGroup.id}"/>
                                            <label class="form-check-label">${group.display.title}</label>
                                        </div>
                                    </a>
                                </li>
                            `)}
                        </ul>
                    </div>
                </div>
                ${this.groups.map(item => this.renderGroupItem(item))}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showToolbar: false,
            showCreate: false,
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
