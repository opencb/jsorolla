class NetworkBrowser {
    constructor(parent, data, config) {
        Object.assign(this, Backbone.Events);

        if (typeof config !== "object" || config === null) {
            config = NetworkBrowser.getDefaultConfig();
        }

        //Initialize the network renderer
        this.renderer = config.renderer;
        this.renderer.init(parent, config);
        let center = this.renderer.getCenter();

        //Initialize the network manager
        this.manager = new NetworkManager(data);
        this.manager.init(center);

        this.selectedNodes = [];

        this.clickBehavior = {};
        this.clickBehavior.list = ["MOVE_PATH", "MOVE_NODE"];
        this.clickBehavior.current = "MOVE_NODE";

        this.simulation = {};
        this.simulation.enabled = false;
        this.simulation.interval = null;
        this.simulation.velocityDecay = 0.0005;
        this.simulation.velocityMin = 0.001;
        this.simulation.tick = 10;
        this.simulation.repulsion = 30000;
        this.simulation.minAttractionDistance = 100;
        this.simulation.maxRepulsionDistance = 60;

        return this.init();
    }

    init() {
        let self = this;
        //Register the svg mouse down event listener.
        //This event is only fired when the user press the mouse left button in a node.
        this.renderer.on("mousedown", function (event, click, nodeID) {
            let nodes = [];
            //Click behavior --> move ths subpath
            if (self.clickBehavior.current === "MOVE_PATH") {
                nodes = (nodeID === null) ? [] : self.manager.getPathById(nodeID);
            }
            //Click behavior --> move this single node
            else if (self.clickBehavior.current === "MOVE_NODE") {
                nodes = (nodeID === null) ? [] : [nodeID];
            }
            //Add the nodes ids to the list of selected nodes
            self.addSelectedNodes(nodes);
            if (self.simulation.enabled === true) {
                self.startSimulation();
            }
        });
        //Register the svg mouse move event listener.
        //This event is only fired while the mouse left button is pressed.
        this.renderer.on("mousemove", function (event, click) {
            //Calculate the difference between the current mouse position and the clicked down initial position
            let dx = click.currentX - click.initialX;
            let dy = click.currentY - click.initialY;
            //Move all selected nodes
            self.selectedNodes.forEach(function (nodeID) {
                let node = self.manager.getNodeById(nodeID);
                node.display.x = node.display.ox + dx;
                node.display.y = node.display.oy + dy;
                self.renderer.moveNode(node);
            });
        });
        //Register the svg mouse up event listener
        this.renderer.on("mouseup", function (event) {
            return self.clearSelectedNodes();
        });
        //Register the svg mouse leave event listener
        this.renderer.on("mouseleave", function (event) {
            // defensive codding: loose track of a clicked point when mouse leave canvas.
            // - would it be nice to keep track of the clicked node and follow motion after reentering canvas
            // - [problem] if mouse get unclicked outside the canvas, the event is not registered and if svg-renderer.js
            //    onMouseLeave(event){ ... this.clickEvent.active = false; is not set, then would never be set,
            //     and the property "click on" would remain active even if unclicked when the mouse returns
            // - [this is a feature] We leave the clearSelectedNodes() until we found a more general satisfactory solution
            return self.clearSelectedNodes();
        });
    }

    addSelectedNodes(nodes) {
        let self = this;
        nodes.forEach(function (id) {
            let node = self.manager.getNodeById(id);
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
            let node = self.manager.getNodeById(nodeID);
            node.display.selected = false;
        });
        this.selectedNodes = [];
    }

    draw() {
        let self = this;
        //Draw all nodes
        this.manager.getNodes().forEach(function (node) {
            self.renderer.drawNode(node);
        });
        //Draw all relations
        this.manager.getRelations().forEach(function (relation) {
            self.renderer.drawRelation(relation);
        });
    }

    startSimulation() {
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

    stopSimulation() {
        if (this.simulation.interval !== null) {
            clearInterval(this.simulation.interval);
            this.simulation.interval = null;
            //Emit the simulation stop event
            this.trigger("simulation:stop");
        }
        return this;
    }

    stepSimulation() {
        let self = this;
        let s = this.simulation;
        let nodes = this.manager.getNodes();
        let inMovement = false;
        //let sx = 0, sy = 0;
        //Calculate the forces for each node
        for (let i = 0; i < nodes.length; i++) {
            nodes[i].display.vx = 0;
            nodes[i].display.vy = 0;
            //sx = sx + nodes[i].display.x;
            //sy = sy + nodes[i].display.y;
            for (let j = 0; j < nodes.length; j++) {
                if (i !== j) {
                    //console.log("Calculating force between node " + i + " and node " + j);
                    let dx = nodes[j].display.x - nodes[i].display.x;
                    let dy = nodes[j].display.y - nodes[i].display.y;
                    let dd = dx * dx + dy * dy;
                    let distance = Math.sqrt(dd);
                    //Check the distance between the nodes
                    if (distance < s.maxRepulsionDistance) {
                        //Apply Coulomb's law
                        nodes[i].display.vx = nodes[i].display.vx - (s.repulsion * dx / dd);
                        nodes[i].display.vy = nodes[i].display.vy - (s.repulsion * dy / dd);
                    }
                    //Check if both nodes are related
                    if (nodes[i].relatedTo.indexOf(nodes[j].id) !== -1) {
                        //Apply Hooke's law
                        nodes[i].display.vx = nodes[i].display.vx + (distance - s.minAttractionDistance) * dx;
                        nodes[i].display.vy = nodes[i].display.vy + (distance - s.minAttractionDistance) * dy;
                    }
                }
            }
        }
        /*
         if(nodes.length > 0) {
         sx = (sx / nodes.length) - center.x;
         sy = (sy / nodes.length) - center.y;
         }
         */
        //Apply the forces and move the nodes
        nodes.forEach(function (node) {
            //Check if this node is selected
            if (node.display.selected === true) {
                inMovement = true;
            }
            else {
                //Calculate the velocity values to apply
                let vx = node.display.vx * s.velocityDecay;
                let vy = node.display.vy * s.velocityDecay;
                //Check if the velocity is over the threshold
                if (Math.abs(vx) > s.velocityMin || Math.abs(vy) > s.velocityMin) {
                    node.display.x = node.display.x + vx; // - sx;
                    node.display.y = node.display.y + vy; // - sy;
                    inMovement = true;
                    self.renderer.moveNode(node);
                }
            }
        });
        //Check if simulation is not in movement and stop the simulation
        if (inMovement === false) {
            console.log("Simulation finished");
            return this.stopSimulation();
        }
    }

    setClickBehavior(value) {
        if (this.clickBehavior.list.indexOf(value.toUpperCase()) === -1) {
            throw new Error("Unknown behavior " + value);
        }
        this.clickBehavior.current = value.toUpperCase();
        return this;
    }

    enableSimulation() {
        this.simulation.enabled = true;
        this.trigger("simulation:enabled"); //Or simulation:enable ??
        this.startSimulation();
        return this;
    }

    disableSimulation() {
        this.simulation.enabled = false;
        this.trigger("simulation:disabled"); //Or simulation:disable ??
        this.stopSimulation();
        return this;
    }

    getSimulationStatus() {
        //Return the current simulation status
        return {
            enabled: this.simulation.enabled,
            running: this.simulation.interval !== null
        }
    }

    static getDefaultConfig() {
        return {
            width: 800,
            height: 600,
            renderer: new SvgNetworkRenderer(),
            shapes: BasicNetworkSvgShapes
        };
    }
}
