import {html, LitElement, nothing} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/forms/data-form.js";
import "../commons/content-editor.js";

export default class FileEditor extends LitElement {

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
                type: Object,
            },
            path: {
                type: String,
            },
            config: {
                type: Object,
            },
        };
    }

    #init() {
        this._error = null;
        this._content = null;
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("path") || changedProperties.has("opencgaSession")) {
            this.pathObserver();
        }
        if (changedProperties.has("config")) {
            this._config = {
                ...this.getDefaultConfig(),
                ...this.config,
            };
        }
        super.update(changedProperties);
    }

    async pathObserver() {
        this._error = null;
        this._content = null;
        if (this.path && this.opencgaSession) {
            try {
                const filePath = this.path.indexOf(":") > 0 ? this.path.replaceAll(":", "/") : this.path;
                // 1. check if there is a file in the current study with that path
                const fileResponse = await this.opencgaSession.opencgaClient.files()
                    .search({
                        study: this.opencgaSession.study.fqn,
                        path: filePath,
                        type: "FILE",
                        include: "id",
                    });
                const files = fileResponse?.responses?.[0]?.results || [];
                // 2.1. if there is no file in the current study, throw an error
                if (files.length === 0) {
                    throw new Error(`File with path '${filePath}' not found in current study '${this.opencgaSession.study.fqn}'.`);
                }
                // 2.2. if there is more than one file in the current study, throw an error
                if (files.length > 1) {
                    throw new Error(`More than one file with path '${filePath}' found in current study '${this.opencgaSession.study.fqn}'.`);
                }
                // 3. if there is exactly one file in the current study, get its content
                const fileContent = await this.opencgaSession.opencgaClient.files()
                    .download(files[0].id, {
                        study: this.opencgaSession.study.fqn,
                    });
                this._content = fileContent;
                this.requestUpdate();
            } catch (error) {
                console.error(error);
                this._error = error?.message || `Error fetching content of file '${this.path}'.`;
                this.requestUpdate();
            }
        }
    }

    getLanguageFromFilePath() {
        let language = "";
        if (this.path) {
            const extension = this.path.split(".").pop();
            switch (extension) {
                case "js":
                case "json":
                    language = "javascript";
                    break;
            }
        }
        return language;
    }

    // onFieldChange(e) {
    //     this._file = {...e.detail.data}; // force to refresh the object-list
    //     this.requestUpdate();
    // }

    // onClear() {
    //     NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
    //         title: "Discard Changes",
    //         message: "This will discard all changes and restore the origial content of the file. Do you want to continue?",
    //         ok: () => {
    //             this._file = {
    //                 content: this._fileOriginalContent,
    //             };
    //             this.requestUpdate();
    //         },
    //     });
    // }

    // onSubmit() {
    //     this.opencgaSession.opencgaClient.files()
    //         .updateContent(this.file.id, this._file, {
    //             study: this.opencgaSession.study.fqn,
    //         })
    //         .then(() => {
    //             NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
    //                 message: `File content updated.`,
    //             });
    //             LitUtils.dispatchCustomEvent(this, "fileContentUpdate", null, null);
    //         })
    //         .catch(error => {
    //             NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
    //         });
    // }

    render() {
        if (typeof this._content !== "string" && !this._error) {
            return nothing;
        }

        return html`
            <content-editor
                class="d-block"
                style="height:640px;"
                .content="${this._content}"
                .config="${{
                    language: this.getLanguageFromFilePath(),
                }}">
            </content-editor>
        `;
    }

    getDefaultConfig() {
        return {};
    }
}

customElements.define("file-editor", FileEditor);
