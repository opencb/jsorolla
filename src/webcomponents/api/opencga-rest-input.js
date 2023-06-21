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
import Types from "../commons/types";
import NotificationUtils from "../commons/utils/notification-utils";
import LitUtils from "../commons/utils/lit-utils";


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
        };
    }

    #init() {
        // CAUTION: not sure if needed
        this.dataJson = {};
        this.data = {};
        this._data = {};
        // get value from list<string>
        this.valuesTolist = {};

        // Data Structure for Json
        this.dataModel = {};
        // Config for data-form endpoint
        this.configFormEndpoint = {};
        // CAUTION: new
        this.elementsByType = {
            "query": [],
            "path": [],
            "body": [],
            "filter": [],
        };
    }

    update(changedProperties) {
        if (changedProperties.has("endpoint")) {
            this.endpointObserver();
        }
        super.update(changedProperties);
    }

    #buildElement(parameterType, childFieldName, parameter) {
        const fieldName = childFieldName || parameter.parentName ? `${parameter.parentName}.${parameter.name}` : parameter.name;
        const dataformType = RestUtils.mapParamToDataformType(parameter);
        if (parameter.name === "phenotypes") {
            // debugger
        }

        const element = {
            title: parameter.name,
            // field: `${parameterType}.${fieldName}`,
            field: `${parameterType}.${fieldName}`,
            // type: this.specialTypeKeys(parameter.name) || this.paramsTypeToHtml[parameter.type?.toLowerCase()],
            type: dataformType,
            allowedValues: parameter.allowedValues?.split(/[\s,]+/) || "",
            defaultValue: this.getDefaultValue(parameter),
            required: !!parameter.required,
            display: dataformType === "object-list" ? {
                style: "border-left: 2px solid #0c2f4c; padding-left: 12px; margin-bottom:24px",
                collapsedUpdate: true,
                view: data => html`
                    <div>${data.id} - ${data?.name}</div>
                `,
            } : {
                helpMessage: parameter?.description,
                // CAUTION: should study be disabled?
                //   disabled Exist:   (a) Query or Path param
                //   disabled Do not exit:  (a) PrimitiveEnum, (b) Object or List, (c) List string
                // disabled: parameter.name === "study"
            },
        };

        // FIXME: try to devise a more clever way of doing this...
        if (RestUtils.isListString(parameter)) {
            element.type = "input-text";
            element.save = value => {
                UtilsNew.setObjectValue(this.valuesTolist, fieldName, value?.split(","));
                return value;
            };
        }

        // 2. If the parameter has data attribute (is an object or a list),
        // recursive call to create elements.
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

    #getDataModel(model) {
        return this.opencgaSession.opencgaClient.meta().model({model: model})
            .then(response => {
                return JSON.parse(response.responses[0].results[0]);
            })
            .catch(response => {
                NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, response);
            });
    }

    disabledElements(elements) {
        return elements.map(element => ({...element, display: {disabled: true}}));
    }

    getDefaultValue(parameter) {
        if (parameter.type === "boolean") {
            return parameter?.defaultValue === "true" || parameter?.defaultValue === true;
        }
        return parameter?.defaultValue ?? "";
    }

    async endpointObserver() {
        this.result = "";
        const hasStudyField = fieldElements => this.opencgaSession?.study && fieldElements.some(field => field.name === "study");
        this.configFormEndpoint = {};
        this.elementsByType = {
            "query": [],
            "path": [],
            "body": [],
            "filter": [],
        };
        this.elements = [];

        if (this.endpoint?.parameters?.length > 0) {
            // Init some of the variables: this will clean up when the endpoint is changed
            this.dataModel = {};
            this.data = {};

            // FIXME DELETE: dictionary for param
            // const dictionaryParam = [...new Set(this.endpoint.parameters.map(item => item.type))];

            // 1. POST endpoint
            const bodyParameters = this.endpoint.parameters.filter(parameter => parameter.param === "body");
            if (bodyParameters.length === 1) {
                if (UtilsNew.isNotEmptyArray(bodyParameters[0].data)) {
                    this.dataModel = await this.#getDataModel(bodyParameters[0].typeClass.replace(";", ""));
                    this.#getDataformElements(bodyParameters[0].data, "body");
                }
            }

            // 2. Query and Path params
            const queryPathParameters = this.endpoint.parameters.filter(parameter => parameter.param !== "body");
            if (queryPathParameters.length > 0) {
                this.#getDataformElements(queryPathParameters, "param");
            }

            // 2. Sort and move 'study/ to first position
            const byStudy = elm => elm.title === "study" ? -1 : 1;
            const elements = [
                ...RestUtils.sortArray(this.elementsByType["path"]),
                ...RestUtils.sortArray(this.elementsByType["query"]).sort(byStudy),
                ...RestUtils.sortArray(this.elementsByType["filter"])
            ];
            const fieldElements = RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession) ? elements : this.disabledElements(elements);

            // 3. Init Form
            this.configFormEndpoint = {
                type: "form",
                display: {
                    width: "12",
                    labelWidth: "3",
                    defaultLayout: "horizontal",
                    buttonClearText: "Clear",
                    buttonOkText: "Try it out!",
                    buttonsVisible: (this.endpoint.method === "GET" || this.endpoint.method === "DELETE") && (RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession))
                },
                sections: []
            };

            // Add Elemenets to the form
            if (fieldElements.length > 0) {
                // Check if there are 'notes' to display
                if (this.endpoint?.notes) {
                    this.configFormEndpoint.sections.push({
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

                this.configFormEndpoint.sections.push(
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
                const bodyElementsForm = RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession) ? this.elementsByType["body"] : this.disabledElements(this.elementsByType["body"]);
                this.configFormEndpoint.sections.push({
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
            if (RestUtils.hasStudyField(fieldElements)) {
                // this.data = {...this.data, study: this.opencgaSession?.study?.fqn};
                this.data.param = {...this.data.param, study: this.opencgaSession?.study?.fqn};
            }

            // 6. Get data.body to JSON.
            this.dataJson = {body: JSON.stringify(this.dataModel, undefined, 4)};

            // Copy Original Data
            this._data = UtilsNew.objectClone(this.data);
        } else {
            // If parameters no found
            this.configFormEndpoint = Types.dataFormConfig({
                type: "form",
                display: {
                    buttonClearText: "",
                    buttonOkText: "Try it out!",
                    labelWidth: "3",
                    defaultLayout: "horizontal",
                    buttonsVisible: (this.endpoint.method === "GET" || this.endpoint.method === "DELETE") && (RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession)),
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

    onChangeFormField(e, field) {
        e.stopPropagation();
        const param = field || e.detail.param;
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
            url += "sid=" + this.opencgaSession.opencgaClient._config.token;
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

        try {
            const _options = {
                sid: this.opencgaSession.opencgaClient._config.token,
                token: this.opencgaSession.opencgaClient._config.token,
                data: isForm ? this.formatBody(this.data?.body) : JSON.parse(this.dataJson?.body),
                method: "POST"
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

        } catch (e) {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_ERROR, {
                message: e
            });
            console.error(e);
        }

    }

    formatBody(data) {
        if (UtilsNew.isNotEmpty(this.valuesTolist)) {
            Object.keys(this.valuesTolist).forEach(key => {
                UtilsNew.setObjectValue(data, key, this.valuesTolist[key]);
            });
        }
        return data;
    }

    getTabsConfig(elements) {
        const configFormTab = {
            display: {
                buttonsVisible: this.endpoint.method === "POST" && RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession),
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

        const configJsonTab = {
            display: {
                buttonsVisible: this.endpoint.method === "POST" && RestUtils.isNotEndPointAdmin(this.endpoint) || RestUtils.isAdministrator(this.opencgaSession),
                buttonClearText: "Clear",
                buttonOkText: "Try it out!",
            },
            sections: [{
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
                            .data="${this.data}"
                            .config="${configFormTab}"
                            @fieldChange="${e => this.onChangeFormField(e)}"
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
                            .config="${configJsonTab}"
                            @fieldChange="${e => this.onChangeJsonField(e, "body")}"
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
            <div style="padding: 5px 10px">
                <h3 style="display:inline-block;">Input Parameters</h3>
                <div style="padding: 20px">
                    <data-form
                        .data="${this.data}"
                        .config="${this.configFormEndpoint}"
                        @fieldChange="${e => this.onChangeFormField(e)}"
                        @clear="${this.onClear}"
                        @submit="${this.onSubmit}">
                    </data-form>
                </div>
            </div>
        `;
    }

}

customElements.define("opencga-rest-input", OpencgaRestInput);
