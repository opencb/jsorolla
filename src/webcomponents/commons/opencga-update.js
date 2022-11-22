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

import {html, LitElement, nothing} from "lit";
import FormUtils from "../../webcomponents/commons/forms/form-utils.js";
import LitUtils from "../commons/utils/lit-utils.js";
import UtilsNew from "../../core/utils-new.js";
import Types from "../commons/types.js";
import "../study/annotationset/annotation-set-update.js";
import "../study/status/status-update.js";
import "../commons/filters/catalog-search-autocomplete.js";
import NotificationUtils from "./utils/notification-utils";

export default class OpencgaUpdate extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            resource: {
                type: String,
            },
            component: {
                type: Object,
            },
            componentId: {
                type: Object,
            },
            params: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            config: {
                type: Object,
            }
        };
    }

    #init() {
        this.resource = "";
        this.component = {};
        this.componentId = {};
        this.params = {};

        this.updatedFields = {};
        this.isLoading = false;
        this.endpoint = {};
        this.displayConfigDefault = {
            style: "margin: 10px",
            defaultLayout: "horizontal",
            labelAlign: "right",
            labelWidth: 3,
            buttonOkText: "Update"
        };

        this._config = this.getDefaultConfig();

    }

    setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
    }

    update(changedProperties) {
        if (changedProperties.has("component")) {
            this.componentObserver();
        }
        if (changedProperties.has("componentId")) {
            this.componentIdObserver();
        }
        if (changedProperties.has("resource")) {
            this.resourceObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }

        super.update(changedProperties);

    }

    componentObserver() {
        if (this.component && this.opencgaSession) {
            this.initOriginalObjects();
        }
    }

    // TODO: retrieve the object from the database
    componentIdObserver() {}

    resourceObserver() {}

    opencgaSessionObserver() {
        if (this?.opencgaSession?.study?.fqn) {
            this.endpoint = {
                "SAMPLE": this.opencgaSession.opencgaClient.samples(),
            };
        }

    }

    configObserver() {
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    initOriginalObjects() {
        this._component = UtilsNew.objectClone(this.component);
        this.updatedFields = {};
        this.componentId = "";
        this._config = {
            ...this.getDefaultConfig(),
            ...this.config,
        };
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.updatedFields = FormUtils.getUpdatedFields(
            this.sample,
            this.updatedFields,
            param,
            e.detail.value);
        this.requestUpdate();
    }

    onClear() {
        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_CONFIRMATION, {
            title: "Discard changes",
            message: "Are you sure you want to discard the changes made?",
            ok: () => {
                this.initOriginalObjects();
                this.requestUpdate();
            },
        });
    }


    // Display a button to back sample browser.
    onShowBtnSampleBrowser() {
        const query = {
            xref: this.sampleId
        };

        const showBrowser = () => {
            LitUtils.dispatchCustomEvent(this, "querySearch", null, {query: query}, null);
            const hash = window.location.hash.split("/");
            window.location.hash = "#sample/" + hash[1] + "/" + hash[2];
        };

        return html `
            <div style="float: right;padding: 10px 5px 10px 5px">
                <button type="button" class="btn btn-primary" @click="${showBrowser}">
                    <i class="fa fa-hand-o-left-borrame" aria-hidden="true"></i> Sample Browser
                </button>
            </div>
        `;
    }

    onSubmit() {

        const payload = FormUtils.getUpdateParams(this._component, this.updatedFields, ["status.date"]);

        // TODO: params in sample-update
        const params = {
            study: this.opencgaSession.study.fqn,
            phenotypesAction: "SET",
            includeResult: true
        };

        // TODO: query here, not in form-utils
        FormUtils.update({
            target: this,
            params: params,
            payload: payload,
        }).then(result => {
            this.component = result;
            this.updatedFields = {};
        }).catch(error => {
            console.log(error);
        });

    }

    render() {
        if (this.isLoading) {
            return html`<loading-spinner></loading-spinner>`;
        }

        if (!this.component?.id) {
            return html `
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i>
                    The ${this.resource} does not have an ID.
                </div>
            `;
        }

        return html`
            ${this._config?.display?.showBtnSampleBrowser ? this.onShowBtnSampleBrowser() : nothing}
            <data-form
                .data="${this._component}"
                .config="${this._config}"
                .updateParams="${this.updatedFields}"
                @fieldChange="${e => this.onFieldChange(e)}"
                @clear="${this.onClear}"
                @submit="${this.onSubmit}">
            </data-form>
        `;
    }

    getDefaultConfig() {}

}

customElements.define("opencga-update", OpencgaUpdate);
