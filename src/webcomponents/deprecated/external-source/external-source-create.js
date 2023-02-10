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

import {LitElement, html} from "lit";
import LitUtils from "../../commons/utils/lit-utils.js";
import Types from "../../commons/types.js";
import FormUtils from "../../commons/forms/form-utils.js";

export default class ExternalSourceCreate extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            source: {
                type: Object
            },
            mode: {
                type: String,
            },
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
        this.mode = "";
        this.displayConfigDefault = {
            buttonsAlign: "right",
            buttonClearText: "Clear",
            buttonOkText: "Create Source",
            titleVisible: false,
            titleWidth: 4,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    onFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        this.source = {
            ...FormUtils.createObject(
                this.source,
                param,
                e.detail.value
            )};
        LitUtils.dispatchCustomEvent(this, "fieldChange", this.source);
    }

    // Submit to upper component.
    onSendSource(e) {
        // Avoid others onSubmit...ex. sample-create::onSubmit
        e.stopPropagation();
        // Send the source to the upper component
        LitUtils.dispatchCustomEvent(this, "addItem", this.source);
    }

    onClearForm(e) {
        e.stopPropagation();
        this.source = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.source}
                .config="${this._config}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendSource(e)}">
            </data-form>
        `;
    }


    getDefaultConfig() {
        return Types.dataFormConfig({
            type: this.mode,
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            name: "ID",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add short id...",
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Add a name..."
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "Add a source..."
                            }
                        },
                        {
                            name: "url",
                            field: "url",
                            type: "input-text",
                            display: {
                                placeholder: "Add a url..."
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Add a description..."
                            }
                        },
                    ]
                }
            ]
        });
    }

}

customElements.define("external-source-create", ExternalSourceCreate);
