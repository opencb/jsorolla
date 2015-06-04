/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function NavigationBar(args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;

    this.id = Utils.genId("NavigationBar");

    this.target;
    this.autoRender = true;

    this.cellBaseHost = 'http://bioinfo.hpc.cam.ac.uk/cellbase/webservices/rest';
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
    this.zoom = 100;

    this.quickSearchDisplayKey = 'name';


    _.extend(this.componentsConfig, args.componentsConfig);
    delete args.componentsConfig;

    //set instantiation args, must be last
    _.extend(this, args);


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
};

NavigationBar.prototype = {

    render: function () {
        var _this = this;


        var HTML = '' +
            '<div style="margin-right: 5px;" id="leftSideButton" class="ocb-ctrl"><i class="fa fa-navicon"></i></div>' +
            '<div id="restoreDefaultRegionButton" class="ocb-ctrl"><i class="fa fa-repeat"></i></div>' +

            '<div class="ocb-dropdown" style="margin-left: 5px">' +
            '   <div tabindex="-1" id="regionHistoryButton" class="ocb-ctrl"><i class="fa fa-history"></i> <i class="fa fa-caret-down"></i></div>' +
            '   <ul id="regionHistoryMenu"></ul>' +
            '</div>' +

            '<div class="ocb-dropdown" style="margin-left: 5px">' +
            '   <div tabindex="-1" id="speciesButton" class="ocb-ctrl"><span id="speciesText"></span> <i class="fa fa-caret-down"></i></div>' +
            '   <ul id="speciesMenu"></ul>' +
            '</div>' +

            '<div class="ocb-dropdown" style="margin-left: 5px">' +
            '   <div tabindex="-1" id="chromosomesButton" class="ocb-ctrl"><span id="chromosomesText"></span> <i class="fa fa-caret-down"></i></div>' +
            '   <ul id="chromosomesMenu" style="height: 200px; overflow-y: auto;"></ul>' +
            '</div>' +

            '<div style="margin-left: 5px; float: left; " >' +
            '   <label class="ocb-ctrl" id="karyotypeButtonLabel"><input id="karyotypeButton" type="checkbox"><span style="border-right: none"><span class="ocb-icon ocb-icon-karyotype"></span></span></label>' +
            '   <label class="ocb-ctrl" id="chromosomeButtonLabel"><input id="chromosomeButton" type="checkbox"><span style="border-right: none"><span class="ocb-icon ocb-icon-chromosome"></span></span></label>' +
            '   <label class="ocb-ctrl" id="regionButtonLabel"><input id="regionButton" type="checkbox"><span><span class="ocb-icon ocb-icon-region"></span></span></label>' +
            '</div>' +


            '<div id="zoomControl" style="float:left;">' +
            '<div id="zoomMinButton" class="ocb-ctrl" style="margin-left: 5px;border-right: none;">0</div>' +
            '<div id="zoomOutButton" class="ocb-ctrl"><span class="fa fa-minus"></span></div>' +
            '<div id="progressBarCont" class="ocb-zoom-bar">' +
            '   <div id="progressBar" style="width: ' + this.zoom + '%"></div>' +
            '</div>' +
            '<div id="zoomInButton" class="ocb-ctrl" style="border-right: none;"><span class="fa fa-plus"></span></div>' +
            '<div id="zoomMaxButton" class="ocb-ctrl">100</div>' +
            '</div>' +


            '<div id="windowSizeControl" style="float:left;">' +
            '<div class="ocb-ctrl-label" style="border-right: none;margin-left: 5px;">Window size:</div>' +
            '<input id="windowSizeField" class="ocb-ctrl"  type="text" style="width: 60px;">' +
            '</div>' +


            '<div id="positionControl" style="float:left;">' +
            '<div class="ocb-ctrl-label" id="regionLabel" style="border-right: none;margin-left: 5px;transition:all 0.5s">Position:</div>' +
            '<input id="regionField" class="ocb-ctrl" placeholder="1:10000-20000" type="text" style="width: 170px;">' +
            '<div id="goButton" class="ocb-ctrl" style="border-left: none;">Go!</div>' +
            '</div>' +


            '<div id="moveControl" style="float:left;font-size:18px;">' +
            '<div id="moveFurtherLeftButton" class="ocb-ctrl" style="border-right: none;margin-left: 5px;"><i class="fa fa-angle-double-left"></i></div>' +
            '<div id="moveLeftButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-angle-left"></i></div>' +
            '<div id="moveRightButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-angle-right"></i></div>' +
            '<div id="moveFurtherRightButton" class="ocb-ctrl"><i class="fa fa-angle-double-right"></i></div>' +
            '</div>' +


//            '<div id="autoheightButton" class="ocb-ctrl" style="margin-left: 5px;font-size:18px;"><i class="fa fa-compress"></i></div>' +
            '<label class="ocb-ctrl"><input type="checkbox" id="autoheightButton"><span style="margin-left: 5px;font-size:18px;"><i class="fa fa-compress"></i></span></label>' +
//            '<div id="compactButton" class="ocb-ctrl" style="margin-left: 5px;font-size:18px;"><i class="fa fa-expand"></i></div>' +


            '<div id="searchControl" style="float:left;">' +
            '<div class="ocb-ctrl-label" style="border-right: none;margin-left: 5px;">Search:</div>' +
            '<input id="searchField" class="ocb-ctrl"  list="searchDataList"  placeholder="gene" type="text" style="width: 90px;">' +
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

        var els = this.div.querySelectorAll('[id]');
        for (var i = 0; i < els.length; i++) {
            var elid = els[i].getAttribute('id');
            if (elid) {
                this.els[elid] = els[i];
            }
        }
        /**************/


        /**Check components config**/
        for (var key in this.componentsConfig) {
            if (!this.componentsConfig[key]) {
                this.els[key].classList.add('hidden');
            }
        }
        /*****/

        this.els.karyotypeButton.checked = (this.karyotypePanelConfig.hidden) ? false : true;
        this.els.chromosomeButton.checked = (this.chromosomePanelConfig.hidden) ? false : true;
        this.els.regionButton.checked = (this.regionPanelConfig.hidden) ? false : true;


        /*** ***/

        this.els.menuButton.addEventListener('click', function (e) {
            _this.trigger('menuButton:click', {clickEvent: e, sender: {}})
        });

        this.els.leftSideButton.addEventListener('click', function (e) {
            _this.trigger('leftSideButton:click', {clickEvent: e, sender: {}})
        });

        this.els.restoreDefaultRegionButton.addEventListener('click', function (e) {
            _this.trigger('restoreDefaultRegion:click', {clickEvent: e, sender: {}})
        });


        this._addRegionHistoryMenuItem(this.region);
        this._setChromosomeMenu();
        this._setSpeciesMenu();
        this.els.chromosomesText.textContent = this.region.chromosome;
        this.els.speciesText.textContent = this.species.text;


        this.els.karyotypeButton.addEventListener('click', function () {
            _this.trigger('karyotype-button:change', {selected: this.checked, sender: _this});
        });
        this.els.chromosomeButton.addEventListener('click', function () {
            _this.trigger('chromosome-button:change', {selected: this.checked, sender: _this});
        });
        this.els.regionButton.addEventListener('click', function () {
            _this.trigger('region-button:change', {selected: this.checked, sender: _this});
        });


        this.els.zoomOutButton.addEventListener('click', function () {
            _this._handleZoomOutButton();
        });
        this.els.zoomInButton.addEventListener('click', function () {
            _this._handleZoomInButton();
        });
        this.els.zoomMaxButton.addEventListener('click', function () {
            _this._handleZoomSlider(100);
        });
        this.els.zoomMinButton.addEventListener('click', function () {
            _this._handleZoomSlider(0);
        });
        this.els.progressBarCont.addEventListener('click', function (e) {
            var br = this.getBoundingClientRect();
            var offsetX = e.clientX - br.left;
            var zoom = 100 / parseInt(getComputedStyle(this).width) * offsetX;
            _this._handleZoomSlider(zoom);
        });

        this.els.regionField.value = this.region.toString();
        this.els.regionField.addEventListener('keyup', function (event) {
            if (_this._checkRegion(this.value) && event.which === 13) {
                _this._triggerRegionChange({region: new Region(this.value), sender: this});
            }
        });
        this.els.goButton.addEventListener('click', function () {
            var value = _this.els.regionField.value;
            if (_this._checkRegion(value)) {
                _this._triggerRegionChange({region: new Region(value), sender: this});
            }
        });

        this.els.moveFurtherLeftButton.addEventListener('click', function () {
            _this._handleMoveRegion(10);
        });

        this.els.moveFurtherRightButton.addEventListener('click', function () {
            _this._handleMoveRegion(-10);
        });

        this.els.moveLeftButton.addEventListener('click', function () {
            _this._handleMoveRegion(1);
        });

        this.els.moveRightButton.addEventListener('click', function () {
            _this._handleMoveRegion(-1);
        });

//        this.els.autoheightButton.addEventListener('click', function (e) {
//            _this.trigger('autoHeight-button:click', {clickEvent: e, sender: _this});
//        });
        this.els.autoheightButton.addEventListener('click', function () {
            _this.trigger('autoHeight-button:change', {selected: this.checked, sender: _this});
        });

//        this.els.compactButton.addEventListener('click', function (e) {
//        });


        var lastQuery = '';
        this.els.searchField.addEventListener('keyup', function (event) {
            this.classList.remove('error');
            var query = this.value;
            if (query.length > 2 && lastQuery !== query && event.which !== 13) {
                _this._setQuickSearchMenu(query);
                lastQuery = query;
            }
            if (event.which === 13) {
                var item = _this.quickSearchDataset[query];
                if (item) {
                    _this.trigger('quickSearch:select', {item: item, sender: _this});
                } else {
                    this.classList.add('error');
                }
            }
        });

        this.els.quickSearchButton.addEventListener('click', function () {
            _this.els.searchField.classList.remove('error');
            var query = _this.els.searchField.value;
            var item = _this.quickSearchDataset[query];
            if (item) {
                _this.trigger('quickSearch:go', {item: item, sender: _this});
            } else {
                _this.els.searchField.classList.add('error');
            }
        });

        this.els.windowSizeField.value = this.region.length();
        this.els.windowSizeField.addEventListener('keyup', function (event) {
            var value = this.value;
            var pattern = /^([0-9])+$/;
            if (pattern.test(value)) {
                this.classList.remove('error');
                if (event.which === 13) {
                    var regionSize = parseInt(value);
                    var haflRegionSize = Math.floor(regionSize / 2);
                    var region = new Region({
                        chromosome: _this.region.chromosome,
                        start: _this.region.center() - haflRegionSize,
                        end: _this.region.center() + haflRegionSize
                    });
                    _this._triggerRegionChange({region: region, sender: _this})
                }
            } else {
                this.classList.add('error');
            }
        });
        this.rendered = true;
    },
    draw: function () {
        this.targetDiv = (this.target instanceof HTMLElement ) ? this.target : document.querySelector('#' + this.target);
        if (!this.targetDiv) {
            console.log('target not found');
            return;
        }
        this.targetDiv.appendChild(this.div);
    },

    _addRegionHistoryMenuItem: function (region) {
        var _this = this;
        var menuEntry = document.createElement('li');
        menuEntry.textContent = region.toString();
        this.els.regionHistoryMenu.appendChild(menuEntry);
        menuEntry.addEventListener('click', function () {
            _this._triggerRegionChange({region: new Region(this.textContent), sender: _this})
        });
    },

    _setQuickSearchMenu: function (query) {
        if (typeof this.quickSearchResultFn === 'function') {
            while (this.els.searchDataList.firstChild) {
                this.els.searchDataList.removeChild(this.els.searchDataList.firstChild);
            }
            this.quickSearchDataset = {};
            var items = this.quickSearchResultFn(query);
//            for (var i = 0; i < items.length; i++) {
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = item[this.quickSearchDisplayKey];
                this.quickSearchDataset[value] = item;
                var menuEntry = document.createElement('option');
                menuEntry.setAttribute('value', value);
                this.els.searchDataList.appendChild(menuEntry);
            }
        } else {
            console.log('the quickSearchResultFn function is not valid');
        }
    },

    _setChromosomeMenu: function () {
        var _this = this;

        while (this.els.chromosomesMenu.firstChild) {
            this.els.chromosomesMenu.removeChild(this.els.chromosomesMenu.firstChild);
        }

        //find species object
        //var list = [];
        //for (var i = 0; i < this.availableSpecies.items.length; i++) {
        //    for (var j = 0; j < this.availableSpecies.items[i].items.length; j++) {
        //        var species = this.availableSpecies.items[i].items[j];
        //        if (species.text === this.species.text) {
        //            list = species.chromosomes;
        //            break;
        //        }
        //    }

        //}
        //for (var i in this.availableSpecies.items) {
        //    for (var j in this.availableSpecies.items[i].items) {
        //        var species = this.availableSpecies.items[i].items[j];
        //        if (species.text === this.species.text) {
        //            list = species.chromosomes;
        //            break;
        //        }
        //    }
        //}

        var list = [];
        for(var chr in this.species.chromosomes){
            list.push(chr);


            var menuEntry = document.createElement('li');
            menuEntry.textContent = chr;
            this.els.chromosomesMenu.appendChild(menuEntry);

            menuEntry.addEventListener('click', function () {
                var region = new Region({
                    chromosome: this.textContent,
                    start: _this.region.start,
                    end: _this.region.end
                });
                _this._triggerRegionChange({region: region, sender: _this})
            });

        }
        this.currentChromosomeList = list;


        //for (var i in list) {
        //    var menuEntry = document.createElement('li');
        //    menuEntry.textContent = list[i];
        //    this.els.chromosomesMenu.appendChild(menuEntry);
        //
        //    menuEntry.addEventListener('click', function () {
        //        var region = new Region({
        //            chromosome: this.textContent,
        //            start: _this.region.start,
        //            end: _this.region.end
        //        });
        //        _this._triggerRegionChange({region: region, sender: _this})
        //    });
        //}
    },

//    _setSpeciesMenu: function () {
//        var _this = this;
//
//        var createEntry = function (species) {
//            var menuEntry = document.createElement('li');
//            menuEntry.textContent = species.text;
//            _this.els.speciesMenu.appendChild(menuEntry);
//
//            menuEntry.addEventListener('click', function () {
//                _this.species = species;
//                _this.els.speciesText.textContent = this.textContent;
//                _this._setChromosomeMenu();
//                _this.trigger('species:change', {species: species, sender: _this});
//            });
//        };
//        //find species object
//        var list = [];
//        for (var i in this.availableSpecies.items) {
//            for (var j in this.availableSpecies.items[i].items) {
//                var species = this.availableSpecies.items[i].items[j];
//                createEntry(species);
//            }
//        }
//    },
    _setSpeciesMenu: function () {
        var _this = this;

        var createEntry = function (species, ul) {
            var menuEntry = document.createElement('li');
            menuEntry.textContent = species.text + ' ' + species.assembly;
            ul.appendChild(menuEntry);

            menuEntry.addEventListener('click', function () {
                _this.trigger('species:change', {species: species, sender: _this});
            });
        };

        var createTaxonomy = function (taxonomy) {
            var menuEntry = document.createElement('li');
            menuEntry.setAttribute('data-sub', true);
            menuEntry.textContent = taxonomy.text;
            _this.els.speciesMenu.appendChild(menuEntry);

            var ul = document.createElement('ul');
            menuEntry.appendChild(ul);

            return ul;
        };

        //find species object
        var list = [];
        for (var i = 0; i < this.availableSpecies.items.length; i++) {
            var taxonomy = this.availableSpecies.items[i];
            var taxUl = createTaxonomy(taxonomy);

            for (var j = 0; j < taxonomy.items.length; j++) {
                var species = taxonomy.items[j];
                createEntry(species, taxUl);
            }
        }
    },
    _checkRegion: function (value) {
        var reg = new Region(value);
        if (!reg.parse(value) || reg.start < 0 || reg.end < 0 || _.indexOf(this.currentChromosomeList, reg.chromosome) == -1) {
            this.els.regionField.classList.add('error');
            return false;
        } else {
            this.els.regionField.classList.remove('error');
            return true;
        }
    },

    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
    },
    _handleZoomSlider: function (value) {
        var _this = this;
        if (!this.zoomChanging) {
            this.zoomChanging = true;
            /**/
            this.zoom = value;
            this.trigger('zoom:change', {zoom: this.zoom, sender: this});
            /**/
            setTimeout(function () {
                _this.zoomChanging = false;
            }, 700);
        }
    },
    _handleZoomInButton: function () {
        this._handleZoomSlider(Math.min(100, this.zoom + 1));
    },

    _handleMoveRegion: function (positions) {
        var pixelBase = (this.width - this.svgCanvasWidthOffset) / this.region.length();
        var disp = Math.round((positions * 10) / pixelBase);
        this.region.start -= disp;
        this.region.end -= disp;
        this.els.regionField.value = this.region.toString();
        this.trigger('region:move', {region: this.region, disp: disp, sender: this});
    },

    setVisible: function (obj) {
        for (key in obj) {
            var el = this.els[key];
            if (obj[key]) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    },

    setRegion: function (region, zoom) {
        this.region.load(region);
        if (zoom) {
            this.zoom = zoom;
        }
        this.updateRegionControls();
        this._addRegionHistoryMenuItem(region);
    },
    moveRegion: function (region) {
        this.region.load(region);
        this.els.chromosomesText.textContent = this.region.chromosome;
        this.els.regionField.value = this.region.toString()
    },

    setSpecies:function(species){
        this.species = species;
        this.els.speciesText.textContent = this.species.text;
        this._setChromosomeMenu();
    },

    setWidth: function (width) {
        this.width = width;
    },
    _triggerRegionChange: function (event) {
        var _this = this;
        if (!this.regionChanging) {
            this.regionChanging = true;
            /**/
            this.trigger('region:change', event);
            /**/
            setTimeout(function () {
                _this.regionChanging = false;
            }, 700);
        } else {
            this.updateRegionControls();
        }
    },
    updateRegionControls: function () {
        this.els.chromosomesText.textContent = this.region.chromosome;
        this.els.regionField.value = this.region.toString();
        this.els.windowSizeField.value = this.region.length();
        this.els.regionField.classList.remove('error');
        this.els.progressBar.style.width = this.zoom + '%';
    }

}
