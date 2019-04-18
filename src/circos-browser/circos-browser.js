class CircosBrowser { 
    constructor(parent, args, config) {
        /* 
         * args = {
         *    "layout": ,      //Layout configuration
         *    "tracks": [],    //Tracks list
         * };
         */
        this.parent = parent;
        //Default props
        this.layout = null;
        this.tracks = [];
        this.tracksDisplay = [];
        Object.assign(this, args);
        //Save the configuration
        this.config = Object.assign({}, this._getDefaultConfig(), config);
        //Init
        this.init();
    }
    //Init method
    init() {
        let self = this;
        let svgAttributes = {
            "width": this.config.width,
            "height": this.config.height
        };
        //Create the SVG object
        this.svg = SVG.addChild(this.parent, "svg", svgAttributes, null); 
        this.mainGroup = SVG.addChild(this.svg, "g", {}, null);
        //Check for no layout provided
        if (this.layout === null) {
            this.layout = new CircosLayout({}, {});
            //console.log(this.layout);
        }
        else {
            //Fetch data from cellbase
            //CellBaseManager.get({
            //    "species": this.config.specie,
            //    //"assembly": this.config.assembly,
            //    "category": "genomic",
            //    "subCategory": "chromosome",
            //    "host": this.config.cellbaseHost,
            //    "success": function (data) {
            //        console.log(data);
            //    }
            //});
        }
        //Build layout
        this.layout.init({
            "species": this.config.species,
            "assembly": this.config.assembly
        });
        //Create the group for each track
        this.tracks.forEach(function (track, index) {
            track.renderer.target = SVG.addChild(self.mainGroup, "g", {}, null);
        });
    }
    //Add a new track
    //addTrack(id, track) {
    //    this.tracks[id] = track;
    //    //Create a group where this track should be rendererd
    //    this.tracks[id].renderer.target = SVG.addChild(this.mainGroup, "g", {}, null);
    //}
    //Draw the circos
    draw(query) {
        let self = this;
        //Render all tracks when the layout is ready
        this.layout.onReady(function () {
            self._buildTracksDisplay();
            self.tracks.forEach(function (track, index) {
                console.log("Render track " + index);
                return track.draw({
                    "query": {
                        "species": self.config.species,
                        "assembly": self.config.assembly
                    },
                    "layout": self.layout,
                    "drawingZone": {
                        "innerRadius": self.tracksDisplay[index].innerRadius,
                        "outerRadius": self.tracksDisplay[index].outerRadius,
                        "center": {
                            "x": self.config.width / 2,
                            "y": self.config.height / 2
                        }
                    },
                    "config": {}
                });
            });
        });
    }
    //Build the tracks display
    _buildTracksDisplay() {
        let self = this;
        let tracksDisplay = this.tracks.map(function (track, index) {
            //Build an object with the track rank and the track size
            return {
                "index": index,
                "rank": track.config.rank,
                "size": track.config.size
            };
        });
        //Sort the tracks by the track rank
        tracksDisplay.sort(function (left, right) {
            return (left.rank < right.rank) ? -1 : 1;
        });
        //Reset the current tracks display object
        this.tracksDisplay = [];
        let currentRadius = this.config.trackOffset;
        tracksDisplay.forEach(function (track) {
            let innerRadius = currentRadius;
            let outerRadius = currentRadius + track.size;
            //Save the display for this track
            self.tracksDisplay[track.index] = {
                "innerRadius": innerRadius,
                "outerRadius": outerRadius
            };
            //Increment the current radius
            currentRadius = outerRadius + self.config.trackGap;
        });
        //Resize the SVG
        let scale = (this.config.width / 2) / currentRadius;
        let translate = (this.config.width / 2) * (1 - scale);
        this.mainGroup.setAttribute("transform", `translate(${translate},${translate}) scale(${scale})`);
    }
    //Get default configuration
    _getDefaultConfig() {
        return {
            "width": 400,
            "height": 400,
            "trackGap": 5,
            "trackOffset": 150,
            "species": "hsapiens",
            "assembly": "grch37"
        };
    }
}

