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

import {LitElement, html} from "lit";
import UtilsNew from "../../core/utilsNew.js";
import "../commons/tool-header.js";

//  Rodiel 2022-09-30 DEPRECATED use study-create
export default class StudyForm extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            project: {
                type: Object
            },
            opencgaSession: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.study = {};
    }

    onFieldChange(e) {
        const field = e.detail.param;
        switch (e.detail.param) {
            case "id":
            case "name":
            case "description":
                this.study = {
                    ...this.study,
                    [field]: e.detail.value
                };
                break;
        }
        // Study is not a lit property  #L32,
        // so it's necessary use requestUpdate();
        this.requestUpdate();
        console.log("New Study", this.study);
    }

    getSaveForm(e) {
        console.log(e.detail.param);
    }

    onSave(e) {
        // TODO: Check it's ok ?
        this.opencgaSession.opencgaClient.studies().create(this.study, {project: this.project.fqn})
            .then(res => {
                this.study = {};
                this.requestUpdate();

                this.dispatchEvent(new CustomEvent("sessionUpdateRequest", {
                    detail: {
                    },
                    bubbles: true,
                    composed: true
                }));

                Swal.fire(
                    "New Study",
                    "New Study created correctly.",
                    "success"
                );
            })
            .catch(err => {
                console.error(err);
                params.error(err);
            });
        $("#newStudy").modal("hide"); // TODO: refactor this function.
    }

    onHide() {
        this.dispatchEvent(new CustomEvent("hide", {
            detail: {},
            bubbles: true,
            composed: true
        }));
    }

    getStudyFormConfig() {
        return {
            title: "Edit",
            icon: "fas fa-edit",
            type: "form",
            buttons: {
                show: true,
                cancelText: "Cancel",
                okText: "Save"
            },
            display: {
                style: "margin: 25px 50px 0px 0px",
                // mode: {
                //     type: "modal",
                //     title: "Review Variant",
                //     buttonClass: "btn-link"
                // },
                labelWidth: 3,
                labelAlign: "right",
                defaultValue: "",
                defaultLayout: "horizontal",
            },
            sections: [
                {
                    elements: [
                        {
                            name: "id",
                            field: "id",
                            type: "input-text",
                            display: {
                                placeholder: "Add a short ID...",
                            }
                        },
                        {
                            name: "Name",
                            field: "name",
                            type: "input-text",
                            display: {
                                placeholder: "Study name...",
                            }
                        },
                        {
                            name: "Description",
                            field: "description",
                            type: "input-text",
                            display: {
                                rows: 3,
                                placeholder: "Study description...",
                            }
                        },
                    ]
                }
            ]
        };
    }

    render() {
        return html`
            <data-form  .data=${this.study}
                        .config="${this.getStudyFormConfig()}"
                        @fieldChange="${e => this.onFieldChange(e)}"
                        @clear="${this.onHide}"
                        @submit="${this.onSave}">
            </data-form>
        `;
    }

}

customElements.define("study-form", StudyForm);
