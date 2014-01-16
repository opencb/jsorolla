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

    var defaults = [
//        ["Id", "string", "null"],
        ["Name", "string", "none"]
    ];
    this.nodeAttributeManager = new AttributeManagerStore(defaults);
    this.edgeAttributeManager = new AttributeManagerStore(defaults);

    this.on(this.handlers);
}

Network.prototype = {
    getGraph: function () {
        return this.graph;
    },
    draw: function (target) {
        var edges = this.graph.edges;
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.renderVertex(vertex, target);
            }
        }
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                this.renderEdge(edge, target);
            }
        }
    },
    addVertex: function (args) {
        var vertex = args.vertex;
        var vertexConfig = args.vertexConfig;
        var target = args.target;

        vertexConfig.id = vertex.id;

        this.graph.addVertex(vertex);
        this.setVertexConfig(vertexConfig);

        if (typeof target !== 'undefined') {
            this.renderVertex(vertex, target);
        }

        //attributes
        this.nodeAttributeManager.addRows([
//            [vertex.id, vertex.name]
            [vertex.name]
        ], true);
    },
    addEdge: function (args) {
        var edge = args.edge;
        var edgeConfig = args.edgeConfig;
        var target = args.target;

        edgeConfig.id = edge.id;

        this.graph.addEdge(edge);
        this.setEdgeConfig(edgeConfig);

        if (typeof target !== 'undefined') {
            this.renderEdge(edge, target);
        }
        //attributes
        this.edgeAttributeManager.addRows([
            [edge.name]
        ], true);
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
            this.config.removeEdge(edge);
        }
        this.graph.removeVertex(vertex);
        this.config.removeVertex(vertex);
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
    setVertexLabel: function (vertex, label) {
        var vertexConfig = this.getVertexConfig(vertex);
        vertexConfig.renderer.setLabelContent(label);
    },
    setVertexLabelByAttribute: function (attributeName) {
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.getVertexConfig(vertex);
                var name = vertex.name;

                //TODO warning with duplicate names, only first will be used.
                var label = this.nodeAttributeManager.getAttributeByName(name, attributeName)[0];
                vertexConfig.renderer.setLabelContent(label);
            }
        }
    },
    setEdgeLabel: function (edge, label) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.setLabelContent(label);
    },
    setEdgeLabelByAttribute: function (attributeName) {
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                var edgeConfig = this.getVertexConfig(edge);
                var name = edge.name;

                //TODO warning with duplicate names, only first will be used.
                var label = this.edgeAttributeManager.getAttributeByName(name, attributeName)[0];
                edgeConfig.renderer.setLabelContent(label);
            }
        }
    },

    selectVertex: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.select();
    },
    selectEdge: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.select();
    },
    selectVerticesByIds: function (vertexIds) {
        var selectedVertices = []
        for (var i = 0, l = vertexIds.length; i < l; i++) {
            var vertexId = vertexIds[i];
            var vertex = this.getVertexById(vertexId);
            this.selectVertex(vertex);
            selectedVertices.push(vertex);
        }
        return selectedVertices;
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
    selectAllVertices: function () {
        var selectedVertices = [];
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.selectVertex(vertex);
                selectedVertices.push(vertex);
            }
        }
        return selectedVertices;
    },
    selectAllEdges: function () {
        var selectedEdges = [];
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                this.selectEdge(edge);
                selectedEdges.push(edge);
            }
        }
        return selectedEdges;
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
    setVertexRendererAttribute: function (vertex, rendererAttr, value, updateEdges) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.set(rendererAttr, value);

        if(updateEdges !== false){
            for (var j = 0; j < vertex.edges.length; j++) {
                var edge = vertex.edges[j];
                if (typeof edge !== 'undefined') {
                    var edgeConfig = this.getEdgeConfig(edge);
                    edgeConfig.renderer.update();
                }
            }
        }
    },
    setVerticesRendererAttribute: function (rendererAttr, value, updateEdges) {
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.setVertexRendererAttribute(vertex, rendererAttr, value, updateEdges);
            }
        }
    },
    setVerticesRendererAttributeMap: function (rendererAttr, vertexAttribute, uniqueMap) {
        for (var uniqueAttrValue in uniqueMap) {
            var rendererValue = uniqueMap[uniqueAttrValue];
            var names = this.nodeAttributeManager.getNamesByAttributeValue(vertexAttribute, uniqueAttrValue);
            for (var i = 0, l = names.length; i < l; i++) {
                var name = names[i];
                var vertices = this.graph.findVertexByName(name);
                for (var j = 0, lj = vertices.length; j < lj; j++) {
                    var vertex = vertices[j];
                    if (typeof vertex !== 'undefined') {
                        this.setVertexRendererAttribute(vertex, rendererAttr, rendererValue);
                    }
                }
            }
        }
    },
    setEdgeRendererAttribute: function (edge, attr, value) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.set(attr, value);
    },
    setEdgesRendererAttribute: function (attr, value) {
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                this.setEdgeRendererAttribute(edge, attr, value);
            }
        }
    },
    setEdgesRendererAttributeMap: function (rendererAttr, vertexAttribute, uniqueMap) {
        for (var uniqueAttrValue in uniqueMap) {
            var rendererValue = uniqueMap[uniqueAttrValue];
            var names = this.edgeAttributeManager.getNamesByAttributeValue(vertexAttribute, uniqueAttrValue);
            for (var i = 0, l = names.length; i < l; i++) {
                var name = names[i];
                var edges = this.graph.findEdgeByName(name);
                for (var j = 0, lj = edges.length; j < lj; j++) {
                    var edge = edges[j];
                    if (typeof edge !== 'undefined') {
                        this.setEdgeRendererAttribute(edge, rendererAttr, rendererValue);
                    }
                }
            }
        }
    },


    /* Attribute Manager */
    addAttribute: function (name, type, defaultValue) {
        //TODO test
    },
    removeAttribute: function (name) {
        //TODO test
//        this.attributeManager.removeAttribute(name);
    },
    getVertexAttributes: function (vertex, success) {
        //TODO test
//        this.attributeManager.getVertexAttributes(vertex, success);
    },

    /** JSON import/export **/
    /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify */
    toJSON: function () {
        return {
            graph: this.graph,
            config: this.config
        };
    },
    loadJSON: function (content) {

        /*  graph */
        this.graph.clean();
        this.config.clean();

        for (var i = 0; i < content.graph.vertices.length; i++) {
            var v = content.graph.vertices[i];
            var vertex = new Vertex({
                id: v.id,
                name: v.name
            });
            /* vertex config */
            var vertexConfig = new VertexConfig({
                id: v.id,
                coords: content.config.vertices[v.id].coords,
                renderer: new DefaultVertexRenderer(content.config.vertices[v.id].renderer)
            });
            this.addVertex({
                vertex: vertex,
                vertexConfig: vertexConfig
            });
        }

        for (var i = 0; i < content.graph.edges.length; i++) {
            var e = content.graph.edges[i];

            var source = this.getVertexById(e.source.id);
            var target = this.getVertexById(e.target.id);

            var edge = new Edge({
                id: e.id,
                name: e.name,
                source: source,
                target: target
            });

            /* edge config */
            var edgeConfig = new EdgeConfig({
                id: e.id,
                renderer: new DefaultEdgeRenderer(content.config.edges[e.id].renderer)
            });

            this.addEdge({
                edge: edge,
                edgeConfig: edgeConfig
            });

        }

    },
    importVertexWithAttributes: function (data) {
//                this.nodeAttributeManager.addAttribute(name, type, defaultValue);
        if (data.createNodes) {
            for (var i = 0; i < data.content.data.length; i++) {
                var name = data.content.data[i][0];

                if (this.graph.findVertexByName(name).length == 0) {
                    var vertex = new Vertex({
                        name: name
                    });

                    /* vertex config */
                    var vertexConfig = new VertexConfig({
                        id: vertex.id,
                        renderer: new DefaultVertexRenderer()
                    });

                    this.addVertex({
                        vertex: vertex,
                        vertexConfig: vertexConfig
                    });
                }
            }
        }

        // add attributes
        if (data.content.attributes.length > 1) {
            var attrNames = [];
            for (var i = 0; i < data.content.attributes.length; i++) {
                var name = data.content.attributes[i].name;
                var type = data.content.attributes[i].type;
                var defaultValue = data.content.attributes[i].defaultValue;
                this.nodeAttributeManager.addAttribute(name, type, defaultValue);
//                this.networkData.getNodeAttributes().addAttribute(name, type, defaultValue);
                attrNames.push(name);
            }

            // add values for attributes
            for (var i = 0; i < data.content.data.length; i++) {
                for (var j = 1; j < data.content.data[i].length; j++) {
                    var name = data.content.data[i][0];
                    var attr = attrNames[j];
                    var value = data.content.data[i][j];
                    this.nodeAttributeManager.setAttributeByName(name, attr, value)
//                    this.networkData.getNodeAttributes().setAttributeByName(name, attr, value);
                }
            }
        }
    },
    findVerticesByName: function (name) {
        return this.graph.findVertexByName(name);
    }

}