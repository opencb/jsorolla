import {html, LitElement, nothing} from "lit";
import {keyed} from "lit/directives/keyed.js";
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
        this._version = 0;
        this._content = null;
        this._originalContent = null;
        this._fileId = null;
        this._settings = {
            theme: "dark",
            autoSave: true,
        };
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
        this._originalContent = null;
        this._version = 0; // reset the editing version
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
                this._fileId = files[0].id; // needed for saving the content
                this._originalContent = fileContent; // needed for discarding changes and restoring original content
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

    getClassForSettingsButton() {
        // TODO: use the isDarkTheme property from the selected theme to determine the class
        return this._settings.theme.includes("dark") ? "border-gray-500 text-white" : "border-gray-200 text-gray-900";
    }

    saveFileContent() {
        const data = {
            content: this._content || "",
        };
        return this.opencgaSession.opencgaClient.files()
            .updateContent(this._fileId, data, {
                study: this.opencgaSession.study.fqn,
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
    }

    onThemeChange(event) {
        this._settings.theme = event?.target?.value;
        this._version = this._version + 1; // force to refresh the editor
        this.requestUpdate();
    }

    onDiscardClick() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard Changes",
            message: "This will discard all changes and restore the origial content of the file. Do you want to continue?",
            ok: () => {
                this._content = this._originalContent;
                this._version = this._version + 1; // force to refresh the editor
                LitUtils.dispatchCustomEvent(this, "fileContentDiscard", null, {content: this._content});
                this.requestUpdate();
            },
        });
    }

    onSaveClick() {
        this.saveFileContent().then(() => {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                message: `File content saved.`,
            });
            LitUtils.dispatchCustomEvent(this, "fileContentSave", null, {content: this._content});
        });
    }

    onSaveAndCloseClick() {
    }

    render() {
        if (!this.path || !this.opencgaSession) {
            return nothing;
        }

        return html`
            <div class="">
                ${this._error ? html`
                    <div class="alert alert-danger d-flex align-items-center gap-2">
                        <i class="fas fa-exclamation-triangle"></i>
                        <div>${this._error}</div>
                    </div>
                ` : nothing}
                ${typeof this._content === "string" ? html`
                    <div class="position-relative w-full">
                        ${keyed(this.path + ":" + this._version, html`
                            <content-editor
                                class="d-block"
                                style="height:640px;"
                                .content="${this._content}"
                                .config="${{
                                    language: this.getLanguageFromFilePath(),
                                    theme: this._settings.theme,
                                }}">
                            </content-editor>
                        `)}
                        ${this._config.showSettings ? html`
                            <div class="position-absolute" style="top:10px; right:10px;">
                                <div class="dropdown">
                                    <button class="bg-transparent border border-1 rounded-3 p-2 d-flex ${this.getClassForSettingsButton()}" data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        <i class="fas fa-cog fs-4"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-end">
                                        <div class="p-1">
                                            <label for="themeSelect" class="form-label mb-1 fw-bold">Theme</label>
                                            <select id="themeSelect" class="form-select form-select-sm" @change="${event => this.onThemeChange(event)}">
                                                ${this._config.allowedThemes.map(theme => html`
                                                    <option value="${theme.id}" ?selected="${this._settings.theme === theme.id}">
                                                        ${theme.name}
                                                    </option>
                                                `)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : nothing}
                    </div>
                    ${this._config.showButtons ? html`
                        <div class="mt-3 d-flex justify-content-end align-items-center gap-2">
                            ${this._config.showDiscardButton ? html`
                                <button class="btn btn-light d-flex align-items-center gap-2" @click="${() => this.onDiscardClick()}">
                                    <i class="fas fa-undo-alt"></i> 
                                    <span>Discard Changes</span>
                                </button>
                            ` : nothing}
                            ${this._config.showSaveButton ? html`
                                <button type="button" class="btn btn-primary d-flex align-items-center gap-2" @click="${() => this.onSaveClick()}">
                                    <i class="fas fa-save"></i> 
                                    <span>Save Changes</span>
                                </button>
                            ` : nothing}
                        </div>
                    ` : nothing}
                ` : nothing}
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            showButtons: true,
            showSaveButton: true,
            showSaveAndCloseButton: false,
            showDiscardButton: true,
            showSettings: true,
            allowedThemes: [
                {id: "dark", name: "Dark", isDarkTheme: true},
                {id: "light", name: "Light", isDarkTheme: false},
            ],
        };
    }
}

customElements.define("file-editor", FileEditor);
