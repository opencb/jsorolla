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
import UtilsNew from "../../../core/utilsNew.js";
import "../../loading-spinner.js";

export default class SignatureView extends LitElement {

    constructor() {
        super();

        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            signature: {
                type: Object
            },
            // active: {
            //     type: Boolean
            // },
            mode: {
                type: String // view | plot
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        this._prefix = UtilsNew.randomString(8);
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        //loading spinner is shown in case this.signature is undefined or null
        // debugger
        // if ((changedProperties.has("signature") || changedProperties.has("active")) && this.active && this.signature) {
        //     this.signatureObserver();
        // }

        if (changedProperties.has("signature")) {
            this.signatureObserver();
        }
    }

    signatureObserver() {
        if (!this.signature || this.signature?.errorState) {
            return;
        }

        const counts = this.signature.counts;
        const categories = counts.map(point => point?.context)
        const data = counts.map(point => point?.total)

        const substitutionClass = string => {
            const [,pair,letter] = string.match(/[ACTG]\[(([ACTG])>[ACTG])\][ACTG]+/);
            return {pair, letter};
        }

        const dataset = {
            "C>A": {
                color: "#31bef0",
                data: []
            },
            "C>G": {
                color: "#000000",
                data: []
            },
            "C>T": {
                color: "#e62725",
                data: []
            },
            "T>A": {
                color: "#cbcacb",
                data: []
            },
            "T>C": {
                color: "#a1cf63",
                data: []
            },
            "T>G": {
                color: "#edc8c5",
                data: []
            }
        };

        for (let count of counts) {
            if (count) {
                const {pair} = substitutionClass(count.context);
                dataset[pair].data.push(count.total);
            }
        }
        const addRects = function(chart) {
            $(".rect", this).remove();
            $(".rect-label", this).remove();
            let lastStart = 0;
            for (const k in dataset) {
                //console.log("chart.categories", chart.xAxis)
                //console.log("k", dataset[k].data.length)
                const xAxis = chart.xAxis[0];
                chart.renderer.rect(xAxis.toPixels(lastStart), 30, xAxis.toPixels(dataset[k].data.length) - xAxis.toPixels(1), 10, 0)
                    .attr({
                        fill: dataset[k].color,
                        zIndex: 2
                    }).addClass("rect")
                    .add();

                // for some reason toPixels(lastStart + dataset[k].data.length / 2) isn't centered
                chart.renderer.label(k, xAxis.toPixels(lastStart - 4 + dataset[k].data.length / 2), 0, "")
                    .css({
                        color: "#000",
                        fontSize: "13px"
                    })
                    .attr({
                        padding: 8,
                        r: 5,
                        zIndex: 3
                    }).addClass("rect-label")
                    .add();

                lastStart += dataset[k].data.length;
            }
        };

        $(`#${this._prefix}SignaturePlot`).highcharts({
            title: "title",
            chart: {
                height: this._config.height, // use plain CSS to avoid resize when <loading-spinner> is visible
                type: "column",
                events: {
                    redraw: function() {
                        addRects(this);
                    },
                    load: function() {
                        addRects(this);
                    }
                },
                marginTop: 70
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function() {
                    const {pair, letter} = substitutionClass(this.x)
                    return this.x.replace(pair, `<span style="color:${dataset[pair].color}">${letter}</span>`).replace("\[", "").replace("\]", "") + `<strong>:${this.y}</strong>`;
                }
            },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -90,
                    formatter: function () {
                        const {pair, letter} = substitutionClass(this.value)
                        return this.value.replace(pair, `<span style="color:${dataset[pair].color}">${letter}</span>`).replace("\[", "").replace("\]", "");
                    }
                }
            },
            colors: Object.keys(dataset).flatMap(key => Array(dataset[key].data.length).fill(dataset[key].color)),
            series: [{
                colorByPoint: "true",
                data: data
            }]
        });
    }

    getDefaultConfig() {
        return {
            //width: null, width is always 100% of the visible container
            height: 240,
        }
    }

    render() {
        if (this.signature?.errorState) {
            return html`<div class="alert alert-danger">${this.signature.errorState}</div>`;
        }

        return html`
            <div style="height: ${this._config.height}px">
                ${this.signature
                        ? html`
                            <div style="margin: 10px">
                                <h4>${this.signature.counts.map(s => s.total).reduce((a, b) => a + b, 0)} Substitutions</h4>
                            </div>
                            <div id="${this._prefix}SignaturePlot"></div>`
                        : html`<loading-spinner></loading-spinner>`
                }
            </div>
            <!-- list of files -->`
    }

}

customElements.define("signature-view", SignatureView);
