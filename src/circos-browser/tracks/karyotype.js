class CircosKaryotypeTrack extends CircosTrack {
    constructor(args, config) {
        super(args, config);
        //Check for no renderer provided
        if (UtilsNew.isUndefinedOrNull(this.renderer)) {
            this.renderer = new CircosKaryotypeRenderer({});
        }
        //Check for undefined data adapter
        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            this.dataAdapter = new CellBaseAdapter(new CellBaseClient(), "genomic", "chromosome", "search", {});
        }
    }
    //Draw this track
    draw(args) {
        let self = this;
        //Clean the track
        this.renderer.clean();
        //Function to render the data provided as an argument
        let renderData = function (data) {
            return self.renderer.render({
                "data": data,
                "layout": args.layout,
                "drawingZone": args.drawingZone,
                "config": args.config
            });
        };
        //Check for initial data provided to the track
        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            return renderData(this.data);
        }
        //Check if a query has been provided
        else if (UtilsNew.isNotUndefinedOrNull(args.query)) {
            if (UtilsNew.isNotUndefinedOrNull(this.dataAdapter)) {
                let request = this.dataAdapter.getData(args.query);
                request.then(function (response) {
                    return renderData(response.items[0].result[0].chromosomes);
                });
                request.catch(function (response) {
                    console.error(response);
                });
            }
        }
    }
}

