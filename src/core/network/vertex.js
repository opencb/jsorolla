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

function Vertex(args) {
    this.id = 'v' + Utils.genId();

    this.edges = [];
    this.edgesIndex = {};

    this.position = new Point();
    this.renderer = new CircosVertexRenderer();
    this.attributes = {};

    //set instantiation args, must be last
    for (var prop in args) {
        if (hasOwnProperty.call(args, prop)) {
            this[prop] = args[prop];
        }
    }

    if (this.renderer) {
        this.renderer.coords = this.position;
        this.renderer.vertex = this;
    }
}

Vertex.prototype = {
    removeEdge: function (edge) {
        for (var i = 0; i < this.edges.length; i++) {
            if (this.edges[i].id === edge.id) {
                this.edges.splice(i, 1);
                delete this.edgesIndex[edge.id];
                break;
            }
        }
    },
    removeEdges: function () {
        this.edges = [];
        this.edgesIndex = {};
    },
    addEdge: function (edge) {
        if (this.containsEdge(edge) === false) {
            this.edges.push(edge);
            this.edgesIndex[edge.id] = edge;
        }
    },
    containsEdge: function (edge) {
        if (typeof this.edgesIndex[edge.id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    render: function (args) {
        this.renderer.render(args)
    },
    setRenderer: function (renderer) {
        if (renderer) {
            this.renderer = renderer;
            this.renderer.coords = this.position;
            this.renderer.vertex = this;
        }
    },
    toJSON: function () {
        return {
            id: this.id,
            position: this.position,
            renderer: this.renderer,
            attributes: this.attributes
        }
    }
}
