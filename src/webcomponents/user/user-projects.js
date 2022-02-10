import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import "../commons/forms/data-form.js";

export default class UserProjects extends LitElement {

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
                type: Object
            },
        };
    }

    #init() {
        this.projectsByUser = {};
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession?.projects) {
            // Generate a list with all owners, including the logged user
            const owners = new Set([this.opencgaSession.user.id]);
            (OpencgaCatalogUtils.getProjectOwners(this.opencgaSession.projects) || []).forEach(name => {
                owners.add(name);
            });

            // Group projects by users
            this.projectsByUser = {};
            owners.forEach(name => {
                this.projectsByUser[name] = this.opencgaSession.projects.filter(project => project.fqn.startsWith(name + "@"));
            });

            // Update configuration
            this.config = this.getDefaultConfig();
        }
    }

    renderTitle(headingType, icon, title) {
        return html`
            <div class="${headingType}" style="color: var(--main-bg-color);">
                <i class="fas fa-${icon} icon-padding"></i>
                <strong>${title}</strong>
            </div>
        `;
    }

    render() {
        // TODO: check if opencgaSession has been provided
        return html`
            <data-form
                .data="${this.opencgaSession}"
                .config="${this.config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const sections = [];
        Object.keys(this.projectsByUser).forEach(owner => {
            // Initialize user section
            sections.push({
                elements: [
                    {
                        type: "custom",
                        display: {
                            render: () => this.renderTitle("h3", "user", owner),
                        },
                    }
                ],
            });

            // Register projects info
            if (this.projectsByUser[owner].length === 0) {
                // This user do not have any projects created
                sections.push({
                    elements: [
                        {
                            type: "notification",
                            text: "You do not have any personal project.",
                            display: {
                                notificationType: "warning",
                            },
                        },
                    ],
                });
            } else {
                this.projectsByUser[owner].forEach(project => {
                    sections.push({
                        display: {
                            style: "border-left:4px solid var(--main-bg-color);padding-left:24px;",
                        },
                        elements: [
                            {
                                type: "custom",
                                display: {
                                    render: () => this.renderTitle("h4", "folder", project.name || project.id),
                                },
                            },
                            {
                                type: "custom",
                                display: {
                                    render: () => this.renderTitle("h5", "info-circle", "Project Info"),
                                },
                            },
                            {
                                title: "Project ID",
                                text: project.id || "-",
                                type: "text",
                            },
                            {
                                title: "Project Description",
                                text: project.description || "-",
                                type: "text",
                            },
                            {
                                title: "Species",
                                text: `${project.organism?.scientificName || "-"} (${project.organism?.assembly || "-"})`,
                                type: "text",
                            },
                            {
                                title: "CellBase",
                                text: `${project.internal?.cellbase?.url || "-"} (${project.internal?.cellbase?.version || "-"})`,
                                type: "text",
                            },
                            // Generate a table with all studies of this project of this user
                            {
                                type: "custom",
                                display: {
                                    render: () => this.renderTitle("h5", "flask", "Project Studies"),
                                },
                            },
                            {
                                type: "table",
                                // title: "Studies",
                                defaultValue: project.studies,
                                display: {
                                    columns: [
                                        {
                                            title: "ID",
                                            field: "id",
                                        },
                                        {
                                            title: "Name",
                                            field: "name",
                                        },
                                        {
                                            title: "Description",
                                            field: "description",
                                            defaultValue: "-",
                                        },
                                        {
                                            title: "Creation",
                                            field: "creationDate",
                                            defaultValue: "-",
                                            type: "custom",
                                            display: {
                                                render: value => UtilsNew.dateFormatter(value),
                                            },
                                        },
                                        {
                                            title: "FQN",
                                            field: "fqn",
                                        },
                                        {
                                            title: "Links",
                                            type: "custom",
                                            field: "id",
                                            display: {
                                                render: id => html`
                                                    <a href="#browser/${project.id}/${id}" title="Variant Browser" style="white-space:nowrap;">
                                                        <i class="fas fa-external-link-alt icon-padding"></i> VB
                                                    </a>
                                                `,
                                            },
                                        },
                                    ],
                                    defaultLayout: "vertical",
                                },
                            },
                        ],
                    });
                });
            }
        });

        return {
            icon: "",
            display: {
                buttonsVisible: false,
            },
            sections: sections,
        };
    }

}

customElements.define("user-projects", UserProjects);
