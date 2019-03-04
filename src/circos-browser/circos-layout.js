class CircosLayout {
    constructor(data, config) {
        this.config = Object.assign({}, this._getDefaultConfig(), config);
        this.init(data);
    }
    //Build the layout
    init(data) {
        let self = this;
        this.blocks = {};
        this.totalSize = 0;
        let currentTotalSize = 0;
        data.forEach(function (item) {
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
        let remainAngle = 2 * Math.PI - (blocksCount * this.config.gap);
        //Set the blocks start and end angle positions
        Object.keys(this.blocks).forEach(function (key, index) {
            let block = self.blocks[key];
            //Set the block start angle
            block.startAngle = (block.offset / self.totalSize) * remainAngle + index * self.config.gap;
            //Set the block end angle
            block.endAngle = ((block.offset + block.length) / self.totalSize) * remainAngle + index * self.config.gap;
            block.diffAngle = block.endAngle - block.startAngle;
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
    //Get default configuration object
    _getDefaultConfig() {
        return {
            "gap": 0.04
        };
    }
}

