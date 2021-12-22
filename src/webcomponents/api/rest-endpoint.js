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
import UtilsNew from "../../core/utilsNew.js";
import {RestClient} from "../../core/clients/rest-client.js";
import FormUtils from "../commons/forms/form-utils";
import NotificationUtils from "../commons/utils/notification-utils.js";
import "../commons/json-viewer.js";


export default class RestEndpoint extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            endpoint: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.data = {};
        this._data = {};
        this.form = {};
        this.methodColor = {
            "GET": "blue",
            "POST": "darkorange",
            "DELETE": "red"
        };
        this.parameterTypeToHtml = {
            "string": "input-text",
            "integer": "input-text",
            "boolean": "checkbox",
            "enum": "select",
            "object": "input-text",
        };

        this.restClient = new RestClient();
        this.isLoading = false;
    }

    updated(changedProperties) {
        if (changedProperties.has("endpoint")) {
            this.endpointObserver();
        }
        // super.update(changedProperties);
    }

    endpointObserver() {
        if (this.endpoint?.parameters?.length > 0) {
            this.data = {};
            const queryElements = [];
            const pathElements = [];
            const bodyElements = [];
            for (const parameter of this.endpoint.parameters) {
                if (parameter.param === "body") {
                    if (!this.data.body) {
                        this.data.body = {};
                    }

                    for (const dataParameter of parameter.data) {
                        this.data.body[dataParameter.name] = dataParameter.defaultValue || "";
                        bodyElements.push(
                            {
                                name: dataParameter.name,
                                field: "body." + dataParameter.name,
                                type: this.parameterTypeToHtml[dataParameter.type?.toLowerCase()],
                                allowedValues: dataParameter.allowedValues?.split(","),
                                defaultValue: dataParameter.defaultValue,
                                required: !!dataParameter.required
                            }
                        );
                    }
                } else {
                    this.data[parameter.name] = parameter.defaultValue || "";
                    const element = {
                        name: parameter.name,
                        field: parameter.name,
                        type: this.parameterTypeToHtml[parameter.type],
                        allowedValues: parameter.allowedValues?.split(",") || "",
                        defaultValue: parameter.defaultValue,
                        required: !!parameter.required
                    };

                    if (parameter.param === "path") {
                        pathElements.push(element);
                    } else {
                        queryElements.push(element);
                    }
                }
            }

            this.form = {
                type: "form",
                buttons: {
                    show: true,
                    clearText: "Clear",
                    okText: "Try it out!"
                },
                display: {
                    width: "12",
                    labelWidth: "3",
                    defaultLayout: "horizontal",
                },
                sections: [
                    {
                        title: "",
                        display: {
                        },
                        elements: [...pathElements, ...queryElements]
                    }
                ]
            };

            if (bodyElements.length > 0) {
                this.form.sections.push(
                    {
                        title: "Body",
                        display: {
                            titleHeader: "h4",
                            style: "margin-left: 20px"
                        },
                        elements: bodyElements
                    }
                );
            }

            this.requestUpdate();
        }
    }

    onFieldChange(e, field) {
        const param = field || e.detail.param;
        this.data = {...FormUtils.updateScalar(this._data, this.data, {}, param, e.detail.value)};
        this.requestUpdate();
    }

    onClear() {
        this.data = {};
        this._data = {};
        this.requestUpdate();
    }

    onSubmit() {
        let url = this.opencgaSession.opencgaClient._config.host + "/webservices/rest" + this.endpoint.path + "?";
        url += "sid=" + this.opencgaSession.opencgaClient._config.token;

        // Replace PATH params
        url = url.replace("{apiVersion}", this.opencgaSession.opencgaClient._config.version);
        this.endpoint.parameters
            .filter(parameter => parameter.param === "path")
            .forEach(parameter => {
                url = url.replace(`{${parameter.name}}`, this.data[parameter.name]);
            });

        // Add QUERY params
        this.endpoint.parameters
            .filter(parameter => parameter.param === "query" && this.data[parameter.name])
            .forEach(parameter => {
                url += `&${parameter.name}=${this.data[parameter.name]}`;
            });

        this.isLoading = true;
        this.requestUpdate();

        this.restClient.call(url, {})
            .then(response => {
                this.result = response.responses[0];
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            })
            .finally(() => {
                this.isLoading = false;
                this.requestUpdate();
            });
    }

    render() {
        if (!this.endpoint) {
            return;
        }

        return html`
            <div class="panel panel-default">
                <div class="panel-body">
                    <h4>
                        <span style="margin-right: 10px; font-weight: bold; color:${this.methodColor[this.endpoint.method]}">
                            ${this.endpoint.method}
                        </span>
                        ${this.endpoint.path}
                    </h4>
                    <div class="help-block" style="margin: 0 10px">
                        ${this.endpoint.description}
                    </div>
                    <div style="padding: 10px 10px">
                        <h3>Response</h3>
                        <div>
                            <label>Response</label>
                            <div>${this.endpoint.response}</div>
                        </div>
                        <div>
                            <label>Response Class</label>
                            <div>${this.endpoint.responseClass}</div>
                        </div>
                    </div>

                    <div style="padding: 10px 10px">
                        <h3>Parameters</h3>
                        <div style="padding: 20px">
                            <data-form
                                .data="${this.data}"
                                .config="${this.form}"
                                @fieldChange="${e => this.onFieldChange(e)}"
                                @clear="${this.onClear}"
                                @submit="${this.onSubmit}">
                            </data-form>
                        </div>
                    </div>

                    <div style="padding: 10px 10px">
                        <h3>Results</h3>
                        <div style="padding: 20px">
                            ${this.isLoading ? html`
                                <loading-spinner></loading-spinner>
                            ` : html`
                                <json-viewer
                                    .data="${this.result}"
                                    .config="${this.form}">
                                </json-viewer>
                            `}

                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("rest-endpoint", RestEndpoint);
