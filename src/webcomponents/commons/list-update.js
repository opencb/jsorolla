/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";
import "./forms/data-form.js";
import NotificationUtils from "./utils/notification-utils.js";


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
            node: {
                type: Object
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
        this._config = {...this.config};

    }

    _init() {
        this.status = {};
        this._prefix = UtilsNew.randomString(8);
        this.item = {};
    }

    onFieldChange(e, index) {
        e.stopPropagation();
        const {param, value} = e.detail;
        if (index >= 0) {
        // Array
        // To edit the element config
            if (value) {
                this.data.items[index] = {
                    ...this.data.items[index],
                    [param]: value
                };
            } else {
                delete this.data.items[index][param];
            }

        } else {
            // Add new config
            if (value) {
                this.item = {
                    ...this.item,
                    [param]: value
                };
            } else {
                delete this.item[param];
            }

            if (this.node?.parent === "annotationIndexConfiguration") {
                const itemData = {...e.detail, node: this.node, item: this.item};
                LitUtils.dispatchCustomEvent(this, "fieldChange", itemData);
            }
        }
        if (this.node?.parent === "fileIndexConfiguration") {
            this._config = {...this.config};
            this.requestUpdate();
        }
    }

    onAddValues(e, key) {
        e.stopPropagation();
        console.log("Add Values", e.detail.value);
        this.values = e.detail.value;
        if (this.node?.parent === "annotationIndexConfiguration") {
            const itemData = {values: this.values.split(","), node: this.node};
            LitUtils.dispatchCustomEvent(this, "addValues", itemData);
        }
    }


    onSendItem(e, index, node) {
        e.stopPropagation();
        if (node?.child === "valuesMapping") {
            this.item = {
                ...this.item,
                values: this.values ? this.values.split(",") : this.data.items[index]
            };
        }
        const itemData = {index: index, node, item: index >= 0 ? this.data.items[index] : this.item};
        LitUtils.dispatchCustomEvent(this, "changeItem", itemData);
        // trigger a update .. it's work for all use case.
        this.requestUpdate();
    }

    onRemoveItem(e, i, node) {
        e.stopPropagation();
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Remove item",
            message: "Are you sure you want to remove this item?",
            display: {
                okButtonText: "Yes, delete it!",
            },
            ok: () => {
                const itemData = this.removeItem(this.data.items, i, node);
                LitUtils.dispatchCustomEvent(this, "removeItem", itemData);
                // trigger a update... refresh the list inside annotationFileConfigs
                this.requestUpdate();
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                    message: "The item has been removed from list",
                });
            },
        });
    }

    removeItem(items, i, node) {
        if (node?.child === "valuesMapping") {
            delete this.data.items[i];
            return {index: i, node, items: this.data.items};
        }

        this.data.items = UtilsNew.removeArrayByIndex(items, i);
        return {index: i, node, items: this.data.items};
    }

    // TODO: Refactor ValuesMapping Variant Configs.
    renderValuesMapping() {
        const valuesMapping = this.data.items;
        return html `
            ${valuesMapping?
                Object.keys(valuesMapping).map((key, i) => {
                const itemData = {key: key, values: valuesMapping[key], node: this.node, index: i};
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
                                            @fieldChange=${e => this.onFieldChange(e)}
                                            @filterChange=${e => this.onAddValues(e, key)}
                                            @submit=${e => this.onSendItem(e, key, this.node)}
                                            .config="${this._config.edit}">
                                        </data-form>
                                        <button type="button" class="btn btn-sm btn-danger" @click=${e => this.onRemoveItem(e, key, this.node)}>Delete</button>
                                </div>
                            </div>
                        </div>`;
                    }): nothing}
                <data-form
                    @fieldChange=${ e => this.onFieldChange(e)}
                    @filterChange=${e => this.onAddValues(e)}
                    @submit=${e => this.onSendItem(e, -1, this.node)}
                    .config="${this._config.new}">
                </data-form>
                `;
    }

    renderListItems() {
        // debugger
        const title = this._config?.item?.title || "id";
        const subtitle = this._config?.item?.subtitle || "description";
        return html `
            ${this.data.items?.map((item, i) => {
                const itemData = {...item, node: this.node, index: i};
                return html`
                    <div class="list-group-item">
                        <div class="row">
                            <div class="col-md-8">
                                <div style="padding-bottom:2px">
                                    <b>${item[title]}</b>
                                    <p class="text-muted">${item[subtitle]}</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                    <data-form
                                        .data="${itemData}"
                                        @fieldChange=${ e => this.onFieldChange(e, i)}
                                        @submit=${e => this.onSendItem(e, i, this.node)}
                                        .config="${this._config.edit}">
                                    </data-form>
                                    <button type="button" class="btn btn-danger btn-sm" @click=${e => this.onRemoveItem(e, i, this.node)}>Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                })
            }
            <data-form
                .data="${this.item}"
                @fieldChange=${ e => this.onFieldChange(e)}
                @submit=${e => this.onSendItem(e, -1, this.node)}
                .config="${this._config.new}">
            </data-form>
            `;
    }

    renderDataForm() {

        if (UtilsNew.isEmpty(this.data.items)) {
            return html`${nothing}`;
        }

        // This renderDataForm is just for 'open form'
        if (this._config?.edit?.type === "modal") {
            return html `${nothing}`;
        }

        return html`
            <data-form
                .data=${this.data.items}
                @filterChange=${e => this.onAddValues(e)}
                @fieldChange=${e => this.onFieldChange(e)}
                .config=${this._config.edit}>
            </data-form> `;
    }


    render() {
        // TODO: Add a condition to know it's a key with values array
        return html`
            ${this.node?.child === "valuesMapping" ?
                html`${this.renderValuesMapping()}`: nothing
            }

            ${Array.isArray(this.data.items) ?
                html`${this.renderListItems()}`:nothing
            }

            ${this.data?.items && UtilsNew.isObject(this.data.items) ?
                html`${this.renderDataForm()}`:nothing
            }`;
    }


}

customElements.define("list-update", ListUpdate);
