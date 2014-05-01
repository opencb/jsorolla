function NetworkViewerWebgl(args) {
    _.extend(this, Backbone.Events);
    this.id = Utils.genId('NetworkViewerWebgl');

    this.width = 800;
    this.height = 600;

    this.scene;
    this.camera;
    this.renderer;

    this.targetId;
    this.cameraRadius;
    this.cameraTheta;
    this.cameraPhi;


    this.elements = {};

    //set instantiation args, must be last
    _.extend(this, args);

    this.potyvirusPorteinNames = ['P1', 'HC-Pro', 'P3', '6K1', 'CI', '6K2', 'VPg', 'Nia-Pro', 'Nib', 'CP', 'P3N-PIPO'];

    this.on(this.handlers);
    if (this.autoRender) {
        this.render();
    }
}


NetworkViewerWebgl.prototype = {
    render: function () {
        var _this = this;
        this.initScene();
//
//
//        setTimeout(function () {
//            _this.renderScene();
//        }, 100);

    },
    renderVertex: function (vertex, target, network, updateScene) {


        var vertexConfig = network.config.getVertexConfig(vertex);
        var coords = vertexConfig.coords;

        var element = this.elements[vertex.id];
        if (element != null) {
            target.remove(element);
        }
        /** vertex representation **/
        var H = Math.random();
        var S = 0.9;
        var L = 0.7;
        if (this.potyvirusPorteinNames.indexOf(vertex.id) !== -1) {
            H = 1;
            S = 1;
            L = 1;
        }

        var spriteMaterial = new THREE.SpriteMaterial({ map: this.particleTexture, useScreenCoordinates: false, color: 0xffffff });
        var sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(32, 32, 1.0); // imageWidth, imageHeight
        sprite.position.set(coords.x, coords.y, coords.z);
        sprite.material.color.setHSL(H,S,L);
        sprite.material.blending = THREE.AdditiveBlending;
//        this.groupElements.add(sprite);
        target.add(sprite);
        /** ************************/

        this.elements[vertex.id] = sprite;

        if (updateScene != false) {
            this.renderScene();
        }

    },
    renderEdge: function (edge, target, network, updateScene) {

        var edgeConfig = network.config.getEdgeConfig(edge);
        var sourceConfig = network.config.getVertexConfig(edge.source);
        var targetConfig = network.config.getVertexConfig(edge.target);

        var sourceCoords = sourceConfig.coords;
        var targetCoods = targetConfig.coords;

        var element = this.elements[edge.id];
        if (element != null) {
            target.remove(element);
        }
        /** vertex representation **/
        var H = Math.random();
        var S = 0.9;
        var L = 0.7;
        if (this.potyvirusPorteinNames.indexOf(edge.source.id) !== -1) {
            H = 1;
            S = 1;
            L = 1;
        }

        var material = new THREE.LineBasicMaterial({color: 0xffffff});
        material.color.setHSL(H,S,L);
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(sourceCoords.x, sourceCoords.y, sourceCoords.z));
        geometry.vertices.push(new THREE.Vector3(targetCoods.x, targetCoods.y, targetCoods.z));
        var line = new THREE.Line(geometry, material);
        target.add(line);
        /** ************************/

        this.elements[edge.id] = line;

        if (updateScene != false) {
            this.renderScene();
        }

    },
    renderNetwork: function (network) {
        for (var element in this.elements) {
            this.scene.remove(this.elements[element]);
        }
        this.renderScene();

        var edges = network.graph.edges;
        var vertices = network.graph.vertices;
        for (var i = 0, l = vertices.length; i < l; i++) {
            var vertex = vertices[i];
            if (typeof vertex !== 'undefined') {
                this.renderVertex(vertex, this.scene, network, false);
            }
        }
        for (var i = 0, l = edges.length; i < l; i++) {
            var edge = edges[i];
            if (typeof edge !== 'undefined') {
                this.renderEdge(edge, this.scene, network, false);
            }
        }

        this.renderScene();
    },
    initScene: function () {
        this.particleTexture = THREE.ImageUtils.loadTexture('images/spark.png');

        // camera vars
        this.cameraRadius = 1600;
        this.cameraTheta = 45;
        this.cameraPhi = 5;

        // set the scene size
        var WIDTH = this.width;
        var HEIGHT = this.height;

        // set some camera attributes
        var VIEW_ANGLE = 45,
            ASPECT = WIDTH / HEIGHT,
            NEAR = 1,
            FAR = 10000;


        // get the DOM element to attach to
        // - assume we've got jQuery to hand
        this.target = $('#' + this.targetId)[0];

        // create a WebGL renderer, camera
        // and a scene
        this.renderer = new THREE.WebGLRenderer();
        this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        this.scene = new THREE.Scene();


        // start the renderer
        this.renderer.setSize(WIDTH, HEIGHT);

        // attach the render-supplied DOM element
        $(this.target).append(this.renderer.domElement);

        // and the camera
        this.scene.add(this.camera);


        // create a point light
        var pointLight = new THREE.PointLight(0xFFFFFF);

        // set its position
        pointLight.position.x = 10;
        pointLight.position.y = 50;
        pointLight.position.z = 200;


        // add to the scene
        this.scene.add(pointLight);

        //create an empty container
        this.groupElements = new THREE.Object3D();

        // debug plane
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshLambertMaterial({color: 0x333333}));
//        var plane = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshNormalMaterial({ shading: THREE.SmoothShading }));
//        plane.overdraw = true;
        this.scene.add(plane);

        //To use enter the axis length
        //{x: red, y: green, z: blue}
        debugaxis(500, this.scene);

        this.renderScene();

        // attach controls
        this.setControls();


    },
    renderScene: function () {
//        θ = theta
//        φ = phi

//        x= r sin(theta) cos(phi)
//        y= r sin(theta) sin(phi)
//        z= r cos(theta)

//        r ≥ 0
//        0° ≤ θ ≤ 180° (π rad)
//        0° ≤ φ < 360° (2π rad)

        this.camera.position.x = this.cameraRadius * Math.sin(this.cameraTheta * Math.PI / 180) * Math.cos(this.cameraPhi * Math.PI / 180);
        this.camera.position.y = this.cameraRadius * Math.sin(this.cameraTheta * Math.PI / 180) * Math.sin(this.cameraPhi * Math.PI / 180);
        this.camera.position.z = this.cameraRadius * Math.cos(this.cameraTheta * Math.PI / 180);


        this.camera.updateMatrix();
        this.camera.up.set(0, 0, 1);
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
//        console.log({x: camera.position.x, y: camera.position.y, z: camera.position.z});
//        console.log({r: cameraRadius, theta: theta, phi: phi});
    },
    setControls: function () {
        var _this = this;
        this.target.addEventListener('mousewheel', function (event) {
            _this.cameraRadius -= event.wheelDeltaY;
            _this.cameraRadius = Math.min(_this.cameraRadius, 2000);
            _this.cameraRadius = Math.max(_this.cameraRadius, 10);
            if (_this.cameraRadius > 10 && _this.cameraRadius < 2000) {
                _this.renderScene();
            }
        }, false);

        $('body').keydown(function (event) {
            switch (event.keyCode) {
                case 38: //up arrow key
                    _this.cameraTheta -= 1;
                    break;
                case 39: //right arrow key
                    _this.cameraPhi += 1;
                    break;
                case 40: //down arrow key
                    _this.cameraTheta += 1;
                    break;
                case 37: //left arrow key
                    _this.cameraPhi -= 1;
                    break;
                default:
            }
            _this.cameraPhi = _this.cameraPhi % 360;
            _this.cameraTheta = Math.min(_this.cameraTheta, 89);
            _this.cameraTheta = Math.max(_this.cameraTheta, 1);
            if (_this.cameraTheta > 0 && _this.cameraTheta < 90) {
                _this.renderScene();
            }
        });
        $(this.target).mousedown(function (mouseDownEvent) {
            var mouseDownX = mouseDownEvent.clientX;
            var mouseDownY = mouseDownEvent.clientY;
            $(this).mousemove(function (mouseMoveEvent) {
                if (mouseDownEvent.which == 1) {

                    _this.cameraPhi -= mouseMoveEvent.clientX - mouseDownX;
                    _this.cameraPhi = _this.cameraPhi % 360;

                    _this.cameraTheta += mouseMoveEvent.clientY - mouseDownY;
                    _this.cameraTheta = Math.min(_this.cameraTheta, 89);
                    _this.cameraTheta = Math.max(_this.cameraTheta, 1);

                    mouseDownX = mouseMoveEvent.clientX;
                    mouseDownY = mouseMoveEvent.clientY;
                    if (_this.cameraTheta > 0 && _this.cameraTheta < 90) {
                        _this.renderScene();
                    }
                }
            });

        });
        $(this.target).mouseup(function () {
            $(this).off('mousemove');
        });
        $(this.target).mouseleave(function () {
            $(this).off('mousemove');
        });
    }
}