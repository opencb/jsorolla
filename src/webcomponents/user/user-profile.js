import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
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
        this.config = this.getDefaultConfig();
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
                                .config="${this.config}">
                            </data-form>
                        </div>
                    </div>
                </div>
            </div>
        `;

    }

    getDefaultConfig() {
        return {
            icon: "",
            display: {
                buttonOkText: "Change password",
            },
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
                    elements: [],
                },
                {
                    title: "Change password",
                    // description: "Here you can change your password. Make sure it has at least 8 characters.",
                    elements: [
                        {
                            title: "Old password",
                            type: "input-text",
                            defaultValue: "",
                            required: true,
                        },
                        {
                            title: "New password",
                            type: "input-text",
                            defaultValue: "",
                            required: true,
                        },
                        {
                            title: "Confirm new password",
                            type: "input-text",
                            defaultValue: "",
                            required: true,
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("user-profile", UserProfile);
