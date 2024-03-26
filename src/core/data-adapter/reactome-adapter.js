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

/**
 * Created by pfurio on 16/11/16.
 */

class ReactomeAdapter {

    constructor(client, options = {}, handlers = {}) {
    // constructor(client, category, subcategory, resource, params = {}, options = {}, handlers = {}) {

        this.client = client;
        this.options = options;
        this.handlers = handlers;

        Object.assign(this, Backbone.Events);
        this.on(this.handlers);
    }

    getData(args){
        // switch(this.category) {
        //     case "analysis/variant":
        //         return this._getVariant(args);
        //         break;
        //     case "analysis/alignment":
        //         return this._getAlignmentData(args);
        //         break;
        //     default:
        //         return this._getExpressionData(args);
        // }
    }

    _getNetworkCanvasForGene(gene, species) {
        this.client.contentServiceClient().mappingClient().pathways("UniProt", gene, species)
            .then(function (response) {
                let diagrammedPathways = [];
                 for (let i = 0; i < response.length; i++) {
                     let pathway = response[i];
                     if (pathway.hasDiagram) {
                         diagrammedPathways.push(pathway);
                     }
                 }
            });
    }
}
