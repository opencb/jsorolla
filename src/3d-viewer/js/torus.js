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
    this.sampleList = [];
    this.commons = {};

    //set args
    _.extend(this, args);


    this.on(this.handlers);

    /**/
    this.data = {commons: {}, samples: []};
    this.config = Torus.Config(args.components);
    this.viewer = new Viewer(this.config);
    this.lastClick;
    this.clickPressed;


    this.setDiv(args.targetId);
    this.setData(args.components);


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

            this.setChromosomes();
            this.setCytobands();
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

            this.sampleList.push(sample);
            var species = sample.species;

            if(_.isUndefined(this.commons[species])){
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
                this.commons[species] = {chromosomes : chromosomes};
            }

            if(_.isUndefined(sample.chromosomes)){
                sample.chromosomes = this.commons[species].chromosomes;
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


    onMouseDown: function (_this) {
        return function (event) {
            _this.lastClick = new THREE.Vector2(event.clientX, event.clientY);
            _this.clickPressed = event.button;
//        event.preventDefault();
            document.addEventListener('mousemove', _this.onMouseMove(_this), false);
//        console.log(_this.lastClick);
            var where = _this.viewer.getClickPosition(_this.lastClick);
//        console.log ("clickado en disk ");
            if (where !== undefined) {
//            console.log(where);
//            console.log (where.coord.x);
//            console.log (where.coord.y);
                switch (event.button) {
                    case 0:
                        _this.viewer.selectChromosomeCoord(where.disk, where.coord);
//                    _this.viewer.selectDisk(where.disk);
                        break;
                    case 1:
                        var chromosomes = _this.data.samples[where.disk].chromosomes;
                        if (chromosomes === undefined)
                            chromosomes = _this.data.commons[_this.data.samples[where.disk].species].chromosomes;
                        if (chromosomes === undefined) {
                            console.log("ALERT: Missing Chromosomes in sample " + where.disk);
                        } else {

                            numChr = _this.viewer.getChrFromCoord(where.coord);
                            for (var i = 0; i < _this.config.numDisk; i++) {
                                _this.viewer.setChromosomes(i, [chromosomes[numChr]]);
                                _this.viewer.setCytobands(i, [chromosomes[numChr]]);
                            }
                        }
                        break;
                    case 2:
//                    _this.viewer.unselectDisk(where.disk);
                        break;
                }
            }
        }
    },
    onMouseUp: function (_this) {
        return function (event) {
            _this.clickPressed = -1;
            document.removeEventListener('mousemove', _this.onMouseMove, false);
        }
    },

    onMouseWheel: function (_this) {
        return function (event) {
            var delta = 0;

            if (event.wheelDelta) { // WebKit / Opera / Explorer 9
                delta = event.wheelDelta;
            } else if (event.detail) { // Firefox
                delta = -event.detail;
            }

            delta = delta / 1000 + 1;
            _this.viewer.addZoom(delta);
        }
    },
    onMouseMove: function (_this) {
        return function (event) {
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