class CircosTrack {
    constructor(args, config) {
        //Save the track configuration
        this.config = Object.assign({}, this._getDefaultConfig(), config);
        //Data configuration
        this.data = null;
        this.dataAdapter = null;
        //Renderer
        this.renderer = null;
        //Assign track arguments
        Object.assign(this, args);
        //Extend backbone events
        //Object.assign(this, Backbone.Events);
    }
    //Get default config
    _getDefaultConfig() {
        return {
            "size": 40,
            "rank": 1
        };
    }
}

