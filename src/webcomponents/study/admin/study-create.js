/**
 * Copyright 2015-2022 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {html, LitElement} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import NotificationUtils from "../../commons/utils/notification-utils.js";
import Types from "../../commons/types.js";
import UtilsNew from "../../../core/utils-new";

export default class StudyCreate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            project: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            },
            displayConfig: {
                type: Object
            },
        };
    }

    #init() {
        this.isLoading = false;
        this.displayConfigDefault = {
            style: "margin: 10px",
            titleWidth: 3,
            defaultLayout: "horizontal",
            buttonOkText: "Create"
        };
        this._config = this.getDefaultConfig();

        this.dataFormParams = {
            expectedSamples: 1000,
            expectedFiles: 1000,
            fileType: "EXOME",
        };
    }

    #setLoading(value) {
        this.isLoading = value;
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

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        switch (param) {
            case "id":
            case "name":
            case "description":
            case "expectedSamples":
            case "expectedFiles":
            case "fileType":
                this.dataFormParams = {
                    ...FormUtils.createObject(
                        this.dataFormParams,
                        param,
                        e.detail.value
                    )
                };
                break;
        }
        this.requestUpdate();
    }

    onClear() {
        const resetForm = () => {
            this.dataFormParams = {
                expectedSamples: 1000,
                expectedFiles: 1000,
                fileType: "EXOME",
            };
            this._config = this.getDefaultConfig();
            this.requestUpdate();
        };
        if (!this.displayConfig?.modal) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
                title: "Clear Study",
                message: "Are you sure to clear?",
                ok: () => {
                    resetForm();
                },
            });
        } else {
            LitUtils.dispatchCustomEvent(this, "clearStudy");
            resetForm();
        }
    }

    async onSubmit() {
        let study, error;
        this.#setLoading(true);

        // 1. Create the study
        const studyCreateParams = {
            id: this.dataFormParams.id,
            name: this.dataFormParams.name,
            description: this.dataFormParams.description,
        };
        await this.opencgaSession.opencgaClient.studies()
            .create(studyCreateParams, {project: this.project.fqn})
            .then(() => {
                // this.dataFormParams = {};
                // this._config = this.getDefaultConfig();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Study Create",
                    message: "New study created correctly"
                });
                LitUtils.dispatchCustomEvent(this, "studyCreate", {}, {});
                LitUtils.dispatchCustomEvent(this, "sessionUpdateRequest", {}, {});
            })
            .catch(reason => {
                study = this.dataFormParams;
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            })
            .finally(()=>{
                this.#setLoading(false);
            });

        // 2. Proceed to variant setup
        // If study creation failed, do not proceed to variant setup
        if (error) {
            return;
        }

        const toolParams = {
            expectedSamples: this.dataFormParams.expectedSamples,
            expectedFiles: this.dataFormParams.expectedFiles,
            fileType: this.dataFormParams.fileType,
        };
        const newStudyFqn = `${this.project.fqn}:${this.dataFormParams.id}`;
        await this.opencgaSession.opencgaClient.variantOperations()
            .setupVariant(toolParams, {study: newStudyFqn, jobId: `variant-setup-${UtilsNew.getDatetime()}`})
            .then(() => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    title: "Variant Setup",
                    message: "Variant setup operation executed correctly"
                });
            })
            .catch(reason => {
                study = this.dataFormParams;
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
            });

        // 3. Initialise objects in the study
        this.dataFormParams = {};
        this._config = this.getDefaultConfig();
    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        return html`
            <data-form
                .data="${this.dataFormParams}"
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${e => this.onClear(e)}"
                @submit="${e => this.onSubmit(e)}">
            </data-form>`;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            type: "form",
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    title: "Study Information",
                    description: "Provide the basic information to create a new study.",
                    elements: [
                        {
                            name: "Study ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Study ID...",
                                helpMessage: "Add a short identifier for the study (no spaces, no special characters)...",
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Study name...",
                                helpMessage: "Add a human readable name for the study",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Study description...",
                                helpMessage: "Add a brief description for the study",
                            }
                        },
                    ]
                },
                {
                    title: "Variant Setup Configuration",
                    description: "Configure the initial parameters for variant storage setup.",
                    elements: [
                        {
                            title: "Expected Samples",
                            field: "expectedSamples",
                            type: "input-num",
                            display: {
                                // defaultValue: 1000,
                                helpMessage: "Expected number of samples in the study"
                            }
                        },
                        {
                            title: "Expected Files",
                            field: "expectedFiles",
                            type: "input-num",
                            display: {
                                // defaultValue: 1000,
                                helpMessage: "Expected number of files in the study"
                            }
                        },
                        {
                            title: "File Type",
                            field: "fileType",
                            type: "select",
                            allowedValues: ["GENOME_VCF", "GENOME_gVCF", "EXOME"],
                            defaultValue: "EXOME",
                            display: {
                                helpMessage: "Most common type of VCF file"
                            }
                        },
                    ],
                }
            ]
        });
    }

}

customElements.define("study-create", StudyCreate);
