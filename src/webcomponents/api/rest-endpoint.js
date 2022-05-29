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
import DetailTabs from "../commons/view/detail-tabs.js";
import Types from "../commons/types.js";
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
        this.dataJson = {};
        this.form = {};
        this.methodColor = {
            "GET": "blue",
            "POST": "darkorange",
            "DELETE": "red"
        };
        this.paramsTypeToHtml = {
            "string": "input-text",
            "integer": "input-text",
            "int": "input-text",
            "boolean": "checkbox",
            "enum": "select",
            "object": "input-text",
        };
        this._queryFilter = ["include", "exclude", "skip", "version", "limit", "release", "count", "attributes"];
        this.passwordKeys = ["password", "newPassword"];
        // Type not support by the moment..
        // Format, BioFormat, List, software, Map
        // ResourceType, Resource, Query, QueryOptions

        this.restClient = new RestClient();
        this.isLoading = false;
    }

    update(changedProperties) {
        if (changedProperties.has("endpoint")) {
            this.endpointObserver();
        }
        if (changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        }
        super.update(changedProperties);
    }

    endpointObserver() {
        this.result = "";
        if (this.endpoint?.parameters?.length > 0) {
            const queryElements = [];
            const filterElements = [];
            const pathElements = [];
            const bodyElements = [];

            // 1. Split params in body and query/path params
            for (const parameter of this.endpoint.parameters) {
                this.data = {
                    body: {}
                };
                if (parameter.param === "body") {

                    // Generate Body Form
                    if (UtilsNew.hasProp(parameter, "data")) {

                        for (const dataParameter of parameter.data) {
                            const paramType = dataParameter.type?.toLowerCase();

                            // this.data.body[dataParameter.name] =
                            //     UtilsNew.hasProp(this.paramsTypeToHtml, paramType) ?
                            //         dataParameter.defaultValue || "" : dataParameter?.type === "List" ? [] : {};

                            // TODO: Rename 'setDataBody' function
                            this.data.body = {...this.data.body, ...this.#setDataBody(this.data?.body, dataParameter)};

                            if (UtilsNew.hasProp(this.paramsTypeToHtml, paramType)) {

                                // Primitive type or Enum
                                if ((!dataParameter.innerParam && !dataParameter.complex) || dataParameter.type === "enum") {
                                    bodyElements.push(
                                        {
                                            name: dataParameter.name,
                                            field: "body." + dataParameter.name,
                                            type: this.passwordKeys.includes(dataParameter.name) ?"input-password":this.paramsTypeToHtml[dataParameter.type?.toLowerCase()],
                                            allowedValues: dataParameter.allowedValues?.split(/[\s,]+/) || "",
                                            defaultValue: this.getDefaultValue(dataParameter),
                                            required: !!dataParameter.required,
                                            display: {
                                                helpMessage: parameter.description
                                            }
                                        }
                                    );
                                }
                                // For Objects
                                if (dataParameter.complex === false && dataParameter.innerParam === true) {
                                    bodyElements.push(
                                        {
                                            name: `${dataParameter.parentParamName}.${dataParameter.name}`,
                                            field: `body.${dataParameter.parentParamName}.${dataParameter.name}`,
                                            type: this.paramsTypeToHtml[dataParameter.type?.toLowerCase()],
                                            allowedValues: dataParameter.allowedValues?.split(/[\s,]+/) || "",
                                            defaultValue: this.getDefaultValue(dataParameter),
                                            required: !!dataParameter.required,
                                            display: {
                                                helpMessage: dataParameter.description
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    }
                } else { // Parameter IS NOT body
                    this.data[parameter.name] = this.getDefaultValue(parameter) || "";
                    const element = {
                        name: parameter.name,
                        field: parameter.name,
                        type: this.paramsTypeToHtml[parameter.type],
                        allowedValues: parameter.allowedValues?.split(/[\s,]+/) || "",
                        defaultValue: this.getDefaultValue(parameter),
                        required: !!parameter.required,
                        display: {
                            helpMessage: parameter.description,
                            disabled: parameter.name === "study"
                        },
                    };

                    if (parameter.param === "path") {
                        pathElements.push(element);
                    } else {
                        if (this._queryFilter.includes(parameter.name)) {
                            filterElements.push(element);
                        } else {
                            queryElements.push(element);
                        }
                    }
                }
            }

            // 2. Sort and move 'study/ to first position
            const pathElementSorted = this.#sortArray(pathElements);
            const queryElementSorted = this.#sortArray(queryElements)
                .sort((a, b) => {
                    if (a.name === "study") {
                        return -1;
                    } else {
                        return 1;
                    }
                });
            const filterElementSorted = this.#sortArray(filterElements);
            const elements = [...pathElementSorted, ...queryElementSorted, ...filterElementSorted];
            const fieldElements =
                this.isNotEndPointAdmin() ? elements :
                    this.isAdministrator() ? elements :
                        this.disabledElements(elements);

            // 3.
            this.form = {
                // title: "Input Parameters",
                type: "form",
                display: {
                    width: "12",
                    labelWidth: "3",
                    // titleHeader: "h3",
                    defaultLayout: "horizontal",
                    buttonClearText: "Clear",
                    buttonOkText: "Try it out!",
                    buttonsVisible: this.isNotEndPointAdmin() ? true : this.isAdministrator()
                },
                // sections: this.#notificationSection(this.endpoint?.notes)
                sections: []
            };

            if (fieldElements.length > 0) {
                // Check if there are 'notes' to display
                if (this.endpoint?.notes) {
                    this.form.sections.push({
                        elements: [
                            {
                                type: "notification",
                                text: this.endpoint?.notes,
                                display: {
                                    notificationType: "info",
                                },
                            }
                        ]
                    });
                }
                this.form.sections.push(
                    {
                        title: "Path and Query Params",
                        display: {
                            titleHeader: "h4",
                            style: "margin-left: 20px",
                        },
                        elements: [...fieldElements]
                    }
                );
            }

            // 4. If POST and body EXISTS then we must show the FORM and JSON tabs
            // TOOD: Pablo me insiste en que os diga los 2 REST: interpretation clear y secondary index configure
            if (this.endpoint.method === "POST" && this.endpoint.parameters.findIndex(parameter => parameter.param === "body") !== -1) {
                if (bodyElements.length >= 0) {
                    const bodyElementsT =
                        this.isNotEndPointAdmin() ? bodyElements :
                            this.isAdministrator() ? bodyElements:
                                this.disabledElements(bodyElements);

                    this.form.sections.push({
                        title: "Body",
                        display: {
                            titleHeader: "h4",
                            style: "margin-left: 20px"
                        },
                        elements: [
                            {
                                type: "custom",
                                display: {
                                    render: () => html`
                                        <detail-tabs
                                            .config="${this.getTabsConfig(bodyElementsT)}"
                                            .mode="${DetailTabs.PILLS_MODE}">
                                        </detail-tabs>
                                    `
                                }
                            }
                        ]
                    });
                }
            }

            // 5.
            if (this.opencgaSession?.study && fieldElements.some(field => field.name === "study")) {
                this.data = {...this.data, study: this.opencgaSession?.study?.fqn};
            }
            this.dataJson = {body: JSON.stringify(this.data?.body, undefined, 4)};
            this._data = this.data;
        } else {
            // No parameters found
            this.form = Types.dataFormConfig({
                type: "form",
                display: {
                    buttonClearText: "",
                    buttonOkText: "Try it out!",
                    labelWidth: "3",
                    defaultLayout: "horizontal",
                    buttonsVisible: this.isNotEndPointAdmin() ? true: this.isAdministrator()
                },
                sections: [
                    {
                        elements: [
                            {
                                type: "notification",
                                text: "No parameters...",
                                display: {
                                    notificationType: "info",
                                },
                            }
                        ]
                    }
                ]
            });
        }
        this.requestUpdate();
    }

    opencgaSessionObserver() {
        if (this.opencgaSession?.study && this.data?.study) {
            this.data = {...this.data, study: this.opencgaSession?.study?.fqn};
        }
    }

    getDefaultValue(parameter) {
        if (parameter.type === "boolean") {
            return parameter.defaultValue === "true" || parameter.defaultValue === true;
        }
        return parameter.defaultValue;
    }

    isAdministrator() {
        return this.opencgaSession?.user?.account?.type === "ADMINISTRATOR" || this.opencgaSession?.user.id === "OPENCGA";
    }

    isNotEndPointAdmin() {
        return !this.endpoint.path.includes("/admin/");
    }

    disabledElements(elements) {

        return elements.map(element => {
            const obj = {...element, display: {disabled: true}};
            return obj;
        });
    }

    #sortArray(elements) {
        const _elements = elements;

        _elements.sort((a, b) => {
            const _nameA = a.name.toLowerCase();
            const _nameB = b.name.toLowerCase();

            // If both have the same required value, sort in alphabetical order
            if (a.required === b.required) {
                if (_nameA < _nameB) {
                    return -1;
                }

                if (_nameA > _nameB) {
                    return 1;
                }
            }

            if (a.required) {
                return -1;
            } else {
                return 1;
            }
        });

        return _elements;
    }

    // #notificationSection(notes) {
    //     if (notes) {
    //         return [{
    //             elements: [{
    //                 type: "notification",
    //                 text: notes,
    //                 display: {
    //                     notificationType: "info",
    //                 },
    //             }]
    //         }];
    //     }
    //     return [];
    // }

    #setDataBody(body, params) {
        const paramType = params.type?.toLowerCase();
        const _body = body;

        // Basic Type
        if (UtilsNew.hasProp(this.paramsTypeToHtml, paramType) && !params.innerParam) {
            _body[params.name] = params.value || "";
        }

        if (params.type === "List") {
            _body[params.name] = [];
        }

        // Support object nested as 2nd Level
        if (params.innerParam && !params.complex) {
            _body[params.parentParamName] = {..._body[params.parentParamName], [params.name]: params.defaultValue || ""};
        }

        return _body;
        // body[params.name] = UtilsNew.hasProp(this.paramsTypeToHtml, paramType) ?
        //     params.defaultValue || "" : params?.type === "List" ? [] : {};
    }


    onFormFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        if (param === "body") {
            this.dataJson = {...this.dataJson, body: e.detail.value};
            try {
                const dataObject = JSON.parse(e.detail.value);
                Object.keys(dataObject).forEach(key => {
                    if (key in this.data.body) {
                        this.data = {...this.data, body: {...this.data.body, [key]: dataObject[key]}};
                    }
                });
            } catch (error) {
                return false;
            }
        } else {
            // if (param.split(".").length > 2) {
            // If the form has nested object
            // ex. body.field.pro -> sample: body.source.name
            if ((param.match(/\./g)||[]).length > 1) {
                // For param type Object
                const paramBody = param.replace("body.", "");
                this.data.body = {...FormUtils.createObject(this.data.body, paramBody, e.detail.value)};
            } else {
                this.data = {...FormUtils.createObject(this.data, param, e.detail.value)};
            }
            this.dataJson = {body: JSON.stringify(this.data?.body, undefined, 4)};
        }
        this.requestUpdate();
    }

    onClear() {
        this.dataJson = {body: JSON.stringify(this._data?.body, undefined, 4)};
        if (this.opencgaSession?.study && this.data?.study) {
            this.data = {study: this.opencgaSession.study.fqn};
        } else {
            this.data = this._data;
        }
        this.requestUpdate();
    }

    onSubmit() {

        let url = this.opencgaSession.opencgaClient._config.host + "/webservices/rest" + this.endpoint.path + "?";
        if (this.endpoint.method === "GET") {
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

        if (this.endpoint.method === "POST") {
            url += "study=" + encodeURIComponent(this.opencgaSession.study.fqn);
            url = url.replace("{apiVersion}", this.opencgaSession.opencgaClient._config.version);

            const _options = {
                sid: this.opencgaSession.opencgaClient._config.token,
                token: this.opencgaSession.opencgaClient._config.token,
                data: this.data?.body,
                method: "POST"
            };

            this.restClient.call(url, _options)
                .then(response => {
                    this.data.body = {};
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        title: "New Item",
                        message: "Data created correctly"
                    });
                })
                .catch(response => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                })
                .finally(() => {
                    this.isLoading = false;
                    this.requestUpdate();
                });
        }
    }

    getJsonDataForm() {
        return {
            type: "form",
            display: {
                width: "12",
                labelWidth: "3",
                defaultLayout: "horizontal",
                buttonClearText: "Clear",
                buttonOkText: "Try it out!"
            },
            sections: [
                {
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

    getTabsConfig(elements) {
        const configForm = {
            buttonsVisible: false,
            display: {
                buttonsVisible: false
            },
            sections: [{
                display: {
                    titleHeader: "h4",
                },
                elements: [...elements]
            }]

        };


        const configJson = {
            display: {
                buttonsVisible: false
            },
            sections: [{
                display: {
                    titleHeader: "h4",
                },
                elements: [
                    {
                        title: "Body",
                        field: "body",
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
            }]
        };

        return {
            items: [
                {
                    id: "form",
                    name: "Form",
                    icon: "fab fa-wpforms",
                    active: true,
                    render: () => {
                        return html`
                            <!-- Body Forms -->
                            <data-form
                                .data="${this.data}"
                                .config="${configForm}"
                                @fieldChange="${e => this.onFormFieldChange(e)}"
                                @clear="${this.onClear}"
                                @submit="${this.onSubmit}">
                            </data-form>
                        `;
                    }
                },
                {
                    id: "json",
                    name: "JSON",
                    icon: "",
                    render: () => {
                        return html`
                            <!-- Body Json -->
                            <data-form
                                .data="${this.dataJson}"
                                .config="${configJson}"
                                @fieldChange="${e => this.onFormFieldChange(e)}"
                                @clear="${this.onClear}"
                                @submit="${this.onSubmit}">
                            </data-form>
                        `;
                    }
                }
            ]
        };
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
                        <h3>Response Type</h3>
                        <div>
                            <div>Type: ${this.endpoint.response} (Source code: ${this.renderResponseClass(this.endpoint.responseClass)})</div>
                        </div>
                    </div>

                    <!-- Parameters Section-->
                    <div style="padding: 5px 10px">
                        <h3>Input Parameters</h3>
                        <div style="padding: 20px">
                            <data-form
                                .data="${this.data}"
                                .config="${this.form}"
                                @fieldChange="${e => this.onFormFieldChange(e)}"
                                @clear="${this.onClear}"
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
