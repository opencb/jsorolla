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

function Network(args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('Network');

    //set instantiation args, must be last
    _.extend(this, args);


    this.graph = new Graph();
    this.config = new NetworkConfig();
    this.attributeManager = new AttributeManager();

    this.on(this.handlers);


}

Network.prototype = {
    getGraph: function () {
        return this.graph;
    },
    addVertex: function (args) {
        var vertex = args.vertex;
        var vertexConfig = args.vertexConfig;
        var target = args.target;

        this.graph.addVertex(vertex);
        this.setVertexConfig(vertexConfig);
        this.renderVertex(vertex, target);
    },
    addEdge: function (args) {
        var edge = args.edge;
        var edgeConfig = args.edgeConfig;
        var target = args.target;

        this.graph.addEdge(edge);
        this.setEdgeConfig(edgeConfig);
        this.renderEdge(edge, target);
    },
    setVertexConfig: function (vertexConfig) {
        this.config.setVertexConfig(vertexConfig);
    },
    setEdgeConfig: function (edgeConfig) {
        this.config.setEdgeConfig(edgeConfig);
    },
    getVertexConfig: function (vertex) {
        return this.config.getVertexConfig(vertex);
    },
    getEdgeConfig: function (edge) {
        return this.config.getEdgeConfig(edge);
    },
    getVertexById: function (vertexId) {
        return this.graph.getVertexById(vertexId);
    },
    getEdgeById: function (edgeId) {
        return this.graph.getEdgeById(edgeId);
    },
    removeVertex: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.remove();
        for (var i = 0; i < vertex.edges.length; i++) {
            var edge = vertex.edges[i];
            var edgeConfig = this.config.getEdgeConfig(edge);
            edgeConfig.renderer.remove();
        }
        this.graph.removeVertex(vertex);
    },
    renderVertex: function (vertex, target) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.render({
            coords: vertexConfig.coords,
            vertex: vertex,
            target: target
        });
    },
    renderEdge: function (edge, target) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        var sourceConfig = this.config.getVertexConfig(edge.source);
        var targetConfig = this.config.getVertexConfig(edge.target);
        edgeConfig.render({
            sourceCoords: sourceConfig.coords,
            targetCoords: targetConfig.coords,
            sourceRenderer: sourceConfig.renderer,
            targetRenderer: targetConfig.renderer,
            edge: edge,
            target: target
        });
    },
    setVertexName: function (vertex, name) {
        vertex.name = name;
    },

    selectVertex: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.select();
    },
    selectEdge: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.select();
    },

    selectVerticesByArea: function (x, y, width, height) {
        var selectedVertices = [];
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.getVertexConfig(vertex);
                if (vertexConfig.coords.x >= x && vertexConfig.coords.x <= x + width && vertexConfig.coords.y >= y && vertexConfig.coords.y <= y + height) {
                    vertexConfig.renderer.select();
                    selectedVertices.push(vertex);
                }
            }
        }
        return selectedVertices;
    },
    deselectVertex: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.deselect();
    },
    deselectEdge: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.deselect();
    },
    deselectAllVertices: function () {
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.deselectVertex(vertex);
            }
        }
    },
    deselectAllEdges: function () {
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                this.deselectEdge(edge);
            }
        }
    },

    moveVertex: function (vertex, dispX, dispY, dispZ) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.move(dispX, dispY, dispZ);

        this._updateEdgeCoords(vertex);
    },
    _updateEdgeCoords: function (vertex) {
        for (var j = 0; j < vertex.edges.length; j++) {
            var edge = vertex.edges[j];
            var edgeConfig = this.getEdgeConfig(edge);
            var sourceConfig = this.getVertexConfig(edge.source);
            var targetConfig = this.getVertexConfig(edge.target);

            if (vertex === edge.source) {
                edgeConfig.renderer.moveSource(sourceConfig.coords);
            }
            if (vertex === edge.target) {
                edgeConfig.renderer.moveTarget(targetConfig.coords);

            }
        }
    },
    setVertexCoords: function (vertex, x, y, z) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.setCoords(x, y, z);

        this._updateEdgeCoords(vertex);
    },

    isVertexSelected: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        return vertexConfig.renderer.selected;
    },
    isEdgeSelected: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        return edgeConfig.renderer.selected;
    },
    /* Config Renderer Attributes */
    setVertexRendererAttribute: function (vertex, attr, value) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.set(attr, value);

        for (var j = 0; j < vertex.edges.length; j++) {
            var edge = vertex.edges[j];
            if (typeof edge !== 'undefined') {
                var edgeConfig = this.getEdgeConfig(edge);
                edgeConfig.renderer.update();
            }
        }
    },
    setEdgeRendererAttribute: function (edge, attr, value) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.set(attr, value);
    },

    /* Attribute Manager */
    addAttribute: function (name, type, defaultValue) {
        this.attributeManager.addAttribute(this.graph.vertices, name, type, defaultValue);
    },
    removeAttribute: function (name) {
        this.attributeManager.removeAttribute(name);
    },
    getVertexAttributes: function (vertex, success) {
        this.attributeManager.getVertexAttributes(vertex, success);
    }
}