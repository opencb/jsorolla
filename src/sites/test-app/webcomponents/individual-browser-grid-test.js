
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
import UtilsNew from "../../../core/utils-new.js";
import "../../../webcomponents/individual/individual-grid.js";
import "../../../webcomponents/individual/individual-detail.js";
import "../../../webcomponents/individual/individual-view.js";
import "../../../webcomponents/commons/json-viewer.js";
import NotificationUtils from "../../../webcomponents/commons/utils/notification-utils.js";
import "../../../webcomponents/individual/individual-update.js";
import "../../../webcomponents/individual/individual-create.js";


class IndividualBrowserGridTest extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            testDataVersion: {
                type: String
            },
        };
    }

    #init() {
        this.COMPONENT_ID = "individual-browser";
        this.FILES = [
            "individuals-platinum.json",
        ];
        this._data = null;
        this._selectedInstance = {};

        this._config = {};
    }

    update(changedProperties) {
        /* if (changedProperties.has("testFile") &&
            changedProperties.has("testDataVersion") &&
            changedProperties.has("opencgaSession")) {
            this.opencgaSessionObserver();
        } */
        if (changedProperties.has("testDataVersion") || changedProperties.has("opencgaSession")) {
            this.propertyObserver();
        }

        super.update(changedProperties);
    }

    propertyObserver() {
        if (this.opencgaSession && this.testDataVersion) {
            const promises = this.FILES.map(file => {
                return UtilsNew.importJSONFile(`./test-data/${this.testDataVersion}/${file}`);
            });

            // Import all files
            Promise.all(promises)
                .then(data => {
                    this._data = data[0];
                    this._selectedInstance = this._data[0];
                    // Mutate data and update
                    this.mutate();
                    this.requestUpdate();
                })
                .catch(error => {
                    NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_RESPONSE, error);
                });
        }
    }

    onSettingsUpdate() {
        this._config = {
            ...this.opencgaSession?.user?.configs?.IVA?.settings?.[this.COMPONENT_ID]?.grid,
        };
        // this.propertyObserver();
        this.requestUpdate();
    }

    getDefaultTabsConfig() {
        return {
            title: "Individual",
            showTitle: true,
            items: [
                {
                    id: "individual-view",
                    name: "Overview",
                    active: true,
                    render: (individual, active, opencgaSession) => html`
                        <individual-view
                            .individual="${individual}"
                            .active="${active}"
                            .opencgaSession="${opencgaSession}">
                        </individual-view>
                    `,
                },
                {
                    id: "json-view",
                    name: "JSON Data",
                    render: (individual, active, opencgaSession) => html`
                        <json-viewer
                            .data="${individual}"
                            .active="${active}">
                        </json-viewer>
                    `,
                }
            ]
        };
    }

    mutate() {
        // return null;
        // Mutation 1: The first individual has annotations with the variable sets defined for the study
        this._data[0].annotationSets = [
            {
                id: "cardiology_tests_checklist_annotationset",
                name: "cariodology_tests_checklist_annotationset",
                variableSetId: "cardiology_tests_checklist",
                annotations: {
                    ecg_exercise_test: "YES",
                    electrophysiological_study: "YES",
                    echo_test: "NO",
                    ecg_test: "YES"
                },
                creationDate: "20231006101625",
                release: 1,
                attributes: []
            },
            {
                id: "risk_assessment_annotationset",
                name: "risk_assessment_annotationset",
                variableSetId: "risk_assessment",
                annotations: {
                    date_risk_assessment: "20-05-2022",
                    risk_score: 7,
                    vf_cardiac_arrest_events: "NO",
                    sdc_iad_family_history: "UNKNOWN",
                },
                creationDate: "20231006101625",
                release: 1,
                attributes: []
            },
        ];
        // Mutation 2: This study has some variableSets defined
        this.opencgaSession.study.variableSets = [
            {
                "id": "cardiology_test_checklist",
                "name": "Individual cardiology test checklist variableSet name",
                "unique": true,
                "confidential": false,
                "internal": false,
                "description": "Individual cardiology test checklist variableSet descriptino",
                "variables": [
                    {
                        "id": "echo_test",
                        "name": "echo_test variable name",
                        "category": "",
                        "type": "CATEGORICAL",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": ["YES", "NO", "UNKNOWN"],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "echo_test variable description",
                        "attributes": {}
                    },
                    {
                        "id": "ecg_test",
                        "name": "ecg_test variable name",
                        "category": "",
                        "type": "CATEGORICAL",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": ["YES", "NO", "UNKNOWN"],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "ecg_test variable description",
                        "attributes": {}
                    },
                    {
                        "id": "ecg_exercise_test",
                        "name": "ecg_exercise_test variable name",
                        "category": "",
                        "type": "CATEGORICAL",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": ["YES", "NO", "UNKNOWN"],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "ecg_exercise_test variable description",
                        "attributes": {}
                    },
                    {
                        "id": "electrophysiological_study",
                        "name": "electrophysiological_study variable name",
                        "category": "",
                        "type": "CATEGORICAL",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": ["YES", "NO", "UNKNOWN"],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "electrophysiological_study variable description",
                        "attributes": {}
                    },

                ],

            },
            {
                "id": "risk_assessment",
                "name": "Risk assessment variableSet name",
                "unique": true,
                "confidential": false,
                "internal": false,
                "description": "Risk assessment variableSet description",
                "variables": [
                    {
                        "id": "date_risk_assessment",
                        "name": "date_risk_assessment variable name",
                        "category": "",
                        "type": "DATE",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": [],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "date_risk_assessment variable description",
                        "attributes": {}
                    },
                    {
                        "id": "risk_score",
                        "name": "risk_score variable name",
                        "category": "",
                        "type": "INTEGER",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": [],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "risk_score variable description",
                        "attributes": {}
                    },
                    {
                        "id": "vf_cardiac_arrest_events",
                        "name": "vf_cardiac_arrest_events variable name",
                        "category": "",
                        "type": "CATEGORICAL",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": ["YES", "NO", "UNKNOWN"],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "vf_cardiac_arrest_events variable description",
                        "attributes": {}
                    },
                    {
                        "id": "sdc_iad_family_history",
                        "name": "sdc_iad_family_history variable name",
                        "category": "",
                        "type": "CATEGORICAL",
                        "required": false,
                        "multiValue": false,
                        "allowedValues": ["YES", "NO", "UNKNOWN"],
                        "rank": 2,
                        "dependsOn": "",
                        "description": "sdc_iad_family_history variable description",
                        "attributes": {}
                    },

                ],

            },
        ];

        // Mutation 3: annotation columns enabled through the admin interface in filter.result.grid
        // See example of use in browser.settings.js, INDIVIDUAL_BROWSER
        this._config.annotations = [
            {
                title: "Cardiology Tests",
                position: 6,
                variableSetId: "cardiology_tests_checklist",
                variables: ["ecg_test", "echo_test"]
            },
            {
                title: "Risk Assessment",
                position: 7,
                variableSetId: "risk_assessment",
                variables: ["date_risk_assessment"]

            }
        ];

    }

    selectInstance(e) {
        this._selectedInstance = e.detail.row;
        this.requestUpdate();
    }

    render() {
        if (!this._data) {
            return html`Processing`;
        }

        return html`
            <div data-cy="individual-browser-container">
                <h2 style="font-weight: bold;">
                    Individual Browser Grid (${this.FILES[0]})
                </h2>
                <individual-grid
                    .toolId="${this.COMPONENT_ID}"
                    .individuals="${this._data}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this._config}"
                    @settingsUpdate="${() => this.onSettingsUpdate()}"
                    @selectrow="${this.selectInstance}">
                </individual-grid>
                <individual-detail
                    .individual="${this._selectedInstance}"
                    .opencgaSession="${this.opencgaSession}"
                    .config="${this.getDefaultTabsConfig()}">
                </individual-detail>
            </div>
        `;
    }

}

customElements.define("individual-browser-grid-test", IndividualBrowserGridTest);
