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

function VertexConfig(args) {


    var x = Math.floor((Math.random() * 1000) + 1);
    var y = Math.floor((Math.random() * 1000) + 1);
    var z = Math.floor((Math.random() * 1000) + 1);

    this.id;
    this.coords = {x: x, y: y, z: z};
    this.renderer;
    this.type;
    this.visible;

    //set instantiation args, must be last
    _.extend(this, args);

}

VertexConfig.prototype = {
    setCoords: function (x, y, z) {
        var dx = x - this.coords.x;
        var dy = y - this.coords.y;
        var dz = z - this.coords.z;

        this.coords.x = x;
        this.coords.y = y;
        this.coords.z = z;

        this.renderer.move(dx, dy, dz);
    },
    move: function (dx, dy, dz) {
        this.coords.x += dx;
        this.coords.y += dy;
        if (typeof dz !== 'undefined') {
            this.coords.z += dz;
        }
        this.renderer.move(dx, dy, dz);
    },
    getCoords: function () {
        return this.coords;
    },
    render: function (args) {
        this.renderer.render(args);
    },
    toJSON: function () {
        return {
            id: this.id,
            coords: this.coords,
            renderer: this.renderer,
            type: this.type,
            visible: this.visible
        };
    }
}