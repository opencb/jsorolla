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


import {LitElement, html, nothing} from "lit";
import LitUtils from "./utils/lit-utils.js";
import UtilsNew from "../../core/utilsNew.js";

export default class ListUpdate extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            key: {
                type: String
            },
            data: {
                type: Object,
            },
            config: {
                type: Object
            }
        };
    }

    connectedCallback() {
        super.connectedCallback();
    }

    _init() {
        this.status = {};
        this._prefix = UtilsNew.randomString(8);
        this.item = {};
    }

    onFieldChange(e, index) {
        e.stopPropagation();
        // Array
        const {param, value} = e.detail;
        if (index >= 0) {
            if (value) {
                this.data.items[index] = {
                    ...this.data.items[index],
                    [param]: value
                };
            } else {
                delete this.data.items[index][param];
            }
            console.log("edited item", this.data.items[index]);
        } else {
            if (value) {
                this.item = {
                    ...this.item,
                    [param]: value
                };
            } else {
                delete this.item[param];
            }
            console.log("edited item", this.item);
        }
    }

    onSendItem(e, index) {
        e.stopPropagation();
        LitUtils.dispatchEventCustom(
            this,
            "changeItem",
            index >= 0 ? {index: index, item: this.data.items[index]} : this.item);
    }

    editItem(e, element) {
        console.log("Edit Item");
        e.stopPropagation();
    }

    render() {

        // TODO: Add a condition to know it's a key with values array
        if (this.key === "valuesMapping") {
            const valuesMapping = this.data.items;
            return html`
                ${valuesMapping ?
                    Object.keys(valuesMapping)?.map(key => {
                    const itemData = {key: key, values: valuesMapping[key], parent: this.key? this.key : ""};
                    return html`
                        <div class="list-group-item">
                            <div class="row">
                                <div class="col-md-8">
                                    <div style="padding-bottom:2px">
                                        <b>${key}</b>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                        <data-form
                                            .data="${itemData}"
                                            @submit=${ e => this.editItem(e, {parent: this.key})}
                                            .config="${this.config.edit}">
                                        </data-form>
                                </div>
                            </div>
                        </div> `;
                    }) : nothing}
                <data-form
                    .data="${this.itemData}"
                    @fieldChange=${ e => this.editItem(e, {parent: this.key, entity: this.entity, new: true})}
                    .config="${this.config.new}">
                </data-form>`;
        }

        // applies when the data is an array
        if (this.data.items.constructor === Array) {
            const title = this.config.edit?.display?.mode?.item?.title || "id";
            const subtitle = this.config.edit?.display?.mode?.item?.subtitle || "description";
            return html`
            ${this.data.items?.map((item, i) => {
                const itemData = {...item, index: i, parent: this.key? this.key : ""};
                return html`
                    <div class="list-group-item">
                        <div class="row">
                            <div class="col-md-8">
                                <div style="padding-bottom:2px">
                                    <b>${itemData[title]}</b>
                                    <p class="text-muted">${itemData[subtitle]}</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                    <data-form
                                        .data="${itemData}"
                                        @fieldChange=${ e => this.onFieldChange(e, i)}
                                        @submit=${e => this.onSendItem(e, i)}
                                        .config="${this.config.edit}">
                                    </data-form>
                            </div>
                        </div>
                    </div>
                `;
            })}
            <data-form
                .data="${this.itemData}"
                @fieldChange=${ e => this.onFieldChange(e)}
                @submit=${e => this.onSendItem(e)}
                .config="${this.config.new}">
            </data-form>`;
        }

        if (this.data.items.constructor === Object) {
            // debugger;
            return html `
                <data-form
                    .data=${this.data.items}
                    @fieldChange=${ e => this.editItem(e, {parent: this.key})}
                    .config=${this.config.edit}>
                </data-form>
            `;
        }
    }

}

customElements.define("list-update", ListUpdate);
