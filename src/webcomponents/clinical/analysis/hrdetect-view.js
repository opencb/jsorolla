/*
 * Copyright 2015-2016 OpenCB
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
import UtilsNew from "../../../core/utils-new.js";
import "../../commons/forms/data-form.js";

class HRDetectView extends LitElement {

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
                type: Object,
            },
            hrdetect: {
                type: Object,
            },
        };
    }

    #init() {
        this._prefix = UtilsNew.randomString(8);

        this.data = {};
        this.config = this.getDefaultConfig();
    }

    update(changedProperties) {
        if (changedProperties.has("hrdetect")) {
            this.data = {};
            this.config = this.getDefaultConfig();
        }

        super.update(changedProperties);
    }

    onFieldChange(e) {
        const hrdetect = this.hrdetect.find(item => item.id === e.detail.value) || null;
        this.data = {
            id: e.detail.value,
            hrdetect: hrdetect,
            scores: Object.keys(hrdetect?.scores || {}).map(key => ({
                key: key,
                value: hrdetect.scores[key],
            })),
        };
        this.requestUpdate();
    }

    renderQuery(query) {
        return Object.keys(query || {}).map(key => html`
            <span class="badge text-bg-primary">
                ${key}: ${query[key]}
            </span>
        `);
    }

    render() {
        if (!this.hrdetect || this.hrdetect.length === 0) {
            return html`
                <div class="alert alert-info">
                    <i class="fas fa-3x fa-info-circle align-middle" style="padding-right: 10px"></i> No HRDetect Data available.
                </div>
            `;
        }

        return html`
            <data-form
                .data=${this.data}
                .config="${this.config}"
                @fieldChange="${e => this.onFieldChange(e)}">
            </data-form>
        `;
    }

    getDefaultConfig() {
        return {
            // title: "HRDetect",
            display: {
                buttonsVisible: false,
            },
            sections: [
                {
                    title: "",
                    elements: [
                        {
                            name: "Select HRDetect",
                            field: "id",
                            type: "select",
                            defaultValue: ".",
                            allowedValues: UtilsNew.sort((this.hrdetect || []).map(h => h.id)),
                        }
                    ],
                },
                {
                    title: "",
                    display: {
                        visible: data => !!data.hrdetect,
                    },
                    elements: [
                        {
                            name: "ID",
                            type: "custom",
                            field: "hrdetect.id",
                            display: {
                                render: id => id || "-",
                            },
                        },
                        {
                            name: "Description",
                            type: "custom",
                            field: "hrdetect.description",
                            display: {
                                render: description => description || "No description provided.",
                            },
                        },
                        {
                            name: "SNV Fitting ID",
                            type: "custom",
                            field: "hrdetect.snvFittingId",
                            display: {
                                render: snvFittingId => snvFittingId || "-",
                            },
                        },
                        {
                            name: "SV Fitting ID",
                            type: "custom",
                            field: "hrdetect.svFittingId",
                            display: {
                                render: svFittingId => svFittingId || "-",
                            },
                        },
                        {
                            name: "CNV Query",
                            type: "custom",
                            field: "hrdetect.cnvQuery",
                            display: {
                                render: cnvQuery => this.renderQuery(cnvQuery),
                            },
                        },
                        {
                            name: "INDEL Query",
                            type: "custom",
                            field: "hrdetect.indelQuery",
                            display: {
                                render: indelQuery => this.renderQuery(indelQuery),
                            },
                        },
                        {
                            name: "Probability",
                            field: "scores",
                            display: {
                                format: scores => {
                                    return scores.find(row => row.key?.toLowerCase?.() === "probability")?.value?.toFixed?.(2) || "-";
                                },
                            },
                        },
                        {
                            name: "Contributions",
                            field: "scores",
                            type: "table",
                            display: {
                                showHeader: false,
                                filter: data => (data || []).filter(row => {
                                    return !["intercept", "probability"].includes(row?.key?.toLowerCase?.());
                                }),
                                transform: data => data.toSorted((a, b) => b.value - a.value),
                                columns: [
                                    {
                                        title: "key",
                                        field: "key"
                                    },
                                    {
                                        title: "value",
                                        field: "value",
                                        display: {
                                            format: value => value.toFixed(2),
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        };
    }

}

customElements.define("hrdetect-view", HRDetectView);
