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


    this.mouseToolDown = this.selectionMouse;
    this.mouseToolUp = this.nothingMouseUp;
    this.mouseToolWheel = this.cameraMouseWheel;

    this.onMouseMoveWrapper(this);
    $(this.torusDiv).on("mousedown", this.onMouseDown(this));
    $(this.torusDiv).on("mouseup", this.onMouseUp(this));
//    $(this.torusDiv).on("mousewheel", this.onMouseWheel(this));
    $(this.torusDiv).on("contextmenu", function (event) {
        event.preventDefault();
    });

//    this.torusDiv.addEventListener('mousedown', this.onMouseDown(this), false);
//    this.torusDiv.addEventListener('mouseup', this.onMouseUp(this), false);
    this.torusDiv.addEventListener('mousewheel', this.onMouseWheel(this), false);
//    this.torusDiv.addEventListener('contextmenu', function (event) {
//        event.preventDefault();
//    }, false);
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
            var trackArgs = {start:start, end:end, z:0.5, y:0.05, mod:0.3, ang:0/*Math.PI/2*/,
                baseColorHex:0xfb8072, topColorHex:0xb3de69, trackType:Viewer.Track.ColumnHistogram};
            trackArgs.dataset = [];

            for (var i = 0; i < this.data.samples.length; i++) {

                var data = this.data.samples[i].coverage.regions[0].coverage;
                trackArgs.dataset.push(data);

            }
            this.viewer.addCentralTrack(trackArgs);

        } else {
            for (var i = 0; i < this.data.samples.length; i++) {        // TODO substitute setMeanCoverage to addtrack
                if (this.scale > 4) {
                    this.viewer.setMeanCoverage(i, this.data.samples[i].coverage);  // meansize is not necessary, the track spans to the positions
                } else {
                    this.viewer.setRegionCoverage(i, this.data.samples[i].coverage);    // FIXME: data model updated
                }
            }
        }
    },

    obtainAlignments: function () {
//        for (var j = 0; j < this.data.samples.length; j++) {
//            this.data.samples[j].alignments = _.extend({}, alignments);
//        }
        this.data.samples[0].alignments = _.extend([], alignments);

    },

    setAlignments: function () {
        for (var i = 0; i < this.data.samples[0].alignments.length; i++) {
            var width = 0.1;
            var alig = this.data.samples[0].alignments[i];
            var config = {
                start: alig.start,
                end: alig.end,
                z: Math.random()*(1-width),
                y: 0.2,
                mod: width,
                ang: 0, //Radians
                baseColorHex: 0x00fdb462,
                trackType: Viewer.Track.Feature
            };

            this.viewer.addTrack(0, config);

        }
    },

    setPosition: function (pos) {
        this.position = pos;
//        var increment = pos - this.position;
//        this.cursor = this.cursor + increment*this.scale*this.scale;
    },

    updateScale: function () {
        console.log(this.scale);
        var region = this.viewer.getRegion();
        var position = region.x + (region.y - region.x)*this.position;
        var frame = Math.pow(2, this.scale)/Math.pow(2, 32);
        var start = position - frame*this.position;
        var end = position + frame*(1-this.position);
        this.viewer.setRegion(start, end);
        if (this.scale < )
        if (this.scale < 14.5) {    // TODO jj un-hardcode...
            for (var i = 0; i < this.viewer.disk.length; i++) {
                this.viewer.disk[i].tracks[0].visible(false);
            }
        }
        console.log(this);
    },

    setRegion: function(start, end) {
        if (this.viewer.metaData.ntsCount !== undefined) {

            console.log("torus.setRegion: " + start + ", " + end + " ::: " + start/this.viewer.metaData.ntsCount + ", " + end/this.viewer.metaData.ntsCount);
            this.viewer.setRegion(start/this.viewer.metaData.ntsCount, end/this.viewer.metaData.ntsCount);
        }
    },

    onMouseDown: function (_this) {
        return function (event) {
            _this.lastClick = new THREE.Vector2(event.clientX, event.clientY);
            _this.clickPressed = event.button;
//        event.preventDefault();
//        console.log(_this.lastClick);


            _this.mouseToolDown(_this, event);
        }
    },
    onMouseUp: function (_this) {
        return function (event) {
            _this.clickPressed = -1;
//            document.removeEventListener('mousemove', _this.onMouseMove, false);
            _this.mouseToolUp(_this, event);
        }
    },

    onMouseWheel: function (_this) {
        return function (event) {

            _this.mouseToolWheel(_this, event);
        }
    },
    onMouseMoveWrapper: function (_this) {
        _this.onMouseMove = function (event) {
//            console.log("en onmousemove");
            var where = _this.viewer.getClickPosition(new THREE.Vector2(event.clientX, event.clientY));
            switch (_this.clickPressed) {
                case 0:
                    _this.viewer.addTorusPhase((event.clientX - _this.lastClick.x) / 500);
                    _this.viewer.addVerticalRotation((event.clientY - _this.lastClick.y) / 500);
                    break;
                case 1:
                    var pos = _this.viewer.getRegion();

                    pos.x += (event.clientX - _this.lastClick.x) / 5000;
                    pos.y += (event.clientY - _this.lastClick.y) / 5000;
                    _this.viewer.setRegion(pos.x, pos.y);
                    break;
                case 2:
                    _this.viewer.addDisksPhase(-(event.clientY - _this.lastClick.y) / 500);
            }
            _this.lastClick.x = event.clientX;
            _this.lastClick.y = event.clientY;
        }
    },

    changeMouseTool: function (tool) {
        if (tool == "Information") {
            this.mouseToolDown = this.informationMouse;
            this.mouseToolUp = this.nothingMouseUp;
            this.mouseToolWheel = this.cameraMouseWheel;
        } else if (tool == "Selection") {
            this.mouseToolDown = this.selectionMouse;
            this.mouseToolUp = this.nothingMouseUp;
            this.mouseToolWheel = this.cameraMouseWheel;
        } else if (tool == "Zoom") {
            this.mouseToolDown = this.zoomMouseDown;
            this.mouseToolUp = this.zoomMouseUp;
            this.mouseToolWheel = this.zoomMouseWheel;
//            document.removeEventListener('mousemove', this.onMouseMove, false);
        }
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
                _this.scale+=0.2;
                _this.postion = 0.5;
                _this.updateScale();
                break;
        }
    },

    zoomMouseUp: function (_this, event) {
        var whereStart = _this.viewer.getClickPosition(_this.lastClick);
        var whereEnd = _this.viewer.getClickPosition(new THREE.Vector2(event.clientX, event.clientY));
        if (whereStart !== undefined && whereEnd !== undefined) {
            var start = whereStart.coord.y <= whereEnd.coord.y ? whereStart.coord.y : whereEnd.coord.y;  // min
            var end = whereStart.coord.y > whereEnd.coord.y ? whereStart.coord.y : whereEnd.coord.y;  // max

            _this.viewer.setRegion(start, end);
            var frame = end - start;
            _this.scale = Math.log(frame)/Math.log(2) + 32;
            

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
