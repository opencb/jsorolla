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
            mode: {
                type: String // view | plot
            },
            plots: {
                type: Array,
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = UtilsNew.randomString(8);
        this.plots = ["counts"];
        this.mode = "SBS";
    }

    connectedCallback() {
        super.connectedCallback();

        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("signature") && this.plots.includes("counts")) {
            this.signatureCountsObserver();
        }

        if (changedProperties.has("signature") && this.plots.includes("fitting")) {
            this.signatureFittingObserver();
        }
    }

    signatureCountsObserver() {
        if (!this.signature || this.signature?.errorState) {
            return;
        }

        const mode = this.mode.toUpperCase();
        const counts = this.signature.counts;
        const categories = counts.map(point => point?.context);
        const data = counts.map(point => point?.total);

        const substitutionClass = string => {
            const [, pair, letter] = string.match(/[ACTG]\[(([ACTG])>[ACTG])\][ACTG]+/);
            return {pair, letter};
        };

        const rearragementClass = string => {
            const fields = string.split("_");
            const pair = fields[0] + "_" + fields[1];
            const letter = fields[2] || "";
            return {pair, letter};
        };

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
            },
            "clustered_del": {
                color: "#e41a1c",
                data: [],
                label: "del",
                group: "clustered",
            },
            "clustered_tds": {
                color: "#4daf4a",
                data: [],
                label: "tds",
                group: "clustered",
            },
            "clustered_inv": {
                color: "#377eb8",
                data: [],
                label: "inv",
                group: "clustered",
            },
            "clustered_trans": {
                color: "#984ea3",
                data: [],
                label: "tr",
                group: "clustered",
            },
            "non-clustered_del": {
                color: "#e41a1c",
                data: [],
                label: "del",
                group: "non-clustered",
            },
            "non-clustered_tds": {
                color: "#4daf4a",
                data: [],
                label: "tds",
                group: "non-clustered",
            },
            "non-clustered_inv": {
                color: "#377eb8",
                data: [],
                label: "inv",
                group: "non-clustered",
            },
            "non-clustered_trans": {
                color: "#984ea3",
                data: [],
                label: "tr",
                group: "non-clustered",
            },
        };

        const groups = {
            "clustered": {
                bgColor: "#000",
                textColor: "#fff",
            },
            "non-clustered": {
                bgColor: "#f0f0f0",
                textColor: "#000",
            },
        };

        counts.forEach(count => {
            if (count) {
                if (this.mode === "SBS") {
                    const {pair} = substitutionClass(count.context);
                    dataset[pair].data.push(count.total);
                } else {
                    const {pair} = rearragementClass(count.context);
                    dataset[pair].data.push(count.total);
                }
            }
        });

        const addRects = function (chart) {
            $(".rect", chart.renderTo).remove();
            $(".rect-label", chart.renderTo).remove();

            const totalLength = Object.values(dataset).reduce((sum, item) => sum + item.data.length, 0);
            const top = mode === "SBS" ? 50 : chart.plotTop + chart.plotHeight;
            let lastWidth = 0;
            let lastGroup = null;
            let lastGroupWidth = 0;

            Object.keys(dataset).forEach(k => {
                if (dataset[k].data.length === 0) {
                    return;
                }

                // Display group
                if (dataset[k].group && lastGroup !== dataset[k].group) {
                    const group = dataset[k].group;
                    const groupLength = Object.values(dataset).reduce((sum, item) => {
                        return item.group === group ? sum + item.data.length : sum;
                    }, 0);
                    const groupWidth = groupLength * (chart.plotWidth / totalLength);
                    const groupHeight = 20;
                    const groupPosition = top + 22;

                    // Render group background
                    chart.renderer
                        .rect(chart.plotLeft + lastGroupWidth, groupPosition, groupWidth, groupHeight, 0)
                        .attr({
                            fill: groups[group].bgColor,
                            zIndex: 2,
                        })
                        .addClass("rect")
                        .add();

                    // Render group label
                    chart.renderer
                        .text(group, chart.plotLeft + lastGroupWidth + groupWidth / 2, groupPosition + groupHeight / 2)
                        .css({
                            color: groups[group].textColor,
                            fontSize: "13px",
                        })
                        .attr({
                            "dominant-baseline": "middle",
                            "text-anchor": "middle",
                            "zIndex": 3,
                        })
                        .addClass("rect-label")
                        .add();

                    lastGroup = group;
                    lastGroupWidth = lastGroupWidth + groupWidth;
                }

                const width = dataset[k].data.length * (chart.plotWidth / totalLength);
                const height = 20;
                const position = top + 2;

                chart.renderer
                    .rect(chart.plotLeft + lastWidth, position, width, height, 0)
                    .attr({
                        fill: dataset[k].color,
                        zIndex: 2
                    })
                    .addClass("rect")
                    .add();

                chart.renderer
                    .text(dataset[k].label || k, chart.plotLeft + lastWidth + width / 2, position + height / 2)
                    .css({
                        color: "#fff",
                        fontSize: "13px",
                    })
                    .attr({
                        "dominant-baseline": "middle",
                        "text-anchor": "middle",
                        "zIndex": 3,
                    })
                    .addClass("rect-label")
                    .add();

                lastWidth = lastWidth + width;
            });
        };

        $(`#${this._prefix}SignatureCountsPlot`).highcharts({
            title: {
                text: `${counts.reduce((c, s) => c + s.total, 0)} ${mode === "SBS" ? "Substitutions" : "Rearrangements"}`,
            },
            chart: {
                height: this._config.height, // use plain CSS to avoid resize when <loading-spinner> is visible
                type: "column",
                events: {
                    redraw: function () {
                        addRects(this);
                    },
                    load: function () {
                        addRects(this);
                    }
                },
                marginTop: mode === "SBS" ? 80 : 50,
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            tooltip: {
                formatter: function () {
                    if (this.x.includes("[")) {
                        const {pair, letter} = substitutionClass(this.x);
                        return this.x.replace(pair, `<span style="color:${dataset[pair].color}">${letter}</span>`).replace("[", "").replace("]", "") + `<strong>: ${this.y}</strong>`;
                    } else {
                        return `${this.x}<strong>: ${this.y}</strong>`;
                    }
                }
            },
            xAxis: {
                categories: categories,
                labels: {
                    rotation: -90,
                    formatter: data => {
                        if (mode === "SBS") {
                            const {pair, letter} = substitutionClass(data.value);
                            return data.value.replace(pair, `<span style="color:${dataset[pair].color}">${letter}</span>`).replace("[", "").replace("]", "");
                        } else {
                            return data.value.split("_")[2];
                        }
                    },
                    y: mode === "SBS" ? 10 : 50,
                }
            },
            colors: Object.keys(dataset).flatMap(key => Array(dataset[key].data.length).fill(dataset[key].color)),
            series: [{
                colorByPoint: "true",
                data: data
            }]
        });
    }

    signatureFittingObserver() {
        if (!this.signature?.fitting) {
            return;
        }

        const self = this;
        const scores = this.signature.fitting.scores;

        $(`#${this._prefix}SignatureFittingPlot`).highcharts({
            chart: {
                height: this._config.height,
                type: "bar",
            },
            title: null,
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            xAxis: {
                categories: scores.map(score => score.label || score.signatureId),
                labels: {
                    formatter: function () {
                        if (this.value && self._config?.mutationalSignature?.[this.value]) {
                            const id = self._config?.mutationalSignature?.[this.value];
                            return `
                                <a href="${self._config.mutationalSignatureUrl}${id}" style="color:#337ab7;cursor:pointer;">
                                    ${this.value}
                                </a>
                            `;
                        } else {
                            return this.value;
                        }
                    },
                },
            },
            yAxis: {
                min: 0,
                title: null,
            },
            series: [{
                data: scores.map(score => score.value),
                name: "Value",
            }]
        }, chart => {
            // Allow opening the link to Signal in another window
            // See TASK-1068
            Array.from(chart.container.querySelectorAll("a")).forEach(link => {
                link.addEventListener("click", event => {
                    event.preventDefault();
                    window.open(link.getAttribute("href"), "_blank");
                });
            });
        });
    }

    render() {
        if (this.signature?.errorState) {
            return html`<div class="alert alert-danger">${this.signature.errorState}</div>`;
        }

        return html`
            <div>
                <i data-fa-symbol="external-link" class="fas fa-fw fa-external-link"></i>
                ${this.signature && this.plots ? html`

                    ${this.plots.includes("counts") ? html `
                        <div id="${this._prefix}SignatureCountsPlot"></div>
                    ` : null}

                    ${this.plots.includes("fitting") ? html`
                        <div id="${this._prefix}SignatureFittingPlot"></div>
                    ` : null}

                ` : html`
                    <loading-spinner></loading-spinner>`
                }
            </div>
        `;
    }

    getDefaultConfig() {
        return {
            // width: null, width is always 100% of the visible container
            height: 320,
            mutationalSignatureUrl: "https://signal.mutationalsignatures.com/explore/referenceCancerSignature/",
            mutationalSignature: {
                "RefSig R2": "1",
                "RefSig R9": "2",
                "RefSig R10": "3",
                "RefSig R11": "4",
                "RefSig R12": "5",
                "RefSig R13": "6",
                "RefSig R14": "7",
                "RefSig R15": "8",
                "RefSig R16": "9",
                "RefSig R17": "10",
                "RefSig R18": "11",
                "RefSig R4": "12",
                "RefSig R19": "13",
                "RefSig R20": "14",
                "RefSig R6a": "15",
                "RefSig R1": "16",
                "RefSig R7": "17",
                "RefSig R5": "18",
                "RefSig R6b": "19",
                "RefSig R8": "20",
                "RefSig R3": "21",
                "RefSig 1": "22",
                "RefSig 3": "23",
                "RefSig 30": "24",
                "RefSig 4": "25",
                "RefSig N1": "26",
                "RefSig PLATINUM": "27",
                "RefSig 33": "28",
                "RefSig 22": "29",
                "RefSig 10": "30",
                "RefSig 18": "31",
                "RefSig 36": "32",
                "RefSig 7": "33",
                "RefSig 16": "34",
                "RefSig 19": "35",
                "RefSig N2": "36",
                "RefSig 9": "37",
                "RefSig N3": "38",
                "RefSig 52": "39",
                "RefSig 11": "40",
                "RefSig 17": "41",
                "RefSig 38": "42",
                "RefSig 51": "43",
                "RefSig N4": "44",
                "RefSig N5": "45",
                "RefSig N6": "46",
                "RefSig N7": "47",
                "RefSig N8": "48",
                "RefSig N9": "49",
                "RefSig N10": "50",
                "RefSig N11": "51",
                "RefSig MMR1": "52",
                "RefSig 24": "53",
                "RefSig N12": "54",
                "RefSig 2": "55",
                "RefSig MMR2": "56",
                "RefSig 5": "57",
                "RefSig 8": "58",
                "RefSig 13": "59",
                "SBS1": "60",
                "SBS2": "61",
                "SBS3": "62",
                "SBS4": "63",
                "SBS5": "64",
                "SBS6": "65",
                "SBS7a": "66",
                "SBS7c": "67",
                "SBS8": "68",
                "SBS9": "69",
                "SBS10a": "70",
                "SBS10d": "71",
                "SBS11": "72",
                "SBS12": "73",
                "SBS13": "74",
                "SBS14": "75",
                "SBS15": "76",
                "SBS16": "77",
                "SBS17": "78",
                "SBS17a": "79",
                "SBS18": "80",
                "SBS19": "81",
                "SBS20": "82",
                "SBS22": "83",
                "SBS23": "84",
                "SBS24": "85",
                "SBS26": "86",
                "SBS28": "87",
                "SBS30": "88",
                "SBS31": "89",
                "SBS32": "90",
                "SBS33": "91",
                "SBS35": "92",
                "SBS38": "93",
                "SBS44": "94",
                "SBS52": "95",
                "SBS53": "96",
                "SBS57": "97",
                "SBS84": "98",
                "SBS87": "99",
                "SBS88": "100",
                "SBS90": "101",
                "SBS92": "102",
                "SBS93": "103",
                "SBS94": "104",
                "SBS95": "105",
                "SBS96": "106",
                "SBS97": "107",
                "SBS98": "108",
                "SBS99": "109",
                "SBS100": "110",
                "SBS101": "111",
                "SBS102": "112",
                "SBS103": "113",
                "SBS104": "114",
                "SBS105": "115",
                "SBS106": "116",
                "SBS107": "117",
                "SBS108": "118",
                "SBS109": "119",
                "SBS110": "120",
                "SBS111": "121",
                "SBS112": "122",
                "SBS113": "123",
                "SBS114": "124",
                "SBS115": "125",
                "SBS116": "126",
                "SBS117": "127",
                "SBS118": "128",
                "SBS119": "129",
                "SBS120": "130",
                "SBS121": "131",
                "SBS122": "132",
                "SBS123": "133",
                "SBS124": "134",
                "SBS125": "135",
                "SBS126": "136",
                "SBS127": "137",
                "SBS128": "138",
                "SBS129": "139",
                "SBS130": "140",
                "SBS131": "141",
                "SBS132": "142",
                "SBS133": "143",
                "SBS134": "144",
                "SBS135": "145",
                "SBS136": "146",
                "SBS137": "147",
                "SBS138": "148",
                "SBS139": "149",
                "SBS140": "150",
                "SBS141": "151",
                "SBS142": "152",
                "SBS143": "153",
                "SBS144": "154",
                "SBS145": "155",
                "SBS146": "156",
                "SBS147": "157",
                "SBS148": "158",
                "SBS149": "159",
                "SBS150": "160",
                "SBS151": "161",
                "SBS152": "162",
                "SBS153": "163",
                "SBS154": "164",
                "SBS155": "165",
                "SBS156": "166",
                "SBS157": "167",
                "SBS158": "168",
                "SBS159": "169",
                "SBS160": "170",
                "SBS161": "171",
                "SBS162": "172",
                "SBS163": "173",
                "SBS164": "174",
                "SBS165": "175",
                "SBS166": "176",
                "SBS167": "177",
                "SBS168": "178",
                "SBS169": "179",
                "DBS1": "180",
                "DBS2": "181",
                "DBS3": "182",
                "DBS4": "183",
                "DBS5": "184",
                "DBS7": "185",
                "DBS8": "186",
                "DBS10": "187",
                "DBS11": "188",
                "DBS12": "189",
                "DBS13": "190",
                "DBS14": "191",
                "DBS15": "192",
                "DBS16": "193",
                "DBS17": "194",
                "DBS18": "195",
                "DBS19": "196",
                "DBS20": "197",
                "DBS21": "198",
                "DBS22": "199",
                "DBS23": "200",
                "DBS24": "201",
                "DBS25": "202",
                "DBS26": "203",
                "DBS27": "204",
                "DBS28": "205",
                "DBS29": "206",
                "DBS30": "207",
                "DBS31": "208",
                "DBS32": "209",
                "DBS33": "210",
                "DBS34": "211",
                "DBS35": "212",
                "DBS36": "213",
                "DBS37": "214",
                "DBS38": "215",
                "DBS39": "216",
                "DBS40": "217",
                "DBS41": "218"
            }
        };
    }

}

customElements.define("signature-view", SignatureView);
