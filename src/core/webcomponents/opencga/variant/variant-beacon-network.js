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

import {LitElement, html} from '/web_modules/lit-element.js';

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
                type: String,
                //observer: 'clearResponse'
            },
            config: {
                type: Object,
                //observer: "configObserver"
            }
        }
    }

    _init() {
        this._prefix = "bn-" + Utils.randomString(6);
        this._config = this.getDefaultConfig();
    }

    updated(changedProperties) {
        if(changedProperties.has("clear")) {
            this.clearResponse();
        }
        if(changedProperties.has("config")) {
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

    //TODO urgent refactor
    searchBeaconNetwork() {
        if (this._config.hosts !== undefined && this.variant !== undefined && this.variant.split(':').length > 2) {
            let [chromosome, position, reference, alternate] = this.variant.split(':');

            $('#' + this._prefix + 'spinGif').show();
            // url to search : https://beacon-network.org/api/responses?allele=C&beacon=[cosmic]&chrom=1&pos=99999&ref=GRCh37
            // TODO: Assembly is hardcoded for now. It has to be taken care in the future

            let _this = this;
            for (let i = 0; i < this._config.hosts.length; i++) {
                let xhr = new XMLHttpRequest();
                // Beacon network uses zero-based numbering hence (position-1) is used in the url.
                let url = "https://beacon-network.org/api/responses?allele=" + alternate + "&beacon=[" + _this._config.hosts[i] + "]&chrom=" + chromosome
                    + "&pos=" + (position - 1) + "&ref=GRCh37";
                xhr.onload = function (event) {
                    if (xhr.readyState === xhr.DONE) {
                        if (xhr.status === 200) {
                            let contentType = xhr.getResponseHeader('Content-Type');
                            if (contentType === 'application/json') {
                                let beaconResponse = JSON.parse(xhr.response);
                                for (let j = 0; j < beaconResponse.length; j++) {
                                    if (beaconResponse[j].response != null) {
                                        let response = beaconResponse[j].response.toString();
                                        PolymerUtils.innerHTML(_this._prefix + _this._config.hosts[i], "" + response.charAt(0).toUpperCase() + response.slice(1));
                                        _this.querySelector("." + _this._prefix + _this._config.hosts[i]).classList.add(response.charAt(0).toUpperCase() + response.slice(1))
                                        if (response === "true") {
                                            //PolymerUtils.addStyle(_this._prefix + _this._config.hosts[i], "color", "red"); // Highlighting the true response in the table

                                        } else {
                                            PolymerUtils.addStyle(_this._prefix + _this._config.hosts[i], "color", "black");
                                        }
                                    } else {
                                        PolymerUtils.innerHTML(_this._prefix + _this._config.hosts[i], "False");
                                        PolymerUtils.addStyle(_this._prefix + _this._config.hosts[i], "color", "black");
                                    }
                                }
                                PolymerUtils.hide(_this._prefix + 'spinGif');
                            }
                        } else {
                            PolymerUtils.innerHTML(_this._prefix + _this._config.hosts[i], "False (not 200)");
                        }
                    } else {
                        PolymerUtils.innerHTML(_this._prefix + _this._config.hosts[i], "False (No response from server)");
                    }
                };
                xhr.open("GET", url, true);
                xhr.send(null);
            }
        }
    }

    getDefaultConfig() {
        return {
            hosts: [
                "brca-exchange", "cell_lines", "cosmic", "wtsi", "wgs", "ncbi", "ebi", "ega", "broad", "gigascience",
                "ucsc", "lovd", "hgmd", "icgc", "sahgp"
            ]
        }
    }

    render() {
        return html`
        <style include="jso-styles">
        
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
        .beacon-square.False {
            background: #dadada;
        }
        .beacon-square.True {
            background: red;
        }
        </style>

        <div style="padding: 15px 20px">
            <div style="padding: 0px 0px 10px 0px">
                <button class="btn btn-primary ripple" type="button" @click="${this.searchBeaconNetwork}">Search Beacon Network</button>
                <a data-toggle="tooltip"
                   title="Beacon Network is a search engine across the world's public beacons. You can find it here - https://beacon-network.org/#/"><i
                        class="fa fa-info-circle" aria-hidden="true"></i></a>
                        
                <i class="fa fa-spinner fa-spin" aria-hidden="true" id="${this._prefix}spinGif" style="display:none"></i>
            </div>

            <!--<table class="table table-bordered" style="width: 50%">
                <thead style="background-color: #eee">
                <tr>
                    <th>Host</th>
                    <th>Response</th>
                </tr>
                </thead>
                <tbody>
                
                </tbody>
            </table>-->
            ${this._config.hosts && this._config.hosts.length && this._config.hosts.map( item => html`
                <div class="beacon-square ${this._prefix}${item}">
                    <p>${item}</p>
                    <p class="" id="${this._prefix}${item}" class="beaconResponse">&nbsp;</p>
                </div> 
            `)}
        </div>
        `;
    }
}

customElements.define('variant-beacon-network', VariantBeaconNetwork);
