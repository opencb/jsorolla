import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import "../commons/forms/data-form.js";

export default class UserInfo extends LitElement {

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
            <data-form
                .data="${this.opencgaSession}"
                .config="${this.config}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            icon: "",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    // title: "General Info",
                    elements: [
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
            ],
        };
    }

}

customElements.define("user-info", UserInfo);
