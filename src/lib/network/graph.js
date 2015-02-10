/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function Graph() {
    this.vertices = [];
    this.verticesIndex = {};
    this.numberOfVertices = 0;

    this.edges = [];
    this.edgesIndex = {};
    this.numberOfEdges = 0;

    this.edgeDraw = {};
}

Graph.prototype = {
    clean: function () {
        this.numberOfVertices = 0;
        this.numberOfEdges = 0;
        this.vertices = [];
        this.edges = [];
        this.verticesIndex = {};
        this.edgesIndex = {};

        this.edgeDraw = {};
    },
    addEdge: function (edge) {
        if (edge.source == null || edge.target == null) {
            return false
        }
        // Check if already exists
        if (this.containsEdge(edge)) {
            return false;
        }

        this.addVertex(edge.source);
        this.addVertex(edge.target);
        var insertPosition = this.edges.push(edge) - 1;
        this.edgesIndex[edge.id] = insertPosition;

        //update source edges
        edge.source.addEdge(edge);
        //update target edges
        if (edge.source !== edge.target) {
            edge.target.addEdge(edge);
        }

        /* count edges between same vertices */
        var stId = edge.source.id + "-" + edge.target.id;
        var tsId = edge.target.id + "-" + edge.source.id;
        if (typeof this.edgeDraw[stId] === 'undefined') {
            this.edgeDraw[stId] = -1;
        }
        if (typeof this.edgeDraw[tsId] === 'undefined') {
            this.edgeDraw[tsId] = -1;
        }
        this.edgeDraw[stId]++;
        this.edgeDraw[tsId]++;
        edge.overlapCount = this.edgeDraw[stId];
//        edge.overlapCount = function () {
//            return _this.edgeDraw[stId];
//        };

        this.numberOfEdges++;
        return true;
    },
    addVertex: function (vertex) {
        if (vertex == null) {
            return false
        }
        // Check if already exists
        if (this.containsVertex(vertex)) {
            return false;
        }
        // Add the vertex
        var insertPosition = this.vertices.push(vertex) - 1;
        this.verticesIndex[vertex.id] = insertPosition;

        this.numberOfVertices++;
        return true;
    },
    removeEdge: function (edge) {
        if (edge == null) {
            return false
        }
        // Check if already exists
        if (!this.containsEdge(edge)) {
            return false;
        }

        //remove edge from vertex
        edge.source.removeEdge(edge);
        edge.target.removeEdge(edge);

        /* count edges between same vertices */
        var stId = edge.source.id + "-" + edge.target.id;
        var tsId = edge.target.id + "-" + edge.source.id;
        this.edgeDraw[stId]--;
        this.edgeDraw[tsId]--;

        var position = this.edgesIndex[edge.id];
        this.edges.splice(position, 1);
        this.numberOfEdges--;

        this._rebuildEdgesIndex();
        return true;
    },
    removeEdges: function (edges) {
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (this.containsEdge(edge)) {

                //remove edge from vertex
                edge.source.removeEdge(edge);
                edge.target.removeEdge(edge);

                /* count edges between same vertices */
                var stId = edge.source.id + "-" + edge.target.id;
                var tsId = edge.target.id + "-" + edge.source.id;
                this.edgeDraw[stId]--;
                this.edgeDraw[tsId]--;

                this.edges[this.edgesIndex[edge.id]] = null;
                this.numberOfEdges--;
            }
        }
        this._rebuildEdges();
    },
    removeVertex: function (vertex) {
        if (vertex == null) {
            return false
        }
        // Check if already exists
        if (!this.containsVertex(vertex)) {
            return false;
        }

        for (var i = 0; i < vertex.edges.length; i++) {
            var edge = vertex.edges[i];
            // remove edges from source or target
            if (edge.source !== vertex) {
                edge.source.removeEdge(edge);
            }
            if (edge.target !== vertex) {
                edge.target.removeEdge(edge);
            }

            var stId = edge.source.id + "-" + edge.target.id;
            var tsId = edge.target.id + "-" + edge.source.id;
            this.edgeDraw[stId]--;
            this.edgeDraw[tsId]--;

            this.edges[this.edgesIndex[edge.id]] = null;

            this.numberOfEdges--;
        }
        vertex.removeEdges();

        var position = this.verticesIndex[vertex.id];
        this.vertices.splice(position, 1);
        this.numberOfVertices--;

        this._rebuildEdges();
        this._rebuildVerticesIndex();
        return true;
    },
    removeVertices: function (vertices) {
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (this.containsVertex(vertex)) {

                for (var j = 0; j < vertex.edges.length; j++) {
                    var edge = vertex.edges[j];
                    // remove edges from source or target
                    if (edge.source !== vertex) {
                        edge.source.removeEdge(edge);
                    }
                    if (edge.target !== vertex) {
                        edge.target.removeEdge(edge);
                    }

                    var stId = edge.source.id + "-" + edge.target.id;
                    var tsId = edge.target.id + "-" + edge.source.id;
                    this.edgeDraw[stId]--;
                    this.edgeDraw[tsId]--;

                    this.edges[this.edgesIndex[edge.id]] = null;

                    this.numberOfEdges--;
                }
                vertex.removeEdges();

                this.vertices[this.verticesIndex[vertex.id]] = null;
                this.numberOfVertices--;
            }
        }
        this._rebuildEdges();
        this._rebuildVertices();
    },
    _rebuildVertices: function () {
        var newVertices = [];
        for (var i = 0, l = this.vertices.length; i < l; i++) {
            var vertex = this.vertices[i];
            if (vertex != null) {
                newVertices.push(vertex);
            }
        }
        this.vertices = newVertices;
        this._rebuildVerticesIndex();
    },
    _rebuildVerticesIndex: function () {
        this.verticesIndex = {};
        for (var i = 0, l = this.vertices.length; i < l; i++) {
            var vertex = this.vertices[i];
            this.verticesIndex[vertex.id] = i;
        }
    },
    _rebuildEdges: function () {
        var newEdges = [];
        for (var i = 0, l = this.edges.length; i < l; i++) {
            var edge = this.edges[i];
            if (edge != null) {
                newEdges.push(edge);
            }
        }
        this.edges = newEdges;
        this._rebuildEdgesIndex();
    },
    _rebuildEdgesIndex: function () {
        this.edgesIndex = {};
        for (var i = 0, l = this.edges.length; i < l; i++) {
            var edge = this.edges[i];
            this.edgesIndex[edge.id] = i;
        }
    },

    containsEdge: function (edge) {
        if (typeof this.edgesIndex[edge.id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    containsVertex: function (vertex) {
        if (typeof this.verticesIndex[vertex.id] !== 'undefined') {
            return true;
        } else {
            return false;
        }
    },
    /**/
    getVertexById: function (vertexId) {
        return this.vertices[this.verticesIndex[vertexId]];
    },
    getEdgeById: function (edgeId) {
        return this.edges[this.edgesIndex[edgeId]];
    },


    /**/
    getAsSIF: function (separator) {
        if (typeof separator === 'undefined') {
            separator = '\t';
        }
        var sifText = "";
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];
            if (typeof edge !== 'undefined') {
                var line = "";
                line = edge.source.id + separator + edge.relation + separator + edge.target.id + "\n";
                sifText += line;
            }
        }
        for (var i = 0; i < this.vertices.length; i++) {
            var vertex = this.vertices[i];
            if (typeof vertex !== 'undefined') {
                var line = "";
                if (vertex.edges.length == 0) {
                    line = vertex.id + separator + separator + "\n";
                }
                sifText += line;
            }
        }
        return sifText;
    },
    getAsSIFNoRelation: function (separator) {
        if (typeof separator === 'undefined') {
            separator = '\t';
        }
        var sifText = "";
        for (var i = 0; i < this.edges.length; i++) {
            var edge = this.edges[i];
            if (typeof edge !== 'undefined') {
                var line = "";
                line = edge.source.id + separator + "r" + separator + edge.target.id + "\n";
                sifText += line;
            }
        }
        for (var i = 0; i < this.vertices.length; i++) {
            var vertex = this.vertices[i];
            if (typeof vertex !== 'undefined') {
                var line = "";
                if (vertex.edges.length == 0) {
                    line = vertex.id + separator + separator + "\n";
                }
                sifText += line;
            }
        }
        return sifText;
    },
    getAsDOT: function () {
        var dotText = "graph network {\n" + this.getAsSIF(' ') + "}";
        return dotText;
    },
    fromJSON: function (json) {
        for (var i = 0, l = json.vertices.length; i < l; i++) {
            var v = json.vertices[i];
            var vertex = new Vertex({
                id: v.id,
                position: new Point(v.position.x, v.position.y, v.position.z),
                renderer: new CircosVertexRenderer(v.renderer)
            });
            this.addVertex(vertex);
        }
        for (var i = 0, l = json.edges.length; i < l; i++) {
            var e = json.edges[i];
            var edge = new Edge({
                id: e.id,
                relation: e.relation,
                source: this.getVertexById(e.source.id),
                target: this.getVertexById(e.target.id),
                renderer: new DefaultEdgeRenderer(e.renderer)
            });
            this.addEdge(edge);
        }
    },
    toJSON: function () {
        //var vertices = [];
        //for (var i = 0; i < this.vertices.length; i++) {
        //    if (typeof this.vertices[i] !== 'undefined') {
        //        vertices.push(this.vertices[i]);
        //    }
        //}
        //var edges = [];
        //for (var i = 0; i < this.edges.length; i++) {
        //    if (typeof this.edges[i] !== 'undefined') {
        //        edges.push(this.edges[i]);
        //    }
        //}
        return {vertices: this.vertices, edges: this.edges};
    }
}