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


    this.version = 2;
    this.itemKey = 'CELLMAPS_SESSION' + this.version;

    this.vertexDefaults = {
        shape: 'circle',
        size: 40,
//            color: '#9fc6e7',
        color: '#fff',
        strokeSize: 2,
//            strokeColor: '#9fc6e7',
        strokeColor: '#888888',
        opacity: 0.8,
        labelSize: 12,
        labelColor: '#111111',
        labelPositionX: 0,
        labelPositionY: 0
    };
    this.edgeDefaults = {
        shape: 'undirected',
        size: 1,
        color: '#888888',
//            color: '#cccccc',
        opacity: 1,
        labelSize: 0,
        labelColor: '#111111'
    };
    this.visualSets = {};
    this.zoom = 25;
    this.backgroundImages = [];
    this.backgroundColor = '#FFF';
    this.center = {
        x: 0,
        y: 0
    };
    this.graph = new Graph();
    this.vAttr = new AttributeManagerMemory();
    this.eAttr = new AttributeManagerMemory();
}

NetworkSession.prototype = {
    loadLocalStorage: function () {
        if (localStorage.getItem(this.itemKey) !== null) {
            this.loadJSON(JSON.parse(localStorage.getItem(this.itemKey)));
            return true;
        }
        return false;
    },
    saveLocalStorage: function () {
        localStorage.setItem(this.itemKey, JSON.stringify(this));
    },
    loadJSON: function (o) {
        if (o.version === this.version) {
            _.extend(this, o)
        } else {
            console.log('Could not load session, does not match with current version');
            localStorage.removeItem('CELLMAPS_SESSION' + this.version);
        }
//        this.config = o.config;
//        this.graph = o.graph;
//        this.attributes = o.attributes;
//        this.general = o.general;
    },
    toJSON: function () {
        return {
            general: this.general,
            config: this.config,
            graph: this.graph,
            attributes: this.attributes,
            version: this.version
        };
    }
};


