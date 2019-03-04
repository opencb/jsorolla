class CircosChordsTrack extends CircosTrack {
    constructor(args, config) {
        super(args, config);
        //Check for no renderer provided
        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            this.renderer = new CircosChordsRenderer({});
        }
        //Check for undefined data adapter
        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            this.dataAdapter = null; //??????
        }
    }
    //Draw the chords track
    draw(args) {
        let self = this;
        this.renderer.clean();
        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            //Render the chords track with the provided data
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

