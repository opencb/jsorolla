/**
 * Copyright 2015-2023 OpenCB
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
import LitUtils from "../commons/utils/lit-utils";

export default class RestMenu extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            apiInfo: {
                type: Object,
            },
            api: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
        };
    }

    #init() {
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        super.update(changedProperties);
    }

    onClick(e, endpoint) {
        LitUtils.dispatchCustomEvent(this, "endpointSelect", "", {event: e, endpoint: endpoint}, null);
    }

    #renderList() {
        return html `
            <div id="rest-list">
                <div class="panel-body" id="accordion" role="tablist" aria-multiselectable="false" data-cy="rest-api-endpoints">
                    ${
                        this.api?.map(category => {
                            const categoryName = category.name.replaceAll(" ", "_");
                            return html `
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
                                    <div id="${categoryName}CollapseOne" class="panel-collapse collapse" role="tabpanel" aria-labelledby="${categoryName}HeadingOne">
                                        ${
                                            category.endpoints.sort((a, b) => {
                                                return this.config.methodOrder[a.method] - this.config.methodOrder[b.method];
                                            }).map(endpoint => html `
                                                <div class="panel-body" style="padding: 5px 15px">
                                                    <button class="btn btn-link" role="link" style="display:flex;white-space:normal;" @click="${e => this.onClick(e, endpoint)}">
                                                        <span style="margin-right: 10px; font-weight: bold; color:${this.config.methodColor[endpoint.method]}">
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
                                            `)
                                        }
                                    </div>
                                </div>
                            `;
                        })
                    }
                </div>
            </div>
        `;
    }

    renderStyle() {
        return html `
            <style>
                .rest-menu-wrapper{
                    display: flex;
                    flex-direction: column;
                }
            </style>
        `;
    }

    render() {
        return html`
            ${this.renderStyle()}
            <div class="rest-menu-wrapper panel panel-default">
                <!-- SIDE-BAR: APIs title-->
                <div class="panel-heading">
                    <div>${this.apiInfo.title}</div>
                </div>
                <!-- SIDE-BAR FILTER-->
                <div class="rest-menu-filter-wrapper">
                    <!-- 1. Search jetbrains-like -->
                    <div class="rest-fuzzy-search"></div>
                    <!-- 2. Filters jetbrains-like -->
                    <div class="rest-filters"></div>
                </div>
                <!-- SIDE-BAR LIST-ENDPOINTS -->
                <div>
                    ${this.#renderList()}
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            methodOrder: {
                "GET": 1,
                "POST": 2,
                "DELETE": 3
            },
            methodColor: {
                "GET": "blue",
                "POST": "darkorange",
                "DELETE": "red"
            },
        };
    }


}

customElements.define("rest-menu", RestMenu);

