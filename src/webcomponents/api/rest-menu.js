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
import UtilsNew from "../../core/utils-new";

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
        if (changedProperties.has("api")) {
            this.apiObserver();
        }
        super.update(changedProperties);
    }

    apiObserver() {
        this._api = UtilsNew.objectClone(this.api);
    }
    onClick(e, endpoint) {
        LitUtils.dispatchCustomEvent(this, "endpointSelect", "", {event: e, endpoint: endpoint}, null);
    }

    #renderList() {
        return html `
            <div id="rest-list">
                <div class="panel-body" id="accordion" role="tablist" aria-multiselectable="false" data-cy="rest-api-endpoints">
                    ${
                        this._api?.map(category => {
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
                    flex: 1;
                }
                .rest-menu-filter-wrapper,
                .rest-menu-filter-wrapper > *{
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }
                .has-search .form-control-feedback {
                    right: initial;
                    left: 0;
                    color: #ccc;
                }
                .has-search .form-control {
                    padding-right: 12px;
                    padding-left: 34px;
                }
            </style>
        `;
    }

    #onEndpointSearch(e) {
        const terms = e.target.value
            .toLowerCase()
            .replace(/[^/-_a-z0-9]/g, "")
            .split("/")
            .map(t => `.*${t}.*`)
            .join("\\/");
        const regExp = new RegExp(terms, "i");
        this._api = this.api
            .map(category => {
                return {
                    ...category,
                    endpoints: category.endpoints.filter(endpoint => {
                        return regExp.test(endpoint.path.replace("/{apiVersion}", ""));
                    })
                };
            })
            .filter(category => category.endpoints.length > 0);
        this.requestUpdate();
    }

    render() {
        return html`
            ${this.renderStyle()}
            <!-- <div class="rest-menu-wrapper panel panel-default"> -->
            <div class="rest-menu-wrapper">
                <!-- SIDE-BAR: APIs title-->
                <div class="panel-heading">
                    <div>${this.apiInfo.title}</div>
                </div>
                <!-- SIDE-BAR FILTER-->
                <div class="rest-menu-filter-wrapper">
                    <!-- 1. Search jetbrains-like -->
                    <div class="rest-fuzzy-search">
                        <!-- Magnifier. Input form. On typing, filtering the list of endpoints -->
                        <!-- BOOTSTRAP 5 -->
                        <!--
                        <div class="input-group">
                            <input class="form-control border-end-0 border rounded-pill" type="text" value="search" id="example-search-input">
                            <span class="input-group-append">
                                <button class="btn btn-outline-secondary bg-white border-start-0 border rounded-pill ms-n3" type="button">
                                    <i class="fa fa-search"></i>
                                </button>
                            </span>
                        </div>
                        -->
                        <!-- BOOTSTRAP 3 -->
                        <div class="form-group has-feedback has-search">
                            <!-- <span class="form-control-feedback"><i class="fa fa-search"></i></span> -->
                            <input
                                type="text"
                                class="form-control"
                                @input="${this.#onEndpointSearch}">
                        </div>
                    </div>
                    <!-- 2. Filters -->
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

