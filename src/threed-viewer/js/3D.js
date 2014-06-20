colors = {gneg: 0xFFFFFFFF, stalk: 0x666666FF, gvar: 0xCCCCCCFF, gpos25: 0xC0C0C0FF, gpos33: 0xD3D3D3FF, gpos50: 0x808080FF, gpos66: 0x696969FF, gpos75: 0xA9A9A9FF, gpos100: 0x000000FF, gpos: 0x808080FF, acen: 0x0000FFFF, clementina: 0xffc967FF};  // RGBA format
//var colors = {gneg:0xFFFFFF, stalk:0x666666, gvar:0xCCCCCC, gpos25:0xC0C0C0, gpos33:0xD3D3D3, gpos50:0x808080, gpos66:0x696969, gpos75:0xA9A9A9, gpos100:0x000000, gpos:0x808080, acen:0x0000FF, clementina:0xffc967};
var t = 5000;

function normalize (array, max) {
    if (!(array === undefined) && !(array === null)) {
        for (var i = 0; i < array.length; i++) {
            array[i] /= max;
        }
    }
}


var Viewer = function (config) {

    this.torusDiv = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.figure = null;
    this.animation = false;
    this.config = config;
    this.data = null;
    this.metaData = {
        ntsCount: 0,
        padSum: 0,
        visibleStart: 0,
        visibleEnd: 0,
        visibleRange: 1
    };

    this.stats = new Stats();

    this.disk = [];
    this.centralTrack = null;
    this.projector = new THREE.Projector();   //para el clicado


    this.initScene(config);
    this.grid = new Viewer.Grid(this.scene);
    this.createFigure(config);

    this.mainLoop = this.mainLoopAux(this);
};


Viewer.prototype = {

    ////////////    INICIALIZATION     ///////////////
    initScene: function (config) {
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor(config.backgroundColor, 1);
        this.renderer.setSize(config.width, config.height);
        this.renderer.sortObjects = true;

        this.camera = new THREE.PerspectiveCamera(45, config.width / config.height, 0.1, 20000);
        this.camera.position.set(5, 0, 5);
        this.camera.lookAt(this.scene.position);
        this.scene.add(this.camera);

//        Viewer.Layer.loadShaders();
        Viewer.Layer.loadShaders("glsl/diskShader/vertexShader.glsl", "glsl/diskShader/fragmentShader.glsl");
        Viewer.Track.loadShaders("glsl/featureShader/vertexShader.glsl", "glsl/featureShader/fragmentShader.glsl");


        this.stats.setMode(0);

    },

    setDomElement: function (domElement) {
        this.torusDiv = domElement;
        this.torusDiv.appendChild(this.renderer.domElement);

        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '0px';
        this.stats.domElement.style.top = '0px';
//        document.getElementById("status").appendChild( this.stats.domElement );
        domElement.appendChild(this.stats.domElement);

    },
    setSize: function (width, height) {
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    },

    createFigure: function (config) {
        this.figure = new THREE.Object3D();

        var diff = 2 * Math.PI / config.numDisk;
        var rad = 0;
        var width = (config.torusRadius - this.radius) * 2 * Math.PI / config.numDisk * config.diskWidth;
        if (width > 1) width = 1;

        var m1 = new THREE.Matrix4();
        var m2 = new THREE.Matrix4();
        var m3 = new THREE.Matrix4();
        m2.makeTranslation(config.torusRadius, 0, 0);
        m3.makeScale(1, 1, width);

        this.disk = new Array(config.numDisk);

        for (var i = 0; i < config.numDisk; i++) {

            m1.makeRotationY(rad);
            m1.multiply(m2);

            this.disk[i] = new Viewer.Disk(i, config);
            this.disk[i].figure.applyMatrix(m1);
            this.disk[i].figure.applyMatrix(m3);

            this.figure.add(this.disk[i].figure);

            rad += diff;

        }
        this.figure.name = "TORUS";
        this.scene.add(this.figure);

        this.setRegion(0, 1);
    },

    ////////////    DRAWING     ///////////////
    drawScene: function () {
//        console.log("Drawing");
        this.renderer.render(this.scene, this.camera);
    },
    animate: function (elapsed) {
        var dir = Math.floor(t / 10000) % 2 ? -1 : 1;
        t += elapsed;

//        this.addDisksPhase(elapsed/5000);
//        this.addTorusPhase(elapsed/5000);
        if (t < 0) {
            elapsed *= -1;
        }
//        this.addVerticalRotation(dir*elapsed/2000);
//        console.log("elapsed, t, start");
//        console.log(elapsed);
//        console.log(t);
//        console.log(Math.floor(t)%1000/1000);

//        this.setRegion(Math.floor(t)%100000/100000,1)

    },
    pause: function () {
        this.animation = !this.animation;

        if (this.animation == true) {
            this.lastTime = new Date().getTime();
            this.mainLoop();
        }
    },

    mainLoopAux: function (_this) {
        return function () {
            _this.stats.update();
            if (_this.animation == true) {
                var timeNow = new Date().getTime();
                var elapsed = timeNow - _this.lastTime;
                _this.animate(elapsed);
                _this.lastTime = timeNow;

                requestAnimationFrame(_this.mainLoop);    //FIXME out of the loop?
            }

            _this.drawScene();
        }
    },


    ////////////    WRITING TEXTURES     ///////////////

    addSample: function (samples) {
        for(var i = 0; i < samples.length; i++){
            var sample = samples[i];
            var diskId = this.config.numDisk++;
            this.disk.push(new Viewer.Disk(diskId, this.config));
            this.figure.add(this.disk[diskId].figure);

            this.setChromosomes(diskId, sample.chromosomes);
            this.setCytobands(diskId, sample.chromosomes);
        }

        var diff = 2 * Math.PI / this.config.numDisk;
        var rad = 0;

        var width = (this.config.torusRadius - this.config.diskRadius) * 2 * Math.PI / this.config.numDisk * this.config.diskWidth;
        if (width > 1) width = 1;


        var m1 = new THREE.Matrix4();
        var m2 = new THREE.Matrix4();
        var m3 = new THREE.Matrix4();
        m2.makeTranslation(this.config.torusRadius, 0, 0);
        m3.makeScale(1, 1, width);


        for (var i = 0; i < this.config.numDisk; i++) {

            m1.makeRotationY(rad);
            m1.multiply(m2);

            this.disk[i].figure.matrix.identity();
            this.disk[i].figure.applyMatrix(m3);
            this.disk[i].figure.applyMatrix(m1);

            rad += diff;
        }


        //Deberia leer las traks y el nombre

    },

    //Creates and updates the layer
    setChromosomes: function (diskId, chromosomes) {
        this.data = chromosomes;
        var tex = new Viewer.Texture(undefined, this.config.texturePrecision, 1);


        var length = 0;
        var genesMax = 0;
        var pad = this.config.pad;
        var padSum = this.config.pad * (chromosomes.length - 1);
//        var pad = this.config.pad / (1+padSum);   // another way to understand padding
        var padTexels = pad * this.config.texturePrecision;
        var chrTexels;
        var i;
        var drawPoint = 0, drawUntil = 0, cursor = 0;

        for (i = 0; i < chromosomes.length; i++) {
            length += chromosomes[i].size;
            genesMax = chromosomes[i].numberGenes > genesMax ? chromosomes[i].numberGenes : genesMax;
        }
        for (i = 0; i < chromosomes.length - 1; i++) {    // -1 because we don't want a pad after the last chromosome
//            chrTexels = this.config.texturePrecision*((chromosomes[i].size/length)/(1+padSum));    // another way to understand padding
            chrTexels = this.config.texturePrecision * ((chromosomes[i].size / length) * (1 - padSum));    // TODO this can be optimized

            cursor += chrTexels;
            drawUntil = Math.floor(cursor);
            for (; drawPoint < drawUntil; drawPoint++) {  // draw chromosome itself
                tex.setPixel(drawPoint, 0, 0, 255 * (chromosomes[i].numberGenes / genesMax));
            }

            cursor += padTexels;
            drawUntil = Math.floor(cursor);
            for (; drawPoint < drawUntil; drawPoint++) {  // draw pad between chromosomes
                tex.setPixel(drawPoint, 255, 255, 0, 0);
            }
        }

        for (; drawPoint < this.config.texturePrecision; drawPoint++) {  // draw last chromosome itself
            tex.setPixel(drawPoint, 0, 0, 255 * (chromosomes[i].numberGenes / genesMax));
        }

        this.disk[diskId].layers[0].setTexture(tex);
        this.metaData.ntsCount = length;
        this.metaData.padSum = padSum;
//        console.log(tex);
    },
    setCytobands: function (diskId, chromosomes) {
        var tex = new Viewer.Texture(undefined, this.config.texturePrecision, 1);

        var length = 0;
        var pad = this.config.pad;
        var padSum = this.config.pad * (chromosomes.length - 1);
        var padTexels = pad * this.config.texturePrecision;
        var i, j;
        var drawPoint = 0, drawUntil = 0, cursor = 0;
        var drawStart, drawEnd;

        for (i = 0; i < chromosomes.length; i++) {
            length += chromosomes[i].size;
        }

        for (i = 0; i < chromosomes.length - 1; i++) {    // -1 because we don't want a pad after the last chromosome
//            chrTexels = this.config.texturePrecision*((chromosomes[i].size/length)/(1+padSum));    // another way to understand padding
            for (j = 0; j < chromosomes[i].cytobands.length; j++) {
                drawStart = Math.floor(((chromosomes[i].cytobands[j].start / length) * (1 - padSum)) * this.config.texturePrecision + cursor);
                drawEnd = Math.floor(((chromosomes[i].cytobands[j].end / length) * (1 - padSum)) * this.config.texturePrecision + cursor);


                while (drawStart < drawEnd) {
                    tex.setInt(tex.data, drawStart, colors[chromosomes[i].cytobands[j].stain]);
                    drawStart++;
                }
                if (drawEnd > this.config.texturePrecision) {
                    console.log("nos salimos del rango");
                    console.log(drawStart);
                    console.log(drawEnd);
                }
            }

            cursor += this.config.texturePrecision * ((chromosomes[i].size / length) * (1 - padSum));    // TODO this can be optimized
            drawPoint = Math.floor(cursor);

            cursor += padTexels;
            drawUntil = Math.floor(cursor);
            for (; drawPoint < drawUntil; drawPoint++) {  // draw pad between chromosomes
                tex.setPixel(drawPoint, 255, 255, 0, 0);
            }
        }
        for (j = 0; j < chromosomes[i].cytobands.length; j++) {
            drawStart = Math.floor(((chromosomes[i].cytobands[j].start / length) * (1 - padSum)) * this.config.texturePrecision + cursor);
            drawEnd = Math.floor(((chromosomes[i].cytobands[j].end / length) * (1 - padSum)) * this.config.texturePrecision + cursor);

            while (drawStart < drawEnd) {
                tex.setInt(tex.data, drawStart, colors[chromosomes[i].cytobands[j].stain]);
                drawStart++;
            }
            if (drawEnd > this.config.texturePrecision) {
                console.log("nos salimos del rango");
                console.log(drawStart);
                console.log(drawEnd);
            }
        }

        this.disk[diskId].layers[1].setTexture(tex);
    },

    setMeanCoverage: function (diskId, coverage) {
        var length = this.metaData.ntsCount;
        var start = (coverage.start-1)/length;
        var end = coverage.end/length;
        this.disk[diskId].addTrack({start:start, end:end, z:0.5, data:coverage.mean, mod:1.2, ang:+Math.PI/2,
                baseColorHex:0xFF0000, topColorHex:0x00FF00, trackType:Viewer.Track.ColumnHistogram}
        )
    },

/*
    var def = {
        start: 0,
        end: 1,
        z: 0,
        y: 0,
        mod: 1,
        ang: 0, //Radians
        baseColorHex: 0x00000000,
        topColorHex: 0xFF000000,
        trackType: Viewer.Track.Feature,
        data: [[],[]],
        colorData: []   //TODO
    };
    */
    addCentralTrack: function (tracksArgs) {
        if (tracksArgs.dataset.length != this.disk.length) {
            alert("central track: skipping: number of samples doesn't match number of disks: " + tracksArgs.data.length + " != " + this.disk.length);
        } else {
            var tracks =[];
            for (var i = 0; i < tracksArgs.dataset.length; i++) {
                var args = _.extend({}, tracksArgs);
                args.dataset = undefined;
                args.data = tracksArgs.dataset[i]; // share configuration, but distribute data
                var trackNum = this.disk[i].addTrack(args);
                tracks.push(this.disk[i].tracks[trackNum]);
            }
            console.log(tracks);
            this.centralTrack = new Viewer.CentralTrack(tracks);
            console.log(this.centralTrack);
        }
    },

    setTrack: function (diskId, data, config) {

    },


    ////////////    CHANGING CONFIGURATION     ///////////////
    toggleLayer: function (disk, layer) {
        if (disk >= 0 && disk < this.disk.length) {
            if (layer >= 0 && layer < this.disk[disk].layers.length) {
                this.disk[disk].layers[layer].figure.visible = !this.disk[disk].layers[layer].figure.visible;
            }
        }
    },

    addVerticalRotation: function (angle) {
        var up = new THREE.Vector3(0, angle >= 0 ? 1 : -1, 0);
        var side = new THREE.Vector3();

        var cosAlpha = this.camera.position.dot(up);
        var magnitude = this.camera.position.length();
        var alpha = Math.acos(cosAlpha / magnitude);

        if (alpha < 0.02) { // we don't allow the camera to look perfectly vertical
            alpha = 0;
        }

        if (angle < 0) {
            angle *= -1;
        }

        if (angle < alpha) {
            alpha = angle;
        }

        side.crossVectors(this.camera.position, up);
        this.camera.position.applyAxisAngle(side.normalize(), alpha);
        this.camera.lookAt(this.scene.position);
    },

    addDisksPhase: function (angle) {
        for (var i = 0; i < this.config.numDisk; i++) {
            this.disk[i].figure.rotateZ(angle);
            var coord = (Math.PI - this.disk[i].figure.rotation.z)/this.disk[i].angularLong;
            if (this.addCentralTrack !== null
                    && coord <= this.centralTrack.tracks[i].end
                    && coord >= this.centralTrack.tracks[i].start) {
                console.log("llamando a update");
                this.centralTrack.update(coord);
            }
        }
    },
    addTorusPhase: function (angle) {
        this.figure.rotateY(angle);// this.angleY);
    },
    addZoom: function (factor) {
        this.camera.position.x /= factor; //TODO control limits
        this.camera.position.y /= factor; //TODO control limits
        this.camera.position.z /= factor; //TODO control limits
    },
    setRegion: function (start, end) {
        this.metaData.visibleStart = start;
        this.metaData.visibleEnd = end;
        this.metaData.visibleRange = end - start;

        for (var i = 0; i < this.config.numDisk; i++) {
            for (var j = 0; j < this.disk[i].layers.length; j++) {
                this.disk[i].layers[j].setRegion(start, end);
            }
            Viewer.Track.uniforms.rangeStart.value = start;
            Viewer.Track.uniforms.range.value = (end - start);
        }
    },
    getRegion: function () {
        return this.disk[0].layers[0].getRegion();
    },
    selectDisk: function (n) {
        if (n < this.config.numDisk && n >= 0) {
            this.disk[n].select();
        }
    },
    unselectDisk: function (n) {
        if (n < this.config.numDisk && n >= 0) {
            this.disk[n].unselect();
        }
    },
    selectChromosomeCoord: function (diskId, coord) {
        var chr = this.getChrFromCoord(coord);
        var virtualNts = this.metaData.ntsCount / (1 - this.config.pad * (this.data.length - 1));
        var sum = 0;
        for (var i = 0; i < chr; i++) {
            sum += this.data[i].size;
        }
        sum += this.config.pad * chr * virtualNts;
        var start = sum / virtualNts;
        var end = start + this.data[chr].size / virtualNts;
        start = (start - this.metaData.visibleStart) / this.metaData.visibleRange;
        end = (end - this.metaData.visibleStart) / this.metaData.visibleRange;

        this.disk[diskId].layers[0].uniforms.selectionStart.value = start;
        this.disk[diskId].layers[0].uniforms.selectionEnd.value = end;
        this.disk[diskId].layers[1].uniforms.selectionStart.value = start;
        this.disk[diskId].layers[1].uniforms.selectionEnd.value = end;

        var angle = (1 - this.config.diskAperture) * 2 * Math.PI * start;
        var height = this.config.diskRadius * 1.2;
        this.disk[diskId].updateTextSprite(1, ["Chromosome " + this.data[chr].name, this.data[chr].numberGenes + " genes", "size " + this.data[chr].size]);
        this.disk[diskId].sprites[1].position.set(Math.cos(angle) * height, Math.sin(angle) * height, 0);
    },

    /**
     * return the index of the element in this.data that owns the position in coord
     * @param coord position in [0, 1] from the total disk, including pads
     * @returns {*}
     */
    getChrFromCoord: function (coord) {
        var cursor = 0;
        var virtualNts = this.metaData.ntsCount / (1 - this.config.pad * (this.data.length - 1));
        var nt = coord.y * (virtualNts - 1);
        var chr = this.data;
        var ntsPad = this.config.pad * virtualNts;

        for (var i = 0; i < this.data.length; i++) {
            cursor += chr[i].size + ntsPad;
            if (cursor > nt) {
                return i;
            }
        }
        return undefined;
    },

    ////////////    TOOLS   //////////////
    /**
     * Locates the click in the world. undefined if clicked in empty space.
     * @param mousePosition
     * @returns {
     *     disk number of disk clicked,
     *     layer layer of the disk,
     *     coord coordinates in [0, 1] from total disk (not visible disk)
     * }
     */
    getClickPosition: function (mousePosition) {
        var vector = new THREE.Vector3((mousePosition.x / window.innerWidth ) * 2 - 1, -( mousePosition.y / window.innerHeight ) * 2 + 1, 1);   //fixme canvas size
        this.projector.unprojectVector(vector, this.camera);
        var ray = new THREE.Raycaster(this.camera.position, vector.sub(this.camera.position).normalize());

        // create an array containing all objects in the scene with which the ray intersects
        if (this.intersect === undefined) {
            this.intersect = [];
            for (var d in this.disk) {
                this.intersect.push(this.disk[d].layers[0].figure1);
            }
        }
        var intersects = ray.intersectObjects(this.intersect, false);
        // if there is one (or more) intersections
        if (intersects.length > 0) {
            var m = new THREE.Matrix4();
            var point = intersects[0].point;
            var position = new THREE.Vector3();

            m.copy(intersects[0].object.matrixWorld);
            position.getPositionFromMatrix(m);
            m.setPosition({x: 0, y: 0, z: 0});
            point.sub(position);
            m.transpose();
            point.applyMatrix4(m);
            var radian = Math.atan2(point.y, point.x);
            var visibleTexPos = (radian < 0 ? radian + Math.PI * 2 : radian) / (2 * Math.PI * (1 - this.config.diskAperture));
            var location = new THREE.Vector2(point.z, visibleTexPos * this.metaData.visibleRange + this.metaData.visibleStart);    //FIXME: x is symetric, [0, 1]?

            return {
                disk: intersects[0].object.diskId,
                layer: intersects[0].object.layerId,
                coord: location
            };
        }
        return undefined;
    }
};

Viewer.Disk = function (numDisk, config) {
    this.name = "disk " + numDisk;
    this.diskId = numDisk;
    this.chrSelected = undefined;
    this.layers = [];
    this.sprites = [];
    this.tracks = [];
    this.figure = new THREE.Object3D();
    this.diskRadius = config.diskRadius;
    this.angularLong = Math.PI * 2 * (1 - config.diskAperture);

    for (var i = 0; i < config.numLayers; i++) {
        this.layers[i] = new Viewer.Layer(numDisk, i, config);
        this.figure.add(this.layers[i].figure);
    }


    this.sprites[0] = this.makeTextSprite("Sample " + numDisk,
        { fontsize: 18, borderColor: {r: 255, g: 0, b: 0, a: 1.0}, backgroundColor: {r: 255, g: 100, b: 100, a: 0.8} });
    this.sprites[0].position.set(0, 0, 0);

    this.figure.add(this.sprites[0]);


};

Viewer.Disk.prototype = {
    select: function (n) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].uniforms.selected.value = 1;
        }
    },
    unselect: function (n) {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].uniforms.selected.value = 0;
        }
    },

    add2Track: function (numTrack, args) { //fixme
        this.tracks[numTrack].add(args);
    },
    addTrack: function (args) {
        var track = new Viewer.Track({radius: this.diskRadius, angularLong: this.angularLong, width: this.layers[0].width});
        var numTrack = this.tracks.length;
        this.tracks.push(track);
        this.figure.add(track.figure);

        if (args !== undefined)
            track.add(args);

        return numTrack;
    },
//    setFeature  : function (start, end, color, config){
//        var texture;
//        var ok;
//        start *= this.layers[this.genesId[0]].texture.width;
//        end   *= this.layers[this.genesId[0]].texture.width;
//
//        for(var i = 0; i < this.genesId.length; i++){
//            texture = this.layers[i].texture;
//            ok = true;
//            for(var s = start; s < end; s++){
//                if(Viewer.Texture.getInt(texture, s) !== 0){
//                    ok = false;
//                    break;
//                }
//            }
//            if(ok){
//                for(var s = start; s < end; s){
//                    Viewer.Texture.setInt(texture, s, color);
//                }
//            }
//        }
//        if(!ok){
//            console.log("Se deberia crear un nuevo layer, saaaabe tu?");
//
//        }
//        texture.texture.needsUpdate = true;
//        texture.setDataUint8(texture.data);
//    },

    updateTextSprite: function (i, text) {
        this.figure.remove(this.sprites[i]);
        this.sprites[i] = this.makeTextSprite(text, {useScreenCoordinates: false});
        this.figure.add(this.sprites[1]);
    },
    makeTextSprite: function (message, parameters) {
        if (parameters === undefined) parameters = {};

        var fontface = parameters.hasOwnProperty("fontface") ?
            parameters["fontface"] : "Arial";

        var fontsize = parameters.hasOwnProperty("fontsize") ?
            parameters["fontsize"] : 18;

        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
            parameters["borderThickness"] : 4;

        var borderColor = parameters.hasOwnProperty("borderColor") ?
            parameters["borderColor"] : { r: 0, g: 0, b: 0, a: 1.0 };

        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
            parameters["backgroundColor"] : { r: 255, g: 255, b: 255, a: 1.0 };

        var useScreenCoordinates = parameters.hasOwnProperty("useScreenCoordinates") ?
            parameters["useScreenCoordinates"] : false;

        var spriteAlignment = THREE.SpriteAlignment.topLeft;

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;

        if (!(message instanceof Array)) {
            message = [message];
        }

        // get size data (height depends only on font size)

        var metrics = [];
        for (var i = 0; i < message.length; i++) {
            metrics[i] = context.measureText(message[i]).width;
        }

        var textWidth = Math.max.apply(null, metrics);

        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        this.roundRect(context, borderThickness / 2, borderThickness / 2, textWidth + borderThickness
            , message.length * fontsize * 1.4 + borderThickness, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.

        // text color
        context.fillStyle = "rgba(0, 0, 0, 1.0)";


        // prepare textarea value to be drawn as multiline text.
        var linespacing = fontsize * 1.4;
        var x = borderThickness;
        var y = fontsize + borderThickness;
        for (var i = 0; i < message.length; i++) {
            context.fillText(message[i], x, y);
            y += linespacing;
        }

        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial(
            { map: texture, useScreenCoordinates: useScreenCoordinates, alignment: spriteAlignment });
        //spriteMaterial.uvScale.x = 0.4;
//        spriteMaterial.uvScale.y = 0.5;
//        spriteMaterial.uvOffset.x = -0.8;
//        spriteMaterial.uvOffset.y = 0.8;
        var sprite = new THREE.Sprite(spriteMaterial);
        if (useScreenCoordinates) {
            sprite.scale.set(400, 200, 1.0);
            sprite.position.set(50, 50, 0);
        } else {
            sprite.scale.set(2, 1, 1.0);
        }
        return sprite;
    },

// function for drawing rounded rectangles
    roundRect: function (ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }


};


Viewer.Track = function (args) {
    this.geometry = null;
    this.material = null;
    this.figure = null;
    this.numFaces = 0;
    this.width = args.width || 1;
    this.radius = args.radius || 2.2;
    this.data = null;
    this.start = null;
    this.end = null;

    this.initGeometry(this.maxFaces);
    Viewer.Track.uniforms.radius.value = args.radius;
    Viewer.Track.uniforms.angularLong.value = args.angularLong;

};

Viewer.Track.precision = 0.01;
Viewer.Track.maxFaces = 300;
Viewer.Track.vertexShader = null;
Viewer.Track.fragmentShader = null;

Viewer.Track.uniforms = {};
Viewer.Track.uniforms.rangeStart = {value: 0, type: 'f'};
Viewer.Track.uniforms.range = {value: 0.7, type: 'f'};
Viewer.Track.uniforms.angularLong = {value: 5, type: 'f'};
Viewer.Track.uniforms.radius = {value: 2.2, type: 'f'};

Viewer.Track.Feature = 0;
Viewer.Track.ColumnHistogram = 1;
Viewer.Track.LinearHistogram = 2;
//Viewer.Track.Insertion        = 3;    //TODO
//Viewer.Track.Deletion         = 4;


Viewer.Track.loadShaders = function (urlVertexShader, urlFragmentShader) {
    if (urlVertexShader !== undefined) {
        $.ajax({
            async: false,
            url: urlVertexShader,
            success: function (data) {
                Viewer.Track.vertexShader = $(data)[0].innerText;
            },
            dataType: 'html'
        });
    }
    if (urlFragmentShader !== undefined) {
        $.ajax({
            async: false,
            url: urlFragmentShader,
            success: function (data) {
                Viewer.Track.fragmentShader = $(data)[0].innerText;
            },
            dataType: 'html'
        });
    }
};

Viewer.Track.prototype = {

    initGeometry: function () {

        this.geometry = new THREE.Geometry();

        this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
//        this.geometry.colors.push(new THREE.Color(1,1,0));
        for (var i = 0; i < Viewer.Track.maxFaces; i++) {
            this.geometry.faces.push(new THREE.Face3(0, 0, 0));
        }

        this.material = new THREE.ShaderMaterial(
            {
                side: THREE.DoubleSide,
                color: 0xFF0000,
                uniforms: {
                    radius: Viewer.Track.uniforms.radius,
                    rangeStart: Viewer.Track.uniforms.rangeStart,
                    range: Viewer.Track.uniforms.range,
                    angularLong: Viewer.Track.uniforms.angularLong
                },
                vertexColors: THREE.VertexColors,
                vertexShader: Viewer.Track.vertexShader,
                fragmentShader: Viewer.Track.fragmentShader
            });

        this.figure = new THREE.Object3D();
        this.figure.add(new THREE.Mesh(this.geometry, this.material));
    },
    newGeometry: function () {
        this.geometry.verticesNeedUpdate = true;
        this.geometry.elementsNeedUpdate = true;
        this.geometry.colorsNeedUpdate = true;
        this.addTrackFinish();
        var v = this.geometry.vertices.length;
        var v1 = this.geometry.vertices[v - 1];
        var v2 = this.geometry.vertices[v - 2];
        var v3 = this.geometry.vertices[v - 3];
        var v4 = this.geometry.vertices[v - 4];
        this.geometry = new THREE.Geometry();
        this.geometry.vertices.push(v4);
        this.geometry.vertices.push(v3);
        this.geometry.vertices.push(v2);
        this.geometry.vertices.push(v1);
        for (var i = 0; i < Viewer.Track.maxFaces; i++) {
            this.geometry.faces.push(new THREE.Face3(0, 0, 0));
        }
        this.figure.add(new THREE.Mesh(this.geometry, this.material));
        this.numFaces = 0;
    },


    add: function (args) {
        if (args.topColorHex === undefined) {
            args.topColorHex = args.baseColorHex;
        }


        var def = {
            start: 0,
            end: 1,
            z: 0,
            y: 0,
            mod: 1,
            ang: 0, //Radians
            baseColorHex: 0x00000000,
            topColorHex: 0xFF000000,
            trackType: Viewer.Track.Feature,
            data: [],
            colorData: []   //TODO
        };
        _.extend(def, args);

        if (def.start > def.end) {
            var aux = def.start;
            def.start = def.end;
            def.end = aux;
        }


        switch (def.trackType) {
            case Viewer.Track.Feature :
                this._addFeature(def);
                break;
            case Viewer.Track.ColumnHistogram:
                this._addHistoCol(def);
                break;
            case Viewer.Track.LinearHistogram:
                this._addHisto(def);
                break;

        }

    },


    _addFeature: function (args) {
        var start = args.start;
        var end = args.end;

        var color = new THREE.Color(args.baseColorHex);
        var color2 = new THREE.Color(args.topColorHex);

        var numPatches = Math.ceil((end - start) / Viewer.Track.precision);
        var precision = (end - start) / numPatches;

        var w = -this.width;
        var z = (args.z - 0.5) * w;
        var y = args.y;

        var dz = Math.cos(-args.ang) * w * args.mod;
        var dy = Math.sin(-args.ang) * w * args.mod;

        this.geometry.vertices.push(new THREE.Vector3(start, y, z));
        this.geometry.vertices.push(new THREE.Vector3(start, y + dy, dz + z));

        for (var i = 0; i < numPatches; i++) {
            start += precision;
            this.geometry.vertices.push(new THREE.Vector3(start, y, z));
            this.geometry.vertices.push(new THREE.Vector3(start, y + dy, dz + z));
            this.setFace(1, color, color2, color, color2);
        }
        this.geometry.verticesNeedUpdate = true;
        this.geometry.elementsNeedUpdate = true;
        this.addTrackFinish();
    },
    _addHisto: function (args) {
        var start = args.start;
//        this.start = start;
        var end = args.end;
//        this.end = end;
        var data = args.data;
//        this.data = data;
        var color1Hex = args.baseColorHex;
        var color2Hex = args.topColorHex;

        var baseColor = new THREE.Color(color1Hex);
        var actualColor;
        var prevColor;
        var numPatches = data.length;
        var precision = (end - start) / numPatches;
        var i = 0;
        var w = -this.width;
        var z = (args.z - 0.5) * w;
        var y = args.y;
        var dz = Math.cos(-args.ang) * w * args.mod;
        var dy = Math.sin(-args.ang) * w * args.mod;

        this.geometry.vertices.push(new THREE.Vector3(start, y, z));
        this.geometry.vertices.push(new THREE.Vector3(start, data[i] * dy + y, dz * data[i] + z));
        prevColor = new THREE.Color(color2Hex);
        prevColor.multiplyScalar(data[i]);
        prevColor.add(new THREE.Color(color1Hex).multiplyScalar(1 - data[i]));

        start -= precision / 2;
        for (i = 0; i < numPatches; i++) {
            start += precision;
            this.geometry.vertices.push(new THREE.Vector3(start, y, z));
            this.geometry.vertices.push(new THREE.Vector3(start, data[i] * dy + y, dz * data[i] + z));

            actualColor = new THREE.Color(color2Hex);
            actualColor.multiplyScalar(data[i]);
            actualColor.add(new THREE.Color(color1Hex).multiplyScalar(1 - data[i]));

            this.setFace(1, baseColor, prevColor, baseColor, actualColor);
            prevColor = actualColor;
        }
        start += precision / 2;
        this.geometry.vertices.push(new THREE.Vector3(start, y, z));
        this.geometry.vertices.push(new THREE.Vector3(start, data[i - 1] * dy + y, dz * data[i - 1] + z));

        actualColor = new THREE.Color(color2Hex);
        actualColor.multiplyScalar(data[i - 1]);
        actualColor.add(new THREE.Color(color1Hex).multiplyScalar(1 - data[i - 1]));

        this.setFace(1, baseColor, prevColor, baseColor, actualColor);

        this.geometry.verticesNeedUpdate = true;
        this.geometry.elementsNeedUpdate = true;
        this.geometry.colorsNeedUpdate = true;
        this.addTrackFinish();

    },
    _addHistoCol: function (args) {
        var start = args.start;
        this.start = start;
        var end = args.end;
        this.end = end;
        var data = args.data;
        this.data = data;
        var color1Hex = args.baseColorHex;
        var color2Hex = args.topColorHex;

        var baseColor = new THREE.Color(color1Hex);
        var actualColor;

        var numPatches = data.length;
        var precision = (end - start) / numPatches;
        var i = 0;
        var w = -this.width;
        var z = (args.z - 0.5) * w;
        var y = args.y;

        var dz = Math.cos(-args.ang) * w * args.mod;
        var dy = Math.sin(-args.ang) * w * args.mod;

        this.geometry.vertices.push(new THREE.Vector3(start, y, z));
        for (i; i < numPatches; i++) {
            this.geometry.vertices.push(new THREE.Vector3(start, data[i] * dy + y, dz * data[i] + z));
            start += precision;
            this.geometry.vertices.push(new THREE.Vector3(start, data[i] * dy + y, dz * data[i] + z));
            this.geometry.vertices.push(new THREE.Vector3(start, y, z));

            actualColor = new THREE.Color(color2Hex);
            actualColor.multiplyScalar(data[i]);
            actualColor.add(new THREE.Color(color1Hex).multiplyScalar(1 - data[i]));

            this.setFace(2, baseColor, actualColor, baseColor, actualColor);
        }

        this.geometry.verticesNeedUpdate = true;
        this.geometry.elementsNeedUpdate = true;
        this.geometry.colorsNeedUpdate = true;
        this.addTrackFinish();
    },
    addTrackFinish: function () {
        this.geometry.computeBoundingSphere();
        this.geometry.boundingSphere.radius = this.radius;
        // this.geometry.computeBoundingBox();
    },
    setFace: function (a, col1, col2, col3, col4) {
        if (this.numFaces + 2 >= Viewer.Track.maxFaces) {
            this.newGeometry();
        }
        var v = this.geometry.vertices.length - 4;

        if (a == 1) {
            this.geometry.faces[this.numFaces  ].a = v
            this.geometry.faces[this.numFaces  ].b = v + 1;
            this.geometry.faces[this.numFaces  ].c = v + 2;
            this.geometry.faces[this.numFaces  ].vertexColors.push(col1, col2, col3);

            this.geometry.faces[this.numFaces + 1].a = v + 1
            this.geometry.faces[this.numFaces + 1].b = v + 3;
            this.geometry.faces[this.numFaces + 1].c = v + 2;
            this.geometry.faces[this.numFaces + 1].vertexColors.push(col2, col4, col3);

        }
        else if (a == 2) {
            this.geometry.faces[this.numFaces  ].a = v
            this.geometry.faces[this.numFaces  ].b = v + 1;
            this.geometry.faces[this.numFaces  ].c = v + 2;
            this.geometry.faces[this.numFaces  ].vertexColors.push(col1, col2, col4);

            this.geometry.faces[this.numFaces + 1].a = v + 2
            this.geometry.faces[this.numFaces + 1].b = v + 3;
            this.geometry.faces[this.numFaces + 1].c = v;
            this.geometry.faces[this.numFaces + 1].vertexColors.push(col4, col3, col1);
        }
        this.numFaces += 2;
    },


    getElement: function (coord) {
        var position = (coord - this.start)/(this.end - this.start);
        return position * this.data.length;
    }
};

Viewer.CentralTrack = function (tracks) {
    this.tracks = tracks;

};

Viewer.CentralTrack.prototype = {
    /**
     *
     * @param coord coordinate in disk, [0-1] doesn't include the open part of the disk
     */
    update: function(coord) {
//        console.log("coord = " + coord);
        var element = this.tracks[0].getElement(coord);
//        console.log("update");
//        console.log(element);
    }
};

Viewer.Layer = function (numDisk, numLayer, config) {
    this.texture = new Viewer.Texture();
    this.figure = null;
    this.geometry = null;
    this.material = null;
    this.uniforms = null;
    this.attributes = null;
    this.radius = config.diskRadius + config.layerSeparation[numLayer];
    this.width = 1;
    this.numPatch = config.polygonPrecision;
    this.diskAperture = config.diskAperture * 2 * Math.PI;

    this.uniforms = {
        //Globals for all disks
        time: 1,   // FIXME aqui habia diskTime
        //For each disk
        diskId: {type: "i", value: numDisk},
        width: {type: "f", value: this.width},

        selected: {type: "i", value: 1},
        selectionStart: {type: "f", value: -1},
        selectionEnd: {type: "f", value: -1},

        tex: {type: "t", value: this.texture.uniform.tex},
        active: {type: 'i', value: this.texture.uniform.active},
        coord: {type: 'v2', value: this.texture.uniform.coord}
    };

    this.attributes = {
        //For each vertex
        id: {type: "f", value: []},
        pos: {type: "f", value: []}
    };
    this.material = new THREE.ShaderMaterial(
        {
            side: THREE.DoubleSide,
            transparent: true,
            //opacity:        0.5,
            uniforms: this.uniforms,
            attributes: this.attributes,
            vertexShader: Viewer.Layer.vertexShader,
            fragmentShader: Viewer.Layer.fragmentShader
        });
    this.material2 = new THREE.ShaderMaterial(
        {
            side: THREE.BackSide,
            transparent: true,
            //opacity:        0.5,
            uniforms: this.uniforms,
            attributes: this.attributes,
            vertexShader: Viewer.Layer.vertexShader,
            fragmentShader: Viewer.Layer.fragmentShader
        });
    /*    this.testMaterial = new THREE.MeshBasicMaterial({
     side:           THREE.DoubleSide,
     color:          0xFF00FFFF
     });
     this.testGeometry = new THREE.Geometry();
     this.testGeometry.vertices.push(new THREE.Vector3(1,0,1));
     this.testGeometry.vertices.push(new THREE.Vector3(0,1,1));
     this.testGeometry.vertices.push(new THREE.Vector3(1,1,0));
     this.testGeometry.faces.push(new THREE.Face3(0,1,2));*/

    this.createGeometry();

    this.figure = new THREE.Object3D();


    if (config.doubleFigure === true) {
        this.figure2 = new THREE.Mesh(this.geometry, this.material2);
        this.figure.add(this.figure2);

        this.figure2.name = "Layer " + numLayer;
        this.figure2.layerId = numLayer;
        this.figure2.diskId = numDisk;
    }
    this.figure1 = new THREE.Mesh(this.geometry, this.material);
    this.figure.add(this.figure1);

    this.figure1.name = "Layer " + numLayer;
    this.figure1.layerId = numLayer;
    this.figure1.diskId = numDisk;
    this.figure.name = "Layer " + numLayer;
    this.figure.layerId = numLayer;
    this.figure.diskId = numDisk;
    this.figure.matrixAutoUpdate = false;
    this.figure.rotationAutoUpdate = false;


};

Viewer.Layer.vertexShader = null;
Viewer.Layer.fragmentShader = null;

Viewer.Layer.loadShaders = function (urlVertexShader, urlFragmentShader) {

    if (urlVertexShader !== undefined) {
        $.ajax({
            async: false,
            url: urlVertexShader,
            success: function (data) {
                Viewer.Layer.vertexShader = $(data)[0].innerText;
            },
            dataType: 'html'
        });
    }
    if (urlFragmentShader !== undefined) {
        $.ajax({
            async: false,
            url: urlFragmentShader,
            success: function (data) {
                Viewer.Layer.fragmentShader = $(data)[0].innerText;
            },
            dataType: 'html'
        });
    }
};

Viewer.Layer.prototype = {
    createGeometry: function () {
        var pi2 = 2 * Math.PI;
        var diffRad = (pi2 - this.diskAperture) / this.numPatch;
        var diffPos = 1 / this.numPatch;
        var rad = 0;
        var pos = 0;
        this.geometry = new THREE.Geometry();

        this.geometry.vertices.push(new THREE.Vector3(this.radius * Math.cos(rad), this.radius * Math.sin(rad), -this.width / 2));
        this.geometry.vertices.push(new THREE.Vector3(this.radius * Math.cos(rad), this.radius * Math.sin(rad), +this.width / 2));
        this.attributes.pos.value.push(0.0);
        this.attributes.pos.value.push(0.0);

        this.attributes.id.value.push(0);
        this.attributes.id.value.push(0);


        for (var i = 1; i <= this.numPatch; i++) {
            rad += diffRad;
            pos += diffPos;
            this.geometry.vertices.push(new THREE.Vector3(this.radius * Math.cos(rad), this.radius * Math.sin(rad), -this.width / 2));
            this.geometry.vertices.push(new THREE.Vector3(this.radius * Math.cos(rad), this.radius * Math.sin(rad), +this.width / 2));

            this.attributes.pos.value.push(pos);
            this.attributes.pos.value.push(pos);

            this.attributes.id.value.push(i);
            this.attributes.id.value.push(i);

            this.geometry.faces.push(new THREE.Face3(i * 2 - 2, i * 2, i * 2 - 1, new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0)));
            this.geometry.faces.push(new THREE.Face3(i * 2 - 1, i * 2, i * 2 + 1, new THREE.Vector3(Math.cos(rad), Math.sin(rad), 0)));
        }
    },
    setTexture: function (texture) {
        this.texture = texture;
        this.uniforms.tex.value = texture.uniform.tex.value;
        this.uniforms.active.value = texture.uniform.active.value;
        this.uniforms.coord.value = texture.uniform.coord.value;

        this.uniforms.selectionStart.value = -1;
        this.uniforms.selectionEnd.value = -1;

        this.texture.texture.needsUpdate = true;
    },
    setRegion: function (start, end) {
        this.figure1.material.uniforms.coord.value.x = start;
        this.figure1.material.uniforms.coord.value.y = end;
        this.uniforms.selectionStart.value = -1;
        this.uniforms.selectionEnd.value = -1;
    },
    getRegion: function () {
        return this.figure1.material.uniforms.coord.value;
    }

};

Viewer.Texture = function (data, width, length) {
    this.id = "";
    this.active = 1;
//    this.layerId = 0;
    this.texCoordStart = 0;
    this.texCoordEnd = 1;

    this.width = width === undefined ? 0 : width;
    this.length = length === undefined ? 0 : length;
    this.data = data === undefined ? new Uint8Array(this.length * this.width * 4) : data;
    this.texture = new THREE.DataTexture(this.data, this.width, this.length, THREE.RGBAFormat);

    this.uniform = {};
    this.uniform.tex = {type: "t", value: this.texture};
    this.uniform.active = {type: "i", value: this.active};
    this.uniform.coord = {type: "v2", value: new THREE.Vector2(this.texCoordStart, this.texCoordEnd)};
};

Viewer.Texture.prototype = {
    setDataUint8: function (dataUint8, copy) {
        if (copy) {
            if (this.data.length != dataUint8.length) {
                this.data = new Uint8Array(dataUint8.length);
            }
            for (var i = 0; i < dataUint8.length; i++) {
                this.data[i] = dataUint8[i];
            }
        } else {
            this.data = dataUint8;
        }

        this.width = this.texture.image.width = Math.floor(dataUint8.length / 4);
        this.texture.image.data = this.data;
        this.texture.needsUpdate = true;
    },

    setDataUint32: function (dataUint32) {
        var u8 = this.u32u8(dataUint32);
        this.setDataUint8(u8, false);
    },

    u32u8: function (u32) {
        var u8 = new Uint8Array(u32.length * 4);
        for (var i = 0; i < u32.length; i++) {
            this.setInt(u8, i, u32[i]);
        }
        return u8;
    },
    setInt: function (texData, pos, value) {
        var val = Math.floor(value);

        texData[pos * 4 + 3] = val & 255;
        val = (val >> 8);
        texData[pos * 4 + 2] = val & 255;
        val = (val >> 8);
        texData[pos * 4 + 1] = val & 255;
        val = (val >> 8);
        texData[pos * 4 + 0] = val & 255;
    },
    setPixel: function (pos, r, g, b, a) {
        if (pos < this.width && pos >= 0) {
            this.data[pos * 4 + 0] = r;
            this.data[pos * 4 + 1] = g;
            this.data[pos * 4 + 2] = b;
            this.data[pos * 4 + 3] = a === undefined ? 255 : a;
        }
    }

};

Viewer.Grid = function (scene) {

    //Grid
    var tamGrid = 20;
    var tamCell = 5;
    var gridDist = 15;

    var gridXZ = this.gridXZ = new THREE.GridHelper(tamGrid, tamCell);
    gridXZ.setColors(new THREE.Color(0x006600), new THREE.Color(0x006600));
    gridXZ.position.set(tamGrid - gridDist, 0 - gridDist, tamGrid - gridDist);
    scene.add(gridXZ);

    var gridXY = this.gridXY = new THREE.GridHelper(tamGrid, tamCell);
    gridXY.position.set(tamGrid - gridDist, tamGrid - gridDist, 0 - gridDist);
    gridXY.rotation.x = Math.PI / 2;
    gridXY.setColors(new THREE.Color(0x000066), new THREE.Color(0x000066));
    scene.add(gridXY);

    var gridYZ = this.gridXY = new THREE.GridHelper(tamGrid, tamCell);
    gridYZ.position.set(0 - gridDist, tamGrid - gridDist, tamGrid - gridDist);
    gridYZ.rotation.z = Math.PI / 2;
    gridYZ.setColors(new THREE.Color(0x660000), new THREE.Color(0x660000));
    scene.add(gridYZ);
}