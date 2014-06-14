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

function NetworkSession() {

    this.general = {
        vertexDefaults: {
            shape: 'circle',
            size: 40,
//            color: '#9fc6e7',
            color: '#fff',
            strokeSize: 1,
//            strokeColor: '#9fc6e7',
            strokeColor: '#000',
            opacity: 0.8,
            labelSize: 12,
            labelColor: '#111111'
        },
        edgeDefaults: {
            shape: 'undirected',
            size: 1,
            color: '#ff0000',
//            color: '#cccccc',
            opacity: 1,
            labelSize: 0,
            labelColor: '#111111'
        },
        visualSets: {},
        zoom: 25,
        backgroundImages: [],
        backgroundColor: '#FFF',
        center: {
            x: 0,
            y: 0
        }
    };
    this.config = {
        vertices: {},
        edges: {}
    };
    this.graph = {
        vertices: {},
        edges: {}
    };
    this.attributes = {
        vertices: {},
        edges: {}
    }
}

NetworkSession.prototype = {
    loadGraph: function (graph) {
        this.graph = graph.toJSON();
    },
    loadConfig: function (config) {
        this.config = config;
    },
    loadVertexAttributes: function (attributeManager) {
        this.attributes.vertices = attributeManager.toJSON();
    },
    loadEdgeAttributes: function (attributeManager) {
        this.attributes.edges = attributeManager.toJSON();
    },
    getBackgroundImages: function () {
        return this.general.backgroundImages;
    },
    setBackgroundImages: function (images) {
        this.general.backgroundImages = images;
    },
    getBackgroundColor: function () {
        return this.general.backgroundColor;
    },
    setBackgroundColor: function (color) {
        this.general.backgroundColor = color;
    },
    setVertexDefault: function (key, value) {
        this.general.vertexDefaults[key] = value;
    },
    setEdgeDefault: function (key, value) {
        this.general.edgeDefaults[key] = value;
    },
    getVertexDefault: function (key) {
        return this.general.vertexDefaults[key];
    },
    getEdgeDefault: function (key) {
        return this.general.edgeDefaults[key];
    },
    getVertexDefaults: function () {
        return this.general.vertexDefaults;
    },
    getEdgeDefaults: function () {
        return this.general.edgeDefaults;
    },
    getVisualSets: function () {
        return this.general.visualSets;
    },
    loadVisualSets: function (visualSets) {
        this.general.visualSets = visualSets;
    },
    setVisualSet: function (key, value) {
        this.general.visualSets[key] = value;
    },
    getZoom: function () {
        return this.general.zoom;
    },
    setZoom: function (zoom) {
        this.general.zoom = zoom;
    },
    loadJSON: function (o) {
        this.config = o.config;
        this.graph = o.graph;
        this.attributes = o.attributes;
        this.general = o.general;
    },
    toJSON: function () {
        return this;
    }
};


