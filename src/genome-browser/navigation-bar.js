class NavigationBar {

    constructor(args) {
        Object.assign(this, Backbone.Events);

        this.id = Utils.genId("NavigationBar");

        this.target;
        this.autoRender = true;

        this.cellBaseHost = 'http://bioinfo.hpc.cam.ac.uk/cellbase';
        this.cellBaseVersion = 'v3';

        this.species = 'Homo sapiens';
        this.increment = 3;
        this.componentsConfig = {
            menuButton: false,
            leftSideButton: false,
            restoreDefaultRegionButton: true,
            regionHistoryButton: true,
            speciesButton: true,
            chromosomesButton: true,
            karyotypeButtonLabel: true,
            chromosomeButtonLabel: true,
            regionButtonLabel: true,
            zoomControl: true,
            windowSizeControl: true,
            positionControl: true,
            moveControl: true,
            autoheightButton: true,
            compactButton: true,
            searchControl: true
        };
        this.zoom = 50;

        this.quickSearchDisplayKey = 'name';


        Object.assign(this.componentsConfig, args.componentsConfig);
        delete args.componentsConfig;

        //set instantiation args, must be last
        Object.assign(this, args);


        //set new region object
        this.region = new Region(this.region);

        this.currentChromosomeList = [];

        this.on(this.handlers);


        this.els = {};
        this.zoomChanging = false;
        this.regionChanging = false;

        this.rendered = false;
        if (this.autoRender) {
            this.render();
        }
    }


    render() {
        let _this = this;


        let HTML = '' +
            '<div title="Restore previous region" style="margin-right: 5px;" id="leftSideButton" class="ocb-ctrl"><i class="fa fa-navicon"></i></div>' +
            '<div id="restoreDefaultRegionButton" class="ocb-ctrl"><i class="fa fa-repeat"></i></div>' +

            '<div title="Region history" class="ocb-dropdown" style="margin-left: 5px">' +
            '   <div tabindex="-1" id="regionHistoryButton" class="ocb-ctrl"><i class="fa fa-history"></i> <i class="fa fa-caret-down"></i></div>' +
            '   <ul id="regionHistoryMenu"></ul>' +
            '</div>' +

            '<div title="Species menu" class="ocb-dropdown" style="margin-left: 5px">' +
            '   <div tabindex="-1" id="speciesButton" class="ocb-ctrl"><span id="speciesText"></span> <i class="fa fa-caret-down"></i></div>' +
            '   <ul id="speciesMenu"></ul>' +
            '</div>' +

            '<div title="Chromosomes menu" class="ocb-dropdown" style="margin-left: 5px">' +
            '   <div tabindex="-1" id="chromosomesButton" class="ocb-ctrl"><span id="chromosomesText"></span> <i class="fa fa-caret-down"></i></div>' +
            '   <ul id="chromosomesMenu" style="height: 200px; overflow-y: auto;"></ul>' +
            '</div>' +

            '<div style="margin-left: 5px; float: left; " >' +
            '   <label title="Toggle karyotype panel" class="ocb-ctrl" id="karyotypeButtonLabel"><input id="karyotypeButton" type="checkbox"><span style="border-right: none"><span class="ocb-icon ocb-icon-karyotype"></span></span></label>' +
            '   <label title="Toggle chromosome panel" class="ocb-ctrl" id="chromosomeButtonLabel"><input id="chromosomeButton" type="checkbox"><span style="border-right: none"><span class="ocb-icon ocb-icon-chromosome"></span></span></label>' +
            '   <label title="Toggle overview panel" class="ocb-ctrl" id="regionButtonLabel"><input id="regionButton" type="checkbox"><span><span class="ocb-icon ocb-icon-region"></span></span></label>' +
            '</div>' +


            '<div id="zoomControl" style="float:left;">' +
            '<div title="Minimum window size" id="zoomMinButton" class="ocb-ctrl" style="margin-left: 5px;border-right: none;">Min</div>' +
            '<div title="Decrease window size" id="zoomOutButton" class="ocb-ctrl"><span class="fa fa-minus"></span></div>' +
            '<div id="progressBarCont" class="ocb-zoom-bar">' +
            '   <div id="progressBar" class="back"></div>' +
            '   <div id="progressBar" class="rect" style="width: ' + this.zoom + '%"></div>' +
            '   <div id="progressBarBall" class="ball" style="left: ' + this.zoom + '%"></div>' +
            '</div>' +
            '<div title="Increase window size" id="zoomInButton" class="ocb-ctrl" style="border-right: none;"><span class="fa fa-plus"></span></div>' +
            '<div title="Maximum window size" id="zoomMaxButton" class="ocb-ctrl">Max</div>' +
            '</div>' +


            '<div title="Window size (Nucleotides)" id="windowSizeControl" style="float:left;margin-left: 5px;">' +
            '<input id="windowSizeField" class="ocb-ctrl"  type="text" style="width: 70px;">' +
            '</div>' +


            '<div title="Position" id="positionControl" style="float:left;margin-left: 5px">' +
            '<input id="regionField" class="ocb-ctrl" placeholder="1:10000-20000" type="text" style="width: 170px;">' +
            '<div id="goButton" class="ocb-ctrl" style="border-left: none;">Go!</div>' +
            '</div>' +


            '<div id="moveControl" style="float:left;font-size:18px;">' +
            '<div id="moveFurtherLeftButton" class="ocb-ctrl" style="border-right: none;margin-left: 5px;"><i class="fa fa-angle-double-left"></i></div>' +
            '<div id="moveLeftButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-angle-left"></i></div>' +
            '<div id="moveRightButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-angle-right"></i></div>' +
            '<div id="moveFurtherRightButton" class="ocb-ctrl"><i class="fa fa-angle-double-right"></i></div>' +
            '</div>' +

            '<label class="ocb-ctrl"><input type="checkbox" id="autoheightButton"><span style="margin-left: 5px;font-size:18px;"><i class="fa fa-compress"></i></span></label>' +

            '<div id="searchControl" style="float:left;">' +
            '<input id="searchField" class="ocb-ctrl"  list="searchDataList"  placeholder="gene" type="text" style="width: 90px;margin-left: 5px;">' +
            '       <datalist id="searchDataList">' +
            '       </datalist>' +
            '<div id="quickSearchButton" class="ocb-ctrl" style="border-left: none;"><i class="fa fa-search"></i></div>' +
            '</div>' +


            '<div style="float:right;margin-right:10px;" id="menuButton" class="ocb-ctrl"><i class="fa fa-navicon"></i> Configure</div>' +
            '';

        /**************/
        this.div = document.createElement('div');
        this.div.setAttribute('class', "ocb-gv-navigation-bar unselectable");
        this.div.innerHTML = HTML;

        let els = this.div.querySelectorAll('[id]');
        for (let i = 0; i < els.length; i++) {
            let elid = els[i].getAttribute('id');
            if (elid) {
                this.els[elid] = els[i];
            }
        }
        /**************/


        /**Check components config**/
        for (let key in this.componentsConfig) {
            if (!this.componentsConfig[key]) {
                this.els[key].classList.add('hidden');
            }
        }
        /*****/

        this.els.karyotypeButton.checked = (this.karyotypePanelConfig.hidden) ? false : true;
        this.els.chromosomeButton.checked = (this.chromosomePanelConfig.hidden) ? false : true;
        this.els.regionButton.checked = (this.regionPanelConfig.hidden) ? false : true;


        /*** ***/

        this.els.menuButton.addEventListener('click', function(e) {
            _this.trigger('menuButton:click', {clickEvent: e, sender: {}});
        });

        this.els.leftSideButton.addEventListener('click', function(e) {
            _this.trigger('leftSideButton:click', {clickEvent: e, sender: {}});
        });

        this.els.restoreDefaultRegionButton.addEventListener('click', function(e) {
            _this.trigger('restoreDefaultRegion:click', {clickEvent: e, sender: {}});
        });


        this._addRegionHistoryMenuItem(this.region);
        this._setChromosomeMenu();
        this._setSpeciesMenu();
        this.els.chromosomesText.textContent = this.region.chromosome;
        this.els.speciesText.textContent = this.species.scientificName;


        this.els.karyotypeButton.addEventListener('click', function() {
            _this.trigger('karyotype-button:change', {selected: this.checked, sender: _this});
        });
        this.els.chromosomeButton.addEventListener('click', function() {
            _this.trigger('chromosome-button:change', {selected: this.checked, sender: _this});
        });
        this.els.regionButton.addEventListener('click', function() {
            _this.trigger('region-button:change', {selected: this.checked, sender: _this});
        });


        this.els.zoomOutButton.addEventListener('click', function() {
            _this._handleZoomOutButton();
        });
        this.els.zoomInButton.addEventListener('click', function() {
            _this._handleZoomInButton();
        });
        this.els.zoomMaxButton.addEventListener('click', function() {
            _this._handleZoomSlider(100);
        });
        this.els.zoomMinButton.addEventListener('click', function() {
            _this._handleZoomSlider(0);
        });


        let zoomBarMove = function(e) {
            let progressBarCont = _this.els.progressBarCont;
            let br = progressBarCont.getBoundingClientRect();
            let offsetX = e.clientX - br.left;
            let zoom = 100 / parseInt(getComputedStyle(progressBarCont).width) * offsetX;
            if (zoom > 0 && zoom < 100) {
                _this.els.progressBarBall.style.left = zoom + '%';
            }
        };
        this.els.progressBarCont.addEventListener('click', function(e) {
            let br = this.getBoundingClientRect();
            let offsetX = e.clientX - br.left;
            let zoom = 100 / parseInt(getComputedStyle(this).width) * offsetX;
            _this._handleZoomSlider(zoom);

            this.removeEventListener('mousemove', zoomBarMove);
        });
        this.els.progressBarBall.addEventListener('mousedown', function(e) {
            _this.els.progressBarCont.addEventListener('mousemove', zoomBarMove);
        });
        this.els.progressBarBall.addEventListener('mouseleave', function(e) {
            _this.els.progressBarCont.removeEventListener('mousemove', zoomBarMove);
            _this.els.progressBarBall.style.left = _this.zoom + '%';
        });

        this.els.regionField.value = this.region.toString();
        this.els.regionField.addEventListener('keyup', function(event) {
            if (_this._checkRegion(this.value) && event.which === 13) {
                _this._triggerRegionChange({region: new Region(this.value), sender: this});
            }
        });
        this.els.goButton.addEventListener('click', function() {
            let value = _this.els.regionField.value;
            if (_this._checkRegion(value)) {
                _this._triggerRegionChange({region: new Region(value), sender: this});
            }
        });

        this.els.moveFurtherLeftButton.addEventListener('click', function() {
            _this._handleMoveRegion(10);
        });

        this.els.moveFurtherRightButton.addEventListener('click', function() {
            _this._handleMoveRegion(-10);
        });

        this.els.moveLeftButton.addEventListener('click', function() {
            _this._handleMoveRegion(1);
        });

        this.els.moveRightButton.addEventListener('click', function() {
            _this._handleMoveRegion(-1);
        });

        this.els.autoheightButton.addEventListener('click', function() {
            _this.trigger('autoHeight-button:change', {selected: this.checked, sender: _this});
        });

        let lastQuery = '';
        this.els.searchField.addEventListener('keyup', function(event) {
            this.classList.remove('error');
            let query = this.value;
            if (query.length > 2 && lastQuery !== query && event.which !== 13) {
                _this._setQuickSearchMenu(query);
                lastQuery = query;
            }
            if (event.which === 13) {
                let item = _this.quickSearchDataset[query];
                if (item) {
                    _this.trigger('quickSearch:select', {item: item, sender: _this});
                } else {
                    this.classList.add('error');
                }
            }
        });

        this.els.quickSearchButton.addEventListener('click', function() {
            _this.els.searchField.classList.remove('error');
            let query = _this.els.searchField.value;
            let item = _this.quickSearchDataset[query];
            if (item) {
                _this.trigger('quickSearch:go', {item: item, sender: _this});
            } else {
                _this.els.searchField.classList.add('error');
            }
        });

        this.els.windowSizeField.value = this.region.length();
        this.els.windowSizeField.addEventListener('keyup', function(event) {
            let value = this.value;
            let pattern = /^([0-9])+$/;
            if (pattern.test(value)) {
                this.classList.remove('error');
                if (event.which === 13) {
                    let regionSize = parseInt(value);
                    let haflRegionSize = Math.floor(regionSize / 2);
                    let region = new Region({
                        chromosome: _this.region.chromosome,
                        start: _this.region.center() - haflRegionSize,
                        end: _this.region.center() + haflRegionSize
                    });
                    _this._triggerRegionChange({region: region, sender: _this});
                }
            } else {
                this.classList.add('error');
            }
        });
        this.rendered = true;
    }

    draw() {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
    }

    _addRegionHistoryMenuItem(region) {
        let _this = this;
        let menuEntry = document.createElement('li');
        menuEntry.textContent = region.toString();
        this.els.regionHistoryMenu.appendChild(menuEntry);
        menuEntry.addEventListener('click', function() {
            _this._triggerRegionChange({region: new Region(this.textContent), sender: _this});
        });
    }

    _setQuickSearchMenu(query) {
        if (typeof this.quickSearchResultFn === 'function') {
            while (this.els.searchDataList.firstChild) {
                this.els.searchDataList.removeChild(this.els.searchDataList.firstChild);
            }
            this.quickSearchDataset = {};
            let _this = this;
            this.quickSearchResultFn(query)
                .then(function(data) {
                    let items = data.response[0].result;
                    for (let i = 0; i < items.length; i++) {
                        let item = items[i];
                        let value = item.name;
                        _this.quickSearchDataset[value] = item;
                        let menuEntry = document.createElement('option');
                        menuEntry.setAttribute('value', value);
                        _this.els.searchDataList.appendChild(menuEntry);
                    }
                });

        } else {
            console.log('the quickSearchResultFn function is not valid');
        }
    }

    _setChromosomeMenu() {
        let _this = this;

        while (this.els.chromosomesMenu.firstChild) {
            this.els.chromosomesMenu.removeChild(this.els.chromosomesMenu.firstChild);
        }

        let list = [];
        for (let chr in this.species.chromosomes) {
            list.push(chr);

            let menuEntry = document.createElement('li');
            menuEntry.textContent = chr;
            this.els.chromosomesMenu.appendChild(menuEntry);

            menuEntry.addEventListener('click', function() {
                let region = new Region({
                    chromosome: this.textContent,
                    start: _this.region.start,
                    end: _this.region.end
                });
                _this._triggerRegionChange({region: region, sender: _this});
            });

        }
        this.currentChromosomeList = list;
    }

    _setSpeciesMenu() {
        let _this = this;

        let createSpeciesEntry = function(species, ul) {
            let menuEntry = document.createElement('li');
            menuEntry.textContent = species.scientificName + ' (' + species.assembly.name + ')';
            ul.appendChild(menuEntry);

            menuEntry.addEventListener('click', function() {
                _this.trigger('species:change', {species: species, sender: _this});
            });
        };

        let createTaxonomy = function(taxonomy) {
            let menuEntry = document.createElement('li');
            menuEntry.setAttribute('data-sub', true);
            menuEntry.textContent = taxonomy;
            _this.els.speciesMenu.appendChild(menuEntry);

            let ul = document.createElement('ul');
            menuEntry.appendChild(ul);

            return ul;
        };

        //find species object
        for (let taxonomy in this.availableSpecies) {
            let taxUl = createTaxonomy(taxonomy);
            for (let i = 0; i < this.availableSpecies[taxonomy].length; i++) {
                let species = this.availableSpecies[taxonomy][i];
                createSpeciesEntry(species, taxUl);
            }
        }
    }

    _checkRegion(value) {
        let reg = new Region(value);
        if (!reg.parse(value) || reg.start < 0 || reg.end < 0 || _.indexOf(this.currentChromosomeList, reg.chromosome) == -1) {
            this.els.regionField.classList.add('error');
            return false;
        } else {
            this.els.regionField.classList.remove('error');
            return true;
        }
    }

    _handleZoomOutButton() {
        this._handleZoomSlider(Math.max(0, this.zoom - 5));
    }

    _handleZoomSlider(value) {
        let _this = this;
        if (!_this.zoomChanging) {
            _this.zoomChanging = true;
            /**/
            _this.zoom = 5 * (Math.round(value / 5));
            _this.trigger('zoom:change', {zoom: _this.zoom, sender: _this});
            /**/
            setTimeout(function() {
                _this.zoomChanging = false;
            }, 700);
        }
    }

    _handleZoomInButton() {
        this._handleZoomSlider(Math.min(100, this.zoom + 5));
    }

    _handleMoveRegion(positions) {
        let pixelBase = (this.width - this.svgCanvasWidthOffset) / this.region.length();
        let disp = Math.round((positions * 10) / pixelBase);
        this.region.start -= disp;
        this.region.end -= disp;
        this.els.regionField.value = this.region.toString();
        this.trigger('region:move', {region: this.region, disp: disp, sender: this});
    }

    setVisible(obj) {
        for (let key in obj) {
            let el = this.els[key];
            if (obj[key]) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    }

    setRegion(region, zoom) {
        this.region.load(region);
        if (zoom) {
            this.zoom = 5 * (Math.round(zoom / 5));
        }
        this.updateRegionControls();
        this._addRegionHistoryMenuItem(region);
    }

    moveRegion(region) {
        this.region.load(region);
        this.els.chromosomesText.textContent = this.region.chromosome;
        this.els.regionField.value = this.region.toString()
    }

    setSpecies(species) {
        this.species = species;
        this.els.speciesText.textContent = this.species.scientificName;
        this._setChromosomeMenu();
    }

    setWidth(width) {
        this.width = width;
    }

    _triggerRegionChange(event) {
        let _this = this;
        if (!this.regionChanging) {
            this.regionChanging = true;
            /**/
            this.trigger('region:change', event);
            /**/
            setTimeout(function() {
                _this.regionChanging = false;
            }, 700);
        } else {
            this.updateRegionControls();
        }
    }

    updateRegionControls() {
        this.els.chromosomesText.textContent = this.region.chromosome;
        this.els.regionField.value = this.region.toString();
        this.els.windowSizeField.value = this.region.length();
        this.els.regionField.classList.remove('error');
        this.els.progressBar.style.width = this.zoom + '%';
        this.els.progressBarBall.style.left = this.zoom + '%';
    }

    setCellBaseHost(host) {
        this.cellBaseHost = host;
    }

}
