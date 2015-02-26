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
                defda
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
            x = this.getRandomArbitrary(0, width);
            y = this.getRandomArbitrary(0, height);
            vertex.position.x = x;
            vertex.position.y = y;
            vertex.renderer.move();
            network._updateEdgeCoords(vertex);
        }
    },
    circle: function (network, width, height, orderedVertices) {
        var vertices = network.graph.vertices;
        if (typeof orderedVertices !== 'undefined') {
            vertices = orderedVertices;
        }

        var radius = (height - 100) / 2;
        var centerX = width / 2;
        var centerY = height / 2;
        var x, y, vertex;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = network.graph.getVertexById(vertices[i].id);
            x = centerX + radius * Math.sin(i * 2 * Math.PI / vertices.length);
            y = centerY + radius * Math.cos(i * 2 * Math.PI / vertices.length);
            vertex.position.x = x;
            vertex.position.y = y;
            vertex.renderer.move();
            network._updateEdgeCoords(vertex);
        }
    },
    force: function (args) {
        var network = args.network;
        var graph = args.network.graph;
        var vAttr = args.network.vAttr;
        var eAttr = args.network.eAttr;
        var width = args.width;
        var height = args.height;
        var friction = args.friction;
        var gravity = args.gravity;
        var chargeDistance = args.chargeDistance;

        var linkStrength = args.linkStrength;
        var linkDistance = args.linkDistance;
        var charge = args.charge;

        var attributes = args.attributes;

        var endFunction = args.end;
        var simulation = args.simulation;

        var config = typeof args.config === 'undefined' ? {vertices: {}, edges: {}} : args.config;

        if (typeof network === 'undefined') {
            console.log('graph not defined');
            return;
        }
        var verticesArray = [];
        var verticesMap = [];
        var edgesArray = [];

        var force = d3.layout.force();

        //Global parameters
        force.size([width, height]);
        if (typeof  friction !== 'undefined') {
            force.friction(friction);

        }
        if (typeof gravity !== 'undefined') {
            force.gravity(gravity);

        }
        if (typeof  chargeDistance !== 'undefined') {
            force.chargeDistance(chargeDistance);

        }


        var vertices = network.graph.vertices;
        var edges = network.graph.edges;


        /*------------------------------------------*/
        /*------------------------------------------*/
        console.time('Force directed preload');

        //set node and edge arrays for D3
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            var v = {
                id: vertex.id,
                index: i,
                x: vertex.position.x,
                y: vertex.position.y
            };
            verticesArray.push(v);
            verticesMap[vertex.id] = v;
        }
        force.nodes(verticesArray);
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                edgesArray.push({
                    id: edge.id,
                    source: verticesMap[edge.source.id],
                    target: verticesMap[edge.target.id]
                });
            }
        }
        force.links(edgesArray);

        /* Node and Edge specific parameters */
        //Link Distance
        if (typeof linkDistance !== 'undefined') {
            if (!attributes || attributes.linkDistance == 'none') {
                force.linkDistance(linkDistance);
            } else {
                force.linkDistance(function (e) {
                    var edge = graph.getEdgeById(e.id);
                    var value = vAttr.getRow(edge.id)[attributes.linkDistance];
                    var ld = isNaN(value) ? (edge.source.renderer.getSize() + edge.target.renderer.getSize()) * 1.7 : value * linkDistance;
                    return ld;
                });
            }
        } else {
            force.linkDistance(function (e) {
                var edge = graph.getEdgeById(e.id);
                return edge.source.renderer.getSize() + edge.target.renderer.getSize() * 1.7;
            })
        }
        //Link Strength
        if (typeof linkStrength !== 'undefined') {
            if (!attributes || attributes.linkStrength == 'none') {
                force.linkStrength(linkStrength);
            } else {
                //is and attributName
                force.linkStrength(function (e) {
                    var value = vAttr.getRow(e.id)[attributes.linkStrength];
                    var ls = isNaN(value) ? 1 : value * linkStrength;
                    return ls;
                });
            }
        }
        //Node Charge
        if (typeof charge !== 'undefined') {
            if (!attributes || attributes.charge == 'none') {
                force.charge(charge);
            } else {
                //is and attributName
                force.charge(function (v) {
                    var vertex = graph.getVertexById(v.id);
                    var value = eAttr.getRow(vertex.id)[attributes.charge];
                    var c = isNaN(value) ? vertex.renderer.getSize() * -13 : value * charge;
                    return c;
                });
            }
        } else {
            force.charge(function (v) {
                var vertex = graph.getVertexById(v.id);
                return vertex.renderer.getSize() * -13;
            });
        }
        console.timeEnd('Force directed preload');
        /*------------------------------------------*/
        /*------------------------------------------*/


        force.on('end', function (o) {
            console.log(o)
            endFunction(verticesArray);
        });

        if (simulation === true) {
            force.on('tick', function (o) {
                endFunction(verticesArray);
                console.log(force.alpha())
                if (force.alpha() < 0.025) {
                    force.stop()
                }
            });
            force.start();
        } else {
            console.time('D3 Force directed layout');
            force.start();
            var safety = 0;
            while (force.alpha() > 0.025) { // You'll want to try out different, "small" values for this
                force.tick();
                if (safety++ > 1000) {
                    break;// Avoids infinite looping in case this solution was a bad idea
                }
            }
//            console.log(safety);
            force.stop();
            console.timeEnd('D3 Force directed layout');
        }

    },
    tree: function (args) {
        var network = args.network;
        var graph = network.graph;
        var vAttr = network.vAttr;
        var eAttr = network.eAttr;
        var width = args.width;
        var height = args.height;
        var vertices = graph.vertices;
        var edges = graph.edges;


        var rootNode = {
            name: args.root.id,
            vertex: args.root,
            children: null
        };
        var visited = {};
        //visited[args.root.id] = true;
        this._getTreeNode(rootNode, visited);

        var tree = d3.layout.tree()
            .sort(null)
            .size([width, height]);
        var nodes = tree.nodes(rootNode);

        args.end(nodes);

        //var links = tree.links(nodes);


    },
    _getTreeNode: function (node, visited) {
        //if (node.vertex.id == "GO:0042802") {
        //    debugger
        //}
        visited[node.vertex.id] = true;
        for (var i = 0; i < node.vertex.edges.length; i++) {
            var edge = node.vertex.edges[i];
            if (edge.target !== node.vertex && visited[edge.target.id] != true) {
                var childVertex = edge.target;
                if (node.children == null) {
                    node.children = [];
                }
                //var childVertexParents = [];
                var notVisitedParentsCount = 0;
                for (var j = 0; j < childVertex.edges.length; j++) {
                    var childEdge = childVertex.edges[j];
                    if (childEdge.target === childVertex) {
                        if (visited[childEdge.source.id] != true) {
                            notVisitedParentsCount++;
                        }
                    }
                }
                if (notVisitedParentsCount == 0) {
                    node.children.push({
                        name: childVertex.id,
                        size: childVertex.renderer.size,
                        vertex: childVertex,
                        children: null
                    });
                }
            }

            //
            //if (edge.target !== vertex && visited[edge.target.id] != true) {
            //    children.push(this._getTreeNode(edge.target, visited));
            //}
            //if (edge.source !== vertex && visited[edge.source.id] != true) {
            //    children.push(this._getTreeNode(edge.source, visited));
            //}
        }
        if (node.children != null) {
            for (var i = 0; i < node.children.length; i++) {
                var childNode = node.children[i];
                this._getTreeNode(childNode, visited)
            }
        }
    },



    /**/
    /**/
    /**/

    forceTree: function (args) {
        /*TODO not ready*/
        var network = args.network;
        var graph = network.graph;
        var vAttr = network.vAttr;
        var eAttr = network.eAttr;
        var width = args.width;
        var height = args.height;
        var vertices = graph.vertices;
        var edges = graph.edges;
        var endFunction = args.end;

        var force = d3.layout.force();
        force.size([width, height]);
        force.charge(-320)
        force.linkDistance(50)

        /* set node and edge arrays for D3 */
        var verticesMap = [];
        var edgesArray = [];
        var verticesArray = [];
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            var v = {
                id: vertex.id,
                index: i,
                x: vertex.position.x,
                y: vertex.position.y
            };
            verticesArray.push(v);
            verticesMap[vertex.id] = v;
        }
        force.nodes(verticesArray);
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                edgesArray.push({
                    id: edge.id,
                    source: verticesMap[edge.source.id],
                    target: verticesMap[edge.target.id]
                });
            }
        }
        force.links(edgesArray);

        force.on('end', function (o) {
            console.log(o)
            endFunction(verticesArray);
        });
        console.time('D3 Force directed layout');
        force.start();
        var safety = 0;
        while (force.alpha() > 0.025) { // You'll want to try out different, "small" values for this
            force.tick();
            var k = 8 * force.alpha();
            edgesArray.forEach(function (d, i) {
                d.source.y -= k;
                d.target.y += k;
            });
            if (safety++ > 1000) {
                break;// Avoids infinite looping in case this solution was a bad idea
            }
        }
//            console.log(safety);
        force.stop();
        console.timeEnd('D3 Force directed layout');

    },

    tree2: function (args) {
        /* TODO not ready */
        var network = args.network;
        var graph = network.graph;
        var vAttr = network.vAttr;
        var eAttr = network.eAttr;
        var width = args.width;
        var height = args.height;
        var vertices = graph.vertices;
        var edges = graph.edges;
        var endFunction = args.end;


        var force = d3.layout.force()
            .charge(function (d) {
                return d._children ? -d.size / 100 : d.children ? -100 : -30;
            })
            .linkDistance(function (d) {
                return d.target._children ? 50 : 30;
            })
            .size([width, height]);


        var rootNode = {
            name: args.root.id,
            vertex: args.root,
            fixed: true,
            size: args.root.renderer.size,
            px: 0,
            py: 0,
            children: null
        };
        var visited = {};
        //visited[args.root.id] = true;
        this._getTreeNode(rootNode, visited);

        var nodes = this._flatten(rootNode, width, height);
        //var links = d3.layout.hierarchy().links(nodes);
        var links = d3.layout.tree().links(nodes);
        // make sure we set .px/.py as well as node.fixed will use those .px/.py to 'stick' the node to:
        if (!rootNode.px) {
            // root have not be set / dragged / moved: set initial root position
            rootNode.px = rootNode.x = width / 2;
            rootNode.py = rootNode.y = (rootNode.children ? 4.5 : Math.sqrt(rootNode.size) / 10) + 2;
        }
        force
            .nodes(nodes)
            .links(links);


        force.on('end', function (o) {
            console.log(o)
            debugger
            endFunction(nodes);
        });
        console.time('D3 Force directed layout');
        force.start();
        var safety = 0;
        while (force.alpha() > 0.025) { // You'll want to try out different, "small" values for this
            force.tick();

            // Apply the constraints:
            force.nodes().forEach(function(d) {
                if (!d.fixed) {
                    var r = (d.children ? 4.5 : Math.sqrt(d.size) / 10) + 4, dx, dy, ly = 30;

                    // #1: constraint all nodes to the visible screen:
                    //d.x = Math.min(width - r, Math.max(r, d.x));
                    //d.y = Math.min(height - r, Math.max(r, d.y));

                    // #1.0: hierarchy: same level nodes have to remain with a 1 LY band vertically:
                    if (d.children || d._children) {
                        var py = 0;
                        if (d.parent) {
                            py = d.parent.y;
                        }
                        d.py = d.y = py + d.depth * ly + r;
                    }

                    // #1a: constraint all nodes to the visible screen: links
                    dx = Math.min(0, width - r - d.x) + Math.max(0, r - d.x);
                    dy = Math.min(0, height - r - d.y) + Math.max(0, r - d.y);
                    d.x += 2 * Math.max(-ly, Math.min(ly, dx));
                    d.y += 2 * Math.max(-ly, Math.min(ly, dy));
                    // #1b: constraint all nodes to the visible screen: charges ('repulse')
                    dx = Math.min(0, width - r - d.px) + Math.max(0, r - d.px);
                    dy = Math.min(0, height - r - d.py) + Math.max(0, r - d.py);
                    d.px += 2 * Math.max(-ly, Math.min(ly, dx));
                    d.py += 2 * Math.max(-ly, Math.min(ly, dy));

                    // #2: hierarchy means childs must be BELOW parents in Y direction:
                    if (d.parent) {
                        d.y = Math.max(d.y, d.parent.y + ly);
                        d.py = Math.max(d.py, d.parent.py + ly);
                    }
                }
            });


            if (safety++ > 1000) {
                break;// Avoids infinite looping in case this solution was a bad idea
            }
        }
//            console.log(safety);
        force.stop();
        console.timeEnd('D3 Force directed layout');


    },
    _flatten: function (root, width, height) {
        var nodes = [], i = 0, depth = 0, level_widths = [1], max_width, max_depth = 1, kx, ky;

        function recurse(node, parent, depth, x) {
            if (node.children) {
                var w = level_widths[depth + 1] || 0;
                level_widths[depth + 1] = w + node.children.length;
                max_depth = Math.max(max_depth, depth + 1);
                node.size = node.children.reduce(function (p, v, i) {
                    return p + recurse(v, node, depth + 1, w + i);
                }, 0);
            }
            if (!node.id) node.id = ++i;
            node.parent = parent;
            node.depth = depth;
            if (!node.px) {
                node.y = depth;
                node.x = x;
            }
            nodes.push(node);
            return node.size;
        }

        root.size = recurse(root, null, 0);

        // now correct/balance the x positions:
        max_width = 1;
        for (i = level_widths.length; --i > 0;) {
            max_width = Math.max(max_width, level_widths[i]);
        }
        kx = (width - 20) / max_width;
        ky = (height - 20) / max_depth;
        for (i = nodes.length; --i >= 0;) {
            var node = nodes[i];
            if (!node.px) {
                node.y *= ky;
                node.y += 10 + ky / 2;
                node.x *= kx;
                node.x += 10 + kx / 2;
            }
        }

        return nodes;
    }


}