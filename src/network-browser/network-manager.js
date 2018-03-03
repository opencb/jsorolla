class NetworkManager {
    constructor(data) {
        this.data = data;
        this.nodesIds = {};
        this.relationsIds = {};
    }

    init(center) {
        this.initializeNodes(center);
        this.initializeRelations();
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
        this.data.relations.forEach(function(relation, index){
            let sourceCount = relation.nodeSource.relatedTo.length;
            let targetCount = relation.nodeTarget.relatedTo.length;
            relation.force = sourceCount / (sourceCount + targetCount);
        });
    }

    moveNode(id, x, y) {
        let node = this.getNodeById(id);
        node.display.x = x;
        node.display.y = y;
        return node;
    }

    getNodes() {
        return this.data.nodes;
    }

    getNodeByIndex(index) {
        return this.data.nodes[index];
    }

    getPathById(id) {
        let self = this;
        let path = [];
        let findRelation = function (node) {
            if (path.indexOf(node) === -1) {
                path.push(node);
                let relations = self.getNodeById(node).relatedTo;
                for (let i = 0; i < relations.length; i++) {
                    findRelation(relations[i]);
                }
            }
        };
        findRelation(id);
        return path;
    }


    getNodeById(id) {
        let index = this.nodesIds[id];
        return (index !== -1) ? this.data.nodes[index] : null;
    }

    getRelations() {
        return this.data.relations;
    }

    getRelationByIndex(index) {
        return this.data.relations[index];
    }

    getRelationById(id) {
        let index = this.relationsIds[id];
        return (index !== -1) ? this.data.relations[index] : null;
    }

    static
    getDefaultNodeDisplay() {
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
}
