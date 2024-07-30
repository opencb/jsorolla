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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";
import "./rest-endpoint.js";
import "./rest-menu.js";
import NotificationUtils from "../commons/utils/notification-utils";

export default class RestApi extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this.listAPI = [
            {id: "opencga", title: "OpenCGA API REST", description: ""},
            // {id: "cellbase", title: "Cellbase API REST", description: ""},
        ];
        this.selectedAPI = this.listAPI[0];
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
        let error;
        if (this.opencgaSession) {
            this.opencgaSession.opencgaClient.meta().api()
                .then(responses => {
                    this.api = responses.responses[0].results[0];
                    this.removeEndpoint("Files", "/{apiVersion}/files/upload");
                    if (this.api?.length > 0) {
                        if (!this.endpoint) {
                            this.endpoint = this.api[0].endpoints.find(endpoint => endpoint.method === "GET");
                        }
                    }
                    this.requestUpdate();
                })
                .catch(error => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                });
        }
    }

    removeEndpoint(categoryName, path) {
        const categoryIndex = this.api.findIndex(category => category.name === categoryName);
        const endpointsIndex = this.api[categoryIndex].endpoints.findIndex(endpoint => endpoint.path === path);
        this.api[categoryIndex].endpoints.splice(endpointsIndex, 1);
    }

    onEndpointSelect(e) {
        this.endpoint = e.detail.endpoint;
        this.requestUpdate();
    }

    onAPISelect(e, api) {
        switch (api.id) {
            case "opencga":
                this.selectedAPI = UtilsNew.objectClone(api);
                this.opencgaSessionObserver();
                break;
            case "cellbase":
                break;
        }
    }

    renderStyle() {
        return html `
            <style>
                .rest-api {
                    display: flex;
                    align-items: stretch
                }
                .rest-options {
                    display: flex;
                    align-items: stretch
                    flex:0;
                    background-color: lightgrey;
                }
                .rest-option {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 4em;
                    height: 4em;
                }
                .rest-option-button{
                    background-color: red;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .rest-option-button-icon{
                    color:white;
                }
                .rest-manager {
                    display: flex;
                    flex:1;
                }
            </style>
        `;
    }

    render() {
        return html`
            ${this.renderStyle()}
            <div class="row">
                <div class="rest-api">
                    <!-- LEFT-BAR -->
                    <div class="rest-options">
                        <!-- List wrapper: TODO when we add cellbase -->
                    </div>
                    <!-- MAIN-MANAGER -->
                    <div class="d-flex flex-grow-1 gap-3">
                        <!-- SIDE-BAR -->
                        <div class="col-3">
                            <rest-menu
                                .apiInfo="${this.selectedAPI}"
                                .api="${this.api}"
                                .opencgaSession="${this.opencgaSession}"
                                @endpointSelect=${this.onEndpointSelect}>
                            </rest-menu>
                        </div>
                        <!-- DASHBOARD -->
                        <div id="rest-endpoint-panel" class="col-8">
                            <rest-endpoint
                                .apiInfo="${this.selectedAPI}"
                                .endpoint="${this.endpoint}"
                                .opencgaSession="${this.opencgaSession}">
                            </rest-endpoint>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("rest-api", RestApi);
