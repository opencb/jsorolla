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

    /// event handling
    this.mouseToolDown = this.torus.selectionMouse;
    this.mouseToolUp = this.torus.nothingMouseUp;
    this.mouseToolWheel = this.torus.cameraMouseWheel;

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
    this.setGUI();
    this.setupLeap();
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

//        $('#dg ac').insertBefore('#application');

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

    onMouseDown: function (_this) {
        return function (event) {
            _this.torus.lastClick = new THREE.Vector2(event.clientX, event.clientY);
            _this.torus.clickPressed = event.button;
//        event.preventDefault();
//        console.log(_this.lastClick);


            _this.mouseToolDown(_this.torus, event);
        }
    },
    onMouseUp: function (_this) {
        return function (event) {
            _this.torus.clickPressed = -1;
//            document.removeEventListener('mousemove', _this.onMouseMove, false);
            _this.mouseToolUp(_this.torus, event);
            _this.updateGUI();
        }
    },

    onMouseWheel: function (_this) {
        return function (event) {

            _this.mouseToolWheel(_this.torus, event);
            _this.updateGUI();
        }
    },
    onMouseMoveWrapper: function (_this) {
        _this.torus.onMouseMove = function (event) {
//            console.log("en onmousemove");
            var where = _this.torus.viewer.getClickPosition(new THREE.Vector2(event.clientX, event.clientY));
            switch (_this.torus.clickPressed) {
                case 0:
                    _this.torus.viewer.addTorusPhase((event.clientX - _this.torus.lastClick.x) / 500);
                    _this.torus.viewer.addVerticalRotation((event.clientY - _this.torus.lastClick.y) / 500);
                    break;
                case 1:
                    var pos = _this.torus.viewer.getRegion();

                    pos.x += (event.clientX - _this.torus.lastClick.x) / 5000;
                    pos.y += (event.clientY - _this.torus.lastClick.y) / 5000;
                    _this.torus.viewer.setRegion(pos.x, pos.y);
                    break;
                case 2:
                    _this.torus.viewer.addDisksPhase(-(event.clientY - _this.torus.lastClick.y) / 500);
            }
            _this.torus.lastClick.x = event.clientX;
            _this.torus.lastClick.y = event.clientY;
        }
    },

    changeMouseTool: function (tool) {
        if (tool == "Information") {
            this.mouseToolDown = this.torus.informationMouse;
            this.mouseToolUp = this.torus.nothingMouseUp;
            this.mouseToolWheel = this.torus.cameraMouseWheel;
        } else if (tool == "Selection") {
            this.mouseToolDown = this.torus.selectionMouse;
            this.mouseToolUp = this.torus.nothingMouseUp;
            this.mouseToolWheel = this.torus.cameraMouseWheel;
        } else if (tool == "Zoom") {
            this.mouseToolDown = this.torus.zoomMouseDown;
            this.mouseToolUp = this.torus.zoomMouseUp;
            this.mouseToolWheel = this.torus.zoomMouseWheel;
//            document.removeEventListener('mousemove', this.onMouseMove, false);
        }
    },
    setGUI: function() {
        this.gui = new dat.GUI();

        var parameters =
        {
            /*
             x: 0, y: 30, z: 0,
             color: "#ff0000", // color (change "#" to "0x")
             opacity: 1,
             visible: true,
             material: "Phong",
             reset: function() { resetCube()
             */
//            visible: false
            start: 0,
            end: 1,
//            position: 0.5, // numeric slider
//            zoom: 31.5,
            sampleName: true,
            tool: "Selection"
        };
        this.parameters = parameters;

/*
        var diskVisible = this.gui.add( parameters, 'visible' ).name('Visible?').listen();
        diskVisible.onChange(
            function(_this) {
                return function (value) {
                    if (value) {
                        _this.torus.viewer.selectDisk(0);
                    } else {
                        _this.torus.viewer.unselectDisk(0);
                    }
                }
            } (this)
        );
        */
        var sampleName = this.gui.add( parameters, 'sampleName').name('Sample name').listen();

        var _this =  this;
        sampleName.onChange(function (value) {
                _this.torus.viewer.viewSampleName(value);
            }
        );

        var mouseTool = this.gui.add( parameters, 'tool', [ "Information", "Selection", "Zoom"] ).name('Tool').listen();

        mouseTool.onChange(function (value) {
                _this.changeMouseTool(value);
            }
        );

        /*
        this.gui.add(parameters, 'position', 0, 1).step(0.001).name('Position').listen().onChange(function (value) {
                _this.torus.setPosition(value);
                _this.torus.updateScale();
            }
        );
        this.gui.add(parameters, 'zoom', 20, 32).step(0.01).name('Zoom').listen().onChange(function (value) {
                _this.torus.scale = value;
                _this.torus.updateScale();
            }
        );*/


        this.gui.region = {start: 0, end:1};
        var folderRegion = this.gui.addFolder('Region');
        folderRegion.add( parameters, 'start').min(0).onChange( function (value) {
                _this.torus.setRegion(_this.gui.__controllers[0].object.start, _this.gui.__controllers[0].object.end);
            }
        );
        folderRegion.add( parameters, 'end' ).onChange( function (value) {
                _this.torus.setRegion(_this.gui.__controllers[0].object.start, _this.gui.__controllers[0].object.end);
            }
        );
        folderRegion.close();
//        folderRegion.onChange(function () {
//            _this.torus.setRegion(_this.gui.region.start, _this.gui.region.end);
//            console.log(_this.torus.viewer.getRegion());
//        });

        this.gui.open();

        /*
         var folder1 = this.gui.addFolder('Position');
         var cubeX = folder1.add( parameters, 'x' ).min(-200).max(200).step(1).listen();
         var cubeY = folder1.add( parameters, 'y' ).min(0).max(100).step(1).listen();
         var cubeZ = folder1.add( parameters, 'z' ).min(-200).max(200).step(1).listen();
         folder1.open();

         cubeX.onChange(function(value)
         {   cube.position.x = value;   });
         cubeY.onChange(function(value)
         {   cube.position.y = value;   });
         cubeZ.onChange(function(value)
         {   cube.position.z = value;   });

         var cubeColor = this.gui.addColor( parameters, 'color' ).name('Color').listen();
         cubeColor.onChange(function(value) // onFinishChange
         {   cube.material.color.setHex( value.replace("#", "0x") );   });
         */
    },

    updateGUI: function () {
        var region = this.torus.getRegion();
        if (region !== undefined) {
            this.parameters.start = region.start;
            this.parameters.end = region.end;
            for (var i = 0; i < this.gui.__folders.Region.__controllers.length; i++) {
                this.gui.__folders.Region.__controllers[i].updateDisplay();
            }

//            this.gui.region.start = region.start;
//            this.gui.region.end = region.end;
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

/*

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
*/
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
//            backgroundColor: 0x984ea3,
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
    },


    setupLeap: function (config) {
        var completeConf = {enableGestures: false};
        _.extend(completeConf, config);

        var _this = this;

// the LeapMotion update function
        Leap.loop( completeConf, function( frame )
        {
            //console.log("leap:");
            //console.log(frame);
            if (frame === undefined) {
                return;
            }

            var handData = frame.hands[0];
            if (handData === undefined || frame.fingers === undefined) {
                return;
            }

            var fingersExtended = 0;
            for (var i = 0; i < frame.fingers.length; i++) {
                fingersExtended += frame.fingers[i].extended;
            }


//            console.log(frame);
            if (_this.torus.lastLeapPosition !== undefined && fingersExtended <= 3) {
                var delta = [];
                delta[0] = (handData.palmPosition[0] - _this.torus.lastLeapPosition[0]) / 200;
                delta[1] = -1*(handData.palmPosition[1] - _this.torus.lastLeapPosition[1]) / 200;
                delta[2] = (handData.palmPosition[2] - _this.torus.lastLeapPosition[2])/ 500 + 1;


                if (fingersExtended == 2) {
                    _this.torus.viewer.addDisksPhase(delta[1]);
                } else {
//                if ( Math.abs(delta[0]) < 0.01) {
                    _this.torus.viewer.addTorusPhase(delta[0]);
//                }
//                if ( Math.abs(delta[1]) < 0.01) {
                    _this.torus.viewer.addVerticalRotation(delta[1]);
//                }
//                if ( Math.abs(delta[2]) < 0.01) {
                    _this.torus.viewer.addZoom(delta[2]);
//                }
                }
            }

            _this.torus.lastLeapPosition = handData.palmPosition;
            _this.torus.viewer.setLeapPosition(handData.palmPosition);
//            console.log(handData.palmPosition);

/*
            handMesh.position.set( , handData.palmPosition[1] - 200, handData.palmPosition[2] );
            handMesh.material = lightMaterial;

            handMesh.rotation.set(0,0,0);
            handMesh.rotateX(  Math.atan2( handData.palmNormal[1], -handData.palmNormal[2] ) );
            handMesh.rotateY( -Math.atan2( handData.palmNormal[0], -handData.palmNormal[1] ) );

            handShadow.position.x = handData.palmPosition[0];
            handShadow.position.z = handData.palmPosition[2];
            handShadow.material = lightMaterial;

            var	handPosition = new THREE.Vector3( handData.palmPosition[0], handData.palmPosition[1] - 200, handData.palmPosition[2] );
            for (var i = 0; i < Math.min(frame.pointables.length,5); i++)
            {
                var pointer = frame.pointables[i];
                fingerMeshArray[i].visible = true;
                fingerMeshArray[i].position.set( pointer.tipPosition[0], pointer.tipPosition[1] - 200, pointer.tipPosition[2] );

                fingerLengthArray[i].visible = true;
                var fingerPosition = new THREE.Vector3( pointer.tipPosition[0], pointer.tipPosition[1] - 200, pointer.tipPosition[2] );
                var direction = new THREE.Vector3().subVectors( fingerPosition, handPosition );
                var arrow = new THREE.ArrowHelper( direction.clone().normalize(), handPosition, direction.length() );
                fingerLengthArray[i].position = new THREE.Vector3().addVectors( handPosition, direction.clone().multiplyScalar(0.5) );
                fingerLengthArray[i].setRotationFromEuler( arrow.rotation );
                fingerLengthArray[i].scale.y = direction.length();

                fingerShadowArray[i].visible = true;
                fingerShadowArray[i].position.x = pointer.tipPosition[0];
                fingerShadowArray[i].position.z = pointer.tipPosition[2];
            }
*/
            /*
             scene.remove(curveBall);
             curveBall = new THREE.Mesh( new THREE.SphereGeometry( handData.sphereRadius / 1.1, 32, 16 ), curveBall.material );
             curveBall.position.set( handData.sphereCenter[0], handData.sphereCenter[1] - 200, handData.sphereCenter[2]  );
             scene.add(curveBall);
             */
/*
            // gesture debugging
            var n = frame.gestures.length;
            if (n > 0)
            {
                for (var i = 0; i < n; i++)
                {
                    console.log( frame.gestures[i] );
                }
            }*/

        });
    }

}