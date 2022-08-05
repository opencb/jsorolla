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
import LitUtils from "../commons/utils/lit-utils.js";
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
        this.dataForm = {body: {}};
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
        this.specialTypeKeys = inputType => {
            const passwordKeys = ["password", "newPassword"];
            const dateKeys = ["creationDate", "modificationDate", "dateOfBirth", "date"];
            if (passwordKeys.includes(inputType)) {
                return "input-password";
            }

            if (dateKeys.includes(inputType)) {
                return "input-date";
            }
            return false;
        };
        // Type not support by the moment
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

        const isPrimitiveOrEnum = dataParameter => !dataParameter.complex || dataParameter.type === "enum";
        const isObject = dataParameter => dataParameter.complex && UtilsNew.isNotEmptyArray(dataParameter?.data) && dataParameter.type !== "List";
        const hasStudyField = fieldElements => this.opencgaSession?.study && fieldElements.some(field => field.name === "study");

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

                if (parameter.param === "body" && UtilsNew.isNotEmptyArray(parameter?.data)) {

                    for (const dataParameter of parameter.data) {
                        const paramType = dataParameter.type?.toLowerCase();

                        // Prepare data, Use for sync between form and json
                        this.data.body = {...this.data.body, ...this.#setDataBody(this.data?.body, dataParameter)};

                        // INFO: Here are some other elements to be avoided, the type of which is not yet supported.
                        // Format, BioFormat, software, Map,ResourceType, Resource, Query, QueryOptions, etc..

                        // Pass Enum, primitive or scalar type element.
                        if (isPrimitiveOrEnum(dataParameter) && this.paramsTypeToHtml[paramType]) {
                            bodyElements.push(
                                {
                                    name: dataParameter.name,
                                    field: "body." + dataParameter.name,
                                    type: this.specialTypeKeys(dataParameter.name) || this.paramsTypeToHtml[dataParameter.type?.toLowerCase()],
                                    allowedValues: dataParameter.allowedValues?.split(/[\s,]+/) || "",
                                    defaultValue: this.getDefaultValue(dataParameter),
                                    required: !!dataParameter.required,
                                    display: {
                                        helpMessage: parameter.description
                                    }
                                }
                            );
                        }

                        // Pass Object element.
                        if (isObject(dataParameter)) {
                            for (const param of dataParameter.data) {
                                // primitive or scalar Type Elements
                                if (this.paramsTypeToHtml[param?.type?.toLowerCase()]) {
                                    bodyElements.push(
                                        {
                                            name: `${param.parentName}.${param.name}`,
                                            field: `body.${param.parentName}.${param.name}`,
                                            type: this.specialTypeKeys(param.name) || this.paramsTypeToHtml[param.type?.toLowerCase()],
                                            allowedValues: param.allowedValues?.split(/[\s,]+/) || "",
                                            defaultValue: this.getDefaultValue(param),
                                            required: !!param.required,
                                            display: {
                                                helpMessage: param.description
                                            }
                                        }
                                    );
                                }
                            }
                        }
                    }
                } else { // Parameter IS NOT body,
                    //  Path and Query Params
                    this.data[parameter.name] = this.getDefaultValue(parameter) || "";
                    const element = {
                        name: parameter.name,
                        field: parameter.name,
                        type: this.specialTypeKeys(parameter.name) || this.paramsTypeToHtml[parameter.type],
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
            const byStudy = elm => elm.name === "study" ? -1 : 1;
            const elements = [
                ...this.#sortArray(pathElements),
                ...this.#sortArray(queryElements).sort(byStudy),
                ...this.#sortArray(filterElements)
            ];
            const fieldElements = this.isNotEndPointAdmin() || this.isAdministrator() ? elements : this.disabledElements(elements);

            // 3. Init Form
            this.form = {
                type: "form",
                display: {
                    width: "12",
                    labelWidth: "3",
                    defaultLayout: "horizontal",
                    buttonClearText: "Clear",
                    buttonOkText: "Try it out!",
                    buttonsVisible: (this.endpoint.method === "GET" || this.endpoint.method === "DELETE") && (this.isNotEndPointAdmin() || this.isAdministrator())
                },
                sections: []
            };

            // Add Elemenets to the form
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
                const bodyElementsForm = this.isNotEndPointAdmin() || this.isAdministrator() ? bodyElements : this.disabledElements(bodyElements);
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
                                        .data="${{}}"
                                        .config="${this.getTabsConfig(bodyElementsForm)}"
                                        .mode="${DetailTabs.PILLS_MODE}">
                                    </detail-tabs>
                                `
                            }
                        }
                    ]
                });
            }

            // 5. If the user is logged in, it will show the current study.
            if (hasStudyField(fieldElements)) {
                this.data = {...this.data, study: this.opencgaSession?.study?.fqn};
            }

            // 6. Get data.body to JSON.
            this.dataJson = {body: JSON.stringify(this.data?.body, undefined, 4)};

            this._data = UtilsNew.objectClone(this.data);
        } else {
            // If parameters no found
            this.form = Types.dataFormConfig({
                type: "form",
                display: {
                    buttonClearText: "",
                    buttonOkText: "Try it out!",
                    labelWidth: "3",
                    defaultLayout: "horizontal",
                    buttonsVisible: (this.endpoint.method === "GET" || this.endpoint.method === "DELETE") && (this.isNotEndPointAdmin() || this.isAdministrator()),
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
        return elements.map(element => ({...element, display: {disabled: true}}));
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

    #setDataBody(body, params) {
        const _body = body;
        const paramValueByType = {
            map: {},
            list: [],
        };

        // Basic Type
        if (this.paramsTypeToHtml[params.type?.toLowerCase()]) {
            _body[params.name] = params.value || "";
        }

        if (params.type === "List") {
            _body[params.name] = [];
        }

        // Support object nested as 2nd Level
        // Display object props from object. sample.source
        if (params.complex && UtilsNew.isNotEmptyArray(params.data) && params.type !== "List") {
            params.data.forEach(param => {
                _body[param.parentName] = {..._body[param.parentName], [param.name]: paramValueByType[param.type.toLowerCase()] || param.defaultValue || ""};
            });
        }

        // Display object props from list ex. List<Phenotypes>
        if (params.complex && UtilsNew.isNotEmptyArray(params.data) && params.type === "List") {
            let paramData = {};
            params.data.forEach(param => {
                paramData = {...paramData, [param.name]: paramValueByType[param.type.toLowerCase()] || param.defaultValue || ""};
            });
            _body[params.name] = [paramData];
        }

        return _body;
    }

    onChangeJsonField(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        // For Json input: param is called body
        if (param === "body") {
            this.dataJson = {...this.dataJson, body: e.detail.value};
            try {
                const dataObject = JSON.parse(e.detail.value);
                // Object.keys(dataObject).forEach(key => {
                //     if (key in this.data.body) {
                //         this.data = {...this.data, body: {...this.data.body, [key]: dataObject[key]}};
                //     }
                // });
            } catch (error) {
            // json parse errors may arise at the time of writing to the json field.
                return false;
            }
        }
    }

    onFormFieldChange(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        // If it contains more than a dot or If the form has nested object
        // ex. body.field.prop -> sample: body.source.name
        if ((param.match(/\./g)||[]).length > 1) {
            // For param type Object
            const paramBody = param.replace("body.", "");
            this.data.body = {...FormUtils.createObject(this.data.body, paramBody, e.detail.value)};
            this.dataForm.body = {...FormUtils.createObject(this.dataForm.body, paramBody, e.detail.value)};
        } else {
            this.data = {...FormUtils.createObject(this.data, param, e.detail.value)};
            this.dataForm = {...FormUtils.createObject(this.dataForm, param, e.detail.value)};
        }
        this.requestUpdate();
    }

    onClear(e) {
        e.stopPropagation();
        this.dataJson = {body: JSON.stringify(this._data?.body, undefined, 4)};
        this.dataForm = {};
        this.data = UtilsNew.objectClone(this._data);
        this.requestUpdate();
    }

    #getOrDeleteEndpoint(url) {
        // Replace PATH params
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
        this.restClient.call(url, {method: this.endpoint.method})
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

    #postEndpoint(url, isForm) {
        url += "study=" + encodeURIComponent(this.opencgaSession.study.fqn);
        this.endpoint.parameters
            .filter(parameter => parameter.param === "path")
            .forEach(parameter => {
                url = url.replace(`{${parameter.name}}`, this.data[parameter.name]);
            });

        try {
            const _options = {
                sid: this.opencgaSession.opencgaClient._config.token,
                token: this.opencgaSession.opencgaClient._config.token,
                data: isForm? this.dataForm?.body : JSON.parse(this.dataJson.body),
                method: "POST"
            };

            this.isLoading = true;
            this.requestUpdate();
            this.restClient.call(url, _options)
                .then(response => {
                    this.dataJson = {body: JSON.stringify(this._data?.body, undefined, 4)};
                    this.dataForm = {};
                    this.data = UtilsNew.objectClone(this._data);
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                        message: "Endpoint successfully executed"
                    });
                })
                .catch(response => {
                    // Sometimes response is an instance of an String
                    if (typeof response == "string") {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                            message: response
                        });
                    } else {
                        NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
                    }
                    console.error(response);
                })
                .finally(() => {
                    this.isLoading = false;
                    this.requestUpdate();
                });

        } catch (e) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: e
            });
            console.error(e);
        }

    }

    onSubmitJson(e) {
        e.stopPropagation(); // avoid call parent component
        LitUtils.dispatchCustomEvent(this, "submit", false);
    }

    onSubmitForm(e) {
        e.stopPropagation(); // avoid call parent component
        LitUtils.dispatchCustomEvent(this, "submit", true);
    }

    onSubmit(e) {
        let url = this.opencgaSession.opencgaClient._config.host + "/webservices/rest" + this.endpoint.path + "?";
        url = url.replace("{apiVersion}", this.opencgaSession.opencgaClient._config.version);

        if (this.endpoint.method === "GET" || this.endpoint.method === "DELETE") {
            url += "sid=" + this.opencgaSession.opencgaClient._config.token;
            this.#getOrDeleteEndpoint(url);
        }

        if (this.endpoint.method === "POST") {
            this.#postEndpoint(url, e.detail.value);
        }
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
            const modelClassName = name => {
                return name.charAt(0).toLowerCase() + name.slice(1);
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

    openModal(e) {
        $(`#${this._prefix}export-modal`, this).modal("show");
    }

    onExport(e) {
        // simply forwarding from opencga-export to grid components
        this.dispatchEvent(new CustomEvent("export", {
            detail: {
                ...e.detail
            }
        }));
    }

    // not used as changes to exportFields is not propagated outside opencga-export anymore (exportFields is now sent on click on download button via `export` event)
    onChangeExportField(e) {
        // simply forwarding from opencga-export to grid components
        LitUtils.dispatchCustomEvent(this, "changeExportField", e.detail, {});
    }

    onViewModel() {
        this.dataJson = {body: JSON.stringify(this.data?.body, undefined, 4)};
        this.requestUpdate();
        console.log("data", this.dataJson);
    }


    getTabsConfig(elements) {
        const configForm = {
            display: {
                buttonsVisible: this.endpoint.method === "POST" && this.isNotEndPointAdmin() || this.isAdministrator(),
                buttonClearText: "Clear",
                buttonOkText: "Try it out!",
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
                buttonsVisible: this.endpoint.method === "POST" && this.isNotEndPointAdmin() || this.isAdministrator(),
                buttonClearText: "Clear",
                buttonOkText: "Try it out!",
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
                            disabled: !(this.isNotEndPointAdmin() || this.isAdministrator()),
                            rows: 10,
                            help: {
                                text: "Must be a valid json, please remove empty fields if you don't need them."
                            }
                        }
                    }
                ]
            }]
        };

        const items = [];

        if (elements.length > 0) {
            items.push({
                id: "form",
                name: "Form",
                icon: "fab fa-wpforms",
                active: true,
                render: () => {
                    return html`
                        <!-- Body Forms -->
                        <data-form
                            .data="${this.dataForm}"
                            .config="${configForm}"
                            @fieldChange="${e => this.onFormFieldChange(e)}"
                            @clear="${e => this.onClear(e)}"
                            @submit="${this.onSubmitForm}">
                        </data-form>
                    `;
                }
            });
        }

        if (this.dataJson) {
            items.push({
                id: "json",
                name: "JSON",
                icon: "",
                render: () => {
                    return html`
                    <!-- Body Json text area -->
                    <data-form
                        .data="${this.dataJson}"
                        .config="${configJson}"
                        @fieldChange="${e => this.onChangeJsonField(e)}"
                        @clear="${e => this.onClear(e)}"
                        @submit="${this.onSubmitJson}">
                    </data-form>
                `;
                }
            });
        }

        return {
            items: [...items]
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
                            <h3 style="display:inline-block;">Input Parameters</h3>
                            <!-- ${this.endpoint.method === "GET" ?html`
                                <button style="margin-left:8px;margin-bottom:8px"  type="button" class="btn btn-default btn-sm" @click="${this.openModal}">
                                    <i class="fa fa-download icon-padding" aria-hidden="true"></i> Export
                                </button>
                            `:null} -->
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
            <div class="modal fade" tabindex="-1" id="${this._prefix}export-modal" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        ${this._config?.downloading ? html`<div class="overlay"><loading-spinner></loading-spinner></div>` : null}
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 class="modal-title">Export</h4>
                        </div>
                        <div class="modal-body">
                            <opencga-export
                                .config="${
                                    {
                                        resource: "API",
                                        exportTabs: ["link", "code"]
                                    }
                                }"
                                .query="${this.data}"
                                .endpoint="${this.endpoint}"
                                .opencgaSession="${this.opencgaSession}"
                                @export="${this.onExport}"
                                @changeExportField="${this.onChangeExportField}">
                        </opencga-export>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define("rest-endpoint", RestEndpoint);
