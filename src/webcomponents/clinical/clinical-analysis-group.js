import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
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
            };

            this.updateGroups();
        }
    }

    updateGroups() {
        this.opencgaSession.opencgaClient.clinical()
            .distinct(this.activeGroup.distinctField, {
                study: this.opencgaSession.study.fqn,
            })
            .then(response => {
                this.groups = response.getResults();
                this.requestUpdate();
            });
    }

    onGroupChange(newGroup) {
        this.activeGroup = newGroup;
        this.updateGroups();
    }

    onQueryComplete(event, item) {
        const totalResults = event.detail.value?.responses[0]?.numTotalResults || 0;
        if (totalResults > 0) {
            this.querySelector(`#${this._prefix}GroupCount${item}`).textContent = `(${totalResults} cases)`;
        }
    }

    render() {
        return html`
            <div>
                <div style="display:flex;">
                    <a type="button" href="#clinical-analysis-create/" class="btn btn-default btn-sm">
                        <i class="fas fa-columns icon-padding"></i> 
                        <span>New</span>
                    </a>
                    <div class="dropdown" style="margin-left:auto;">
                        <button type="button" class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                            <i class="fas fa-layer-group icon-padding"></i> 
                            Group by <span class="caret"></span>
                        </button>
                        <ul class="dropdown-menu btn-sm" style="left:auto;right:0px;">
                            ${this._config.groups.map(group => html`
                                <li>
                                    <a style="cursor:pointer;" @click="${() => this.onGroupChange(group)}">
                                        <label style="display:flex;align-items:center;margin-bottom:0px;">
                                            <input
                                                type="radio"
                                                name="CaseGroupBy"
                                                style="margin-top:0px;"
                                                ?checked="${group.id === this.activeGroup.id}"
                                            />
                                            <span style="margin-left:8px;">${group.display.title}</span>
                                        </label>
                                    </a>
                                </li>
                            `)}
                        </ul>
                    </div>
                </div>
                ${this.groups.map(item => html`
                    <div>
                        <h1>
                            <i class="fas ${this.activeGroup.display.icon} icon-padding"></i>
                            <strong>${item || this.activeGroup.display.emptyTitle}</strong>
                            <span id="${this._prefix}GroupCount${item}"></span>
                        </h1>
                        <clinical-analysis-grid
                            .opencgaSession="${this.opencgaSession}"
                            .config="${this._config}"
                            .query="${{
                                ...this.query,
                                [this.activeGroup.queryField]: item,
                            }}"
                            .active="${true}"
                            @queryComplete="${e => this.onQueryComplete(e, item)}">
                        </clinical-analysis-grid>
                    </div>
                `)}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            groups: [
                {
                    id: "analyst",
                    distinctField: "analyst.id",
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
