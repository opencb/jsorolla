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

    update(changedProperties) {
        if (changedProperties.has("endpoint")) {
            this.endpointObserver();
        }
        super.update(changedProperties);
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
                        if (dataParameter.type?.toUpperCase() !== "OBJECT" && dataParameter.type?.toUpperCase() !== "MAP") {
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

            queryElements.sort((fieldA, fieldB) => {
                const fa = fieldA.name.toLowerCase();
                const fb = fieldB.name.toLowerCase();

                if (fa < fb) {
                    return -1;
                }
                if (fa > fb) {
                    return 1;
                }
                return 0;
            });

            const fieldElements = [...pathElements, ...queryElements];

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
                sections: []
            };

            if (fieldElements.length > 0) {
                this.form.sections.push(
                    {
                        title: "Parameters",
                        display: {
                            titleHeader: "h4",
                            style: "margin-left: 20px"
                        },
                        elements: [...fieldElements]
                    }
                );
            }

            if (bodyElements.length > 0) {
                this.form.sections.push(
                    {
                        title: "",
                        display: {
                            // titleHeader: "h4",
                            style: "margin-left: 20px"
                        },
                        elements: [
                            {
                                title: "",
                                type: "custom",
                                display: {
                                    render: () => {
                                        return html`
                                            <div style="float: right; padding: 5px 20px">
                                                <ul class="nav nav-pills">
                                                    <li role="presentation" class="active"><a href="#">Form</a></li>
                                                    <li role="presentation"><a href="#">JSON</a></li>
                                                </ul>
                                            </div>
                                        `;
                                    }
                                }
                            }
                        ]
                    },
                    {
                        title: "Body",
                        display: {
                            titleHeader: "h4",
                            // visible: this.bodyForm === true,
                            style: "margin-left: 20px"
                        },
                        elements: bodyElements
                    },
                    {
                        title: "Body",
                        display: {
                            titleHeader: "h4",
                            // visible: this.bodyForm === false,
                            style: "margin-left: 20px"
                        },
                        elements: [
                            {
                                title: "Body",
                                field: "id",
                                type: "input-text",
                                required: true,
                                display: {
                                    placeholder: "Data Json...",
                                    rows: 10,
                                    help: {
                                        text: "json data model"
                                    }
                                }
                            }
                        ]
                    }
                );
            }

            this.requestUpdate();
        }
    }

    onFormFieldChange(e, field) {
        const param = field || e.detail.param;
        this.data = {...FormUtils.updateScalar(this._data, this.data, {}, param, e.detail.value)};
        this.requestUpdate();
    }

    onFormClear() {
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

    getJsonDataForm() {
        return {
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
                    title: "Individual General Information",
                    elements: [
                        {
                            title: "Individual id",
                            field: "id",
                            type: "input-text",
                            required: true,
                            display: {
                                placeholder: "Add an ID...",
                                rows: 10,
                                help: {
                                    text: "json data model"
                                }
                            }
                        }
                    ]
                }
            ]
        };
    }

    getUrlLinkModelClass(responseClass) {
        // https://github.com/opencb/opencga/blob/develop/opencga-core/src/main/java/org/opencb/opencga/core/models/user/UserFilter.java
        // https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/variantAnnotation.avdl
        // https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/java/org/opencb/biodata/models/alignment/RegionCoverage.java

        // org.opencb.biodata.models.variant.avro.VariantAnnotation;
        // org.opencb.biodata.models.alignment.RegionCoverage;
        // org.opencb.commons.datastore.core.QueryResponse;

        if (responseClass.includes("opencb.opencga")) {
            return `https://github.com/opencb/opencga/blob/develop/opencga-core/src/main/java/${responseClass.replaceAll(".", "/").replace(";", "")}.java`;
        }

        if (responseClass.includes("avro")) {
            const response = responseClass.split(".");
            const className = response[response.length - 1].replace(";", "");
            const modelClassName = className => {
                return className.charAt(0).toLowerCase() + className.slice(1);
            };
            return `https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/avro/${modelClassName(className)}.avdl`;
        }

        if (responseClass.includes("opencb.biodata") && !responseClass.includes("avro")) {
            return `https://github.com/opencb/biodata/blob/develop/biodata-models/src/main/java/${responseClass.replaceAll(".", "/").replace(";", "")}.java`;
        }
    }

    renderResponseClass(responseClass) {
        return responseClass.includes("opencga") || responseClass.includes("biodata") ? html `
            <a target="_blank" href="${this.getUrlLinkModelClass(this.endpoint.responseClass)}">${this.endpoint.responseClass}</a>
            ` : html `${this.endpoint.responseClass}`;
    }

    render() {
        if (!this.endpoint) {
            return;
        }

        return html`
            <div class="panel panel-default">
                <div class="panel-body">
                    <!-- Header Section-->
                    <h4>
                        <span style="margin-right: 10px; font-weight: bold; color:${this.methodColor[this.endpoint.method]}">
                            ${this.endpoint.method}
                        </span>
                        ${this.endpoint.path}
                    </h4>
                    <div class="help-block" style="margin: 0 10px">
                        ${this.endpoint.description}
                    </div>

                    <!-- Response Section-->
                    <div style="padding: 5px 10px">
                        <h3>Response</h3>
                        <div>
                            <div>Type: ${this.endpoint.response} (Source code: ${this.renderResponseClass(this.endpoint.responseClass)})</div>
                        </div>
                    </div>

                    <!-- Parameters Section-->
                    <div style="padding: 5px 10px">
                        <h3>Parameters</h3>


                        <div style="padding: 20px">
                            <data-form
                                .data="${this.data}"
                                .config="${this.form}"
                                @fieldChange="${e => this.onFormFieldChange(e)}"
                                @clear="${this.onFormClear}"
                                @submit="${this.onSubmit}">
                            </data-form>
                        </div>

                    </div>

                    <!-- Results Section-->
                    <div style="padding: 5px 10px">
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
