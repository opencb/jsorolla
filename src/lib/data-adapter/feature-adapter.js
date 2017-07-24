
class FeatureAdapter {

    constructor(options) {
        this.options = options;
        // this.handlers = handlers;

        // if (!this.options.hasOwnProperty("chunkSize")) {
        //     this.options.chunkSize = 10000;
        // }
        //
        // // Extend backbone events
        // Object.assign(this, Backbone.Events);
        // // _.extend(this, args);
        // this.on(this.handlers);
    }

    _checkRegion(region) {
        // Check region is a valid object
        if (region === undefined || region === null) {
            return undefined;
        }

        // Check start is >= 1
        region.start = Math.max(region.start, 1);

        // Check end >= start
        if (region.start > region.end) {
            console.warn("Swapping start and end positions: ", region);
            [region.start, region.end] = [region.end, region.start];
        }

        return region;
    }

    // This function must be implemented by any child
    getData() {

    }

}