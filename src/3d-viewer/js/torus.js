/*
 TODO:
 no pasar un config inicial, aunque esta el problema de cuantos discos crear, y cuando
 eventos
 viewer:
 ☑  click en chromosoma con la textura estirada
 ☑  mover seleccion de chromosoma mientras estirar o giras el disco
 ☐
 */


var Torus = function(args) {
    this.data = {commons: {}, samples: []};
    this.config = Torus.Config(args.components);
    this.viewer = new Viewer(this.config);
    this.lastClick;
    this.clickPressed;


    window.torus = this;

    this.setDiv(args.targetId);
    this.setData(args.components);

    this.torusDiv.addEventListener( 'mousedown', this.onMouseDown, false );
    this.torusDiv.addEventListener( 'mouseup', this.onMouseUp, false );
    this.torusDiv.addEventListener( 'mousewheel', this.onMouseWheel, false );
    this.torusDiv.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
};

Torus.prototype = {
    setDiv      : function(targetId) {

        if (targetId !== undefined) {
            this.torusDiv = document.getElementById(targetId);
            this.viewer.setDomElement(this.torusDiv);
        }
    },
    setData     : function(components) {
        if (components !== undefined){
            this.data.commons = components.commons;

            var baseSpecie = Object.keys(this.data.commons)[0];
            if(baseSpecie === undefined){
                baseSpecie = "hsapiens";
                this.data.commons.hsapiens = {};
            }

            for(var i = 0; i < this.config.numDisk; i++){
                this.data.samples[i] = components.samples[i] === undefined ? {} : components.samples[i];
                this.data.samples[i].id = this.data.samples[i].id === undefined ? "" : this.data.samples[i].id;
                this.data.samples[i].features = this.data.samples[i].features === undefined ? [] : this.data.samples[i].features;
                this.data.samples[i].species = this.data.samples[i].species === undefined? baseSpecie : this.data.samples[i].species;
            }

            this.setChromosomes();
            this.setCytobands();
            //this.setGenes();


//        this.viewer.drawScene();
//        this.viewer.pause();
        }
    },
    addHistogram    : function(histogram,chromosome, samples, common){

        if(!(samples instanceof Array)){
            samples = [samples];
        }
        for(var i in samples){
            this.viewer.setHistogram(samples[i], chromosome, histogram);
        }
        for(var i in this.data.samples){
            if(this.data.samples[i].species == common){
                this.viewer.setHistogram(samples[i], chromosome, histogram);
            }
        }

    },
    setChromosomes  : function(/*Region?*/){       // TODO set, view o draw? y lo mismo para cytob y genes
        var chromosomes;
        for(var i = 0; i < this.config.numDisk; i++){
            chromosomes = this.data.samples[i].chromosomes;
            if(chromosomes === undefined)
                chromosomes = this.data.commons[this.data.samples[i].species].chromosomes;
            if(chromosomes === undefined){
                console.log("ALERT: Missing Chromosomes in sample " + i)
            } else {
                this.viewer.setChromosomes(i, chromosomes);
            }
        }
    },
    setCytobands    : function (/*numchr?*/) {
        var chromosomes;
        for(var i = 0; i < this.config.numDisk; i++){
            chromosomes = this.data.samples[i].chromosomes;
            if(chromosomes === undefined)
                chromosomes = this.data.commons[this.data.samples[i].species].chromosomes;
            if(chromosomes === undefined){
                console.log("ALERT: Missing Chromosomes in sample " + i)
            } else {
                this.viewer.setCytobands(i, chromosomes);
//                console.log(chromosomes);
            }
        }
    },

    setGenes    : function(  ){
        var data = [];
        var genes = this.data.commons.hsapiens.chromosomes[0].histograms.genes;
        for(var i in genes){
            data.push(genes[i].value*0.5);
        }
        this.viewer.disk[0].features[0].addFeature(0 , 6 , -0.2, data );

    },


    onMouseDown     :function (event){
        window.torus.lastClick = new THREE.Vector2(event.clientX, event.clientY);
        window.torus.clickPressed = event.button;
//        event.preventDefault();
        document.addEventListener( 'mousemove', window.torus.onMouseMove, false );
//        console.log(window.torus.lastClick);
        var where = window.torus.viewer.getClickPosition(window.torus.lastClick);
//        console.log ("clickado en disk ");
        if (where !== undefined) {
//            console.log(where);
//            console.log (where.coord.x);
//            console.log (where.coord.y);
            switch (event.button) {
                case 0:
                    window.torus.viewer.selectChromosomeCoord(where.disk, where.coord);
//                    window.torus.viewer.selectDisk(where.disk);
                    break;
                case 1:
                    var chromosomes = window.torus.data.samples[where.disk].chromosomes;
                    if(chromosomes === undefined)
                        chromosomes = window.torus.data.commons[window.torus.data.samples[where.disk].species].chromosomes;
                    if(chromosomes === undefined){
                        console.log("ALERT: Missing Chromosomes in sample " + where.disk);
                    } else {

                        numChr = window.torus.viewer.getChrFromCoord(where.coord);
                        for(var i = 0; i < window.torus.config.numDisk; i++){
                            window.torus.viewer.setChromosomes(i, [chromosomes[numChr]]);
                            window.torus.viewer.setCytobands(i, [chromosomes[numChr]]);
                        }
                    }
                    break;
                case 2:
//                    window.torus.viewer.unselectDisk(where.disk);
                    break;
            }
        }
    },
    onMouseUp     :function (event){
        window.torus.clickPressed = -1;
        document.removeEventListener( 'mousemove', window.torus.onMouseMove, false );
    },

    onMouseWheel     :function (event){
        var delta = 0;

        if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
            delta = event.wheelDelta;
        } else if ( event.detail ) { // Firefox
            delta = - event.detail;
        }

        delta = delta/1000 + 1;
        window.torus.viewer.addZoom(delta);
    },
    onMouseMove     :function (event){
        switch (window.torus.clickPressed) {
            case 0:
                window.torus.viewer.addTorusPhase((event.clientX - window.torus.lastClick.x)/500);
                window.torus.viewer.addVerticalRotation((event.clientY - window.torus.lastClick.y)/500);
                break;
            case 1:
                var pos = window.torus.viewer.getRegion();

                pos.x += (event.clientX - window.torus.lastClick.x)/5000;
                pos.y += (event.clientY - window.torus.lastClick.y)/5000;
                window.torus.viewer.setRegion(pos.x, pos.y);
                break;
            case 2:
                window.torus.viewer.addDisksPhase(-(event.clientY - window.torus.lastClick.y)/500);
        }
        window.torus.lastClick.x = event.clientX;
        window.torus.lastClick.y = event.clientY;
    }
};

Torus.Config = function(components) {
    var conf = {
        type: "torus",  // cylinder, plane
        torusRadius: 4, // looks better if torusRadius > diskRadius
        diskRadius: 2,
        diskWidth: 1,   // [0, 1]
        diskAperture: 0.2,  // [0, 1]
        polygonPrecision: 50,   // number of square polygons in each disk
        texturePrecision: 1000,   // number of texels in each disk
        pad: 0.002,     // space between chromosomes
        numLayers: 1,
        layerSeparation: [0],
        featureSeparation: 0.03,
        numDisk: components.samples === undefined? 20 : components.samples,    // number of samples
        width: 300,     //  ??
        height: 300,
        backgroundColor: 0x7070B0,
        doubleFigure : false
    };

    _.extend(conf, components.config);

    return conf;
};