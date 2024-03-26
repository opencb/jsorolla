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

function Edge(args) {

    this.id = 'e' + Utils.genId();

    this.relation = '';
    this.source;
    this.target;
    this.weight;
    this.directed;
    this.overlapCount;

    this.attributes = {};

    this.renderer = new DefaultEdgeRenderer();
    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            this[prop] = args[prop];
        }
    }

    if (this.renderer) {
        this.renderer.edge = this;
    }
}

Edge.prototype = {
    getSource: function () {
        return this.source;
    },
    setSource: function (vertex) {
        this.source = vertex;
    },
    getTarget: function () {
        return this.target;
    },
    setTarget: function (vertex) {
        this.target = vertex;
    },
    render: function (args) {
        this.renderer.render(args)
    },
    setRenderer: function (renderer) {
        if (renderer) {
            this.renderer = renderer;
            this.renderer.edge = this;
        }
    },
    toJSON: function () {
        return {
            id: this.id,
            source: this.source,
            target: this.target,
            weight: this.weight,
            directed: this.directed,
            relation: this.relation,
            renderer: this.renderer,
            attributes: this.attributes
        }
    }
}
