/**
 * Copyright 2015-2019 OpenCB
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

import {LitElement, html} from "/web_modules/lit-element.js";
import LitUtils from "../../commons/utils/lit-utils.js";

export default class DisorderManager extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            disorder: {
                type: Object
            },
        };
    }

    _init() {
        this.disorder = {};
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    onFieldChange(e) {
        const field = e.detail.param;
        if (e.detail.value) {
            this.disorder = {
                ...this.disorder,
                [field]: e.detail.value
            };
        } else {
            delete this.disorder[field];
        }
        console.log("Change disorder: ", this.disorder);
    }

    getDefaultConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            buttons: {
                show: true,
                cancelText: "Cancel",
                classes: "pull-right"
            },
            display: {
                labelWidth: 3,
                labelAlign: "right",
                defaultLayout: "horizontal",
                defaultValue: "",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                placeholder: "Name ...",
                            }
                        },
                        {
                            name: "Evidences",
                            field: "evidences",
                            type: "select",
                            allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOW"],
                            display: {
                                placeholder: "select a status...",
                            }
                        },
                    ]
                }
            ]
        };
    }

    onSendDisorder(e) {
        LitUtils.dispatchEventCustom(this, "addItem", this.disorder);
    }

    onClearForm(e) {
        e.stopPropagation();
        LitUtils.dispatchEventCustom(this, "closeForm");
    }

    onDisorderChange(e) {
        console.log("onDisorderChange ", e.detail.param, e.detail.value);
        let field = "";
        switch (e.detail.param) {
            case "description":
            case "status":
                field = e.detail.param.split(".")[1];
                if (!this.disorder[field]) {
                    this.disorder[field] = {};
                }
                this.disorder[field] = e.detail.value;
                break;
        }
    }

    render() {
        return html`
        <div class="subform-test">
            <data-form
                .data=${this.disorder}
                .config="${this._config}"
                @fieldChange="${e =>this.onFieldChange(e)}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onSendDisorder(e)}">
            </data-form>
        </div>`;
    }

}

customElements.define("disorder-manager", DisorderManager);
