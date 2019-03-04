class CircosHistogramRenderer extends CircosRenderer {
    constructor(config) {
        super();
        this.config = Object.assign({}, this._getDefaultConfig(), config);
    }
    //Render the karyotype
    render(args) {
        let self = this;
        let config = Object.assign({}, this.config, args.config);
        let center = args.drawingZone.center;
        let innerRadius = args.drawingZone.innerRadius;
        let outerRadius = args.drawingZone.outerRadius;
        //Difference radius
        let diffRadius = outerRadius - innerRadius;
        //Max value
        let maxValue = 100;
        //For each chromosome in the data object
        args.data.forEach(function (chromosome) {
            let block = args.layout.getBlock(chromosome.name);
            //Check if block is not defined
            if (typeof block === "undefined") {
                return null;
            }
            //Iterate over all values
            chromosome.values.forEach(function (item) {
                let height = innerRadius + diffRadius * (item.value / maxValue);
                let startAngle = block.startAngle + (item.start / block.length) * block.diffAngle;
                let endAngle = block.startAngle + (item.end / block.length) * block.diffAngle;
                let innerStart = CircosUtils.polarToCartesian(center.x, center.y, innerRadius, startAngle - Math.PI / 2);
                let innerEnd = CircosUtils.polarToCartesian(center.x, center.y, innerRadius, endAngle - Math.PI / 2);
                let outerStart = CircosUtils.polarToCartesian(center.x, center.y, height, startAngle - Math.PI / 2);
                let outerEnd = CircosUtils.polarToCartesian(center.x, center.y, height, endAngle - Math.PI / 2);
                //Calculate the arc flag value
                let arcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
                //Build the path
                let path = [];
                path.push(`M ${innerStart.x},${innerStart.y}`);
                path.push(`A ${innerRadius} ${innerRadius} 0 ${arcFlag} 1 ${innerEnd.x},${innerEnd.y}`);
                path.push(`L ${outerEnd.x},${outerEnd.y}`);
                path.push(`A ${outerRadius} ${outerRadius} 0 ${arcFlag} 0 ${outerStart.x},${outerStart.y}`);
                path.push("Z");
                //Append the path element
                SVG.addChild(self.target, "path", {
                    "fill": "#000000",
                    "d": path.join(" "),
                    "opacity": "0.9"
                }, null);
            });
        });
    }
    //Get default config
    _getDefaultConfig() {
        return {};
    }
}

