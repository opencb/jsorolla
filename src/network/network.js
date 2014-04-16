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

    // Default attributes for vertices and edges.
    // They cannot be deleted.
    var vertexAttributes = [
        {name: "Id", type: "string", defaultValue: "none", locked: true},
        {name: "Name", type: "string", defaultValue: "none"}
    ];
    var edgeAttributes = [
        {name: "Id", type: "string", defaultValue: "none", locked: true},
        {name: "Name", type: "string", defaultValue: "none"},
        {name: "Relation", type: "string", defaultValue: "none"}
    ];
    this.vertexAttributeManager = new AttributeManagerStore({
        attributes: vertexAttributes,
        handlers: {
            'change:attributes': function (e) {
                _this.trigger('change:vertexAttributes', e);
            }
        }
    });
    this.edgeAttributeManager = new AttributeManagerStore({
        attributes: edgeAttributes,
        handlers: {
            'change:attributes': function (e) {
                _this.trigger('change:edgeAttributes', e);
            }
        }
    });

    this.batchFlag = false;

    this.on(this.handlers);
}

Network.prototype = {
    setGraph: function (graph) {
        console.time('Network.setGraph');
        this.batchStart();
        this.clean();
        var edges = graph.edges;
        var vertices = graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.addVertex({
                    vertex: vertex,
                    vertexConfig: new VertexConfig({})
                });
            }
        }
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                this.addEdge({
                    edge: edge,
                    edgeConfig: new EdgeConfig({})
                });
            }
        }
        this.batchEnd();
        console.timeEnd('Network.setGraph');
    },
    getGraph: function () {
        return this.graph;
    },
    draw: function (target) {
        console.time('Network.draw');
        var parent = target.parentNode;
        parent.removeChild(target);
        this.batchStart();
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
        this.batchEnd();
        console.timeEnd('Network.draw');
        parent.appendChild(target);
        this.trigger('draw');
    },
    addVertex: function (args) {
        var vertex = args.vertex;
        var vertexConfig = args.vertexConfig;
        var target = args.target;
        var name = args.name;

        var added = this.graph.addVertex(vertex);
        if (added) {

            /* vertex config */
            if (typeof vertexConfig === 'undefined') {
                vertexConfig = new VertexConfig({});
            }
            vertexConfig.id = vertex.id;
            this.setVertexConfig(vertexConfig);

            if (typeof target !== 'undefined') {
                this.renderVertex(vertex, target);
            }

            var n = vertex.id;
            //attributes
            if (typeof name !== 'undefined') {
                n = name;
            }

            this.vertexAttributeManager.addRecord({
                'Id': vertex.id,
                'Name': n
            });

            if (this.batchFlag == false) {
                this.trigger('add:vertex');
            }
        }
        return added;
    },
    addEdge: function (args) {
        var edge = args.edge;
        var edgeConfig = args.edgeConfig;
        var target = args.target;


        var added = this.graph.addEdge(edge);
        if (added) {

            /* edge config */
            if (typeof edgeConfig === 'undefined') {
                edgeConfig = new EdgeConfig({});
            }
            edgeConfig.id = edge.id;
            this.setEdgeConfig(edgeConfig);


            if (typeof target !== 'undefined') {
                this.renderEdge(edge, target);
            }

            //attributes
            this.edgeAttributeManager.addRecord({
                'Id': edge.id,
                'Name': edge.id,
                'Relation': edge.relation
            });

            if (this.batchFlag == false) {
                this.trigger('add:edge');
            }
        }
        return added;
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
            this.edgeAttributeManager.removeRecordById(edge.id);
        }
        this.graph.removeVertex(vertex);
        this.config.removeVertex(vertex);
        this.vertexAttributeManager.removeRecordById(vertex.id);

        if (this.batchFlag == false) {
            this.trigger('remove:vertex');
        }

    },
    removeEdge: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.remove();
        this.graph.removeEdge(edge);
        this.config.removeEdge(edge);
        this.edgeAttributeManager.removeRecordById(edge.id);
        if (this.batchFlag == false) {
            this.trigger('remove:edge');
        }
    },
    removeVertices: function (vertices) {
        this.vertexAttributeManager.store.suspendEvents();
        for (var i = 0, li = vertices.length; i < li; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.removeVertex(vertex, true);
            }
        }
        this.vertexAttributeManager.store.resumeEvents();
        this.vertexAttributeManager.store.fireEvent('refresh');
        this.trigger('remove:vertices');
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
        this.vertexAttributeManager.setRecordAttributeById(vertex.id, 'Name', label);
    },
    setVertexLabelByAttribute: function (attributeName) {
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.getVertexConfig(vertex);
                var id = vertex.id;

//              /* Name attribute is unique */
                var label = this.vertexAttributeManager.getValueByAttributeAndId(id, attributeName);
                vertexConfig.renderer.setLabelContent(label);
            }
        }
    },
    setEdgeLabel: function (edge, label) {
        this.edgeAttributeManager.setRecordAttributeById(edge.id, 'Name', label);
    },
    setEdgeLabelByAttribute: function (attributeName) {
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                var edgeConfig = this.getEdgeConfig(edge);
                var id = edge.id;

                /* Name attribute is unique */
                var label = this.edgeAttributeManager.getValueByAttributeAndId(id, attributeName);
                edgeConfig.renderer.setLabelContent(label);
            }
        }
    },

    selectVertex: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.select();
        this.vertexAttributeManager.setRecordAttributeById(vertex.id, 'Selected', true);
    },
    selectEdge: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.select();
        this.edgeAttributeManager.setRecordAttributeById(edge.id, 'Selected', true);
    },
    selectVerticesByIds: function (vertexIds) {
        var selectedVertices = []
        for (var i = 0, l = vertexIds.length; i < l; i++) {
            var vertexId = vertexIds[i];
            var vertex = this.getVertexById(vertexId);
            var vertexConfig = this.config.getVertexConfig(vertex);
            vertexConfig.renderer.select();
            selectedVertices.push(vertex);
        }
        this.vertexAttributeManager.selectByItems(selectedVertices);
        return selectedVertices;
    },
    selectByArea: function (x, y, width, height) {
        var selectedVertices = [];
        var selectedEdges = [];
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.getVertexConfig(vertex);
                if (vertexConfig.coords.x >= x && vertexConfig.coords.x <= x + width && vertexConfig.coords.y >= y && vertexConfig.coords.y <= y + height) {
                    vertexConfig.renderer.select();
                    selectedVertices.push(vertex);

                    for (var j = 0; j < vertex.edges.length; j++) {
                        var edge = vertex.edges[j];
                        var edgeConfig = this.config.getEdgeConfig(edge);
                        if (edgeConfig.renderer.selected === false) {
                            edgeConfig.renderer.select();
                            selectedEdges.push(edge);
                        }
                    }

                }
            }
        }
        this.vertexAttributeManager.selectByItems(selectedVertices);
        this.edgeAttributeManager.selectByItems(selectedEdges);
        return {vertices: selectedVertices, edges: selectedEdges};
    },
    deselectVertex: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.renderer.deselect();
        this.vertexAttributeManager.setRecordAttributeById(vertex.id, 'Selected', false);
    },
    deselectEdge: function (edge) {
        var edgeConfig = this.config.getEdgeConfig(edge);
        edgeConfig.renderer.deselect();
        this.edgeAttributeManager.setRecordAttributeById(edge.id, 'Selected', false);
    },
    deselectAllVertices: function () {
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.config.getVertexConfig(vertex);
                vertexConfig.renderer.deselect();
            }
        }
        this.vertexAttributeManager.deselectAll();
    },
    deselectAllEdges: function () {
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                var edgeConfig = this.config.getEdgeConfig(edge);
                edgeConfig.renderer.deselect();
            }
        }
        this.edgeAttributeManager.deselectAll();
    },
    selectAllVertices: function () {
        var selectedVertices = [];
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.config.getVertexConfig(vertex);
                vertexConfig.renderer.select();
                selectedVertices.push(vertex);
            }
        }
        this.vertexAttributeManager.selectAll();
        return selectedVertices;
    },
    selectVerticesNeighbour: function (vertices) {
        var selectedVertices = [];
        var selectedVerticesMap = {};
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                selectedVerticesMap[vertex.id] = vertex;
                selectedVertices.push(vertex);
                var vertexConfig = this.config.getVertexConfig(vertex);
                vertexConfig.renderer.select();

                for (var j = 0; j < vertex.edges.length; j++) {
                    var edge = vertex.edges[j];
                    if (typeof selectedVerticesMap[edge.source.id] === 'undefined') {
                        selectedVerticesMap[edge.source.id] = edge.source;
                        selectedVertices.push(edge.source);
                        var vertexConfig = this.config.getVertexConfig(edge.source);
                        vertexConfig.renderer.select();
                    }
                    if (typeof selectedVerticesMap[edge.target.id] === 'undefined') {
                        selectedVerticesMap[edge.target.id] = edge.target;
                        selectedVertices.push(edge.target);
                        var vertexConfig = this.config.getVertexConfig(edge.target);
                        vertexConfig.renderer.select();
                    }
                }
            }
        }
        this.vertexAttributeManager.selectByItems(selectedVertices);
        return selectedVertices;
    },
    selectEdgesNeighbour: function (vertices) {
        var selectedEdges = [];
        var selectedEdgesMap = {};
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                for (var j = 0; j < vertex.edges.length; j++) {
                    var edge = vertex.edges[j];
                    if (typeof selectedEdgesMap[edge.id] === 'undefined') {
                        selectedEdgesMap[edge.id] = edge;
                        selectedEdges.push(edge);
                        var edgeConfig = this.config.getEdgeConfig(edge);
                        edgeConfig.renderer.select();
                    }
                }
            }
        }
        this.edgeAttributeManager.selectByItems(selectedEdges);
        return selectedEdges;
    },
    selectVerticesInvert: function () {
        var selectedVertices = [];
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                var vertexConfig = this.config.getVertexConfig(vertex);
                if (vertexConfig.renderer.selected) {
                    vertexConfig.renderer.deselect();
                } else {
                    selectedVertices.push(vertex);
                    vertexConfig.renderer.select();
                }
            }
        }
        this.vertexAttributeManager.selectByItems(selectedVertices);
        return selectedVertices;
    },
    selectAllEdges: function () {
        var selectedEdges = [];
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                var edgeConfig = this.config.getEdgeConfig(edge);
                edgeConfig.renderer.select();
                selectedEdges.push(edge);
            }
        }
        this.edgeAttributeManager.selectAll();
        return selectedEdges;
    },
    selectVerticesByAttribute: function (attributeName, attributeValue) {
        var selectedVertices = [];
        var ids = this.vertexAttributeManager.getIdsByAttributeValue(attributeName, attributeValue);
        for (var i = 0, l = ids.length; i < l; i++) {
            var id = ids[i];
            var vertex = this.graph.getVertexById(id);
            var vertexConfig = this.config.getVertexConfig(vertex);
            vertexConfig.renderer.select();
            selectedVertices.push(vertex);
        }
        this.vertexAttributeManager.selectByItems(selectedVertices);
        return selectedVertices;
    },
    selectEdgesByAttribute: function (attributeName, attributeValue) {
        var selectedEdges = [];
        var ids = this.edgeAttributeManager.getIdsByAttributeValue(attributeName, attributeValue);
        for (var i = 0, l = ids.length; i < l; i++) {
            var id = ids[i];
            var edge = this.graph.getEdgeById(id);
            var edgeConfig = this.config.getEdgeConfig(edge);
            edgeConfig.renderer.select();
            selectedEdges.push(edge);
        }
        this.vertexAttributeManager.selectByItems(selectedEdges);
        return selectedEdges;
    },


    moveVertex: function (vertex, dispX, dispY, dispZ) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.move(dispX, dispY, dispZ);

        this._updateEdgeCoords(vertex);
    },
    _updateEdgeCoords: function (vertex) {
        for (var i = 0; i < vertex.edges.length; i++) {
            var edge = vertex.edges[i];
            var edgeConfig = this.getEdgeConfig(edge);
            var sourceConfig = this.getVertexConfig(edge.source);
            var targetConfig = this.getVertexConfig(edge.target);

            if (vertex === edge.source) {
//                edgeConfig.renderer.moveSource(sourceConfig.coords);
                edgeConfig.renderer.move(sourceConfig.coords);
            }
            if (vertex === edge.target) {
//                edgeConfig.renderer.moveTarget(targetConfig.coords);
                edgeConfig.renderer.move(targetConfig.coords);
            }
        }
    },
    setVertexCoords: function (vertex, x, y, z) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        vertexConfig.setCoords(x, y, z);

        this._updateEdgeCoords(vertex);
    },
    setVertexCoordsById: function (vertexId, x, y, z) {
        var vertex = this.getVertexById(vertexId);
        this.setVertexCoords(vertex, x, y, z);
    },
    getVertexCoords: function (vertex) {
        var vertexConfig = this.config.getVertexConfig(vertex);
        return vertexConfig.getCoords();
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

        //By default not update edges
        if (updateEdges === true) {
            this._updateVertexEdgesRenderer(vertex);
        }
    },
    _updateVertexEdgesRenderer: function (vertex) {
        for (var j = 0; j < vertex.edges.length; j++) {
            var edge = vertex.edges[j];
            if (typeof edge !== 'undefined') {
                var edgeConfig = this.getEdgeConfig(edge);
                edgeConfig.renderer.updateShape();
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
            var ids = this.vertexAttributeManager.getIdsByAttributeValue(vertexAttribute, uniqueAttrValue);
            for (var i = 0, l = ids.length; i < l; i++) {
                var id = ids[i];
                var vertex = this.graph.getVertexById(id);
                this.setVertexRendererAttribute(vertex, rendererAttr, rendererValue);
            }
        }
    },
    setVerticesRendererAttributeListMap: function (args) {
        var _this = this;

        var settings = args.settings;
        var defaults = args.defaults;

        if (settings.length > 0) {
            var sortFunction = function (a, b) {
                return b.values.length - a.values.length;
            };

            var checkEqualValuesLength = function (list) {
                if (list.length == 1) {
                    return true;
                } else {
                    var l = list[0].values.length;
                    for (var i = 1; i < list.length; i++) {
                        if (list[i].values.length !== l) {
                            return false;
                        }
                    }
                    return true;
                }
            };
            var checkNotEqualValuesLength = function (list) {
                if (list.length > 1) {
//                var l0 = list[0].values.length;
                    for (var i = 1; i < list.length; i++) {
                        var li = list[i].values.length;
                        if (li > 1) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            };

            this.vertexAttributeManager.eachRecord(function (record) {


                var slicesMap = {};

                var id = record.get('Id');

//                if(id === 'c'){
//                    debugger
//                }

                var vertex = _this.graph.getVertexById(id);
                var vertexConfig = _this.config.getVertexConfig(vertex);

                for (var s = 0; s < settings.length; s++) {
                    var configs = settings[s].configs;
                    var label = settings[s].label;
                    var slicesName = settings[s].slicesName;
                    var sliceDefault = defaults[slicesName];

                    if (configs.length > 0) {

                        var valuesAndConfigList = [];
                        for (var i = 0; i < configs.length; i++) {
                            var config = configs[i];
                            if (typeof config !== 'undefined') {
                                var value = record.get(config.attribute);
                                if (typeof value !== 'undefined') {
                                    var valueSplit = value.split(',');
                                    valuesAndConfigList.push({values: valueSplit, config: config});
                                }
                            }
                        }

                        valuesAndConfigList.sort(sortFunction);

                        var slices = [];
                        if (valuesAndConfigList.length > 0) {
                            if (checkEqualValuesLength(valuesAndConfigList)) {
                                var valuesLength = valuesAndConfigList[0].values.length;
                                for (var i = 0; i < valuesLength; i++) {
                                    var slice = {};
                                    for (var displayAttribute in sliceDefault) {
                                        slice[displayAttribute] = sliceDefault[displayAttribute];
                                    }

                                    for (var j = 0; j < valuesAndConfigList.length; j++) {
                                        var valuesAndConfig = valuesAndConfigList[j];
                                        var val = valuesAndConfig.values[i];
                                        var renderValue = valuesAndConfig.config.map[val];
                                        if (label.enable && valuesAndConfig.config.attribute === label.attribute) {
                                            slice['text'] = val;
                                            slice['labelSize'] = label.size;
                                            slice['labelOffset'] = label.offset;
                                        }
                                        if (typeof renderValue !== 'undefined') {
                                            slice[valuesAndConfig.config.displayAttribute] = renderValue;
                                        }
                                    }
                                    slices.push(slice);
                                }
                            } else if (checkNotEqualValuesLength(valuesAndConfigList)) {
                                var valuesLength = valuesAndConfigList[0].values.length;
                                for (var i = 0; i < valuesLength; i++) {
                                    var slice = {};
                                    for (var displayAttribute in sliceDefault) {
                                        slice[displayAttribute] = sliceDefault[displayAttribute];
                                    }

                                    var valuesAndConfig = valuesAndConfigList[0];
                                    var val = valuesAndConfig.values[i];
                                    var renderValue = valuesAndConfig.config.map[val];
                                    if (label.enable && valuesAndConfig.config.attribute === label.attribute) {
                                        slice['text'] = val;
                                        slice['labelSize'] = label.size;
                                        slice['labelOffset'] = label.offset;
                                    }
                                    if (typeof renderValue !== 'undefined') {
                                        slice[valuesAndConfig.config.displayAttribute] = renderValue;
                                    }

                                    for (var j = 1; j < valuesAndConfigList.length; j++) {
                                        valuesAndConfig = valuesAndConfigList[j];
                                        val = valuesAndConfig.values[0];
                                        if (label.enable && valuesAndConfig.config.attribute === label.attribute) {
                                            slice['text'] = val;
                                            slice['labelSize'] = label.size;
                                            slice['labelOffset'] = label.offset;
                                        }
                                        renderValue = valuesAndConfig.config.map[val];
                                        if (typeof renderValue !== 'undefined') {
                                            slice[valuesAndConfig.config.displayAttribute] = renderValue;
                                        }
                                    }
                                    slices.push(slice);
                                }
                            } else {
                                console.log(record.get('Id'));
                            }
                        }
                        if (slices.length > 0) {
                            slicesMap[slicesName] = slices;
                        }
                    }
                }
                vertexConfig.renderer.updateComplex(slicesMap, defaults);
            });
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
            var ids = this.edgeAttributeManager.getIdsByAttributeValue(vertexAttribute, uniqueAttrValue);
            for (var i = 0, l = ids.length; i < l; i++) {
                var id = ids[i];
                var edge = this.graph.getEdgeById(id);
                this.setEdgeRendererAttribute(edge, rendererAttr, rendererValue);
            }
        }
    },


    getVerticesLength: function () {
        return this.graph.numberOfVertices;
    },
    getEdgesLength: function () {
        return this.graph.numberOfEdges;
    },
    getVertices: function () {
        var items = [];
        var vertices = this.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                items.push(vertex);
            }
        }
        return items;
    },
    getEdges: function () {
        var items = [];
        var edges = this.graph.edges;
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                items.push(edge);
            }
        }
        return items;
    },
    getVerticesOrdered: function (attributeName) {
        var vertices = [];
        var item = this.vertexAttributeManager.getOrderedIdsByAttribute(attributeName);
        for (var i = 0, l = item.length; i < l; i++) {
            var id = item[i].id;
            var vertex = this.graph.getVertexById(id);
            if (typeof vertex !== 'undefined') {
                vertices.push(vertex);
            }
        }
        return vertices;
    },


//    /* Attribute Manager */
//    addAttribute: function (name, type, defaultValue) {
//        //TODO test
//    },
//    removeAttribute: function (name) {
//        //TODO test
////        this.attributeManager.removeAttribute(name);
//    },
//    getVertexAttributes: function (vertex, success) {
//        //TODO test
////        this.attributeManager.getVertexAttributes(vertex, success);
//    },

    clean: function () {
        console.time('Network.clean')
        /*  graph */
        this.graph.clean();
        this.config.clean();

        //Attributes
        this.vertexAttributeManager.clean();
        this.edgeAttributeManager.clean();

        var vertexAttributes = [
            {name: "Id", type: "string", defaultValue: "none", locked: true},
            {name: "Name", type: "string", defaultValue: "none"}
        ];
        var edgeAttributes = [
            {name: "Id", type: "string", defaultValue: "none", locked: true},
            {name: "Name", type: "string", defaultValue: "none"},
            {name: "Relation", type: "string", defaultValue: "none"}
        ];
        this.vertexAttributeManager.addAttributes(vertexAttributes);
        this.edgeAttributeManager.addAttributes(edgeAttributes);

        this.trigger('clean');
        console.timeEnd('Network.clean')
    },

    getAsSIF: function (separator) {
        return this.graph.getAsSIF(separator);
    },
    getAsSIFCustomRelation: function (separator, relationColumn) {
        if (typeof separator === 'undefined') {
            separator = '\t';
        }

        var vertices = this.graph.vertices;
        var edges = this.graph.edges;

        var sifText = "";
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                var line = "";

                var attrValue = this.edgeAttributeManager.getValueByAttributeAndId(edge.id, relationColumn);

                line = edge.source.id + separator + attrValue + separator + edge.target.id + "\n";
                sifText += line;
            }
        }
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
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

    /** JSON import/export **/
    /* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify */
    toJSON: function () {
        return {
            graph: this.graph,
            config: this.config,
            vertexAttributes: this.vertexAttributeManager,
            edgeAttributes: this.edgeAttributeManager
        };
    },
    loadJSON: function (content) {
        this.clean();

        this.batchStart();
        console.time('Network.loadJSON');
        for (var i = 0; i < content.graph.vertices.length; i++) {
            var v = content.graph.vertices[i];
            var vertex = new Vertex({
                id: v.id
            });

            /* vertex config */
            var config = content.config.vertices[v.id];
            if (typeof config === 'undefined') {
                var vertexConfig = new VertexConfig({});
            } else {
                var vertexConfig = new VertexConfig({
                    id: v.id,
                    coords: content.config.vertices[v.id].coords,
                    rendererConfig: config.renderer
                });
            }

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
                relation: e.relation,
                source: source,
                target: target
            });

            /* edge config */
            var config = content.config.edges[v.id];
            if (typeof config === 'undefined') {
                var edgeConfig = new EdgeConfig({});
            } else {
                var edgeConfig = new EdgeConfig({
                    id: v.id,
                    coords: content.config.edges[v.id].coords,
                    rendererConfig: config.renderer
                });
            }

            this.addEdge({
                edge: edge,
                edgeConfig: edgeConfig
            });
        }

        this._importAttributes(content.vertexAttributes, this.vertexAttributeManager);
        this._importAttributes(content.edgeAttributes, this.edgeAttributeManager);

        this.batchEnd();
        this.trigger('load:json');
        console.timeEnd('Network.loadJSON');
    },
    importVertexWithAttributes: function (data) {
        console.time('Network.importVertexWithAttributes');
        this.batchStart();
        if (data.createVertices) {
            for (var i = 0; i < data.content.data.length; i++) {
                var id = data.content.data[i][0];

                var vertex = new Vertex({
                    id: id
                });

                this.addVertex({
                    vertex: vertex
                });
            }
        }
        // add attributes
        this._importAttributes(data.content, this.vertexAttributeManager);
        this.batchEnd();
        this.trigger('import:attributes');
        console.timeEnd('Network.importVertexWithAttributes');
    },
    _importAttributes: function (data, attributeManager) {
        if (data.attributes.length > 1) {
            var attributes = data.attributes;
            attributeManager.addAttributes(attributes);
            // add values for attributes
//            console.time('Network._importAttributes');
            var values = [], recordObject, attr, value;
            for (var i = 0; i < data.data.length; i++) {
                recordObject = {
                    id: data.data[i][0]
                };
                for (var j = 1; j < data.data[i].length; j++) {
                    attr = attributes[j].name;
                    value = data.data[i][j];
                    recordObject[attr] = value;
                }
                values.push(recordObject);
            }
//            console.timeEnd('Network._importAttributes');
            attributeManager.setRecordAttributeByIds(values);
        }
    },
    importEdgesWithAttributes: function (data) {
        console.time('Network.importEdgesWithAttributes');
        this.batchStart();
        // add attributes
        this._importAttributes(data.content, this.edgeAttributeManager);
        this.batchEnd();
        this.trigger('import:attributes');
        console.timeEnd('Network.importEdgesWithAttributes');
    },
    batchStart: function () {
        this.batchFlag = true;
        this.vertexAttributeManager.store.suspendEvents();
        this.edgeAttributeManager.store.suspendEvents();
    },
    batchEnd: function () {
        this.vertexAttributeManager.store.resumeEvents();
        this.edgeAttributeManager.store.resumeEvents();
        this.vertexAttributeManager.store.fireEvent('refresh');
        this.edgeAttributeManager.store.fireEvent('refresh');
        this.batchFlag = false;
        this.trigger('batch:end');
    }

}