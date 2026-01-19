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
        this._fileId = null;
        this._version = 0;

        // the currentContent variable holds the content being edited in the editor
        // the originalContent variable holds the content last saved to the server
        this._currentContent = null;
        this._originalContent = null;

        this._config = this.getDefaultConfig();
        this._settings = {
            theme: this._config.allowedThemes[0].id,
            language: "",
        };
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
            // if the current theme is not in the list of allowed themes, set it to the first one
            if (!this._config.allowedThemes.find(theme => theme.id === this._settings.theme)) {
                this._settings.theme = this._config.allowedThemes[0].id;
            }
        }

        super.update(changedProperties);
    }

    async pathObserver() {
        this._error = null;
        this._currentContent = null;
        this._originalContent = null;
        this._version = 0; // reset the editing version
        this._fileId = null;

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
                
                // 2. get the list of files in the current study with that path
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
                this._currentContent = fileContent;
                
                // 4. extract the language from the file path
                this._settings.language = this.getLanguageFromFilePath();

            } catch (error) {
                console.error(error);
                this._error = error?.message || `Error fetching content of file '${this.path}'.`;
            }
            this.requestUpdate();
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
                case "md":
                    language = "markdown";
                    break;
            }
        }
        return language;
    }

    getClassForSettingsButton() {
        // TODO: use the isDarkTheme property from the selected theme to determine the class
        return this._settings.theme.includes("dark") ? "border-gray-500 text-white bg-gray-900" : "border-gray-200 text-gray-900 bg-white";
    }

    onThemeChange(event) {
        this._settings.theme = event?.target?.value;
        this._version = this._version + 1; // force to refresh the editor
        this.requestUpdate();
    }

    onLanguageChange(event) {
        this._settings.language = event?.target?.value;
        this._version = this._version + 1; // force to refresh the editor
        this.requestUpdate();
    }

    onContentChange(event) {
        this._currentContent = event?.detail?.value || "";
        LitUtils.dispatchCustomEvent(this, "fileContentChange", this._currentContent);
    }

    onDiscardClick() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard Changes",
            message: "This will discard all changes and restore the original content of the file. Do you want to continue?",
            ok: () => {
                this._currentContent = this._originalContent;
                this._version = this._version + 1; // force to refresh the editor
                LitUtils.dispatchCustomEvent(this, "fileContentDiscard", this._currentContent);
                this.requestUpdate();
            },
        });
    }

    onSaveClick() {
        const data = {
            content: this._currentContent || "",
        };
        return this.opencgaSession.opencgaClient.files()
            .updateContent(this._fileId, data, {
                study: this.opencgaSession.study.fqn,
            })
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: `File content saved.`,
                });
                LitUtils.dispatchCustomEvent(this, "fileContentSave", this._currentContent);
                // we have to update the saved content to avoid issues when discarding changes
                // as the content in the editor is the same as the saved content
                this._originalContent = this._currentContent;
            })
            .catch(error => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });
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
                ${typeof this._currentContent === "string" ? html`
                    <div class="position-relative w-full">
                        ${this._config.showSettings ? html`
                            <div class="position-absolute" style="top:10px; right:10px;">
                                <div class="dropdown">
                                    <div data-bs-toggle="dropdown" data-bs-auto-close="outside">
                                        <button class="border border-1 rounded-3 p-2 ${this.getClassForSettingsButton()} d-flex">
                                            <i class="fas fa-cog fs-4"></i>
                                        </button>
                                    </div>
                                    <div class="dropdown-menu dropdown-menu-end px-2 py-3">
                                        <div class="d-flex flex-column gap-2 px-1" style="min-width:160px;">
                                            ${this._config.showLanguageSelector ? html`
                                                <div class="p-0">
                                                    <label for="languageSelect" class="form-label mb-1 fw-bold">Language</label>
                                                    <select id="languageSelect" class="form-select" @change="${event => this.onLanguageChange(event)}">
                                                        ${this._config.allowedLanguages.map(lang => html`
                                                            <option value="${lang.id}" ?selected="${this._settings.language === lang.id}">
                                                                ${lang.name}
                                                            </option>
                                                        `)}
                                                    </select>
                                                </div>
                                            ` : nothing}
                                            ${this._config.showThemeSelector ? html`
                                                <div class="p-0">
                                                    <label for="themeSelect" class="form-label mb-1 fw-bold">Theme</label>
                                                    <select id="themeSelect" class="form-select" @change="${event => this.onThemeChange(event)}">
                                                        ${this._config.allowedThemes.map(theme => html`
                                                            <option value="${theme.id}" ?selected="${this._settings.theme === theme.id}">
                                                                ${theme.name}
                                                            </option>
                                                        `)}
                                                    </select>
                                                </div>
                                            ` : nothing}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ` : nothing}
                        ${keyed(this.path + ":" + this._version, html`
                            <content-editor
                                class="${this._config.editorClassName}"
                                style="${this._config.editorStyle}"
                                .content="${this._currentContent}"
                                .config="${{
                                    parentClassName: "w-full h-full overflow-hidden rounded-3 border border-1 border-gray-200",
                                    language: this._settings.language,
                                    theme: this._settings.theme,
                                }}"
                                @contentChange="${event => this.onContentChange(event)}">
                            </content-editor>
                        `)}
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
                                    <span>Save</span>
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
            showDiscardButton: true,
            showSettings: true,
            showLanguageSelector: true,
            showThemeSelector: true,
            editorClassName: "d-block",
            editorStyle: "height:640px;",
            allowedThemes: [
                {id: "one-dark", name: "Dark", isDarkTheme: true},
                {id: "one-light", name: "Light", isDarkTheme: false},
            ],
            allowedLanguages: [
                {id: "", name: "Plain Text"},
                {id: "javascript", name: "JavaScript"},
                {id: "json", name: "JSON"},
                {id: "markdown", name: "Markdown"},
            ],
        };
    }
}

customElements.define("file-editor", FileEditor);
