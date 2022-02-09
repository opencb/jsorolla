import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/tool-header.js";
import "../commons/forms/data-form.js";

export default class UserProfile extends LitElement {

    static tabs = {
        "projects": "Projects",
        "change-password": "Change Password",
    };

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
        this.updateParams = {};
        this.projectsByUser = {};
        this.currentTab = "projects";
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }

        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        if (this.opencgaSession) {
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

    onFieldChange(e) {
        this.updateParams[e.detail.param] = e.detail.value;
        // TODO: find another solution to force an update in data-form
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    onSubmit() {
        this.opencgaSession.opencgaClient.getClient("user").password({
            user: this.opencgaSession.user.id,
            password: this.updateParams.oldPassword,
            newPassword: this.updateParams.newPassword,
        })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Your password has been changed",
                });
                this.onClear();
            })
            .catch(response => {
                // console.error(response);
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    onClear() {
        this.updateParams = {};
        // Terrible hack to reset the values in the input elements
        // eslint-disable-next-line no-param-reassign
        Array.from(this.querySelectorAll("input")).forEach(el => el.value = "");
        this.requestUpdate();
    }

    onTabChange(newTab) {
        this.currentTab = newTab;
        this.updateParams = {};
        this.config = this.getDefaultConfig();
        this.requestUpdate();
    }

    renderTabs() {
        return html`
            <ul class="nav nav-tabs">
                ${Object.keys(UserProfile.tabs).map(key => html`
                    <li role="presentation" class="${key === this.currentTab ? "active" : ""}" @click="${() => this.onTabChange(key)}">
                        <a style="cursor:pointer;">${UserProfile.tabs[key]}</a>
                    </li>
                `)}
            </ul>
        `;
    }

    renderTitle(headingType, icon, title) {
        return html`
            <div class="${headingType}">
                <i class="fas fa-${icon} icon-padding"></i>
                <strong>${title}</strong>
            </div>
        `;
    }

    render() {
        console.log(this.opencgaSession);
        // TODO: check if opencgaSession has been provided
        return html`
            <div>
                <tool-header title="Your profile" icon="fa fa-user-circle"></tool-header>
                <div class="container">
                    <data-form
                        .data="${this.opencgaSession}"
                        .config="${this.config}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @submit="${() => this.onSubmit()}"
                        @clear="${() => this.onClear()}">
                    </data-form>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        const projectsElements = [];
        Object.keys(this.projectsByUser).forEach(owner => {
            projectsElements.push({
                type: "custom",
                display: {
                    render: () => this.renderTitle("h3", "user", owner),
                },
            });

            // Register projects info
            if (this.projectsByUser[owner].length === 0) {
                // This user do not have any projects created
                projectsElements.push({
                    type: "custom",
                    display: {
                        render: () => html`
                            <div class="alert alert-warning">
                                <i class="fas fa-info-circle icon-padding"></i>
                                You do not have any personal project.
                            </div>
                        `,
                    },
                });
            } else {
                this.projectsByUser[owner].forEach(project => {
                    projectsElements.push({
                        type: "custom",
                        display: {
                            render: () => this.renderTitle("h4", "folder", project.name || project.id),
                        },
                    });
                    projectsElements.push({
                        title: "Project ID",
                        text: project.id || "-",
                        type: "text",
                    });
                    projectsElements.push({
                        title: "Project Name",
                        text: project.name || "-",
                        type: "text",
                    });
                    projectsElements.push({
                        title: "Project Description",
                        text: project.description || "-",
                        type: "text",
                    });
                    projectsElements.push({
                        title: "Species",
                        text: project.organism?.scientificName || "-",
                        type: "text",
                    });
                    projectsElements.push({
                        title: "Assembly",
                        text: project.organism.assembly || "-",
                        type: "text",
                    });
                    projectsElements.push({
                        title: "CellBase Host",
                        text: project.internal?.cellbase?.url || "-",
                        type: "text",
                    });
                    projectsElements.push({
                        title: "CellBase Version",
                        text: project.internal?.cellbase?.version || "-",
                        type: "text",
                    });
                    // Generate a table with all studies of this project of this user
                    projectsElements.push({
                        type: "table",
                        title: "Studies",
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
                                    title: "Creation Date",
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
                                            <a href="#browser/${project.id}/${id}" title="Variant Browser">
                                                <i class="fas fa-external-link-alt icon-padding"></i> 
                                                VB
                                            </a>
                                        `,
                                    },
                                },
                            ],
                            defaultLayout: "vertical",
                        },
                    });

                    // Add separator rule
                    projectsElements.push({
                        type: "separator",
                    });
                });
            }
        });

        return {
            icon: "",
            display: {
                buttonOkText: "Change password",
                buttonsVisible: () => this.currentTab === "change-password",
                layout: [
                    {
                        sections: [
                            {
                                id: "info",
                                style: "position:sticky;top:0px;",
                            }
                        ],
                        style: "width:100%;max-width:350px;"
                    },
                    {
                        sections: [
                            {
                                id: "tabs",
                            },
                            {
                                id: "projects",
                            },
                            {
                                id: "change-password",
                            }
                        ],
                        style: "flex-grow:1;"
                    },
                ],
                style: "display:flex;width:100%;",
            },
            // validation: {
            //     validate: () => this.updateParams.newPassword === this.updateParams.confirmNewPassword,
            //     message: "New passwords do not match",
            // },
            sections: [
                {
                    id: "info",
                    // title: "General Info",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => this.renderTitle("h2", "user", "User Info"),
                            },
                        },
                        {
                            title: "id",
                            field: "user.id"
                        },
                        {
                            title: "Name",
                            field: "user.name"
                        },
                        {
                            title: "Email",
                            field: "user.email",
                        },
                        {
                            title: "Organization",
                            field: "user.organization",
                            defaultValue: "-",
                        },
                        {
                            title: "Account type",
                            field: "user.account.type"
                        },
                        {
                            title: "Member since",
                            field: "user.account.creationDate",
                            type: "custom",
                            display: {
                                render: date => UtilsNew.dateFormatter(date),
                            }
                        },
                        {
                            title: "Data release",
                            type: "custom",
                            field: "project.attributes",
                            display: {
                                visible: data => !!data.project?.attributes?.release,
                                render: attributes => attributes?.release
                            }
                        },
                    ]
                },
                {
                    id: "tabs",
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => this.renderTabs(),
                            },
                        }
                    ],
                },
                {
                    id: "projects",
                    // title: "Projects and Studies",
                    // description: "This is the list of projects and studies that you have access.",
                    display: {
                        visible: () => this.currentTab === "projects",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => this.renderTitle("h2", "archive", "Projects and Studies"),
                            },
                        },
                        ...projectsElements,
                    ],
                },
                {
                    id: "change-password",
                    // title: "Change password",
                    // description: "Here you can change your password. Make sure it has at least 8 characters.",
                    display: {
                        visible: () => this.currentTab === "change-password",
                    },
                    elements: [
                        {
                            type: "custom",
                            display: {
                                render: () => this.renderTitle("h2", "user-shield", "Change password"),
                            },
                        },
                        {
                            title: "Current password",
                            type: "input-password",
                            field: "oldPassword",
                            defaultValue: "",
                            validation: {
                                validate: () => !!this.updateParams.oldPassword,
                                message: "Please enter your existing password.",
                            },
                        },
                        {
                            title: "New password",
                            type: "input-password",
                            field: "newPassword",
                            defaultValue: "",
                            validation: {
                                validate: () => !!this.updateParams.newPassword,
                                message: "Your new password can not be empty.",
                            },
                        },
                        {
                            title: "Confirm new password",
                            type: "input-password",
                            field: "confirmNewPassword",
                            defaultValue: "",
                            validation: {
                                validate: () => {
                                    return !!this.updateParams.confirmNewPassword && this.updateParams.confirmNewPassword === this.updateParams.newPassword;
                                },
                                message: "New passwords do not match.",
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-profile", UserProfile);
