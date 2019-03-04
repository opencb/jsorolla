class CircosHistogramTrack extends CircosTrack {
    constructor(args, config) {
        super(args, config);
        //Check for no renderer provided
        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            this.renderer = new CircosHistogramRenderer({});
        }
        //Check for undefined data adapter
        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            this.dataAdapter = null; //??????
        }
    }
    //Draw this track
    draw(args) {
        let self = this;
        this.renderer.clean();
        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            //Render the histogram track with the provided data
            return this.renderer.render({
                "data": this.data,
                "layout": args.layout,
                "drawingZone": args.drawingZone,
                "config": args.config
            });
        }
        else {
            return null; //???????
        }
    }
}

