import {LitElement, html} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";


export default class UserPasswordReset extends LitElement {

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
                type: Object,
            },
            opencgaSession: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._user = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            titleStyle: "color: var(--main-bg-color);margin-bottom:16px;font-weight:bold;",
            defaultLayout: "horizontal",
            buttonOkText: "Reset password",
        };
        this._config = this.getDefaultConfig();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    #initOriginalObjects() {
        this._config = this.getDefaultConfig();
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig") || changedProperties.has("user")) {
            this.displayConfig = {
                ...this.displayConfigDefault,
                ...this.displayConfig
            };
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    /*
        onSubmit(e) {
            e.preventDefault();
            const user = (this.querySelector("#user").value || "").trim();

            // Check for empty user ID
            this.hasEmptyUser = user.length === 0;
            if (this.hasEmptyUser) {
                return this.requestUpdate();
            }

            // Reset password mockup
            // TODO: call openCGA to the correct endpoint
            Promise.resolve().then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    "message": "We have just send you an email with the new password.",
                });

                this.querySelector("#user").value = "";
                this.hasEmptyUser = false;
                this.requestUpdate();
            });
        }
    */

    onSubmit() {
        // QUESTION:
        //  - TASK-1667, includeResult
        //  - JS client do not have argument for params, only user
        const data = {
            includeResult: true,
        };
        let error;
        this.#setLoading(true);
        //  Reset password
        // Fixme: waiting for task:
        //  https://app.clickup.com/t/36631768/TASK-464
        //  Check endpoint when released
        this.opencgaSession.opencgaClient.users()
            .resetPassword(this.user.id)
            .then(response => {
                this._user = UtilsNew.objectClone(response.responses[0].results[0]);
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `User Reset Password`,
                    message: `User ${this.userId} password reset correctly`,
                });
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "userUpdate", this._user, {}, error);
                this.#setLoading(false);
            });

    }

    render() {
        // TODO: check if opencgaSession has been provided
        debugger
        return html`
            <data-form
                .data="${this.user}"
                .config="${this._config}"
                @submit="${() => this.onSubmit()}"
                @clear="${() => this.onClear()}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            title: "Reset Password",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: `Do you really want to reset ${this.user?.id}'s password?`,
                    elements: [
                        {
                            type: "notification",
                            text: `${this.user?.id} will receive an email with a temporary password... [ TO ELABORATE ]`,
                            display: {
                                visible: true,
                                icon: "fas fa-exclamation-triangle",
                                notificationType: "error",
                            },
                        },
                        {
                            title: "User ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                disabled: true,
                            }
                        },
                        {
                            title: "Email",
                            field: "email",
                            type: "input-text",
                            display: {
                                disabled: true,
                            }
                        },
                    ],
                },
            ],
        };
    }


}

customElements.define("user-password-reset", UserPasswordReset);
