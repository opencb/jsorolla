import {html, LitElement} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";

export default class FileContentUpdate extends LitElement {

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
            file: {
                type: Object,
            },
            fileId: {
                type: String,
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this._file = {};
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("file")) {
            this.fileObserver();
        }
        if (changedProperties.has("displayConfig")) {
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    fileObserver() {
        this._file = {};
        if (this.file && this.opencgaSession) {
            this.opencgaSession.opencgaClient.files()
                .download(file.id, {
                    study: this.opencgaSession.study.fqn,
                })
                .then(fileContent => {
                    this._file = {
                        content: fileContent,
                    };
                    this._config = this.getDefaultConfig();
                    this.requestUpdate();
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    onFieldChange(e) {
        this._file = {...e.detail.data}; // force to refresh the object-list
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Clear File Content",
            message: "This will clear the content of the file. Do you want to continue?",
            ok: () => {
                this._file = {};
                this.requestUpdate();
            },
        });
    }

    onSubmit() {
        this.opencgaSession.opencgaClient.files()
            .updateContent(this.file.id, this._file, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `File content updated.`,
                });
                LitUtils.dispatchCustomEvent(this, "fileContentUpdate", null, data);
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
    }

    render() {
        return html`
            <data-form
                .data="${this._file}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            display: {
                ...this.displayConfigDefault,
                ...this.displayConfig,
            },
            sections: [
                {
                    elements: [
                        {
                            title: "Content",
                            field: "content",
                            type: "input-text",
                            required: true,
                            display: {
                                rows: 20,
                                help: {
                                    text: "Content of the file. Maximum size is 5MB.",
                                },
                            }
                        },
                    ],
                },
            ],
        };
    }
}

customElements.define("file-content-update", FileContentUpdate);
