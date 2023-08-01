import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
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
            projects: {
                type: Array
            },
            userId: {
                type: String,
            },
        };
    }

    #init() {
        this.userProjects = [];
        this.sharedProjects = {};
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("projects") || changedProperties.has("userId")) {
            this.projectsObserver();
        }

        super.update(changedProperties);
    }

    projectsObserver() {
        this.userProjects = [];
        this.sharedProjects = {};

        if (this.projects) {
            // Generate a list with all owners, without the logged user
            const owners = new Set();
            (OpencgaCatalogUtils.getProjectOwners(this.projects) || []).forEach(name => {
                if (name !== this.userId) {
                    owners.add(name);
                }
            });

            // Group projects by users
            owners.forEach(name => {
                this.sharedProjects[name] = this.projects.filter(project => project.fqn.startsWith(name + "@"));
            });

            // Get user projects
            if (this.userId) {
                this.userProjects = this.projects.filter(project => project.fqn.startsWith(this.userId + "@"));
            }
        }

        // Update configuration
        this.config = this.getDefaultConfig();
    }

    generateProjectSection(project, owner, bg) {
        return {
            display: {
                style: `border-left:4px solid var(--main-bg-color);padding:16px 24px;background-color:${bg}`,
            },
            elements: [
                {
                    type: "text",
                    text: project.name || project.id,
                    display: {
                        icon: "folder",
                        textClassName: "h4",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                },
                {
                    type: "text",
                    text: "Project Info",
                    display: {
                        icon: "info-circle",
                        textClassName: "h5",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                },
                {
                    title: "Project ID",
                    text: project.id || "-",
                    type: "text",
                    display: {
                        textStyle: "padding-left:16px;",
                    },
                },
                {
                    title: "Project Description",
                    text: project.description || "-",
                    type: "text",
                    display: {
                        textStyle: "padding-left:16px;",
                    },
                },
                {
                    title: "Data Release",
                    text: project.attributes.release,
                    type: "text",
                    display: {
                        textStyle: "padding-left:16px;",
                        visible: !!project?.attributes?.release
                    },
                },
                {
                    title: "Project Owner",
                    text: owner || "-",
                    type: "text",
                    display: {
                        textStyle: "padding-left:16px;font-weight:bold;",
                    },
                },
                {
                    title: "Species",
                    text: `${project.organism?.scientificName || "-"} (${project.organism?.assembly || "-"})`,
                    type: "text",
                    display: {
                        textStyle: "padding-left:16px;",
                    },
                },
                {
                    title: "CellBase",
                    text: `${project.cellbase?.url || "-"} (${project.cellbase?.version || "-"}, Data Release: ${project.cellbase?.dataRelease || "-"})`,
                    type: "text",
                    display: {
                        textStyle: "padding-left:16px;",
                    },
                },
                // Generate a table with all studies of this project of this user
                {
                    type: "text",
                    text: "Project Studies",
                    display: {
                        icon: "flask",
                        textClassName: "h5",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
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
        };
    }

    render() {
        return html`
            <data-form
                .config="${this.config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        const sections = [];

        // Add user projects
        sections.push({
            elements: [
                {
                    type: "text",
                    text: "Your projects",
                    display: {
                        icon: "user",
                        textClassName: "h3",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                }
            ],
        });
        if (this.userProjects.length > 0) {
            this.userProjects.forEach(project => {
                sections.push(this.generateProjectSection(project, this.userId, "#ffffff"));
            });
        } else {
            // No user projects found
            sections.push({
                elements: [
                    {
                        type: "notification",
                        text: "You do not have any personal project.",
                        display: {
                            notificationType: "warning",
                        },
                    }
                ],
            });
        }

        // Add shared projects
        sections.push({
            elements: [
                {
                    type: "text",
                    text: "Shared projects",
                    display: {
                        icon: "users",
                        textClassName: "h3",
                        textStyle: "color: var(--main-bg-color);font-weight:bold;",
                    },
                }
            ],
        });

        if (Object.keys(this.sharedProjects).length > 0) {
            Object.keys(this.sharedProjects).forEach((owner, index) => {
                const bg = index % 2 === 0 ? "#ffffff" : "#f5f5f5";

                this.sharedProjects[owner].forEach(project => {
                    sections.push(this.generateProjectSection(project, owner, bg));
                });
            });
        } else {
            // No shared project found
            sections.push({
                elements: [
                    {
                        type: "notification",
                        text: "You do not have any shared project.",
                        display: {
                            notificationType: "warning",
                        },
                    }
                ],
            });
        }

        return {
            icon: "",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    elements: [
                        {
                            type: "text",
                            text: "Projects and Studies",
                            display: {
                                icon: "archive",
                                textClassName: "h2",
                                textStyle: "color: var(--main-bg-color);margin-bottom:24px;font-weight:bold;",
                            },
                        }
                    ],
                },
                ...sections,
            ],
        };
    }

}

customElements.define("user-projects", UserProjects);
