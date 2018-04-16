/**
 *
 * new API mapping
 *  Network
 * x  nb.loadNetwork(network)
 *    nb.saveNetwork()
 *    nb.saveNetworkImage()
 * X Network diagram display
 * x  nb.zoom(scale)
 * x  nb.zoomIn()
 * x  nb.zoomOut()
 * x  nb.zoomReset()
 * x  nb.move(dx, dy)
 * x  nb.moveReset()
 *  Nodes
 *    nb.addNode(node)
 *    nb.getNode(uid)
 *    nb.showNode(uid)
 *    nb.hideNode(uid)
 *    nb.fixNodePosition(uid)
 *    nb.unfixNodePosition(uid)
 *    nb.moveNode(uid, dx, dy)
 *    nb.setNodeStyle(uid, style)
 *    nb.setNodeSize(uid, size)
 *    nb.setNodeColor(uid, color)
 *    nb.setNodeCharge(uid, charge)
 *  Nodes selection
 *  Relations
 *    nb.addRelation(relation)
 * X Force layout
 * x   nb.forceLayoutStart()
 * x   nb.forceLayoutStop()
 * x   nb.forceLayoutStatus()
 *  analysis
 *    registerAnalysis
 *
 *
 */

class NetworkBrowser {
    constructor(parent, config) {
        Object.assign(this, Backbone.Events);

        if (typeof config !== "object" || config === null) {
            config = NetworkBrowser.getDefaultConfig();
        }

        //Initialize the network renderer
        this.renderer = config.renderer;
        this.renderer.init(parent, config);
        //let center = this.renderer.getCenter();

        //Initialize the network manager
        this.manager = new NetworkManager();
        //this.manager.init(center);

        this.selectedNodes = [];

        this.clickBehavior = {};
        this.clickBehavior.list = ["MOVE_PATH", "MOVE_NODE"];
        this.clickBehavior.current = "MOVE_NODE";

        this.simulation = {};
        this.simulation.enabled = false;
        this.simulation.interval = null;
        this.simulation.tick = 50;
        this.simulation.attraction = 0.05;
        this.simulation.repulsion = 150;
        this.simulation.damping = 0.9;
        this.simulation.alpha = 1;
        this.simulation.alphaMin = 0.001;
        this.simulation.alphaDecay = 0.02;
        this.simulation.alphaTarget = 0.9;
        this.simulation.alphaDefault = 0.9;

        return this.init();
    }

    _init() {
        return this.init();
    }

    init() {
        // <TODO> deprecate in favour of _init() 
        let self = this;
        //Register the svg mouse down event listener.
        //This event is only fired when the user press the mouse left button in a node.
        this.renderer.on("mousedown", function (event, click, nodeID) {
            let nodes = [];
            //Click behavior --> move ths subpath
            if (self.clickBehavior.current === "MOVE_PATH") {
                nodes = (nodeID === null) ? [] : self.manager.getPath(nodeID);
            }
            //Click behavior --> move this single node
            else if (self.clickBehavior.current === "MOVE_NODE") {
                nodes = (nodeID === null) ? [] : [nodeID];
            }
            //Add the nodes ids to the list of selected nodes
            self.addSelectedNodes(nodes);
            self.simulation.alphaTarget = self.simulation.alphaDefault;
            if (self.simulation.enabled === true) {
                self.startSimulation();
            }
        });
        //Register the svg mouse move event listener.
        //This event is only fired while the mouse left button is pressed.
        this.renderer.on("mousemove", function (event, click) {
            let scale = self.renderer.getScale();
            //Calculate the difference between the current mouse position and the clicked down initial position
            let dx = (click.currentX - click.initialX) / scale;
            let dy = (click.currentY - click.initialY) / scale;
            //Move all selected nodes
            self.selectedNodes.forEach(function (nodeID) {
                let node = self.manager.getNode(nodeID);
                node.display.x = node.display.ox + dx;
                node.display.y = node.display.oy + dy;
                self.renderer.moveNode(node);
            });
        });
        //Register the svg mouse up event listener
        this.renderer.on("mouseup", function (event) {
            self.simulation.alphaTarget = 0;
            return self.clearSelectedNodes();
        });
        //Register the svg mouse leave event listener
        this.renderer.on("mouseleave", function (event) {
            self.simulation.alphaTarget = 0;
            // defensive codding: loose track of a clicked point when mouse leave canvas.
            // - would it be nice to keep track of the clicked node and follow motion after reentering canvas
            // - [problem] if mouse get unclicked outside the canvas, the event is not registered and if svg-renderer.js
            //    onMouseLeave(event){ ... this.clickEvent.active = false; is not set, then would never be set,
            //     and the property "click on" would remain active even if unclicked when the mouse returns
            // - [this is a feature] We leave the clearSelectedNodes() until we found a more general satisfactory solution
            return self.clearSelectedNodes();
        });
    }

    loadNetwork(data) {
        let self = this;
        //Reset the current network
        this.manager.reset();
        this.renderer.reset();
        //Parse the nodes in the new network
        if (typeof data.nodes === "object" && Array.isArray(data.nodes)) {
            data.nodes.forEach(function (node) {
                self.nodeAdd(node);
            });
        }
        //Parse the relations in the new network
        if (typeof data.relations === "object" && Array.isArray(data.relations)) {
            data.relations.forEach(function (relation) {
                self.relationAdd(relation);
            });
        }
    }

    nodeAdd(node) {
        let center = this.renderer.getCenter(); 
        this.manager.addNode(node, center);
        return this;
    }

    addSelectedNodes(nodes) {
        let self = this;
        nodes.forEach(function (id) {
            let node = self.manager.getNode(id);
            node.display.ox = node.display.x;
            node.display.oy = node.display.y;
            node.display.selected = true;
            self.renderer.bringNodeToTop(node);
        });
        //Concat the nodes IDs to the selected nodes list
        this.selectedNodes = this.selectedNodes.concat(nodes);
    }

    clearSelectedNodes() {
        let self = this;
        //Reset the selected nodes
        this.selectedNodes.forEach(function (nodeID) {
            let node = self.manager.getNode(nodeID);
            node.display.selected = false;
        });
        this.selectedNodes = [];
    }

    relationAdd(relation) {
        this.manager.addRelation(relation);
        return this;
    }

    _draw() {
        this.draw();
    }

    draw() {
        // <TODO> deprecate in favour of _draw()
        let self = this;
        //Draw all nodes
        this.manager.getAllNodes().forEach(function (node) {
            self.renderer.drawNode(node);
        });
        //Draw all relations
        this.manager.getAllRelations().forEach(function (relation) {
            self.renderer.drawRelation(relation);
        });
    }

    forceLayoutStart(){
        return this.startSimulation();
    }

    startSimulation() {
        // <TODO> deprecate next iteration and implement in forceLayoutStart
        let self = this;
        if (this.simulation.enabled === true) {
            if (this.simulation.interval === null) {
                //let center = this.renderer.getCenter();
                this.simulation.interval = setInterval(function () {
                    return self.stepSimulation();
                }, this.simulation.tick);
                //Emit the simulation start event
                this.trigger("simulation:start");
            }
        }
        return this;
    }

    forceLayoutStop(){
        return this.stopSimulation();
    }

    stopSimulation() {
        // <TODO> deprecate next iteration and implement in forceLayoutStop
        if (this.simulation.interval !== null) {
            clearInterval(this.simulation.interval);
            this.simulation.interval = null;
            //Emit the simulation stop event
            this.trigger("simulation:stop");
        }
        return this;
    }

    _forceLayoutStep() {
        this.stepSimulation();
    }

    stepSimulation() {
        // <TODO> deprecate next iteration and implement in _forceLayoutStep
        let self = this;
        let s = this.simulation;
        let nodes = this.manager.getAllNodes();
        let relations = this.manager.getAllRelations();
        //Calculate the new alpha value
        s.alpha = s.alpha + (s.alphaTarget - s.alpha) * s.alphaDecay;
        //Calculate the repulsion forces for each node
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].display.fx = 0;
            nodes[i].display.fy = 0;
            for (let j = 0; j < nodes.length; j++) {
                if (i !== j) {
                    let dx = nodes[j].display.x - nodes[i].display.x;
                    let dy = nodes[j].display.y - nodes[i].display.y;
                    let dd = Math.max(dx * dx + dy * dy, 0.001);
                    //Apply Coulomb's law
                    nodes[i].display.fx = nodes[i].display.fx - (s.repulsion * dx / dd);
                    nodes[i].display.fy = nodes[i].display.fy - (s.repulsion * dy / dd);
                }
            }
        }
        //Calculate the attraction forces between related nodes
        for(let i = 0; i < relations.length; i++) {
            let source = relations[i].nodeSource;
            let target = relations[i].nodeTarget;
            //Calculate the distance between the two related nodes
            let dx = target.display.x - source.display.x;
            let dy = target.display.y - source.display.y;
            //Apply Hooke's law
            target.display.fx = target.display.fx - dx * s.attraction;
            target.display.fy = target.display.fy - dy * s.attraction;
            source.display.fx = source.display.fx + dx * s.attraction;
            source.display.fy = source.display.fy + dy * s.attraction;
        }
        //Apply the forces and move the nodes
        nodes.forEach(function (node) {
            //Check if this node is not selected
            if (node.display.selected === false) {
                //Calculate the velocity values to apply
                node.display.vx = (node.display.vx + node.display.fx) * s.alpha;
                node.display.vy = (node.display.vy + node.display.fy) * s.alpha;
                //Move the node
                node.display.x = node.display.x + node.display.vx;
                node.display.y = node.display.y + node.display.vy;
                self.renderer.moveNode(node);
            }
        });
        //Check the alpha value to stop the simulation
        if (s.alpha < s.alphaMin) {
            console.log("Simulation finished");
            return this.stopSimulation();
        }
    }

    enableSimulation() {
        // <TODO> deprecate next iteration. Find where it is used and substitute the call
        // with a direct call to forceLayoutStart
        this.simulation.enabled = true;
        this.trigger("simulation:enabled"); //Or simulation:enable ??
        this.startSimulation();
        return this;
    }

    disableSimulation() {
        // <TODO> deprecate next iteration. Find where it is used and substitute the call
        // with a direct call to forceLayoutStop
        this.simulation.enabled = false;
        this.trigger("simulation:disabled"); //Or simulation:disable ??
        this.stopSimulation();
        return this;
    }

    forceLayoutSatuts() {
        return this.getSimulationStatus();
    }

    getSimulationStatus() {
        // <TODO> deprecate next iteration
        //Return the current simulation status
        return {
            enabled: this.simulation.enabled,
            running: this.simulation.interval !== null
        }
    }


    zoom(scale) {
        this.renderer.applyScale(scale);
        return this;
    }

    zoomIn() {
        this.renderer.applyScale(1.5);
        return this;
    }

    zoomOut() {
        this.renderer.applyScale(0.666);
        return this;
    }

    zoomReset() {
        this.renderer.resetScale();
        return this;
    }

    move(dx, dy) {
        this.renderer.applyTranslation(dx, dy);
        return this;
    }

    moveReset() {
        this.renderer.resetTranslation();
        return this;
    }

    setClickBehavior(value) {
        if (this.clickBehavior.list.indexOf(value.toUpperCase()) === -1) {
            throw new Error("Unknown behavior " + value);
        }
        this.clickBehavior.current = value.toUpperCase();
        return this;
    }

    static getDefaultConfig() {
        return {
            width: "100%",
            height: "600px",
            renderer: new SvgNetworkRenderer(),
            shapes: BasicNetworkSvgShapes
        };
    }
}
