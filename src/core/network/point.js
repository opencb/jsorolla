Point = function (x, y, z) {

    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;

};

Point.prototype = {
    set: function (x, y, z) {

        this.x = x;
        this.y = y;
        this.z = z;

        return this;

    },

    setX: function (x) {

        this.x = x;

        return this;

    },

    setY: function (y) {

        this.y = y;

        return this;

    },

    setZ: function (z) {

        this.z = z;

        return this;

    },
    toJSON: function () {
        return {x: this.x, y: this.y, z: this.z}
    }
};