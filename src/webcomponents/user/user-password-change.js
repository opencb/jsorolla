import {LitElement, html} from "lit";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";
import LitUtils from "../commons/utils/lit-utils";
import UtilsNew from "../../core/utils-new";

export default class UserPasswordChange extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            userId: {
                type: String,
            },
            opencgaSession: {
                type: Object
            },
            organizationId: {
                type: String,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._password = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            titleStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
            defaultLayout: "horizontal",
            buttonOkText: "Change password",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #initOriginalObjects() {
        this._password = {};
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e) {
        this._password = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onSubmit() {
        const params = {
            user: this.userId,
            password: this._password.oldPassword,
            newPassword: this._password.newPassword,
            organizationId: this.organizationId,
        };
        let error;
        this.#setLoading(true);
        this.opencgaSession.opencgaClient.users()
            .password(params)
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "Your password has been changed",
                });
                LitUtils.dispatchCustomEvent(this, "userUpdate");
                this.#initOriginalObjects();
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(() => {
                this.#setLoading(false);
            });
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear password",
            message: "Are you sure to clear?",
            ok: () => this.#initOriginalObjects(),
        });
    }

    render() {
        // TODO: check if opencgaSession has been provided
        return html`
            <data-form
                .data="${this._password}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${() => this.onSubmit()}"
                @clear="${() => this.onClear()}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            // icon: "",
            // display: {
            //     buttonOkText: "Change password",
            // },
            // // validation: {
            // //     validate: () => this.updateParams.newPassword === this.updateParams.confirmNewPassword,
            // //     message: "New passwords do not match",
            // // },
            title: "Change Password",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    // title: "Change password",
                    // description: "Here you can change your password. Make sure it has at least 8 characters.",
                    elements: [
                        // {
                        //     type: "text",
                        //     text: "Change password",
                        //     display: {
                        //         icon: "user-shield",
                        //         textClassName: "h2",
                        //         textStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
                        //     },
                        // },
                        // {
                        //     type: "text",
                        //     text: `
                        //         Here you can change your password. We recommend that your new password has at least
                        //         8 characters long and uses uppercase and lowercase letters and numbers.
                        //     `,
                        //     display: {
                        //         textStyle: "margin-bottom:16px;",
                        //     },
                        // },
                        {
                            title: "Current password",
                            type: "input-password",
                            field: "oldPassword",
                            defaultValue: "",
                            validation: {
                                validate: () => !!this._password.oldPassword,
                                message: "Please enter your existing password.",
                            },
                        },
                        {
                            title: "New password",
                            type: "input-password",
                            field: "newPassword",
                            defaultValue: "",
                            validation: {
                                validate: () => !!this._password.newPassword,
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
                                    return !!this._password.confirmNewPassword && this._password.confirmNewPassword === this._password.newPassword;
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

customElements.define("user-password-change", UserPasswordChange);
