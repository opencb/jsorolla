import {LitElement, html, nothing} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import UtilsNew from "../../core/utils-new.js";

export default class UserStatusUpdate extends LitElement {

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
            status: {
                type: String,
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
        this._statusDisplay = {
            "SUSPENDED": {
                action: "SUSPEND",
                result: "suspended",
                effects: [
                    "User will not be able to login",
                ],
            },
            "READY": {
                action: "ACTIVATE",
                result: "activated",
                effects: [
                    "User will be able to login",
                ],
            },
        };
        this._currentStatusDisplay = {};
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
        if (changedProperties.has("status")) {
            debugger
            this._currentStatusDisplay = this._statusDisplay[this.status];
        }
        super.update(changedProperties);
    }

    onSubmit() {
        // QUESTION:
        //  - TASK-1667, includeResult
        //  - JS client do not have argument for params, only user
        const params = {
            includeResult: true,
        };
        const updateParams = {
            status: "SUSPENDED",
        };

        let error;
        this.#setLoading(true);
        //  Reset password
        // Fixme: waiting for task:
        //  https://app.clickup.com/t/36631768/TASK-464
        //  Check endpoint when released
        this.opencgaSession.opencgaClient.organization()
            .userUpdateStatus(this.user.id)
            .then(response => {
                this._user = UtilsNew.objectClone(response.responses[0].results[0]);
                this.#initOriginalObjects();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: `Status user`,
                    message: `User ${this.userId} has been ${this._currentStatusDisplay.result} correctly`,
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
            title: "User Status Update",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: `Do you really want to ${this._currentStatusDisplay.action} user ${this.user?.id}?`,
                    elements: [
                        {
                            type: "notification",
                            text: `
                                [ ELABORATE ]${this._currentStatusDisplay.action} ${this.user?.id} will have the following effects:
                                ${this._currentStatusDisplay.effects}
                            `,
                            display: {
                                visible: true,
                                icon: "fas fa-exclamation-triangle",
                                notificationType: "warning",
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
                    ],
                },
            ],
        };
    }


}

customElements.define("user-status-update", UserStatusUpdate);
