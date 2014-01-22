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

function GraphLayout(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('GraphLayout');

    this.verticesList = [];

    //set instantiation args, must be last
    _.extend(this, args);

    this.vertices = {};

    this._init();

    this.on(this.handlers);
}

GraphLayout.prototype = {
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
    applySphereSurface: function (offsetZ) {
        //        θ = theta
        //        φ = phi
        var radius = 200;
        var n = Object.keys(this.vertices).length;
        var i = 0;
        for (var key in this.vertices) {
            var vertex = this.vertices[key];

            var phi = Math.acos(-1 + ( 2 * i ) / n);
            var theta = Math.sqrt(n * Math.PI) * phi;

            vertex.x = radius * Math.cos(theta) * Math.sin(phi);
            vertex.y = radius * Math.sin(theta) * Math.sin(phi);
            vertex.z = radius * Math.cos(phi) + offsetZ;

            /* update */
            i++;
        }
    },
    getRandom2d: function () {

    },
    springLayout: function (graph) {
        var iterations = 500;
        var maxRepulsiveForceDistance = 6;
        var k = 2;
        var c = 0.01;
        var maxVertexMovement = 0.5;

        var layout = function () {
            layoutPrepare();
            for (var i = 0; i < iterations; i++) {
                layoutIteration();
            }
            layoutCalcBounds();
        };

        var layoutPrepare = function () {
            for (var i = 0; i < graph.nodes.length; i++) {
                var node = graph.nodes[i];
                node.layoutPosX = 0;
                node.layoutPosY = 0;
                node.layoutForceX = 0;
                node.layoutForceY = 0;
            }
        };

        var layoutCalcBounds = function () {
            var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;

            for (var i = 0; i < this.graph.nodes.length; i++) {
                var x = this.graph.nodes[i].layoutPosX;
                var y = this.graph.nodes[i].layoutPosY;

                if (x > maxx) maxx = x;
                if (x < minx) minx = x;
                if (y > maxy) maxy = y;
                if (y < miny) miny = y;
            }

            this.graph.layoutMinX = minx;
            this.graph.layoutMaxX = maxx;
            this.graph.layoutMinY = miny;
            this.graph.layoutMaxY = maxy;
        };

        var layoutIteration = function () {
            // Forces on nodes due to node-node repulsions
            for (var i = 0; i < this.graph.nodes.length; i++) {
                var node1 = this.graph.nodes[i];
                for (var j = i + 1; j < this.graph.nodes.length; j++) {
                    var node2 = this.graph.nodes[j];
                    this.layoutRepulsive(node1, node2);
                }
            }
            // Forces on nodes due to edge attractions
            for (var i = 0; i < this.graph.edges.length; i++) {
                var edge = this.graph.edges[i];
                this.layoutAttractive(edge);
            }

            // Move by the given force
            for (var i = 0; i < this.graph.nodes.length; i++) {
                var node = this.graph.nodes[i];
                var xmove = this.c * node.layoutForceX;
                var ymove = this.c * node.layoutForceY;

                var max = this.maxVertexMovement;
                if (xmove > max) xmove = max;
                if (xmove < -max) xmove = -max;
                if (ymove > max) ymove = max;
                if (ymove < -max) ymove = -max;

                node.layoutPosX += xmove;
                node.layoutPosY += ymove;
                node.layoutForceX = 0;
                node.layoutForceY = 0;
            }
        };

        var layoutRepulsive = function (node1, node2) {
            var dx = node2.layoutPosX - node1.layoutPosX;
            var dy = node2.layoutPosY - node1.layoutPosY;
            var d2 = dx * dx + dy * dy;
            if (d2 < 0.01) {
                dx = 0.1 * Math.random() + 0.1;
                dy = 0.1 * Math.random() + 0.1;
                var d2 = dx * dx + dy * dy;
            }
            var d = Math.sqrt(d2);
            if (d < this.maxRepulsiveForceDistance) {
                var repulsiveForce = this.k * this.k / d;
                node2.layoutForceX += repulsiveForce * dx / d;
                node2.layoutForceY += repulsiveForce * dy / d;
                node1.layoutForceX -= repulsiveForce * dx / d;
                node1.layoutForceY -= repulsiveForce * dy / d;
            }
        };

        var layoutAttractive = function (edge) {
            var node1 = edge.source;
            var node2 = edge.target;

            var dx = node2.layoutPosX - node1.layoutPosX;
            var dy = node2.layoutPosY - node1.layoutPosY;
            var d2 = dx * dx + dy * dy;
            if (d2 < 0.01) {
                dx = 0.1 * Math.random() + 0.1;
                dy = 0.1 * Math.random() + 0.1;
                var d2 = dx * dx + dy * dy;
            }
            var d = Math.sqrt(d2);
            if (d > this.maxRepulsiveForceDistance) {
                d = this.maxRepulsiveForceDistance;
                d2 = d * d;
            }
            var attractiveForce = (d2 - this.k * this.k) / this.k;
            if (edge.weight == undefined || edge.weight < 1) edge.weight = 1;
            attractiveForce *= Math.log(edge.weight) * 0.5 + 1;

            node2.layoutForceX -= attractiveForce * dx / d;
            node2.layoutForceY -= attractiveForce * dy / d;
            node1.layoutForceX += attractiveForce * dx / d;
            node1.layoutForceY += attractiveForce * dy / d;
        };
    }

}