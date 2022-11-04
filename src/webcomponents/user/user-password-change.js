import {LitElement, html} from "lit";
import UtilsNew from "../../core/utils-new.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";

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
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this.updateParams = {};
        this.config = this.getDefaultConfig();
    }

    onFieldChange(e) {
        this.updateParams[e.detail.param] = e.detail.value;
        this.updateParams = {...this.updateParams};
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
            <data-form
                .data="${this.updateParams}"
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @submit="${() => this.onSubmit()}"
                @clear="${() => this.onClear()}">
            </data-form>
        `;
    }

    getDefaultConfig() {
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
                    // title: "Change password",
                    // description: "Here you can change your password. Make sure it has at least 8 characters.",
                    elements: [
                        {
                            type: "text",
                            text: "Change password",
                            display: {
                                icon: "user-shield",
                                textClassName: "h2",
                                textStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
                            },
                        },
                        {
                            type: "text",
                            text: `
                                Here you can change your password. We recommend that your new password has at least
                                8 characters long and uses uppercase and lowercase letters and numbers.
                            `,
                            display: {
                                textStyle: "margin-bottom:16px;",
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

customElements.define("user-password-change", UserPasswordChange);
