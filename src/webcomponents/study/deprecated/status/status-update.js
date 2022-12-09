/**
 * Copyright 2015-2021 OpenCB
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
import UtilsNew from "../../../../core/utils-new.js";
import LitUtils from "../../../commons/utils/lit-utils.js";
import FormUtils from "../../../commons/forms/form-utils.js";
import Types from "../../../commons/types.js";

export default class StatusUpdate extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            status: {
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
            buttonOkText: "Create Status",
            titleVisible: false,
            titleWidth: 4,
            defaultLayout: "horizontal",
        };
        this._config = this.getDefaultConfig();
    }

    firstUpdated(changedProperties) {
        if (changedProperties.has("status")) {
            this.statusObserver();
        }
    }

    update(changedProperties) {
        if (changedProperties.has("displayConfig")) {
            this.displayConfig = {...this.displayConfigDefault, ...this.displayConfig};
            this._config = this.getDefaultConfig();
        }
        super.update(changedProperties);
    }

    statusObserver() {
        if (this.status) {
            this._status = UtilsNew.objectClone(this.status);
        }
    }

    onFieldChange(e) {
        e.stopPropagation();
        // No need to switch(field) since all of them are processed in the same way
        this.updateParams = FormUtils.updateScalar(
            this._status,
            this.status,
            this.updateParams,
            e.detail.param,
            e.detail.value);

        LitUtils.dispatchCustomEvent(this, "fieldChange", this.updateParams, null, null, {bubbles: false, composed: true});
    }

    onSendStatus(e) {
        // Send the status to the upper component
        e.stopPropagation();
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "updateItem", this.status);
    }

    onClear(e) {
        e.stopPropagation();
        this.status = JSON.parse(JSON.stringify(this._status));
        this.updateParams = {};
        LitUtils.dispatchCustomEvent(this, "closeForm");
    }

    render() {
        return html`
            <data-form
                .data="${this.status}"
                .config="${this._config}"
                .updateParams="${this.updateParams}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${e => this.onSendStatus(e)}">
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

customElements.define("status-update", StatusUpdate);
