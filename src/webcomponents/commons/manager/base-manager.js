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

export const BaseManagerMixin = superClass => class extends superClass {

    static UPDATE_MODE = "update";
    static CREATE_MODE = "create";

    constructor() {
        super();
        this._initBaseManager();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            mode: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _initBaseManager() {
        this.isShow = false;
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
        console.log("Connected Callback baseManager", this);
    }

    dispatchSessionUpdateRequest() {
        this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
            detail: {
            },
            bubbles: true,
            composed: true
        }));
    }

    onShow() {
        console.log("show: ", this.isShow);
        this.isShow = !this.isShow;
        this.requestUpdate();
    }

    onRemoveItem(e, item) {
        this.dispatchEvent(new CustomEvent("removeItem", {
            detail: {
                value: item
            },
            bubbles: false,
            composed: true
        }));
    }

    onAddItem(item) {
        console.log("Add item from BaseManager", item);
        this.dispatchEvent(new CustomEvent("addItem", {
            detail: {
                value: item
            },
            bubbles: false,
            composed: true
        }));
    }

};
