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
        //Function to render the track with the provided data
        let renderData = function (data) {
            return self.renderer.render({
                "data": data,
                "layout": args.layout,
                "drawingZone": args.drawingZone,
                "config": args.config
            });
        };
        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            //Render the histogram track with the provided data
            return renderData(this.data);
        }
        //Check if a query has been provided
        else if (UtilsNew.isNotUndefinedOrNull(args.query)) {
            if (UtilsNew.isNotUndefinedOrNull(this.dataAdapter)) {
                let request = this.dataAdapter.getData(args.query);
                request.then(function (response) {
                    return renderData(response);
                });
                request.catch(function (response) {
                    console.error(response);
                });
            }
        }
    }
}

