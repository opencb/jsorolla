//Base circos renderer
class CircosRenderer {
    constructor() {
        //this.config = config;
        this.target = null;
    }
    //Clean the renderer
    clean() {
        while (this.target.firstChild) {
            this.target.removeChild(this.target.firstChild);
        }
    }
}

