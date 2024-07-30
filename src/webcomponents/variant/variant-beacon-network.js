/*
 * Copyright 2015-2024 OpenCB
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
import UtilsNew from "../../core/utils-new.js";


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
            active: {
                type: Boolean
            },
            assembly: {
                type: String
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "bn-" + UtilsNew.randomString(6) + "_";
        this._config = this.getDefaultConfig();
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("variant") || changedProperties.has("active")) {
            this.variantObserver();
        }
        if (changedProperties.has("config")) {
            this.configObserver();
        }
    }

    configObserver() {
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    variantObserver() {
        $(".beacon-loading-spinner", this).css("display", "none");
        $(".host", this).removeClass("false");
        $(".host", this).removeClass("true");
        $(".host", this).removeClass("null");
        $(".beaconResponse").empty();

        if (this.variant && this.active) {
            this.searchBeaconNetwork();
        }
    }

    async searchBeaconNetwork() {
        if (this._config.hosts !== undefined && this.variant !== undefined && this.variant.split(":").length > 2) {
            const [chromosome, position, reference, alternate] = this.variant.split(":");
            $(".beacon-loading-spinner", this).css("display", "block");
            // $("#" + this._prefix + "spinGif").show();
            // url to search : https://beacon-network.org/api/responses?allele=C&beacon=[cosmic]&chrom=1&pos=99999&ref=GRCh37
            for (let i = 0; i < this._config.hosts.length; i++) {
                // Beacon network uses zero-based numbering hence (position-1) is used in the url.
                const url = `https://beacon-network.org/api/responses?allele=${alternate}&beacon=[${this._config.hosts[i]}]&chrom=${chromosome}&pos=${(position - 1)}&ref=${this.assembly}`;
                fetch(url)
                    .then(async res => {
                        if (res.ok) {
                            const response = await res.json();
                            for (const r of response) {
                                // console.log(r);
                                const host = this.querySelector("." + this._prefix + this._config.hosts[i]);
                                // console.log("host", host)
                                if (host) {
                                    host.querySelector(".beacon-loading-spinner").style.display = "none";
                                }
                                host.classList.add(r.response || "false");
                                if (r.response === null) {
                                    // null from server
                                    host.querySelector(".beaconResponse").innerHTML = "NULL";
                                    host.classList.add("null");
                                } else {
                                    host.querySelector(".beaconResponse").innerHTML = r.response;
                                }

                            }
                        } else {
                            console.error("Server Error", res);
                        }
                    })
                    .catch(e => console.error(e));
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

    renderStyles() {
        return html `
            <style>
            /* .beacon-square {
                width: 120px;
                height: 120px;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                background: #fff;
                margin: 10px 10px 10px 0;
                flex-flow: column;
                transition: all .7s ease-in-out;
            } */

            .beacon-square.false {
                background: #e8e8e8;
            }

            .beacon-square.true {
                background: #b7ff30;
            }

            #variant-beacon-network .beacon-loading-spinner {
                display: none;
            }
        </style>
        `;
    }

    render() {
        return html`
        ${this.renderStyles()}
        <div id="variant-beacon-network">
            <div>
                <p>Beacon Network is a search engine across the world's public beacons. You can find it here <a href="https://beacon-network.org">beacon-network.org</a>.</p>
                <button class="btn btn-primary mb-3" type="button" @click="${this.variantObserver}"><i class="fas fa-sync-alt pe-1"></i> Refresh Beacon Network query</button>
            </div>
            <div class="row row-cols-md-4 row-cols-lg-6 g-3 text-center">
                ${this._config.hosts && this._config.hosts.length && this._config.hosts.map(item => html`
                    <div class="col">
                        <div class="card beacon-square ${this._prefix}${item} shadow rounded border-0 py-4">
                            <span>${item}</span>
                            <span id="${this._prefix}${item}" class="beaconResponse badge">
                            </span>
                            <i class="fa fa-spinner fa-spin beacon-loading-spinner" aria-hidden="true"></i>
                        </div>
                    </div>
                `)}
            </div>
        </div>
        `;
    }

}

customElements.define("variant-beacon-network", VariantBeaconNetwork);
