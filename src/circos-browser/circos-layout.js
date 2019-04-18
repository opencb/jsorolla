class CircosLayout {
    constructor(args, config) {
        this.dataAdapter = null;
        this.dataParser = null;
        this.data = null;
        Object.assign(this, args);
        //Save the layout configuration
        this.config = Object.assign({}, this._getDefaultConfig(), config);
        //Check for no dataAdapter provided
        if (UtilsNew.isUndefinedOrNull(this.dataAdapter)) {
            this.dataAdapter = new CellBaseAdapter(new CellBaseClient(), "genomic", "chromosome", "search", {});
        }
        //Check for no data parser provided
        if (typeof this.dataParser !== "function") {
            this.dataParser = function (data) {
                return data;
            };
        }
        this.isReady = false;
        this.readyListeners = [];
        //this.init();
    }
    //Build the layout
    init(query) {
        let self = this;
        //Check for data provided
        if (UtilsNew.isNotUndefinedOrNull(this.data)) {
            return this._build(this.data);
        }
        else if (UtilsNew.isNotUndefinedOrNull(this.dataAdapter)) {
            //Import data using the dataadapter
            let request = this.dataAdapter.getData(query);
            request.then(function (response) {
                return self._build(response.items[0].result[0].chromosomes);
            });
            //Error fetching data
            request.catch(function (error) {
                return console.error("Error fetching layout data");
            });
        }
    }
    //Build the layout from a data
    _build(data) {
        let self = this;
        this.blocks = {};
        this.totalSize = 0;
        let currentTotalSize = 0;
        //Parse the provided data and build the layout blocks
        this.dataParser(data).forEach(function (item) {
            if (typeof self.blocks[item.name] !== "undefined") {
                console.log(item);
                return null;
            }
            //Build the block object
            let block = {
                "length": (typeof item.size === "number") ? item.size : item.end - item.start + 1,
                "startAngle": null,
                "endAngle": null,
                "diffAngle": null,
                "offset": currentTotalSize,
                "data": item
            };
            //Update the current total size
            currentTotalSize = currentTotalSize + block.length;
            //Save the block
            self.blocks[item.name] = block;
        });
        this.totalSize = currentTotalSize;
        let blocksCount = Object.keys(this.blocks).length;
        //Calculate the total space gap angle between blocks
        let remainAngle = 2 * Math.PI - (blocksCount * self.config.gap);
        //Set the blocks start and end angle positions
        Object.keys(this.blocks).forEach(function (key, index) {
            let block = self.blocks[key];
            //Set the block start angle
            block.startAngle = (block.offset / self.totalSize) * remainAngle + index * self.config.gap;
            //Set the block end angle
            block.endAngle = ((block.offset + block.length) / self.totalSize) * remainAngle + index * self.config.gap;
            block.diffAngle = block.endAngle - block.startAngle;
        });
        //Layout built
        self.isReady = true;
        //Call all listeners provided
        self.readyListeners.forEach(function (listener) {
            return listener();
        });
    }
    //Get a single block
    getBlock(id) {
        return this.blocks[id];
    }
    //Get all blocks
    getAllBlocks() {
        let self = this;
        return Object.keys(this.blocks).map(function (key) {
            return self.blocks[key];
        });
    }
    //Run the provided function when the layout is ready
    onReady(callback) {
        if (this.isReady === true) {
            return callback();
        }
        //Save this function to run after layout is ready
        this.readyListeners.push(callback);
    }
    //Get default configuration object
    _getDefaultConfig() {
        return {
            "gap": 0.04
        };
    }
}

