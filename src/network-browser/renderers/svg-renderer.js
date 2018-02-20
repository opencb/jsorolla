class SvgNetworkRenderer {
    constructor() {
        //Could it be possible to extend the class Backbone? (if it is a class...)
        Object.assign(this, Backbone.Events);

        this.svg = null;
        this.nodesGroup = null;
        this.relationsGroup = null;
        this.shapes = null;

        this.clickEvent = {active: false, initialX: 0, initialY: 0, currentX: 0, currentY: 0};
    }

    init(parent, config) {
        let self = this;

        //Build the svg container
        let attributes = {width: config.width, height: config.height};
        this.svg = SvgNetworkRenderer.addChild(parent, "svg", attributes);
        this.svg.addEventListener("mousedown", function (e) {
            return self.onMouseDown(e);
        }, false);
        this.svg.addEventListener("mousemove", function (e) {
            return self.onMouseMove(e);
        }, false);
        this.svg.addEventListener("mouseup", function (e) {
            return self.onMouseUp(e);
        }, false);
        this.svg.addEventListener("mouseleave", function (e) {
            return self.onMouseLeave(e);
        }, false);

        //Add groups
        this.relationsGroup = SvgNetworkRenderer.addChild(this.svg, "g", {id: "network-relations"});
        this.nodesGroup = SvgNetworkRenderer.addChild(this.svg, "g", {id: "network-nodes"});

        //Save the shapes
        this.shapes = config.shapes;
    }

    getWidth() {
        return this.svg.getBoundingClientRect().width;
    }

    getHeight() {
        return this.svg.getBoundingClientRect().height;
    }

    getCenter() {
        return {x: this.getWidth() / 2, y: this.getHeight() / 2};
    }

    onMouseDown(event) {
        let target = event.target;
        let nodeID = null;
        if (target.tagName === "path" && typeof target.dataset.nodeId === "string") {
            nodeID = target.dataset.nodeId;
        }
        this.clickEvent.active = true;
        //Save the initial click coordinates
        this.clickEvent.initialX = event.offsetX;
        this.clickEvent.initialY = event.offsetY;
        this.clickEvent.currentX = event.offsetX;
        this.clickEvent.currentY = event.offsetY;
        return this.trigger("mousedown", event, this.clickEvent, nodeID);
    }

    onMouseMove(event) {
        if (this.clickEvent.active === true) {
            //Save the current cursor position and emit the mouse move event
            this.clickEvent.currentX = event.offsetX;
            this.clickEvent.currentY = event.offsetY;
            return this.trigger("mousemove", event, this.clickEvent);
        }
    }

    onMouseUp(event) {
        if (this.clickEvent.active === true) {
            //Disable the click event and emit the mouse up event
            this.clickEvent.active = false;
            return this.trigger("mouseup", event);
        }
    }

    onMouseLeave(event) {
        if (this.clickEvent.active === true) {
            //Disable the click event and emit the mouse leave event
            this.clickEvent.active = false;
            return this.trigger("mouseleave", event);
        }
    }

    drawNode(node) {
        let self = this;
        let display = node.display;
        let nodeGroup = SvgNetworkRenderer.addChild(this.nodesGroup, "g", {id: node.id});

        //Create the node
        let path = this.shapes[display.shape](display.size);
        let nodePath = SvgNetworkRenderer.addChild(nodeGroup, "path", {d: path});
        nodePath.dataset.nodeId = node.id;
        nodePath.setAttribute("stroke", "#ffffff");
        nodePath.setAttribute("stroke-width", "5px");
        nodePath.setAttribute("fill", node.display.fill);

        //Create the node label
        let text = "Node " + node.index;
        let nodeText = SvgNetworkRenderer.addChild(nodeGroup, "text", {"text-anchor": "middle"});
        nodeText.innerHTML = text;
        nodeText.setAttribute("transform", "translate(0, " + (display.size * 0.9) + ")");
        nodeText.setAttribute("style", "user-select:none;font-size:12px;fill:#697496;");

        //Move the group
        nodeGroup.setAttribute("transform", "translate(" + display.x + ", " + display.y + ")");
    }

    moveNode(node) {
        //Move the node
        let nodeGroup = this.nodesGroup.querySelectorAll("#" + node.id)[0];
        nodeGroup.setAttribute("transform", "translate(" + node.display.x + ", " + node.display.y + ")");

        //Move all the relations where the node is the source
        let relationsSource = this.relationsGroup.querySelectorAll("[data-node-source='" + node.id + "']");
        for (let i = 0; i < relationsSource.length; i++) {
            relationsSource[i].setAttribute("x1", node.display.x);
            relationsSource[i].setAttribute("y1", node.display.y);
        }

        //Move all the relations where the node is the target
        let relationsTarget = this.relationsGroup.querySelectorAll("[data-node-target='" + node.id + "']");
        for (let i = 0; i < relationsTarget.length; i++) {
            relationsTarget[i].setAttribute("x2", node.display.x);
            relationsTarget[i].setAttribute("y2", node.display.y);
        }
    }

    bringNodeToTop(node) {
        let nodeGroup = this.nodesGroup.querySelectorAll('#' + node.id)[0];
        this.nodesGroup.appendChild(nodeGroup);
    }

    drawRelation(relation) {
        let source = relation.nodeSource.display;
        let target = relation.nodeTarget.display;
        let attributes = {
            id: relation.id,
            x1: source.x,
            y1: source.y,
            x2: target.x,
            y2: target.y
        };
        let r = SvgNetworkRenderer.addChild(this.relationsGroup, "line", attributes);
        r.setAttribute("stroke", "#d7e4f4");
        r.setAttribute("stroke-width", "2px");
        r.dataset["nodeSource"] = relation.nodeSource.id;
        r.dataset["nodeTarget"] = relation.nodeTarget.id;
    }

    static addChild(parent, elementName, elementAttributes) {
        let el = document.createElementNS("http://www.w3.org/2000/svg", elementName);
        Object.keys(elementAttributes).forEach(function (key) {
            el.setAttribute(key, elementAttributes[key]);
        });
        parent.appendChild(el);
        return el;
    }
}
