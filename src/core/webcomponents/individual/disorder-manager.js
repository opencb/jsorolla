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

import { LitElement, html } from "/web_modules/lit-element.js";
import UtilsNew from "../../utilsNew.js";
import "../commons/tool-header.js";
import { BaseManagerMixin } from "../phenotype/base-manager.js";

export default class DisorderManager extends BaseManagerMixin(LitElement) {

    constructor() {
        super();
        this._init();
    }

    static get properties() {
        return {
            disorders: {
                type: Array
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.disorders = []
        this.disorder = {}
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
            },
            sections: [
                {
                    elements: [
                        {
                            name: "Description",
                            field: "disorder.description",
                            type: "input-text",
                            display: {
                                placeholder: "Name ...",
                            }
                        },
                        {
                            name: "Evidences",
                            field: "disorder.evidences",
                            type: "select",
                            allowedValues: ["OBSERVED", "NOT_OBSERVED", "UNKNOW"],
                            display: {
                                placeholder: "select a status...",
                            }
                        },
                    ]
                }
            ]
        }
    }

    onClearForm(e) {
        console.log("OnClear disorders form ", e)
        this.disorder = {}
        this.onShow()
        e.stopPropagation()
    }

    onAddDisorder(e, item) {
        this.onAddItem(item)
        this.disorder = {}
        this.onShow() // it's from BaseManager.
    }

    onDisorderChange(e) {
        console.log("onDisorderChange ", e.detail.param, e.detail.value)
        let field = ""
        switch (e.detail.param) {
            case "disorder.description":
            case "disorder.status":
                field = e.detail.param.split(".")[1];
                if (!this.disorder[field]) {
                    this.disorder[field] = {}
                }
                this.disorder[field] = e.detail.value;
                break;
        }
    }

    render() {
        return html`
        <div class="row">
            <div class="col-md-2" style="padding: 10px 20px">
                <h3>Disorder</h3>
            </div>
            <div class="col-md-10" style="padding: 10px 20px">
                <button type="button" class="btn btn-primary ripple pull-right" @click="${this.onShow}">
                    Add Disorder
                </button>
            </div>
            <div class="clearfix"></div>
            <hr style="margin:0px"> 
            <div class="col-md-12" style="padding: 10px 20px">
                ${this.disorders?.map((item) => html`
                    <span class="label label-primary" style="font-size: 14px; margin:5px; padding-right:0px; display:inline-block">${item.description}
                        <span class="badge" style="cursor:pointer" @click=${e => this.onRemoveItem(e, item)}>X</span>
                    </span>`
                )}
            </div>
        </div>

        <div class="subform-test" style="${this.isShow ? "display:block" : "display:none"}">
            <data-form  
                .data=${this.disorders}
                .config="${this._config}"
                @fieldChange="${this.onDisorderChange}"
                @clear="${this.onClearForm}"
                @submit="${e => this.onAddDisorder(e,this.disorder)}">
            </data-form>
        </div>`;
    }

}

customElements.define("disorder-manager", DisorderManager);
