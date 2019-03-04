class CircosChordsRenderer extends CircosRenderer {
    constructor(config) {
        super();
        this.config = Object.assign({}, this._getDefaultConfig(), config);
    }
    //Get start and end angles for the given interval of a chromosome
    getAngles(item, layout) {
        let block = layout.getBlock(item.name);
        return {
            "start": block.startAngle + block.diffAngle * (item.start / block.length),
            "end": block.startAngle + block.diffAngle * (item.end / block.length)
        };
    }   
    //Chords track render
    render(args) {
        let self = this;
        let config = Object.assign({}, this.config, args.config);
        let center = args.drawingZone.center;
        //let innerRadius = args.drawingZone.innerRadius;
        let radius = args.drawingZone.outerRadius;
        //Build the chords
        args.data.forEach(function (item) {
            //Get the source and target angles
            let sourceAngle = self.getAngles(item.source, args.layout, radius);
            let targetAngle = self.getAngles(item.target, args.layout, radius);
            //Get the coordinates
            let sourceStart = CircosUtils.polarToCartesian(center.x, center.y, radius, sourceAngle.start - Math.PI / 2);
            let sourceEnd = CircosUtils.polarToCartesian(center.x, center.y, radius, sourceAngle.end - Math.PI / 2);
            let targetStart = CircosUtils.polarToCartesian(center.x, center.y, radius, targetAngle.start - Math.PI / 2);
            let targetEnd = CircosUtils.polarToCartesian(center.x, center.y, radius, targetAngle.end - Math.PI / 2);
            //Calculate the arc flag value
            let arcFlagSource = sourceAngle.end - sourceAngle.start <= Math.PI ? "0" : "1";
            let arcFlagTarget = targetAngle.end - targetAngle.start <= Math.PI ? "0" : "1";
            //Build the path
            let path = [];
            path.push(`M ${sourceStart.x},${sourceStart.y}`);
            path.push(`A ${radius} ${radius} 0 ${arcFlagSource} 1 ${sourceEnd.x},${sourceEnd.y}`);
            path.push(`Q ${center.x},${center.y} ${targetEnd.x},${targetEnd.y}`);
            path.push(`A ${radius} ${radius} 0 ${arcFlagTarget} 1 ${targetStart.x},${targetStart.y}`);
            path.push(`Q ${center.x},${center.y} ${sourceStart.x},${sourceStart.y}`);
            path.push("Z");
            //Add the path
            SVG.addChild(self.target, "path", {
                "fill": "#000000",
                "stroke": "#000000",
                "stroke-width": "1",
                "d": path.join(" "),
                "opacity": "0.3"
            }, null);
        });
    }
    //Get default config
    _getDefaultConfig() {
        return {};
    }
}

