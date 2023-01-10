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

import {html, LitElement} from "lit";
import UtilsNew from "../../core/utils-new.js";
import "../commons/forms/data-form.js";
import "./rest-endpoint.js";

export default class RestApi extends LitElement {

    constructor() {
        super();

        this._init();
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

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.api = [];
        this.methodOrder = {
            "GET": 1,
            "POST": 2,
            "DELETE": 3
        };
        this.methodColor = {
            "GET": "blue",
            "POST": "darkorange",
            "DELETE": "red"
        };
    }

    update(changedProperties) {
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    opencgaSessionObserver() {
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
                .catch(error => {});
        }
    }

    removeEndpoint(categoryName, path) {
        const categoryIndex = this.api.findIndex(category => category.name === categoryName);
        const endpointsIndex = this.api[categoryIndex].endpoints.findIndex(endpoint => endpoint.path === path);
        this.api[categoryIndex].endpoints.splice(endpointsIndex, 1);
    }

    async onClick(e, endpoint) {
        this.endpoint = endpoint;
        this.requestUpdate();

        // Experimental dynamic height
        const endpointPanel = document.querySelector("#rest-endpoint-panel");
        const endpointList = document.getElementById("rest-list");
        endpointList.style.maxHeight = endpointPanel?.clientHeight > 1000? endpointPanel?.clientHeight + "px": "1000px";

    }

    render() {


        return html`
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    <div id="rest-list" class="col-md-4" style="overflow-y:scroll; max-height:700px">
                        <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="false" data-cy="rest-api-endpoints">
                            ${this.api?.map(category => {
                                const categoryName = category.name.replaceAll(" ", "_");
                                const isFirst = category.name === this.api[0].name;
                                return html`
                                    <div class="panel panel-default">
                                        <div class="panel-body" role="tab" id="${categoryName}HeadingOne">
                                            <h5 class="panel-title">
                                                <div class="">
                                                    <a role="button" data-toggle="collapse" data-parent="#accordion" href="#${categoryName}CollapseOne" aria-expanded="true" aria-controls="${category.name}CollapseOne">
                                                        <div style="margin-bottom: 10px">
                                                            ${category.name} <span class="badge pull-right">${category.endpoints?.length || "NA"}</span>
                                                        </div>
                                                        <div style="font-size: 1em;text-transform: none;letter-spacing: 1px">
                                                            ${category.path}
                                                        </div>
                                                    </a>
                                                </div>
                                            </h5>
                                        </div>
                                        <div id="${categoryName}CollapseOne" class="panel-collapse collapse ${isFirst ? "in" : ""}" role="tabpanel" aria-labelledby="${categoryName}HeadingOne">
                                            ${category.endpoints
                                                .sort((a, b) => {
                                                    return this.methodOrder[a.method] - this.methodOrder[b.method];
                                                })
                                                .map(endpoint => html`
                                                    <div class="panel-body" style="padding: 5px 15px">
                                                        <button class="btn btn-link" role="link" style="display:flex;white-space:normal;" @click="${e => this.onClick(e, endpoint)}">
                                                            <span style="margin-right: 10px; font-weight: bold; color:${this.methodColor[endpoint.method]}">
                                                                ${endpoint.method}
                                                            </span>
                                                            <span style="font-weight:bold;word-break:break-word;text-align:left;" data-cy="endpoint-path">
                                                                ${endpoint.path.replace("/{apiVersion}", "")}
                                                            </span>
                                                        </button>
                                                        <div class="help-block" style="margin: 0 15px">
                                                            ${endpoint.description}
                                                        </div>
                                                    </div>
                                                `)}
                                        </div>
                                    </div>
                                `;
                            })}
                        </div>
                    </div>

                    <div id="rest-endpoint-panel" class="col-md-8">
                        <rest-endpoint
                            .endpoint="${this.endpoint}"
                            .opencgaSession="${this.opencgaSession}">
                        </rest-endpoint>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("rest-api", RestApi);
