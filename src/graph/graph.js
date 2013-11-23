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

    this.vertices = {};
    this.edges = {};

    this.display = {
        style: {

        },
        layouts: {

        }
    };

    this.numberOfVertices = 0;
    this.numberOfEdges = 0;

    this.graphType = 'directed';

    //set instantiation args, must be last
    _.extend(this, args);

    this.on(this.handlers);

}

Graph.prototype = {
    addEdge: function (edge) {
        if (edge.source == null || edge.target == null) {
            return false
        }

        this.addVertex(edge.source);
        this.addVertex(edge.target);
        this.edges[edge.id] = edge;

        edge.source.addEdge(edge);
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
        this.vertices[vertex.id] = vertex;

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

        this.trigger('edge:remove', {edge: edge, graph: this});
        delete this.edges[edge.id];
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

        for (var i = 0; i < vertex.edges; i++) {
            this.removeEdge(vertex.edges[i]);
        }

        this.trigger('vertex:remove', {vertex: vertex, graph: this});
        delete this.vertices[vertex.id];
        this.numberOfVertices--;
        return true;
    },
    containsEdge: function (edge) {
        if (this.edges[edge.id] != null) {
            return true;
        } else {
            return false;
        }
    },
    containsVertex: function (vertex) {
        if (this.vertices[vertex.id] != null) {
            return true;
        } else {
            return false;
        }
    },
    /**/
    addLayout: function (layout) {
        this.display.layouts[layout.id] = layout;
    }

}