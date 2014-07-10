/*
 TODO:
 no pasar un config inicial, aunque esta el problema de cuantos discos crear, y cuando
 eventos
 viewer:
 ☑  click en chromosoma con la textura estirada
 ☑  mover seleccion de chromosoma mientras estirar o giras el disco
 ☐
 */


var Torus = function (args) {
    var _this = this;
    _.extend(this, Backbone.Events);
    this.id = Utils.genId("Torus");

    //default args
    this.targetId;
    //this.sampleList = [];   //FIXME esto no va a data?
    //this.commons = {};  //FIXME

    //set args
    _.extend(this, args);


    this.on(this.handlers);

    /**/
    this.data = {commons: {}, samples: []};
    this.config = Torus.Config(args.components);
    this.viewer = new Viewer(this.config);
    this.lastClick;
    this.clickPressed;
    this.scale = 32;    // 1 = full genome, 0 = 1 nucleotide
    this.position = 0.5;
    this.cursor = 0.5;


    this.setDiv(args.targetId);
    this.setData(args.components);



    this.colors = {
        "S": 0x808080,  // dark gray
        "D": 0x0,   // black
        "I": 0x20ff20,  //  green
        "X": 0xff2020,  // red
        "M": 0xC0C0C0   // gray
    };

};

Torus.prototype = {
    setDiv: function (targetId) {

        if (targetId !== undefined) {
            this.torusDiv = document.getElementById(targetId);
            this.viewer.setDomElement(this.torusDiv);
        }
    },
    setData: function (components) {
        if (components !== undefined) {
            this.data.commons = components.commons !== undefined ? components.commons : {};

            var baseSpecie = Object.keys(this.data.commons)[0];
            if (baseSpecie === undefined) {
                baseSpecie = "hsapiens";
                this.data.commons.hsapiens = {};
            }

            for (var i = 0; i < this.config.numDisk; i++) {
                this.data.samples[i] = components.samples[i] === undefined ? {} : components.samples[i];
                this.data.samples[i].id = this.data.samples[i].id === undefined ? "" : this.data.samples[i].id;
                this.data.samples[i].features = this.data.samples[i].features === undefined ? [] : this.data.samples[i].features;
                this.data.samples[i].species = this.data.samples[i].species === undefined ? baseSpecie : this.data.samples[i].species;

}

            if (this.config.numLayers >= 1) {
                this.setChromosomes();
                if (this.config.numLayers >= 2) {
                    this.setCytobands();
                }
            }
            //this.setGenes();


//        this.viewer.drawScene();
//        this.viewer.pause();
        }
    },

    addSample:function(samples){
        if(!_.isArray(samples)){
            samples = [samples];
        }

        for(var i=0; i < samples.length; i++){
            var sample = samples[i];

            //this.sampleList.push(sample);
            this.data.samples.push(sample);
            var species = sample.species;

            if(_.isUndefined(this.data.commons[species])){   // ask for the chromosomes if the species is missing in this.data.commons
                var chromosomes = [];
                CellBaseManager.get({
                    species: species,
                    category: 'genomic',
                    subCategory: 'chromosome',
                    resource: 'all',
                    async:false,
                    success: function (data) {
                        chromosomes = data.response.result.chromosomes
                    }
                });
                this.data.commons[species] = {chromosomes : chromosomes};
            }

            if(_.isUndefined(sample.chromosomes)){
                sample.chromosomes = this.data.commons[species].chromosomes;
            }
        }

        this.viewer.addSample(samples);
    },


    addHistogram: function (histogram, chromosome, samples, common) {

        if (!(samples instanceof Array)) {
            samples = [samples];
        }
        for (var i in samples) {
            this.viewer.setHistogram(samples[i], chromosome, histogram);
        }
        for (var i in this.data.samples) {
            if (this.data.samples[i].species == common) {
                this.viewer.setHistogram(samples[i], chromosome, histogram);
            }
        }

    },
    setChromosomes: function (/*Region?*/) {       // TODO set, view o draw? y lo mismo para cytob y genes
        var chromosomes;
        for (var i = 0; i < this.config.numDisk; i++) {
            chromosomes = this.data.samples[i].chromosomes;
            if (chromosomes === undefined)
                chromosomes = this.data.commons[this.data.samples[i].species].chromosomes;
            if (chromosomes === undefined) {
                console.log("ALERT: Missing Chromosomes in sample " + i)
            } else {
                this.viewer.setChromosomes(i, chromosomes);
            }
        }
    },
    setCytobands: function (/*numchr?*/) {
        var chromosomes;
        for (var i = 0; i < this.config.numDisk; i++) {
            chromosomes = this.data.samples[i].chromosomes;
            if (chromosomes === undefined)
                chromosomes = this.data.commons[this.data.samples[i].species].chromosomes;
            if (chromosomes === undefined) {
                console.log("ALERT: Missing Chromosomes in sample " + i)
            } else {
                this.viewer.setCytobands(i, chromosomes);
//                console.log(chromosomes);
            }
        }
    },

    setGenes: function () {
        var data = [];
        var genes = this.data.commons.hsapiens.chromosomes[0].histograms.genes;
        for (var i in genes) {
            data.push(genes[i].value * 0.5);
        }
        this.viewer.disk[0].features[0].addFeature(0, 6, -0.2, data);

    },

    obtainCoverages: function () {
        normalize(coverage.regions[0].coverage, 15);
        normalize(coverage.regions[1].coverage, 15);
        //console.log("samples en obtain: " + this.data.samples.length);
        for (var j = 0; j < this.data.samples.length; j++) {
            this.data.samples[j].coverage = _.extend({}, coverage);
//            this.data.samples[j].coverage.mean = new Array(100);
//            for (var i = 0; i < 100; i++) {
//                this.data.samples[j].coverage.mean[i] = Math.random();
//            }
        }

        // alert(" mala copia? " + (this.data.samples[0].coverage.mean[0] == this.data.samples[1].coverage.mean[0]));

        //console.log(this.data.samples);
    },
    /**
     * example: when the user ticks a check box,
     * after the coverage is requested, this function is called.

      //{start:0, end:0.35, z:0.5, y:0.05, mod:-1/5, ang:0,
//                baseColorHex:0x0000FF, topColorHex:0xFF0000, trackType:Viewer.Track.ColumnHistogram};

     * @param sampleNum
     */
    setCoverages: function(withCentralTrack/*,coverage.json from url to ws*/) {

        if (withCentralTrack == true) {

            var length = this.viewer.metaData.ntsCount;
            var start = (this.data.samples[0].coverage.start-1)/length;
            var end = this.data.samples[0].coverage.end/length;
            var trackArgs = {start:start, end:end, z:1, y:0.05, mod:0.3, ang:Math.PI/2,
                    baseColorHex:0xe41a1c, topColorHex:0x4dff4a, trackType:Viewer.Track.ColumnHistogram};
//                baseColorHex:0xfb8072, topColorHex:0xb3de69, trackType:Viewer.Track.ColumnHistogram};
            trackArgs.dataset = [];

            for (var i = 0; i < this.data.samples.length; i++) {

//                var data = this.data.samples[i].coverage.regions[0].coverage;
                var data = [];
                for(var j= 0; j < 38; j++) {
                    data[j] = Math.random()*0.4;
                }
                trackArgs.dataset.push(data);

            }
            this.viewer.addCentralTrack(trackArgs);

        } else {
            var precisionId;
            if (this.scale > 10) {
                precisionId = 1;
            } else {
                precisionId = 0;
            }
            for (var i = 0; i < this.data.samples.length; i++) {        // TODO substitute setMeanCoverage to addtrack
                this.viewer.setCoverage(i, this.data.samples[i].coverage, precisionId);
            }
        }
    },

    obtainAlignments: function () {
//        for (var j = 0; j < this.data.samples.length; j++) {
//            this.data.samples[j].alignments = _.extend({}, alignments);
//        }

        this.data.samples[0].alignments = _.extend([], alignments);
//        for (var i = 0; i < this.viewer.disk.length; i++) {
//            this.data.samples[i].alignments = _.extend([], aligs[i]);
//        }
    },

    setAlignments: function () {
        var trackId = this.viewer.addTrack(0);

        for (var i = 0; i < this.data.samples[0].alignments.length; i++) {
            var width = 0.1;
            var alig = this.data.samples[0].alignments[i];
            var end = alig.flags&4? alig.start + alig.length: alig.end; // unmapped
            var color = alig.flags&4? 0xbc80bd: 0x00fdb462;
            var config = {
                start: alig.start,
                end: end,
                z: Math.random()*(1-width),
                y: 0.2,
                mod: width,
                ang: 0, //Radians
                baseColorHex: color,
                trackType: Viewer.Track.Feature
            };

            this.viewer.add2Track(0, trackId, config);
        }
    },
    setFullAlignments: function (withMismatch) {
        var mismatch = withMismatch === undefined? true: withMismatch;
        var z = 0;
        var width = 0.08;
        for (var s = 0; s < this.viewer.disk.length; s++) {
            var distance = Math.random()*10000;
            var trackId = this.viewer.addTrack(s);
            for (var i = 0; i < this.data.samples[0].alignments.length; i++) {
                var alig = this.data.samples[0].alignments[i];
                var end = alig.flags&4? alig.start + alig.length: alig.end; // unmapped
                var color = alig.flags&4? 0xbc80bd: 0x00fdb462;

                var config = {
                    start: alig.start+distance,
                    end: end+distance,
                    z: z,
                    y: 0.04,
                    mod: width,
                    ang: 0, //Radians
                    baseColorHex: color,
                    trackType: Viewer.Track.Feature
                };
                this.viewer.add2Track(s, trackId, config);
                if (!(alig.flags & 4)) { //unmapped, no assumptions can be made about CIGAR
                    var offset = 0;
                    if (alig.differences[0].op == "S" && alig.differences[0].pos == 0) {
                        offset = alig.start - alig.unclippedStart;
                    }
                    for (var j = 0; j < this.data.samples[0].alignments[i].differences.length; j++) {
                        var difference = this.data.samples[0].alignments[i].differences[j];
                        var start = alig.start + difference.pos - offset;
                        var end = (difference.length === undefined? difference.seq.length: difference.length) + start;
                        var color = this.colors[difference.op];
                        var config = {
                            start: start+distance,
                            end:end+distance,
                            z:z,
                            y: 0.06,
                            mod: width*0.8,
                            ang: 0, //Radians
                            baseColorHex: color === undefined? 0x2020A0: color, // else blue
                            trackType: Viewer.Track.Feature
                        };
                        if (mismatch || difference.op != "M") {
                            this.viewer.add2Track(s, trackId, config);
                        }
                    }
                }
                z = z + width * 1.1;
                if (z > (1-width)) {
                    z = 0;
                }
            }
        }
    },

    setDifferences: function () {
        var width = 0.05;
        var trackId = this.viewer.addTrack(0);
        for (var i = 0; i < this.data.samples[0].alignments.length; i++) {
            var alig = this.data.samples[0].alignments[i];
            for (var j = 0; j < this.data.samples[0].alignments[i].differences.length; j++) {
                var difference = this.data.samples[0].alignments[i].differences[j];
                var start = alig.start + difference.pos;
                var end = (difference.length === undefined? difference.seq.length: difference.length) + start;
                var color = this.colors[difference.op];
                var config = {
                    start: start,
                    end:end,
                    z: Math.random()*(1-width),
                    y: 0.3,
                    mod: width,
                    ang: 0, //Radians
                    baseColorHex: color === undefined? 0x2020A0: color, // else blue
                    trackType: Viewer.Track.Feature
                };
                if (difference.op != "M") {
                    this.viewer.add2Track(0, trackId, config);
                }
            }
        }
    },

    setPosition: function (pos) {
        this.position = pos;
//        var increment = pos - this.position;
//        this.cursor = this.cursor + increment*this.scale*this.scale;
    },

    setScale: function (frame) {
        this.scale = Math.log(frame)/Math.log(2) + 32;
        this.updateScale();
    },

    updateScale: function () {
        console.log(this.scale);
        var region = this.viewer.getRegion();
        var position = region.x + (region.y - region.x)*this.position;
        var frame = Math.pow(2, this.scale)/Math.pow(2, 32);
        var start = position - frame*this.position;
        var end = position + frame*(1-this.position);
        this.viewer.setRegion(start, end);

        if (this.scale < 10) {    // TODO jj un-hardcode...
            for (var i = 0; i < this.viewer.disk.length; i++) {
                for (var j = 0; j < this.viewer.disk[i].tracks.length; j++) {
                    this.viewer.disk[i].tracks[j].visible(false);
                }
            }
        } else if (this.scale < 14.5) {
            for (var i = 0; i < this.viewer.disk.length; i++) {
                this.viewer.disk[i].tracks[0].visible(false);
                for (var j = 1; j < this.viewer.disk[i].tracks.length; j++) {
                    this.viewer.disk[i].tracks[j].visible(true);
                }
            }
        } else if (this.scale < 16) {
            for (var i = 0; i < this.viewer.disk.length; i++) {
                for (var j = 0; j < this.viewer.disk[i].tracks.length; j++) {
                    this.viewer.disk[i].tracks[j].visible(true);
                }
            }
        } else if (this.scale < 26) {
            for (var i = 0; i < this.viewer.disk.length; i++) {
                this.viewer.disk[i].tracks[0].visible(true);
                for (var j = 1; j < this.viewer.disk[i].tracks.length; j++) {
                    this.viewer.disk[i].tracks[j].visible(false);
                }
            }
        } else {
            for (var i = 0; i < this.viewer.disk.length; i++) {
                for (var j = 0; j < this.viewer.disk[i].tracks.length; j++) {
                    this.viewer.disk[i].tracks[j].visible(false);
                }
            }
        }

        console.log(this);
    },

    setRegion: function(start, end) {
        if (this.viewer.metaData.ntsCount !== undefined) {

            console.log("torus.setRegion: " + start + ", " + end + " ::: " + start/this.viewer.metaData.ntsCount + ", " + end/this.viewer.metaData.ntsCount);
            this.viewer.setRegion(start/this.viewer.metaData.ntsCount, end/this.viewer.metaData.ntsCount);
            var region = this.viewer.getRegion();
            this.setScale(region.y - region.x);
        }
    },

    getRegion: function () {
        var region = this.viewer.getRegion();
        return {start: region.x * this.viewer.metaData.ntsCount, end: region.y * this.viewer.metaData.ntsCount};
    },

    ///////////////// mouse tools
    informationMouse: function (_this, event) {
        document.addEventListener('mousemove', _this.onMouseMove, false);
        var where = _this.viewer.getClickPosition(_this.lastClick);

        if (where !== undefined) {
            switch (event.button) {
                case 0:
                    _this.viewer.selectChromosomeCoord(where.disk, where.coord);
                    break;
                case 1:
                    break;
                case 2:
                    _this.viewer.unselectChromosome(where.disk);
                    break;
            }
        }
    },
    selectionMouse: function (_this, event) {
//        document.addEventListener('mousemove', _this.onMouseMove(_this), false);
        document.addEventListener('mousemove', _this.onMouseMove, false);
//        this.torusDiv.addEventListener('mousemove', _this.onMouseMove(_this));
//        console.log("poniendo");
//        console.log(_this.lastClick);
        var where = _this.viewer.getClickPosition(_this.lastClick);
//        console.log ("clickado en disk ");

        if (where !== undefined) {
            switch (event.button) {
                case 0:
                    _this.viewer.selectDisk(where.disk);
                    _this.updateScale();
                    break;
                case 1:
//                var chromosomes = _this.data.samples[where.disk].chromosomes;
//                if (chromosomes === undefined)
//                    chromosomes = _this.data.commons[_this.data.samples[where.disk].species].chromosomes;
//                if (chromosomes === undefined) {
//                    console.log("ALERT: Missing Chromosomes in sample " + where.disk);
//                } else {
//                    numChr = _this.viewer.getChrFromCoord(where.coord);
//                    for (var i = 0; i < _this.config.numDisk; i++) {
//                        _this.viewer.setChromosomes(i, [chromosomes[numChr]]);
//                        _this.viewer.setCytobands(i, [chromosomes[numChr]]);
//                    }
//                }
                    break;
                case 2:
                    _this.viewer.unselectDisk(where.disk);
                    break;
            }
        }
    },
    zoomMouseDown: function (_this, event) {
        switch (event.button) {
            case 0:
                break;
            case 1:
                break;
            case 2:
                console.log("boton derecho");
                console.log(_this.position);
                console.log(_this.scale);
                _this.scale+=0.2;
                _this.postion = 0.5;
                _this.updateScale();
                console.log(_this.position);
                console.log(_this.scale);
                break;
        }
    },

    zoomMouseUp: function (_this, event) {
        if (event.button == 0) {
            var whereStart = _this.viewer.getClickPosition(_this.lastClick);
            var whereEnd = _this.viewer.getClickPosition(new THREE.Vector2(event.clientX, event.clientY));
            console.log("mouseup");
            console.log(whereStart);
            console.log(whereEnd);
            if (whereStart !== undefined && whereEnd !== undefined && (whereEnd.coord.y - whereStart.coord.y > 0.00000001)) {
                var start = whereStart.coord.y <= whereEnd.coord.y ? whereStart.coord.y : whereEnd.coord.y;  // min
                var end = whereStart.coord.y > whereEnd.coord.y ? whereStart.coord.y : whereEnd.coord.y;  // max

                var frame = end - start;
                _this.setScale(frame);
                _this.position = (whereStart.visibleTexPos + whereEnd.visibleTexPos) * 0.5;
                _this.updateScale();


                /*
                 console.log(start)
                 console.log(end )
                 var region = _this.viewer.getRegion();
                 var frame = region.y - region.x;
                 console.log(frame)
                 console.log(end-start)
                 console.log(_this.scale);
                 var region2 = {x: region.x + start*frame,
                 y: region.x + end*frame};
                 console.log(region2)
                 _this.viewer.setRegion(region2.x, region2.y);
                 _this.scale = Math.log(region2.y - region2.x)/Math.log(2) + 32;
                 */

            }
        }
    },
    nothingMouseUp: function (_this, event) {
//        console.log("quitando");
        document.removeEventListener('mousemove', _this.onMouseMove, false);
    },

    cameraMouseWheel: function(_this, event) {
        var delta = 0;

        if (event.wheelDelta) { // WebKit / Opera / Explorer 9
            delta = event.wheelDelta;
        } else if (event.detail) { // Firefox
            delta = -event.detail;
        }

        delta = delta / 1000 + 1;
        _this.viewer.addZoom(delta);
    },

    zoomMouseWheel: function (_this, event) {
        var delta = 0;

        if (event.wheelDelta) { // WebKit / Opera / Explorer 9
            delta = event.wheelDelta;
        } else if (event.detail) { // Firefox
            delta = -event.detail;
        }
        delta *= 0.0001;
        var region = _this.viewer.getRegion();
        var frame = region.y-region.x;

        _this.viewer.setRegion(region.x + delta*frame, region.y + delta*frame);

    }

};


Torus.Config = function (components) {
    var conf = {
        type: "torus",  // cylinder, plane
        torusRadius: 4, // looks better if torusRadius > diskRadius
        diskRadius: 2,
        diskWidth: 1,   // [0, 1]
        diskAperture: 0.2,  // [0, 1]
        polygonPrecision: 50,   // number of square polygons in each disk
        texturePrecision: 3000,   // number of texels in each disk
        pad: 0.002,     // space between chromosomes
        numLayers: 2,
        layerSeparation: [0, 0.02],
        numDisk: components.samples === undefined ? 0 : components.samples,    // number of samples
        width: 1800,     //  ??
        height: 1000,
        backgroundColor: 0x7070B0,
        doubleFigure: true
    };

    _.extend(conf, components.config);

    return conf;
};
