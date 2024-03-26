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

import UtilsNew from "../../core/utils-new.js";
import Region from "../../core/bioinfo/region.js";
import GenomeBrowserConstants from "../genome-browser-constants.js";

export default class StatusBar {

    constructor(target, config) {
        // eslint-disable-next-line no-undef
        Object.assign(this, Backbone.Events);

        this.target = target;
        this.config = {
            ...this.getDefaultConfig(),
            ...config,
        };

        this.#init();
    }

    #init() {
        this.prefix = UtilsNew.randomString(8);
        this.region = new Region(this.config.region);

        this.#initDom();
    }

    #initDom() {
        const template = UtilsNew.renderHTML(`
            <div id="${this.prefix}" class="small" style="display:flex;">
                <div>
                    ${this.config.version}
                </div>
                <div style="margin-left:auto;">
                    <span id="${this.prefix}PositionBase" style="margin-right:4px"></span>
                    <span id="${this.prefix}PositionRegion"></span>
                </div>
            </div>
        `);

        this.div = template.querySelector(`div#${this.prefix}`);
        this.mousePositionBase = this.div.querySelector(`span#${this.prefix}PositionBase`);
        this.mousePositionRegion = this.div.querySelector(`span#${this.prefix}PositionRegion`);

        this.target.appendChild(this.div);
    }

    setRegion(event) {
        this.region.load(event.region);
        this.mousePositionBase.textContent = "";
        this.mousePositionRegion.textContent = `${this.region.chromosome}:${event.region.center()}`;
    }

    setMousePosition(event) {
        this.mousePositionBase.style.color = GenomeBrowserConstants.SEQUENCE_COLORS[event.base];
        this.mousePositionBase.textContent = event.base;
        this.mousePositionRegion.textContent = `${this.region.chromosome}:${event.mousePos}`;
    }

    getDefaultConfig() {
        return {
            region: null,
            version: "",
        };
    }

}
