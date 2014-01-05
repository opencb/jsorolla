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
/*

 public E addEdge(V sourceVertex, V targetVertex);
 public boolean addEdge(V sourceVertex, V targetVertex, E e);
 public boolean containsEdge(E e);
 public boolean containsEdge(V sourceVertex, V targetVertex);
 public List<E> getAllEdges();
 public E getEdge(String edgeName);
 public List<E> getAllEdges(String edgeName);
 public List<E> getAllEdges(V vertex);
 public E getEdge(V sourceVertex, V targetVertex);
 public List<E> getAllEdges(V sourceVertex, V targetVertex);
 void setEdges(List<E> edges);
 public boolean removeEdge(E e);
 public List<E> removeAllEdges(V vertex);
 public E removeEdge(V sourceVertex, V targetVertex);
 public List<E> removeAllEdges(V sourceVertex, V targetVertex);
 public boolean removeAllEdges(Collection<? extends E> edges);
 public V getEdgeSource(E e);
 public V getEdgeTarget(E e);




 public boolean addVertex(V v);
 boolean addAllVertices(Collection<? extends V> vertices);
 public boolean containsVertex(V vertex);
 public V getVertex(String vertexId);

 public List<V> getAllVertices();

 public int getDegreeOf(V v);
 public boolean copySubgraphAddVertex(V v);
 public List<V> getNotNullVertices();
 public List<V> getAdjacentVertices(V v);
 public boolean removeVertex(V v);
 public boolean removeVertices(Collection<? extends V> vertices);
 public int getNumberOfVertices();


 public void clear();
 public void setVertices(List<V> verticesList);
 public int getVerticesMapId(V v);
 public V getVertex(int mapPosition);
 public List<List<V>> getAllInformationComponents(boolean isolatedNode);
 public int getNumberOfBicomponents();

 */
function Graph(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('Graph');

    this.vertices = [];
    this.edges = [];

    this.display = {
        style: {

        },
        layouts: {

        }
    };

    this.numberOfVertices = 0;
    this.numberOfEdges = 0;

    this.graphType = '';

    //set instantiation args, must be last
    _.extend(this, args);

    this.verticesIndex = {};
    this.edgesIndex = {};

    this.verticesNameIndex = {};

    this.on(this.handlers);
}

Graph.prototype = {
    setType: function (type) {
        this.graphType = type;
    },
    clean: function () {
        this.numberOfVertices = 0;
        this.numberOfEdges = 0;
        this.vertices = [];
        this.edges = [];
        this.verticesIndex = {};
        this.edgesIndex = {};

        this.verticesNameIndex = {};
    },
    addEdge: function (edge) {
        if (edge.source == null || edge.target == null) {
            return false
        }

        this.addVertex(edge.source);
        this.addVertex(edge.target);
        var length = this.edges.push(edge);
        var insertPosition = length - 1;
        this.edgesIndex[edge.id] = insertPosition;

        edge.source.addEdge(edge);
        edge.target.addEdge(edge);
        this.trigger('edge:add', {edge: edge, graph: this});

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
        var length = this.vertices.push(vertex);
        var insertPosition = length - 1;
        this.verticesIndex[vertex.id] = insertPosition;

        //name index update
        this.addVertexNameIndex(vertex, insertPosition);


        // the real number of vertices
        this.numberOfVertices++;

        this.trigger('vertex:add', {vertex: vertex, graph: this});
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

        var position = this.edgesIndex[edge.id];
        delete this.edgesIndex[edge.id];
        delete this.edges[position];

        this.trigger('edge:remove', {edge: edge, graph: this});
        this.numberOfEdges--;
        return true;
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
            var position = this.edgesIndex[edge.id];
            delete this.edgesIndex[edge.id];
            delete this.edges[position];
            this.trigger('edge:remove', {edge: edge, graph: this});
        }
        vertex.removeEdges();

        var position = this.verticesIndex[vertex.id];
        delete this.verticesIndex[vertex.id];
        delete this.vertices[position];
        this.removeVertexNameIndex(vertex, position);

        this.trigger('vertex:remove', {vertex: vertex, graph: this});
        this.numberOfVertices--;
        return true;
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
    addLayout: function (layout) {
        this.display.layouts[layout.id] = layout;
    },

    /**/
    getAsSIF: function () {
        var sifText = "";
        for (var i = 0; i < this.vertices.length; i++) {
            var vertex = this.vertices[i];
            if (typeof vertex !== 'undefined') {
                var line = "";
                if (vertex.edges.length == 0) {
                    line = vertex.id + "\n";
                } else {
                    for (var j = 0; j < vertex.edges.length; j++) {
                        var edge = vertex.edges[j];
                        line = edge.source.id + " " + "--" + " " + edge.target.id + "\n";
                    }
                }
                sifText += line;
            }

        }
        return sifText;
    },
    getAsDOT: function () {
        var dotText = "graph network {\n" + this.getAsSIF() + "}";
        return dotText;
    },

    toJSON: function () {
        var vertices = [];
        for (var i = 0; i < this.vertices.length; i++) {
            if (typeof this.vertices[i] !== 'undefined') {
                vertices.push(this.vertices[i]);
            }
        }
        var edges = [];
        for (var i = 0; i < this.edges.length; i++) {
            if (typeof this.edges[i] !== 'undefined') {
                edges.push(this.edges[i]);
            }
        }
        return {vertices: vertices, edges: edges};
    },

    addVertexNameIndex: function (vertex, insertPosition) {
        if (typeof this.verticesNameIndex[vertex.name] === 'undefined') {
            this.verticesNameIndex[vertex.name] = [];
        }
        this.verticesNameIndex[vertex.name].push(insertPosition);
    },
    removeVertexNameIndex: function (vertex, position) {
        var indices = this.verticesNameIndex[vertex.name];
        for (var i = 0; i < indices.length; i++) {
            if (indices[i] === position) {
                indices.splice(i, 1);
                break;
            }
        }
    },
    findByName: function (name) {
        var result = [];
        if (typeof this.verticesNameIndex[name] !== 'undefined') {
            var indices = this.verticesNameIndex[name];
            for (var i = 0; i < indices.length; i++) {
                result.push(this.vertices[indices[i]]);
            }
        }
        return result;
    }
}