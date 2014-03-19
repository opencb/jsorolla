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

//function GraphLayout(args) {
//    _.extend(this, Backbone.Events);
//    this.id = Utils.genId('GraphLayout');
//
//    this.verticesList = [];
//
//    //set instantiation args, must be last
//    _.extend(this, args);
//
//    this.vertices = {};
//
//    this._init();
//
//    this.on(this.handlers);
//}

GraphLayout = {
    _init: function () {
        for (var i in this.verticesList) {
            var vertex = this.verticesList[i];
            if (typeof vertex.x === 'undefined') {
                vertex.x = 0;
            }
            if (typeof vertex.y === 'undefined') {
                vertex.y = 0;
            }
            if (typeof vertex.z === 'undefined') {
                vertex.z = 0;
            }
            this.vertices[vertex.id] = vertex;
        }
    },
    getRandomArbitrary: function (min, max) {
        return Math.random() * (max - min) + min;
    },
    applyRandom3d: function () {
        for (var i in this.vertices) {
            var vertex = this.vertices[i];
            vertex.x = this.getRandomArbitrary(-300, 300);
            vertex.y = this.getRandomArbitrary(-300, 300);
            vertex.z = this.getRandomArbitrary(10, 600);
        }
    },
    sphereSurface: function (vertices, network, radius, offsetZ) {

        //        θ = theta
        //        φ = phi
        var n = vertices.length;

        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            var vertexConfig = network.config.getVertexConfig(vertex);
            var coords = vertexConfig.coords;

            var phi = Math.acos(-1 + ( 2 * i ) / n);
            var theta = Math.sqrt(n * Math.PI) * phi;
            coords.x = radius * Math.cos(theta) * Math.sin(phi);
            coords.y = radius * Math.sin(theta) * Math.sin(phi);
            coords.z = radius * Math.cos(phi) + offsetZ;
        }
    },
    random2d: function (network, width, height) {
        var vertices = network.graph.vertices;
        var x, y;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                x = this.getRandomArbitrary(0, width);
                y = this.getRandomArbitrary(0, height);
                network.setVertexCoords(vertex, x, y);
            }
        }
    },
    circle: function (network, width, height, orderedVertices) {
        var vertices = network.graph.vertices;
        if (typeof orderedVertices !== 'undefined') {
            vertices = orderedVertices;
        }
        var radius = height / 2;
        var centerX = width / 2;
        var centerY = height / 2;
        var x, y;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                x = centerX + radius * Math.sin(i * 2 * Math.PI / vertices.length);
                y = centerY + radius * Math.cos(i * 2 * Math.PI / vertices.length);
                network.setVertexCoords(vertex, x, y);
            }
        }
    },
    force: function (network, width, height, endFunction, simulation) {
        if (typeof network === 'undefined') {
            console.log('graph not defined');
            return;
        }
        var verticesArray = [];
        var verticesMap = [];
        var edgesArray = [];

        var force = d3.layout.force();
        force.size([width, height]);

        var vertices = network.graph.vertices;

        var run = function () {
            layoutPrepare();
            force.nodes(verticesArray)
                .links(edgesArray)
//                .linkStrength(0.8)
                .linkDistance(function (edge) {
                    return edge.size * 1.5;
                })
                .charge(function (node) {
                    return node.size * -10;
                })
        };

        var layoutPrepare = function () {
            for (var i = 0, l = vertices.length; i < l; i++) {
                var vertex = vertices[i];
                if (typeof vertex !== 'undefined') {
                    var vertexConfig = network.config.getVertexConfig(vertex);
                    var v = {
                        id: vertex.id,
                        index: i,
                        x: vertexConfig.coords.x,
                        y: vertexConfig.coords.y,
                        size: vertexConfig.renderer.getSize()
                    };
                    verticesArray.push(v);
                    verticesMap[vertex.id] = v;
                }
            }


            var edges = network.graph.edges;
            for (var i = 0, l = edges.length; i < l; i++) {
                var edge = edges[i];
                if (typeof edge !== 'undefined') {
                    var sourceConfig = network.config.getVertexConfig(edge.source);
                    var targetConfig = network.config.getVertexConfig(edge.target);
                    edgesArray.push({
                        source: verticesMap[edge.source.id],
                        target: verticesMap[edge.target.id],
                        size: sourceConfig.renderer.size + targetConfig.renderer.size
                    });
                }
            }
        };
        run();

        force.on('end', function (o) {
            console.log(o)
            endFunction(verticesArray);
        });

        if (simulation === true) {
            force.on('tick', function (o) {
                endFunction(verticesArray);
            });
            force.start();
        } else {
            force.start();
            var safety = 0;
            while (force.alpha() > 0) { // You'll want to try out different, "small" values for this
                force.tick();
                if (safety++ > 1000) {
                    break;// Avoids infinite looping in case this solution was a bad idea
                }
            }
            console.log(safety);
            force.stop();

        }

    }

}