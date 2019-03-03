class CircosBrowser { 
    constructor(parent, config) {
        this.parent = parent;
        this.config = Object.assign({}, this._getDefaultConfig(), config);
        //Initialize the layout
        this.layout = null;
        //Tracks
        this.tracks = {};
        this.tracksDisplay = null;
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
        //Register all provided tracks in the config
        if (this.config.tracks !== null) {
            Object.keys(this.config.tracks).forEach(function (key) {
                self.addTrack(key, self.config.tracks[key]);
            });
        }
        //Check for predefined layout data
        if (this.config.layout.data !== null) {
            this.layout = new CircosLayout(this.config.layout.data, this.config.layout.config);
            console.log(this.layout);
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
    }
    //Add a new track
    addTrack(id, track) {
        this.tracks[id] = track;
        //Create a group where this track should be rendererd
        this.tracks[id].renderer.target = SVG.addChild(this.mainGroup, "g", {}, null);
    }
    //Draw the circos
    draw() {
        let self = this;
        if (this.tracksDisplay === null) {
            this._buildTracksDisplay();
        }
        //Render all tracks
        Object.keys(this.tracks).forEach(function (id) {
            console.log("Render track " + id);
            self.tracks[id].draw({
                "query": null,
                "layout": self.layout,
                "drawingZone": {
                    "innerRadius": self.tracksDisplay[id].innerRadius,
                    "outerRadius": self.tracksDisplay[id].outerRadius,
                    "center": {
                        "x": self.config.width / 2,
                        "y": self.config.height / 2
                    }
                },
                "config": {}
            });
        });
    }
    //Build the tracks display
    _buildTracksDisplay() {
        let self = this;
        let tracksDisplay = Object.keys(this.tracks).map(function (id) {
            //Build an object with the track rank and the track size
            return {
                "id": id,
                "rank": self.tracks[id].config.rank,
                "size": self.tracks[id].config.size
            };
        });
        //Sort the tracks by the track rank
        tracksDisplay.sort(function (left, right) {
            return (left.rank < right.rank) ? -1 : 1;
        });
        //Reset the current tracks display object
        this.tracksDisplay = {};
        let currentRadius = this.config.trackOffset;
        tracksDisplay.forEach(function (track) {
            let innerRadius = currentRadius;
            let outerRadius = currentRadius + track.size;
            //Save the display for this track
            self.tracksDisplay[track.id] = {
                "innerRadius": innerRadius,
                "outerRadius": outerRadius
            };
            //Increment the current radius
            currentRadius = outerRadius + self.config.trackGap;
        });
    }
    //Get default configuration
    _getDefaultConfig() {
        return {
            "width": 400,
            "height": 400,
            "trackGap": 5,
            "trackOffset": 150,
            "layout": {
                "data": null,
                "cellbase": null,
                "config": {
                    "gap": 0.04
                }
            }
        };
    }
}

