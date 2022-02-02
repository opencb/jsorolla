import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import OpencgaCatalogUtils from "../../core/clients/opencga/opencga-catalog-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/tool-header.js";
import "../commons/forms/data-form.js";

export default class UserProfile extends LitElement {

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

    render() {
        // TODO: check if opencgaSession has been provided
        return html`
            <div>
                <tool-header title="Your profile" icon="fa fa-user-circle"></tool-header>
                <div class="container">
                    <div class="row">
                        <div class="col-md-12">
                            <data-form
                                .data="${this.opencgaSession}"
                                .config="${this.config}"
                                @fieldChange="${e => this.onFieldChange(e)}"
                                @submit="${() => this.onSubmit()}"
                                @clear="${() => this.onClear()}">
                            </data-form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        const projectsElements = [];
        Object.keys(this.projectsByUser).forEach(owner => {
            projectsElements.push({
                type: "text",
                text: owner,
                display: {
                    textClassName: "h3",
                },
            });

            // Register projects info
            if (this.projectsByUser[owner].length === 0) {
                // This user do not have any projects created
                projectsElements.push({
                    type: "custom",
                    display: {
                        render: () => html`
                            <div class="alert alert-warning">You do not have any personal project.</div>
                        `,
                    },
                });
            } else {
                // Generate a table with all projects of this user
                projectsElements.push({
                    type: "table",
                    defaultValue: this.projectsByUser[owner],
                    display: {
                        columns: [
                            {
                                title: "ID",
                                field: "id"
                            },
                            {
                                title: "Name",
                                field: "name"
                            },
                            {
                                title: "Description",
                                field: "description",
                                defaultValue: "-",
                            },
                            {
                                title: "Studies",
                                field: "studies",
                                type: "custom",
                                display: {
                                    render: studies => {
                                        return UtilsNew.renderHTML(`${studies.map(study => study.name).join("<br>")}`);
                                    }
                                }
                            }
                        ],
                        defaultLayout: "vertical",
                    },
                });
            }
        });
        return {
            icon: "",
            display: {
                buttonOkText: "Change password",
            },
            // validation: {
            //     validate: () => this.updateParams.newPassword === this.updateParams.confirmNewPassword,
            //     message: "New passwords do not match",
            // },
            sections: [
                {
                    title: "General Info",
                    elements: [
                        {
                            name: "id",
                            field: "user.id"
                        },
                        {
                            name: "Name",
                            field: "user.name"
                        },
                        {
                            name: "Organization",
                            field: "user.organization",
                            defaultValue: "-",
                        },
                        {
                            name: "Account type",
                            field: "user.account.type"
                        },
                        {
                            name: "Status",
                            field: "user.internal.status",
                            type: "custom",
                            display: {
                                render: field => `${field?.name} (${UtilsNew.dateFormatter(field?.date)})`
                            }
                        },
                        {
                            name: "Data release",
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
                    title: "Projects and Studies",
                    description: "This is the list of projects and studies that you have access.",
                    elements: projectsElements,
                },
                {
                    title: "Change password",
                    // description: "Here you can change your password. Make sure it has at least 8 characters.",
                    elements: [
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
