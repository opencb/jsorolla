class NetworkManager {
    constructor(data) {
        //this.data = data;
        //this.nodesIds = {};
        //this.relationsIds = {};

        //Nodes information 
        this.nodes = {
            list: [],
            ids: {},
            initialAngle: Math.PI * (3 - Math.sqrt(5)),
            initialRadius: 50
        };        
        //Relations information 
        this.relations = {
            list: [],
            ids: {}
        };
    }

    init(center) {
        //DEPRECATED
        this.initializeNodes(center);
        this.initializeRelations();
    }

    reset() {
        this.nodes.list = [];
        this.nodes.ids = {};
        this.relations.list = [];
        this.relations.ids = {};
    }

    loadData(nodes, relations, center) {
        let self = this;
        this.reset();
        //Add all nodes
        nodes.forEach(function (node) {
            self.addNode(node, center);
        });
        //Add all relations 
        relations.forEach(function (relation) {
            self.addRelation(relation);
        });
    }

    initializeNodes(center) {
        let self = this;
        let initialAngle = Math.PI * (3 - Math.sqrt(5));
        let initialRadius = 50;
        this.data.nodes.forEach(function (node, index) {
            //Get the default display object and check if the node has the display object
            let defaultDisplay = NetworkManager.getDefaultNodeDisplay();
            if (typeof node.display !== "object" || node.display === null) {
                //Display not defined --> save the default display object
                node.display = defaultDisplay;
            } else {
                //Display defined --> assign the defined display properties to the default
                //display object.
                node.display = Object.assign(defaultDisplay, node.display);
            }
            //Check the node initial position
            if (!node.display.x || !node.display.y) {
                let radius = initialRadius * Math.sqrt(index) * 0.8;
                let angle = index * initialAngle;
                node.display.x = parseInt(center.x + radius * Math.cos(angle));
                node.display.y = parseInt(center.y + radius * Math.sin(angle));
            }
            //Reset the velocity values
            node.display.vx = 0;
            node.display.vy = 0;
            node.index = index;
            node.id = (typeof node.id === "string") ? node.id : "node" + index;
            node.relatedTo = [];
            //Assign the node id to the node index
            self.nodesIds[node.id] = index;
        });
    }

    addNode(node, center) {
        let index = this.nodes.list.length;
        //Get the default display object and check if the node has the display object
        let defaultDisplay = NetworkManager.getDefaultNodeDisplay();
        if (typeof node.display !== "object" || node.display === null) {
            //Display not defined --> save the default display object
            node.display = defaultDisplay;
        } else {
            //Display defined --> assign the defined display properties to the default
            //display object.
            node.display = Object.assign(defaultDisplay, node.display);
        }
        //Check the node initial position
        if (!node.display.x || !node.display.y) {
            let radius = this.nodes.initialRadius * Math.sqrt(index) * 0.8;
            let angle = this.nodes.initialAngle * index;
            node.display.x = parseInt(center.x + radius * Math.cos(angle));
            node.display.y = parseInt(center.y + radius * Math.sin(angle));
        }
        //Reset the velocity values
        node.display.vx = 0;
        node.display.vy = 0;
        node.index = index;
        node.id = (typeof node.id === "string") ? node.id : "node" + index;
        node.relatedTo = [];
        //Save the node
        this.nodes.list.push(node);
        //Assign the node id to the node index
        this.nodes.ids[node.id] = index;
    }

    moveNode(id, x, y) {
        let node = this.getNode(id);
        node.display.x = x;
        node.display.y = y;
        return node;
    }

    getNode(id) {
        let index = this.nodes.ids[id];
        return (index !== -1) ? this.nodes.list[index] : null;
    }

    getAllNodes() {
        return this.nodes.list;
    }

    getPath(id) {
        let self = this;
        let path = [];
        let findRelation = function (node) {
            if (path.indexOf(node) === -1) {
                path.push(node);
                let relations = self.getNode(node).relatedTo;
                for (let i = 0; i < relations.length; i++) {
                    findRelation(relations[i]);
                }
            }
        };
        findRelation(id);
        return path;
    } 

    initializeRelations() {
        let self = this;
        this.data.relations.forEach(function (relation, index) {
            relation.nodeSource = self.getNodeById(relation.source);
            relation.nodeTarget = self.getNodeById(relation.target);
            relation.index = index;
            relation.id = (typeof relation.id === "string") ? relation.id : "relation" + index;
            self.relationsIds[relation.id] = index;
            //Save the relations between the nodes
            relation.nodeSource.relatedTo.push(relation.target);
            relation.nodeTarget.relatedTo.push(relation.source);
            //Relation force
            relation.force = 0;
        });
        this.data.relations.forEach(function (relation, index) {
            let sourceCount = relation.nodeSource.relatedTo.length;
            let targetCount = relation.nodeTarget.relatedTo.length;
            relation.force = sourceCount / (sourceCount + targetCount);
        });
    }

    addRelation(relation) {
        let index = this.relations.list.length;
        relation.nodeSource = this.getNode(relation.source);
        relation.nodeTarget = this.getNode(relation.target);
        relation.index = index;
        //Generate the relation ID
        relation.id = (typeof relation.id === "string") ? relation.id : "relation" + index;
        this.relations.list.push(relation);
        //Map the relation ID
        this.relations.ids[relation.id] = index;
        //Save the relations between the nodes
        relation.nodeSource.relatedTo.push(relation.target);
        relation.nodeTarget.relatedTo.push(relation.source);
        //Relation force
        relation.force = 0;
    }
 
    getAllRelations() {
        return this.relations.list;
    }

    getRelation(id) {
        let index = this.relations.ids[id];
        return (index !== -1) ? this.relations.list[index] : null;
    }

    static getDefaultNodeDisplay() {
        return {
            x: null,
            y: null,
            ox: null,
            oy: null,
            vx: 0,
            vy: 0,
            fx: 0,
            fy: 0,
            size: 30,
            shape: "circle",
            hide: false,
            fill: "#1add9f",
            className: "",
            selected: false,
            fixed: false
        };
    }

    static getDefaultRelationDisplay() {
        return {};
    }
}
