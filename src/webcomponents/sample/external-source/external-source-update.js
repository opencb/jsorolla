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
import UtilsNew from "../../../core/utils-new.js";
import LitUtils from "../../commons/utils/lit-utils.js";
import FormUtils from "../../commons/forms/form-utils.js";
import Types from "../../commons/types.js";

export default class ExternalSourceUpdate extends LitElement {

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
            displayConfig: {
                type: Object
            }
        };
    }

    #init() {
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
        /*
        if (changedProperties.has("source")) {
        *     console.log("update...", this);
        *     this.sourceObserver();
        * }
        */

        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    firstUpdated(_changedProperties) {
        // Child it's not necessary
        if (_changedProperties.has("source")) {
            this.sourceObserver();
        }
    }

    sourceObserver() {
        if (this.source) {
            this._source = UtilsNew.objectClone(this.source);
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
        // No need to switch(field) since all of them are processed in the same way
        this.updateParams = FormUtils.updateScalar(
            this._source,
            this.source,
            this.updateParams,
            e.detail.param,
            e.detail.value);

        LitUtils.dispatchCustomEvent(this, "fieldChange", this.updateParams, null, null, {bubbles: false, composed: true});
    }

    onSendSource(e) {
        // Send the source to the upper component
        e.stopPropagation();
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "updateItem", this.source);
    }

    onClear(e) {
        e.stopPropagation();
        this.source = JSON.parse(JSON.stringify(this._source));
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data=${this.source}
                .config="${this._config}"
                .updateParams=${this.updateParams}
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendSource(e)}">
            </data-form>
    `;
    }

    getDefaultConfig() {
        return Types.dataFormConfig({
            display: this.displayConfig || this.displayConfigDefault,
            sections: [
                {
                    elements: [
                        {
                            name: "ID",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "add short id",
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "add a name"
                            }
                        },
                        {
                            name: "Source",
                            field: "source",
                            type: "input-text",
                            display: {
                                placeholder: "add a source"
                            }
                        },
                        {
                            name: "Url",
                            field: "url",
                            type: "input-text",
                            display: {
                                placeholder: "add a url"
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

customElements.define("external-source-update", ExternalSourceUpdate);
