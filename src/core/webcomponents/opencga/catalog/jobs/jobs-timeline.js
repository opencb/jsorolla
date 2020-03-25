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
import Utils from "../../../../utils.js";

export default class JobsTimeline extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
            active: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        };
    }

    _init() {
        this._prefix = "sf-" + Utils.randomString(6) + "_";
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if (changedProperties.has("active") && this.active) {
            this.queryObserver();
        }
        if (changedProperties.has("query") && this.active) {
            this.queryObserver();
        }
    }

    activeObserver() {
        console.log("fire rest call iff query has changed");
    }

    queryObserver(){
        console.log("query observer")
        const filters = {
            study: this.opencgaSession.study.fqn,
            deleted: false,
            count: true,
            //order: params.data.order,
            limit: 500,
            //skip: params.data.offset || 0,
            //include: "name,path,samples,status,format,bioformat,creationDate,modificationDate,uuid", TODO include only the column I show
            exclude: "execution",
            ...this.query
        };
        this.opencgaSession.opencgaClient.jobs().search(filters).then( restResponse => {
            console.log(restResponse)
            let results = restResponse.getResults();
            console.log(results)
            this._results = results.map(result => {
                return {
                    id: result.id,
                    timestampStart: result.execution && result.execution.start ? result.execution.start : moment(result.creationDate, "YYYYMMDDHHmmss").valueOf(),
                    timestampEnd: result.execution ? result.execution.end ? result.execution.end : result.execution.start : moment(result.creationDate, "YYYYMMDDHHmmss").valueOf(),
                    status: result.internal.status.name,
                    dependsOn: result.dependsOn
                };
            }).sort((a, b) => a.timestampStart - b.timestampStart);

            this.timestampMin = Math.min(...this._results.map(_ => _.timestampStart));
            this.timestampMax = Math.max(...this._results.map(_ => _.timestampEnd));
            //console.log("timestampMinMax", timestampMin, timestampMax);

            this.tick = Math.round(this._config.board.width / this._config.ticks);
            this.dateTick = Math.round((this.timestampMax - this.timestampMin) / this._config.ticks);

            console.log("this._results",this._results)

            this.querySelector("#svg").innerHTML = ""; // TODO check if this causes memory leaks
            this.draw = SVG().addTo("#svg").size(this._config.board.width + this._config.board.padding, this._config.board.height + this._config.board.padding);
            const rect = this.draw.rect(this._config.board.width, this._config.board.height).attr({fill: "#f3f3f3", x: this._config.board.originX + this._config.board.padding/2, y: this._config.board.originY + this._config.board.padding/2});

            this.drawTicks(this._config.ticks, 500)
        });
    }

    drawTicks(num, height) {
        for (let i = 0; i <= num; i++) {
            this.draw.line(this._config.board.originX + this.tick * i, this._config.board.originY + 35, this._config.board.originX + this.tick * i, height).stroke({
                color: "#aaa",
                width: 1
            });
            this.draw.text(moment(this.timestampMin + this.dateTick * i).format("D MMM YY")).dy(this._config.board.originY).dx(this._config.board.originX + this.tick * i - 10);
        }
        //plot the last text and the last tick
        /*draw.line(board.originX + tick * num, 35, board.originX + tick * num, height).stroke({
            color: "#aaa",
            width: 1
        });*/
        //draw.text(moment(timestampMax).format("D MMM YY")).dy(board.originY).dx(board.originX + tick * num - 10);
    }
    statusColor(status) {
        return {
            "PENDING": "#245da9",
            "QUEUED": "#245da9",
            "RUNNING": "#245da9",
            "DONE": "#008901",
            "ERROR": "#f00",
            "UNKNOWN": "#5b5b5b",
            "REGISTERING": "#245da9",
            "UNREGISTERED": "#5b5b5b",
            "ABORTED": "#b6904e",
            "DELETED": "#c09c00"
        }[status];
    }

    getDefaultConfig() {
        return {
            lineWidth: 10,
            ticks: 20, // number of vertical lines
            vspace: 40, // space between tracks
            hspace: 10, // space between adjacent intervals
            board: {
                width: 1500,
                height: 0, // height is dynamic on the number of tracks
                originX: 10,
                originY: 10,
                padding: 50
            }
        };
    }

    generateTimeline() {

    }

    render() {
        return html` timeline ${this.active}
        <div id="svg">
        </div>
        `;
    }

}

customElements.define("jobs-timeline", JobsTimeline);
