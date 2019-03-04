class CircosKaryotypeRenderer extends CircosRenderer {
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
        //For each chromosome
        args.data.forEach(function (chr) {
            //Get the block for this item
            let block = args.layout.getBlock(chr.name);
            //Check for undefined block
            if (typeof block === "undefined") {
                return;
            }
            //For each cytoband
            chr.cytobands.forEach(function (item) {
                let rStart = (item.stain === "acen") ? innerRadius + 2 : innerRadius;
                let rEnd = (item.stain === "acen") ? outerRadius - 2 : outerRadius;
                let startAngle = block.startAngle + (item.start / block.length) * block.diffAngle;
                let endAngle = block.startAngle + (item.end / block.length) * block.diffAngle;
                let innerStart = CircosUtils.polarToCartesian(center.x, center.y, rStart, startAngle - Math.PI / 2);
                let innerEnd = CircosUtils.polarToCartesian(center.x, center.y, rStart, endAngle - Math.PI / 2);
                let outerStart = CircosUtils.polarToCartesian(center.x, center.y, rEnd, startAngle - Math.PI / 2);
                let outerEnd = CircosUtils.polarToCartesian(center.x, center.y, rEnd, endAngle - Math.PI / 2);
                //Calculate the arc flag value
                let arcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
                //Build the path
                let path = [];
                path.push(`M ${innerStart.x},${innerStart.y}`);
                path.push(`A ${innerRadius} ${innerRadius} 0 ${arcFlag} 1 ${innerEnd.x},${innerEnd.y}`);
                path.push(`L ${outerEnd.x},${outerEnd.y}`);
                path.push(`A ${outerRadius} ${outerRadius} 0 ${arcFlag} 0 ${outerStart.x},${outerStart.y}`);
                path.push("Z");
                let color = config.stainColors[item.stain];
                //Append the path element
                SVG.addChild(self.target, "path", {
                    "fill": config.stainColors[item.stain],
                    "d": path.join(" "),
                    "opacity": "0.9"
                }, null);
            });
        });
    }
    //Karyotype renderer default config
    _getDefaultConfig() {
        return {
            "stainColors": {
                "acen": "#d92722",
                "gpos": "#000000",
                "gpos100": "#000000",
                "gpos75": "#827d79",
                "gpos66": "#a0a8ab",
                "gpos50": "#c8cacb",
                "gpos33": "#d2d4d5",
                "gpos25": "#c8cacb",
                "gvar": "#dbdde1",
                "gneg": "#ffffff",
                "stalk": "#6471a4",
                "select": "#87b1ff"
            }
        };
    }
}

