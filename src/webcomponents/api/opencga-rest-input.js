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
import RestUtils from "./rest-utils.js";
import UtilsNew from "../../core/utils-new";
import DetailTabs from "../commons/view/detail-tabs";
import NotificationUtils from "../commons/utils/notification-utils";
import LitUtils from "../commons/utils/lit-utils";
import RestClient from "../../core/clients/rest-client";

export default class OpencgaRestInput extends LitElement {

    constructor() {
        super();

        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            endpoint: {
                type: Object,
            },
            opencgaSession: {
                type: Object,
            },
            bodyMode: {
                type: String,
            }
        };
    }

    #init() {
        this.restClient = new RestClient();
        this.isLoading = false;
        // Dictionary: json | both
        this.bodyMode = "json";
        this.displayConfig = {
            width: 12,
            titleVisible: false,
            titleAlign: "left",
            titleWidth: 4,
            buttonsVisible: true,
            buttonsLayout: "bottom", // TODO: Changed to UPPER when TASK-4286 merged
        };
        this.#initOriginalObjects();
    }

    #setLoading(value) {
        this.isLoading = value;
        this.requestUpdate();
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

    opencgaSessionObserver() {
        if (this.opencgaSession?.study && this.data?.param?.study) {
            this.data.param = {...this.data.param, study: this.opencgaSession?.study?.fqn};
            this.data = {...this.data};
        }
    }

    async endpointObserver() {
        this.#initOriginalObjects();
        if (this.endpoint?.parameters?.length > 0) {
            // 1. Build dataform elements from API rest parameters and retrieve JSON data model if necessary.
            // 1.1 Build Query and Path elements
            const queryPathParameters = this.endpoint.parameters.filter(parameter => parameter.param !== "body");
            if (queryPathParameters.length > 0) {
                this.#getDataformElements(queryPathParameters, "param");
            }
            // 1.2. Retrieve JSON model and body elements (if this.bodyMode = "form" || "both")
            const bodyParameters = this.endpoint.parameters.filter(parameter => parameter.param === "body");
            if (bodyParameters.length === 1) {
                if (UtilsNew.isNotEmptyArray(bodyParameters[0].data)) {
                    this.dataModel = await this.#getDataModel(bodyParameters[0].typeClass.replace(";", ""));
                    this.dataJson = {body: JSON.stringify(this.dataModel, undefined, 4)};
                    if (this.bodyMode !== "json") {
                        this.#getDataformElements(bodyParameters[0].data, "body");
                    }
                }
            }
            // 2. Sort and move study to first position
            this.#sortParams();
            // 3. Verify rights
            this.elements = RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession) ?
                this.elements :
                this.elements.map(element => ({...element, display: {disabled: true}}));
            // 4. Add elements to the form configuration
            this.#addElementsToConfig();
            // 5. If the user is logged in, it will show the current study.
            if (this.opencgaSession?.study && this.elements.some(field => field.title === "study")) {
                this.data.param = {...this.data.param, study: this.opencgaSession?.study?.fqn};
            }
            this._data = UtilsNew.objectClone(this.data);
        } else {
            // If the endpoint does not have parameters, show notification
            this.config.sections = {
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
            };
        }
        this.requestUpdate();
    }

    #initOriginalObjects() {
        // Clean up variables when the endpoint change
        this.elementsByType = {
            "query": [],
            "path": [],
            "filter": [],
            "body": [],
        };
        this.elements = [];
        this.dataModel = {};
        this.data = {};
        this._data = {};
        // Get value from list<string>
        this.valuesTolist = {};
    }

    #getDataModel(model) {
        return this.opencgaSession.opencgaClient.meta().model({model: model})
            .then(response => {
                return JSON.parse(response.responses[0].results[0]);
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    #getDataformElements(parameters, parameterType) {
        for (const parameter of parameters) {
            // 1. Get component type: path | filter | query | body
            const componentType = RestUtils.getComponentType(parameter);
            // 2. Build element
            const element = this.#buildElement(parameterType, "", parameter);
            // 3. Add element to the appropriate array
            if (element) {
                this.elementsByType[componentType].push(element);
            } else {
                // CAUTION: it should not enter here
                console.log("CAUTION: element not created");
            }
        }
    }

    #buildElement(parameterType, childFieldName, parameter) {
        const fieldName = childFieldName || parameter.parentName ? `${parameter.parentName}.${parameter.name}` : parameter.name;
        const dataformType = RestUtils.mapParamToDataformType(parameter);

        const element = {
            title: parameter.name,
            // field: `${parameterType}.${fieldName}`,
            field: `${parameterType}.${fieldName}`,
            // type: this.specialTypeKeys(parameter.name) || this.paramsTypeToHtml[parameter.type?.toLowerCase()],
            type: dataformType,
            allowedValues: parameter.allowedValues?.split(/[\s,]+/) || "",
            defaultValue: this.getDefaultValue(parameter),
            required: !!parameter.required,
            display: {
                helpMessage: parameter?.description,
                disabled: parameter.name === "study",
            },
            // display: dataformType === "object-list" ? {
            //     style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
            //     collapsedUpdate: true,
            //     // helpMode: "block",
            //     view: data => html`
            //         <div>${data.id} - ${data?.name}</div>
            //     `,
            // } : {
            //     helpMessage: parameter?.description,
            //     // helpMode: "block",
            //     // CAUTION: should study be disabled?
            //     //   disabled Exist:   (a) Query or Path param
            //     //   disabled Do not exit:  (a) PrimitiveEnum, (b) Object or List, (c) List string
            //     // disabled: parameter.name === "study"
            // },
        };
        if (dataformType === "object-list") {
            element.display = {
                ...element.display,
                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                collapsedUpdate: true,
                // helpMode: "block",
                view: data => html`
                    <div>${data.id} - ${data?.name}</div>
                `,
            };
        }

        // FIXME: try to devise a more clever way of doing this...
        if (RestUtils.isListString(parameter)) {
            element.type = "input-text";
            element.save = value => {
                UtilsNew.setObjectValue(this.valuesTolist, fieldName, value?.split(","));
                return value;
            };
        }

        // 2. If the parameter is object or list with data array, recursive call to create elements.
        if (RestUtils.isObjectOrList(parameter)) {
            let elements = [];
            let childFieldName = "";
            for (const childParam of parameter.data) {
                if (RestUtils.getParameterType(childParam) === "primitive-enum") {
                    childFieldName = parameter.type === "List" ?
                        `${fieldName}[].${childParam.name}`:
                        `${fieldName}.${childParam.name}`;
                }
                elements = [
                    ...elements,
                    this.#buildElement("body", childFieldName, childParam),
                ];
            }
            element.elements = elements;
        }
        return element;
    }

    #sortParams() {
        const byStudy = elm => elm.title === "study" ? -1 : 1;
        this.elements = [
            ...RestUtils.sortArray(this.elementsByType["path"]),
            ...RestUtils.sortArray(this.elementsByType["query"]).sort(byStudy),
            ...RestUtils.sortArray(this.elementsByType["filter"])
        ];
    }

    // Add Elemenets to the form
    #addElementsToConfig() {
        this.config = this.getDefaultConfig();
        // Add elements to respective sections
        if (this.elements.length > 0) {
            // 1. Notes if they exist
            if (this.endpoint?.notes) {
                this.config.sections.push({
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
            // 2. Path and query params
            this.config.sections.push(
                {
                    title: "Path and Query Params",
                    display: {
                        titleHeader: "h5",
                        style: "margin-left: 20px",
                    },
                    elements: [...this.elements]
                }
            );
        }

        //  If POST and body EXISTS then we must show the FORM and JSON tabs
        // TOOD: Pablo me insiste en que os diga los 2 REST: interpretation clear y secondary index configure
        if (this.endpoint.method === "POST" && this.endpoint.parameters.findIndex(parameter => parameter.param === "body") !== -1) {
            const bodyElementsForm = RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession) ?
                this.elementsByType["body"] :
                this.elementsByType["body"].map(element => ({...element, display: {disabled: true}}));
            this.config.sections.push({
                title: "Body",
                display: {
                    titleHeader: "h5",
                    style: "margin-left: 20px"
                },
                elements: [
                    {
                        type: "custom",
                        display: {
                            render: () => html`
                                <detail-tabs
                                    .data="${{}}"
                                    .config="${{items: this.getTabsConfig(bodyElementsForm), hideTabsIfOnlyOneVisible: true}}"
                                    .mode="${DetailTabs.TABS_MODE}">
                                </detail-tabs>
                            `,
                        }
                    }
                ]
            });
        }
    }

    getDefaultValue(parameter) {
        if (parameter.type === "boolean") {
            return parameter?.defaultValue === "true" || parameter?.defaultValue === true;
        }
        return parameter?.defaultValue ?? "";
    }

    onChangeFormField(e) {
        e.stopPropagation();
        this.data = {...e.detail.data};
        this.requestUpdate();
    }

    onClear(e) {
        e.stopPropagation();
        this.dataJson = {body: JSON.stringify(this.dataModel, undefined, 4)};
        this.data = UtilsNew.objectClone(this._data);
        this.valuesTolist = {};
        this.requestUpdate();
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
            this.#getOrDeleteEndpoint(url);
        }

        if (this.endpoint.method === "POST") {
            this.#postEndpoint(url, e.detail.value);
        }
    }

    #getOrDeleteEndpoint(url) {
        // Replace PATH params
        this.endpoint.parameters
            .filter(parameter => parameter.param === "path")
            .forEach(parameter => {
                url = url.replace(`{${parameter.name}}`, this.data.param[parameter.name]);
            });

        // Add QUERY params
        this.endpoint.parameters
            .filter(parameter => parameter.param === "query" && this.data.param[parameter.name])
            .forEach(parameter => {
                url += `&${parameter.name}=${this.data.param[parameter.name]}`;
            });

        let error, result;
        this.#setLoading(true);
        this.restClient.call(url, {method: this.endpoint.method})
            .then(response => {
                result = UtilsNew.objectClone(response.responses[0].results);
            })
            .catch(reason => {
                error = reason;
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, reason);
            })
            .finally(() => {
                LitUtils.dispatchCustomEvent(this, "submit", result, {}, error);
                this.#setLoading(false);
            });
    }

    #postEndpoint(url, isForm) {
        // Add Study
        url += "study=" + encodeURIComponent(this.opencgaSession.study.fqn);

        // Replace PATH params
        this.endpoint.parameters
            .filter(parameter => parameter.param === "path")
            .forEach(parameter => {
                url = url.replace(`{${parameter.name}}`, this.data.param[parameter.name]);
            });

        // Add QUERY params
        this.endpoint.parameters
            .filter(parameter => (parameter.param === "query" && parameter.name !== "study") && this.data.param[parameter.name])
            .forEach(parameter => {
                url += `&${parameter.name}=${this.data.param[parameter.name]}`;
            });

        // check if QUERY is required and it is not exist in the data
        this.endpoint.parameters
            .filter(parameter => (parameter.param === "query" && parameter.required) && typeof this.data.param[parameter.name] === "undefined")
            .forEach(parameter => {
                url += `&${parameter.name}=${parameter.defaultValue}`;
            });

        const _options = {
            sid: this.opencgaSession.opencgaClient._config.token,
            token: this.opencgaSession.opencgaClient._config.token,
            data: isForm ? this.formatBody(this.data?.body) : JSON.parse(this.dataJson?.body),
            method: "POST",
        };

        this.isLoading = true;
        this.requestUpdate();
        this.restClient.call(url, _options)
            .then(() => {
                this.dataJson = {body: JSON.stringify(this.dataModel, undefined, 4)};
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
    }

    formatBody(data) {
        if (UtilsNew.isNotEmpty(this.valuesTolist)) {
            Object.keys(this.valuesTolist).forEach(key => {
                UtilsNew.setObjectValue(data, key, this.valuesTolist[key]);
            });
        }
        return data;
    }

    getTabsConfig(bodyElements) {
        const items = [];
        const configJsonTab = {
            display: {
                // buttonsVisible: this.endpoint.method === "POST" && RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession),
                // buttonClearText: "Clear",
                // buttonOkText: "Try it out!",
            },
            sections: [
                {
                    display: {
                        titleHeader: "h4",
                    },
                    elements: [
                        {
                            field: "body",
                            type: "json-editor",
                            display: {
                                placeholder: "write json",
                                readOnly: !(RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession)),
                                help: {
                                    text: "Must be a valid json, please remove empty fields if you don't need them."
                                }
                            }
                        },
                    ]
                }
            ]
        };
        const configFormTab = {
            display: {
                // buttonsVisible: this.endpoint.method === "POST" && RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession),
                // buttonClearText: "Clear",
                // buttonOkText: "Try it out!",
            },
            sections: [{
                display: {
                    titleHeader: "h4",
                },
                elements: [...bodyElements]
            }]
        };

        if (this.dataJson) {
            items.push({
                id: "json",
                name: "JSON",
                icon: "",
                render: () => html`
                    <!-- Body Json text area -->
                    <data-form
                        .data="${this.dataJson}"
                        .config="${configJsonTab}"
                        @fieldChange="${e => this.onChangeJsonField(e, "body")}"
                        @clear="${e => this.onClear(e)}"
                        @submit="${this.onSubmitJson}">
                    </data-form>
                `,
            });
        }

        if (bodyElements.length > 0) {
            items.push({
                id: "form",
                name: "Form",
                icon: "fab fa-wpforms",
                active: true,
                visible: this.bodyMode === "both",
                render: () => html`
                    <!-- Body Forms -->
                    <data-form
                        .data="${this.data}"
                        .config="${configFormTab}"
                        @fieldChange="${e => this.onChangeFormField(e)}"
                        @clear="${e => this.onClear(e)}"
                        @submit="${this.onSubmitForm}">
                    </data-form>
                `,
            });
        }
        return items;
    }

    onChangeJsonField(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
        // For Json input: param is called body

        if (param === "body") {
            // pass json as text
            const jsonAsText = e.detail.value?.text ? e.detail.value.text : JSON.stringify(e.detail.value.json, undefined, 4);
            this.dataJson = {...this.dataJson, body: jsonAsText};
        }
    }

    render() {
        if (!this.endpoint) {
            return;
        }
        return html`
            <!-- Parameters Section-->
            <div class="py-2 px-3">
                <h3 class="d-inline-block">Input Parameters</h3>
                <div class="p-4">
                    <data-form
                        .data="${this.data}"
                        .config="${this.config}"
                        @fieldChange="${e => this.onChangeFormField(e)}"
                        @clear="${this.onClear}"
                        @submit="${this.onSubmit}">
                    </data-form>
                </div>
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            type: "tabs",
            display: this.displayConfig,
            buttons: {
                clearText: "Discard Changes",
                okText: "Try it out!",
            },
            sections: [],
        };
    }

}

customElements.define("opencga-rest-input", OpencgaRestInput);
