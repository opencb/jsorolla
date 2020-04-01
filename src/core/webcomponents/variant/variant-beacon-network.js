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

import {LitElement, html} from "/web_modules/lit-element.js";
import Utils from "./../../utils.js";
import PolymerUtils from "../PolymerUtils.js";

// TODO: Assembly is hardcoded for now. It has to be taken care in the future

export default class VariantBeaconNetwork extends LitElement {

    constructor() {
        super();

        // Set status and init private properties
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            variant: {
                type: String
            },
            clear: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "bn-" + Utils.randomString(6) + "_";
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if (changedProperties.has("clear")) {
            this.clearResponse();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    clearResponse() {
        // Empty previous response
        PolymerUtils.innerHtmlByClass("beaconResponse", "");
    }

    async searchBeaconNetwork() {
        if (this._config.hosts !== undefined && this.variant !== undefined && this.variant.split(":").length > 2) {
            const [chromosome, position, reference, alternate] = this.variant.split(":");
            this.querySelector(".loading-spinner").style.display = "block";
            //$("#" + this._prefix + "spinGif").show();
            // url to search : https://beacon-network.org/api/responses?allele=C&beacon=[cosmic]&chrom=1&pos=99999&ref=GRCh37
            // TODO: Assembly is hardcoded for now. It has to be taken care in the future

            const _this = this;
            for (let i = 0; i < this._config.hosts.length; i++) {
                // Beacon network uses zero-based numbering hence (position-1) is used in the url.
                const url = "https://beacon-network.org/api/responses?allele=" + alternate + "&beacon=[" + _this._config.hosts[i] + "]&chrom=" + chromosome +
                    "&pos=" + (position - 1) + "&ref=GRCh37";

                // TODO continue
                /* axios.get(url)
                    .then( response => {
                        console.log("rr", response)
                    })
                    .catch( e => console.error(e))
                */
                fetch(url)
                    .then( async res => {
                        if (res.ok) {
                            const response = await res.json();
                            console.log(response);
                            for (const r of response) {
                                console.log(r);
                                const host = this.querySelector("." + this._prefix + this._config.hosts[i]);
                                host.querySelector(".loading-spinner").style.display = "none";
                                host.classList.add(r.response || "false");
                                if (r.response === null) {
                                    // null from server
                                    host.querySelector(".beaconResponse").innerHTML = `false (${r.response})`;
                                } else {
                                    host.querySelector(".beaconResponse").innerHTML = r.response;
                                }

                            }
                        } else {
                            console.error("Server Error", res);
                        }
                    })
                    .catch( e => console.error(e));
            }
        }
    }

    getDefaultConfig() {
        return {
            hosts: [
                "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience",
                "ucsc", "lovd", "hgmd", "icgc", "sahgp"
            ]
        };
    }

    render() {
        return html`
        <style>
        .beacon-square {
            width: 120px;
            height: 120px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            background: aliceblue;
            margin: 10px;
            flex-flow: column;
            transition: all .7s ease-in-out;
        }
        .beacon-square.false {
            background: #cfffc7;
        }
        .beacon-square.true {
            background: red;
        }
        </style>

        <div style="padding: 15px 20px">
            <div style="padding: 0px 0px 10px 0px">
                <button class="btn btn-primary ripple" type="button" @click="${this.searchBeaconNetwork}">Search Beacon Network</button>
                <a data-toggle="tooltip"
                   title="Beacon Network is a search engine across the world's public beacons. You can find it here - https://beacon-network.org/#/">
                   <i class="fa fa-info-circle" aria-hidden="true"></i>
                </a>
            </div>

            ${this._config.hosts && this._config.hosts.length && this._config.hosts.map( item => html`
                <div class="beacon-square ${this._prefix}${item} shadow">
                    <span>${item}</span>
                    <span id="${this._prefix}${item}" class="beaconResponse"><i class="fa fa-spinner fa-spin loading-spinner" style="display: none" aria-hidden="true"></i>&nbsp;</span>
                </div> 
            `)}
        </div>
        `;
    }

}

customElements.define("variant-beacon-network", VariantBeaconNetwork);
