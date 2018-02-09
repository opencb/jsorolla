cclass NetworkManager {
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
        let initialRadius = 40;
        this.data.nodes.forEach(function (node, index) {
            if (typeof node.display !== "object" || node.display === null) {
                node.display = NetworkManager.getDefaultNodeDisplay();
            }
            if (!node.display.x || !node.display.y) {
                let radius = initialRadius * Math.sqrt(index);
                let angle = index * initialAngle;
                node.display.x = center.x + radius * Math.cos(angle);
                node.display.y = center.y + radius * Math.sin(angle);
            }
            node.index = index;
            node.id = (typeof node.id === "string") ? node.id : "node" + index;
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
        });
    }

    getNodes() {
        return this.data.nodes;
    }

    getNodeByIndex(index) {
        return this.data.nodes[index];
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

    static getDefaultNodeDisplay() {
        return {
            x: null,
            y: null,
            size: 12,
            shape: "circle",
            hide: false,
            color: "#000000",
            className: ""
        };
    }
}
