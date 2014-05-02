/**
 * Created with IntelliJ IDEA.
 * User: jcoll
 * Date: 10/15/13
 * Time: 5:33 PM
 * To change this template use File | Settings | File Templates.
 */


function ThreeDViewer(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("ThreeDViewer");
    this.targetId;
    this.torusComponents = {};

    _.extend(this, args);


    this.on(this.handlers);

    this.rendered = false;

    if(this.demoTorus){
        this.torusComponents = this._fakeComponents();
    }

    if (this.autoRender) {
        this.render();
    }
};

ThreeDViewer.prototype = {
    render:function(targetId){
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if (this.rendered) {
            console.log('Already rendered');
            return;
        }
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" class="ocb-gv ocb-box-vertical"></div>')[0];
        $(this.targetDiv).append(this.div);


        this.barDiv = $('<div id="bar-' + this.id + '" class="ocb-gv-navigation"></div>')[0];
        $(this.div).append(this.barDiv);


        this.torusDiv = $('<div id="torus-' + this.id + '" class="ocb-gv-navigation"></div>')[0];
        $(this.div).append(this.torusDiv);



        this.torus = this._createTorus($(this.torusDiv).attr('id'));



        //div structure
        this.rendered = true;
    },
    draw:function(){
        if (!this.rendered) {
            console.info('ThreeDViewer is not rendered yet');
            return;
        }


    },
    _createTorus:function(targetId){

        var torus = new Torus({
            targetId:targetId,
            components: this.torusComponents
        })
        torus.viewer.pause();
        console.log(torus);

        if(this.demoTorus){
            var data = [];
            var data2 = [];
            var data3 = [];
            var data4 = [];
            var data5 = [];
            for(i = 0; i < 500; i++){
                data.push(Math.random());
                data2.push(Math.random());
                data3.push(Math.random());
                data4.push(Math.random());
                data5.push(1);
            }
            for(i in torus.viewer.disk){
//                torus.viewer.disk[i].features[0].addFeature({start:0, end:1, z:0.8, data:data, mod:0.2, ang:Math.PI/2,
//                    baseColorHex:0x000000, topColorHex:0xFF0000, histogramType:Viewer.Features.ColumnHistogram});
//                torus.viewer.disk[i].features[0].addFeature({start:0, end:1, z:0.2, data:data, mod:0.2, ang:Math.PI/2,
//                    baseColorHex:0x000000, topColorHex:0xFF0000, histogramType:Viewer.Features.ColumnHistogram});



                var end = 0.35;

                torus.viewer.disk[i].addTrack({start:0, end:end, z:0.5, y:0.05, data:data, mod:-1/5, ang:0,
                    baseColorHex:0x0000FF, topColorHex:0xFF0000, trackType:Viewer.Track.ColumnHistogram});
                torus.viewer.disk[i].addTrack({start:0, end:end, z:0.5, y:0.05, data:data, mod:+1/5, ang:0,
                    baseColorHex:0x0000FF, topColorHex:0xFF00, trackType:Viewer.Track.LinearHistogram});

                torus.viewer.disk[i].addTrack({start:0, end:end, z:1, y:0.05, data:data2, mod:-1/5, ang:0,
                    baseColorHex:0xFF0000, topColorHex:0xFF0000, trackType:Viewer.Track.ColumnHistogram});
                torus.viewer.disk[i].addTrack({start:0, end:end, z:0, y:0.05, data:data3, mod:+1/5, ang:0,
                    baseColorHex:0xAAFF00, topColorHex:0x8800, trackType:Viewer.Track.LinearHistogram});

                torus.viewer.disk[i].addTrack({start:0, end:1, y:-0.02, z:0.5, data:data4, mod:+1/3, ang:-Math.PI/2,
                    baseColorHex:0x0000FF, topColorHex:0xFF00, trackType:Viewer.Track.LinearHistogram});

                var end2 = end+0.25;
                var num = torus.viewer.disk[i].addTrack();
                for(j = 0; j < 100; j++){
                    var s = end+Math.random()*(end2-end);
                    var m = 0.07;
                    var l = 0.02;
                    torus.viewer.disk[i].add2Track(num, {start:s, end:s+Math.random()*l, z:Math.random()*(1-m), mod:m, ang:0,
                        baseColorHex:0xA00000, topColorHex:0xA00000, y : Math.random()*0.2});
                }
                var end3 = 1;
                var num2 = torus.viewer.disk[i].addTrack();
                for(j = 0; j < 100; j++){
                    var s = end2+Math.random()*(end3-end2);
                    var m = 0.07;
                    var l = 0.02;
                    torus.viewer.disk[i].add2Track(num2, {start:s, end:s+Math.random()*l, z:0.45, mod:m, ang:+Math.PI/2,
                        baseColorHex:0xA00000, topColorHex:0xA00000, y : Math.random()*(1-m)});
                }


                torus.viewer.disk[i].addTrack({start:end2, end:4, z:0.5, data:data5, mod:1.2, ang:+Math.PI/2,
                    baseColorHex:0xAAAAAA, topColorHex:0xDDDDDD, trackType:Viewer.Track.LinearHistogram});

            }
        }

        return torus;

    },

    _fakeComponents:function(){



        var cellbase = this.demoCellbase || chrjson;
        var numDisks = 15;
        var components = {};
        components.commons = {};
        components.commons.hsapiens = {};
        components.commons.hsapiens.chromosomes = cellbase.result.result[0].chromosomes;
        components.commons.hsapiens.chromosomes.sort(function(a, b){
            var a2 = parseInt(a.name);
            var b2 = parseInt(b.name);
            if(a.name == 'X') {
                a2 = 23;
            }
            if(b.name == 'Y') {
                b2 = 24;
            }
            if(b.name == 'X') {
                b2 = 23;
            }
            if(a.name == 'Y') {
                a2 = 24;
            }
            if(a.name == 'MT') {
                a2 = 25;
            }
            if(b.name == 'MT') {
                b2 = 25;
            }

            return a2- b2;
//        return parseInt(a.name, 10)-parseInt(b.name, 10);
        });
        components.commons.hsapiens.chromosomes.pop();

        components.samples = new Array(numDisks);
        for (var i = 0; i < numDisks; i++){
            components.samples[i] = {};
            components.samples[i].species = 'hsapiens';
        }



        components.config = {
            type: "torus",  // cylinder, plane
            torusRadius: 4,
            diskRadius: 2,
            diskWidth: 1, // [0, 1]
            diskAperture: 0.1,  //[0,1]
            polygonPrecision: 50,
            texturePrecision: 5000,
            numLayers: 2,
            layerSeparation: [0, 0.02],
            pad:0.005,
            numDisk: numDisks,
            width:  window.innerWidth,
            height: window.innerHeight,
            doubleFigure: true
        };
        console.log(components);
        return components;

    },

    destroy:function(){
        this.rendered = false;
    },

    addSample:function(args){
        this.torus.addSample(args);
    }




}