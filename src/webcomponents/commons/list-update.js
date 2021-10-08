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
    }

    editItem(e, key) {
        const filterChange = {
            data: {
                param: e.detail.param,
                value: e.detail.value
            }, key};
        LitUtils.dispatchEventCustom(this, "editChange", filterChange);
        e.stopPropagation();
    }

    render() {
        if (this.data.items.constructor === Array) {
            const title = this.config.edit?.display?.mode?.heading?.title || "id";
            const subtitle = this.config.edit?.display?.mode?.heading?.subtitle || "description";
            return html`
            ${this.data.items?.map(item => {
                const status = {...item, parent: this.key? this.key : ""};
                return html`
                    <div class="list-group-item">
                        <div class="row">
                            <div class="col-md-8">
                                <div style="padding-bottom:2px">
                                    <b>${status[title]}</b>
                                    <p class="text-muted">${status[subtitle]}</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                    <data-form
                                        .data="${status}"
                                        @fieldChange=${ e => this.editItem(e, {parent: this.key, entity: this.entity})}
                                        .config="${this.config.edit}">
                                    </data-form>
                            </div>
                        </div>
                    </div>
                `;
            })}
            <data-form
                .data="${this.status}"
                @fieldChange=${ e => this.editItem(e, {parent: this.key, entity: this.entity, new: true})}
                .config="${this.config.new}">
            </data-form>`;
        }

        if (this.data.items.constructor === Object) {
            // debugger;
            return html `
                <data-form
                    .data=${this.data.items}
                    @fieldChange=${ e => this.editItem(e, {parent: this.key, entity: this.entity})}
                    .config=${this.config.edit}>
                </data-form>
            `;
        }
    }

}

customElements.define("list-update", ListUpdate);
