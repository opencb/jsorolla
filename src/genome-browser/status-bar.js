class StatusBar {

    constructor(args) {
        Object.assign(this, Backbone.Events);

        this.id = Utils.genId("StatusBar");

        this.target;
        this.autoRender = true;

        //set instantiation args, must be last
        Object.assign(this, args);

        //set new region object
        this.region = new Region(this.region);

        this.rendered = false;
        if (this.autoRender) {
            this.render();
        }
    }

    render() {

        this.div = $('<div id="' + this.id + '" class="ocb-gv-status-bar"></div>')[0];

        this.rightDiv = $('<div class="ocb-gv-status-right" id="' + this.id + 'position"</div>')[0];
        this.leftDiv = $('<div class="ocb-gv-status-left" id="' + this.id + 'position"></div>')[0];
        $(this.div).append(this.leftDiv);
        $(this.div).append(this.rightDiv);

        this.mousePositionEl = $('<span id="' + this.id + 'position"></span>')[0];
        this.mousePositionBase = document.createElement('span');
        this.mousePositionBase.style.marginRight = '5px';
        this.mousePositionRegion = document.createElement('span');
        this.mousePositionEl.appendChild(this.mousePositionBase);
        this.mousePositionEl.appendChild(this.mousePositionRegion);

        this.versionEl = $('<span id="' + this.id + 'version">' + this.version + '</span>')[0];
        $(this.rightDiv).append(this.mousePositionEl);
        $(this.leftDiv).append(this.versionEl);

        this.rendered = true;
    }

    draw () {
        this.targetDiv = (this.target instanceof HTMLElement) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
    }

    setRegion (event) {
        this.region.load(event.region);
        this.mousePositionBase.textContent = "";
        this.mousePositionRegion.textContent = this.region.chromosome + ':' + Utils.formatNumber(event.region.center());
    }

    setMousePosition (event) {
        this.mousePositionBase.style.color = SEQUENCE_COLORS[event.base];
        this.mousePositionBase.textContent = event.base;

        this.mousePositionRegion.textContent = this.region.chromosome + ':' + Utils.formatNumber(event.mousePos);
    }

}
