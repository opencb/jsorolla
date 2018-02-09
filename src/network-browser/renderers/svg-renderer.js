class SvgNetworkRenderer {
    constructor() {
        //Could it be possible to extend the class Backbone? (if it is a class...)
        //Object.assign(this, Backbone.Events);

        this.parent = null;
        this.nodesGroup = null;
        this.relationsGroup = null;

        this.shapes = null;
    }

    init(parentDiv, config) {
        //Build the svg container
        let attributes = {width: config.width, height: config.height};
        this.parent = SvgNetworkRenderer.addChild(parentDiv, "svg", attributes);
        this.relationsGroup = SvgNetworkRenderer.addChild(this.parent, "g", {id: "network-relations"});
        this.nodesGroup = SvgNetworkRenderer.addChild(this.parent, "g", {id: "network-nodes"});

        //Save the shapes
        this.shapes = config.shapes;
    }

    getWidth() {
        return this.parent.getBoundingClientRect().width;
    }

    getHeight() {
        return this.parent.getBoundingClientRect().height;
    }

    getCenter() {
        return {x: this.getWidth() / 2, y: this.getHeight() / 2};
    }

    drawNode(node) {
        let self = this;
        let display = node.display;
        let nodeGroup = SvgNetworkRenderer.addChild(this.nodesGroup, "g", {id: node.id});

        //Create the node
        let path = this.shapes[display.shape](display.size);
        let attr = {d: path, fill: display.color};
        SvgNetworkRenderer.addChild(nodeGroup, "path", attr);

        //Create the node label
        let text = "Node " + node.index;
        let nodeText = SvgNetworkRenderer.addChild(nodeGroup, "text", {"text-anchor": "middle"});
        nodeText.innerHTML = text;
        nodeText.setAttribute("transform", "translate(0, " + (display.size * 1.5) + ")");

        //Move the group
        nodeGroup.setAttribute("transform", "translate(" + display.x + ", " + display.y + ")");

        /*
        nodeCircle.addEventListener("mousedown", function(event){
            return self.onNodeClick(event);
        }, false);
        nodeCircle.addEventListener("dblclick", function(event){
            return self.onNodeDblClick(event);
        }, false);
        */
    }

    onNodeClick(event) {
        console.log("Regular click event");
        let nodeId = event.path[1].getAttribute("id");
        console.log(nodeId);
        console.log(event);
    }

    onNodeDblClick(event){
        console.log("Double click event");
        console.log(event);
    }

    drawRelation(relation) {
        let source = relation.nodeSource.display;
        let target = relation.nodeTarget.display;
        let attributes = {
            id: relation.id,
            x1: source.x,
            y1: source.y,
            x2: target.x,
            y2: target.y,
            style: "stroke-width:1px;stroke:#000000;"
        };
        SvgNetworkRenderer.addChild(this.relationsGroup, "line", attributes);
    }

    static addChild(parent, elementName, elementAttributes) {
        let el = document.createElementNS("http://www.w3.org/2000/svg", elementName);
        Object.keys(elementAttributes).forEach(function(key){
            el.setAttribute(key, elementAttributes[key]);
        });
        parent.appendChild(el);
        return el;
    }
}
