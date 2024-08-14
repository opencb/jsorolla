import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
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
            user: {
                type: Object
            },
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    render() {
        return html`
            <data-form
                .data="${this.user}"
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
                            type: "text",
                            text: "User Info",
                            display: {
                                icon: "user",
                                textClassName: "h3",
                                textStyle: "color: var(--main-bg-color);margin-bottom:24px;font-weight:bold;",
                            },
                        },
                        {
                            title: "id",
                            field: "id"
                        },
                        {
                            title: "Name",
                            field: "name"
                        },
                        {
                            title: "Email",
                            field: "email",
                        },
                        {
                            title: "Organization",
                            field: "organization",
                            display: {
                                defaultValue: "-",
                            },
                        },
                        {
                            title: "Member since",
                            field: "account.creationDate",
                            display: {
                                defaultValue: "Not provided",
                                format: date => UtilsNew.dateFormatter(date)
                            }
                        },
                        {
                            title: "Synced from",
                            field: "account.authentication",
                            // CAUTION 20240229 VERO: bug in visible function:
                            //  the argument authentication is the entire data model, not the field account.authentication
                            display: {
                                visible: authentication => authentication.id === "internal",
                                format: authentication => authentication.id,
                            }
                        }
                    ]
                },
            ],
        };
    }

}

customElements.define("user-info", UserInfo);
