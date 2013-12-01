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
    applyRandom3d: function () {
        var getRandomArbitrary = function (min, max) {
            return Math.random() * (max - min) + min;
        }
        for (var i in this.vertices) {
            var vertex = this.vertices[i];
            vertex.x = getRandomArbitrary(-300, 300);
            vertex.y = getRandomArbitrary(-300, 300);
            vertex.z = getRandomArbitrary(10, 600);
        }
    },
    getRandom2d: function () {

    }

}