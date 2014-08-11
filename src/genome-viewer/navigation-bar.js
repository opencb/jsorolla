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

    this.cellBaseHost = 'http://www.ebi.ac.uk/cellbase/webservices/rest';
    this.cellBaseVersion = 'v3';

    this.species = 'Homo sapiens';
    this.increment = 3;
    this.componentsConfig = {
        leftSideButton: false,
        restoreDefaultRegionButton: true,
        regionHistoryButton: true,
        speciesButton: true,
        chromosomesButton: true,
        karyotypeButton: true,
        chromosomeButton: true,
        regionButton: true,
        zoomControl: true,
        windowSizeControl: true,
        positionControl: true,
        moveControl: true,
        autoheightButton: true,
        compactButton: true,
        searchControl: true
    };
    this.zoom = 100;

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

    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        this.targetDiv = (this.targetId instanceof HTMLElement ) ? this.targetId : $('#' + this.targetId)[0];
        if (this.targetDiv === 'undefined') {
            console.log('targetId not found');
            return;
        }


        var HTML = '' +
            '<button style="margin-right: 5px" id="leftSideButton" class="ocb-ctrl"><i class="fa fa-navicon"></i></button>' +
            '<button id="restoreDefaultRegionButton" class="ocb-ctrl"><i class="fa fa-repeat"></i></button>' +

            '<div class="ocb-dropdown" style="margin-left: 5px">' +
            '   <button id="regionHistoryButton" class="ocb-ctrl"><i class="fa fa-history"></i></button>' +
            '   <ul id="regionHistoryMenu"></ul>' +
            '</div>' +

            '<div class="ocb-dropdown" style="margin-left: 5px">' +
            '   <button id="speciesButton" class="ocb-ctrl"><span id="speciesText"></span></button>' +
            '   <ul id="speciesMenu"></ul>' +
            '</div>' +

            '<div class="ocb-dropdown" style="margin-left: 5px">' +
            '   <button id="chromosomesButton" class="ocb-ctrl"><span id="chromosomesText"></span></button>' +
            '   <ul id="chromosomesMenu"></ul>' +
            '</div>' +

            '<label style="margin-left: 5px;" class="ocb-ctrl"><input type="checkbox" id="karyotypeButton"><span style="border-right: none"><span class="ocb-icon ocb-icon-karyotype"></span></span></label>' +
            '<label class="ocb-ctrl"><input type="checkbox" id="chromosomeButton"><span style="border-right: none"><span class="ocb-icon ocb-icon-chromosome"></span></span></label>' +
            '<label class="ocb-ctrl"><input type="checkbox" id="regionButton"><span><span class="ocb-icon ocb-icon-region"></span></span></label>' +


            '<button id="zoomMinButton" class="ocb-ctrl" style="margin-left: 5px;border-right: none;">0</button>' +
            '<button id="zoomOutButton" class="ocb-ctrl"><span class="fa fa-minus"></span></button>' +
            '<div id="progressBarCont" class="ocb-zoom-bar">' +
            '   <div id="progressBar" style="width: ' + this.zoom + '%"></div>' +
            '</div>' +
            '<button id="zoomInButton" class="ocb-ctrl" style="border-right: none;"><span class="fa fa-plus"></span></button>' +
            '<button id="zoomMaxButton" class="ocb-ctrl">100</button>' +


            '<div class="ocb-ctrl-label" style="border-right: none;margin-left: 5px;">Window size:</div>' +
            '<input id="windowSizeField" class="ocb-ctrl"  type="text" style="width: 60px;">' +

            '<div class="ocb-ctrl-label" style="border-right: none;margin-left: 5px;">Position:</div>' +
            '<input id="regionField" class="ocb-ctrl" placeholder="1:10000-20000" type="text" style="width: 170px;">' +
            '<button id="goButton" class="ocb-ctrl" style="border-left: none;">Go!</button>' +


            '<button id="moveFurtherLeftButton" class="ocb-ctrl" style="border-right: none;margin-left: 5px;"><i class="fa fa-angle-double-left"></i></button>' +
            '<button id="moveLeftButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-angle-left"></i></button>' +
            '<button id="moveRightButton" class="ocb-ctrl" style="border-right: none;"><i class="fa fa-angle-right"></i></button>' +
            '<button id="moveFurtherRightButton" class="ocb-ctrl"><i class="fa fa-angle-double-right"></i></button>' +


            '<button id="autoheightButton" class="ocb-ctrl" style="margin-left: 5px;"><i class="fa fa-expand"></i></button>' +
            '<button id="compactButton" class="ocb-ctrl" style="margin-left: 5px;"><i class="fa fa-compress"></i></button>' +

            '<div class="ocb-ctrl-label" style="border-right: none;margin-left: 5px;">Search:</div>' +
            '<input id="searchField" class="ocb-ctrl"  list="searchDataList"  placeholder="gene, snp..." type="text" style="width: 90px;">' +
            '       <datalist id="searchDataList">' +
            '       </datalist>' +
            '<button id="quickSearchButton" class="ocb-ctrl" style="border-left: none;"><i class="fa fa-search"></i></button>' +
            '';


        /**************/
        this.div = document.createElement('div');
        this.div.setAttribute('class', "ocb-gv-navigation-bar unselectable");
        this.div.style.height = 21 + 'px';
        this.div.innerHTML = HTML;
        $(this.targetDiv).append(this.div);

        var els = this.div.querySelectorAll('[id]');
        for (var i = 0; i < els.length; i++) {
            var elid = els[i].getAttribute('id');
            if (elid) {
                this.els[elid] = els[i];
            }
        }
        /**************/


        //TODO check all functionality
        return
        /**Check components config**/
        for (var key in this.componentsConfig) {
            if (!this.componentsConfig[key]) {
                $(this.els[key]).hide();
            }
        }
        /*****/

        /*** ***/
        $(this.els.leftSideButton).click(function (e) {
            _this.trigger('leftSideButton:click', {clickEvent: e, sender: {}})
        });

        $(this.els.restoreDefaultRegionButton).click(function (e) {
            _this.trigger('restoreDefaultRegion:click', {clickEvent: e, sender: {}})
        });

        this._addRegionHistoryMenuItem(this.region);
        this._setChromosomeMenu();
        this._setSpeciesMenu();
        $(this.els.chromosomesText).text(this.region.chromosome);
        $(this.els.speciesText).text(this.species.text);


        $(this.els.karyotypeButton).click(function () {
            _this.trigger('karyotype-button:change', {selected: $(this).hasClass('active'), sender: _this});
        });
        $(this.els.chromosomeButton).click(function () {
            _this.trigger('chromosome-button:change', {selected: $(this).hasClass('active'), sender: _this});
        });
        $(this.els.regionButton).click(function () {
            _this.trigger('region-button:change', {selected: $(this).hasClass('active'), sender: _this});
        });


        $(this.els.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.els.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });
        $(this.els.zoomMaxButton).click(function () {
            _this._handleZoomSlider(100);
        });
        $(this.els.zoomMinButton).click(function () {
            _this._handleZoomSlider(0);
        });
        $(this.els.progressBarCont).click(function (e) {
            var offsetX = e.clientX - $(this).offset().left;
            console.log('offsetX ' + offsetX);
            console.log('e.offsetX ' + e.offsetX);
            var zoom = 100 / $(this).width() * offsetX;
            _this._handleZoomSlider(zoom);
        });

        $(this.els.regionField).val(this.region.toString());
        $(this.els.regionField).bind("keyup", function (event) {
            if (event.which === 13) {
                _this._triggerRegionChange({region: new Region($(_this.els.regionField).val()), sender: _this});
//                _this._goRegion();
            }
        });
        $(this.els.goButton).click(function () {
            _this._triggerRegionChange({region: new Region($(_this.els.regionField).val()), sender: _this});
//            _this._goRegion($(_this.els.regionField).val());
        });

        $(this.els.moveFurtherLeftButton).click(function () {
            _this._handleMoveRegion(10);
        });

        $(this.els.moveFurtherRightButton).click(function () {
            _this._handleMoveRegion(-10);
        });

        $(this.els.moveLeftButton).click(function () {
            _this._handleMoveRegion(1);
        });

        $(this.els.moveRightButton).click(function () {
            _this._handleMoveRegion(-1);
        });

        $(this.els.autoheightButton).click(function (e) {
            _this.trigger('autoHeight-button:click', {clickEvent: e, sender: _this});
        });

        $(this.els.compactButton).click(function (e) {
            _this.trigger('autoHeight-button:click', {clickEvent: e, sender: _this});
            $(".ocb-compactable").toggle();
        });


//        var speciesCode = Utils.getSpeciesCode(this.species.text).substr(0, 3);
//        var url = CellBaseManager.url({
//              host: this.cellBaseHost,
//            host: 'http://ws.bioinfo.cipf.es/cellbase/rest',
//            species: speciesCode,
//            version: 'latest',
//            category: 'feature',
//            subCategory: 'id',
//            query: '%QUERY',
//            resource: 'starts_with',
//            params: {
//                of: 'json'
//            }
//        });

//        $(this.div).find('#searchField').typeahead({
//            remote: {
//                url: url,
//                filter: function (parsedResponse) {
//                    return parsedResponse[0];
//                }
//            },
//            valueKey: 'displayId',
//            limit: 20
//        }).bind('typeahead:selected', function (obj, datum) {
//                _this._goFeature(datum.displayId);
//            });
//
//        $(this.div).find('#searchField').parent().find('.tt-hint').addClass('form-control tt-query').css({
//            height: '22px'
//        });
//        $(this.div).find('.tt-dropdown-menu').css({
//            'font-size': '14px'
//        });

        var lastQuery = '';
        $(this.els.searchField).bind("keyup", function (event) {
            var query = $(this).val();
            if (query.length > 2 && lastQuery !== query && event.which !== 13) {
                _this._setQuickSearchMenu(query);
                lastQuery = query;
            }
            if (event.which === 13) {
                var item = _this.quickSearchDataset[query];
                _this.trigger('quickSearch:select', {item: item, sender: _this});
            }
        });

        $(this.els.quickSearchButton).click(function () {
            var query = $(_this.els.searchField).val();
            var item = _this.quickSearchDataset[query];
            _this.trigger('quickSearch:go', {item: item, sender: _this});
        });

        $(this.els.windowSizeField).val(this.region.length());
        $(this.els.windowSizeField).bind("keyup", function (event) {
            var value = $(this).val();
            var pattern = /^([0-9])+$/;
            if (event.which === 13 && pattern.test(value)) {
                var regionSize = parseInt(value);
                var haflRegionSize = Math.floor(regionSize / 2);
                var region = new Region({
                    chromosome: _this.region.chromosome,
                    start: _this.region.center() - haflRegionSize,
                    end: _this.region.center() + haflRegionSize
                });
                _this._triggerRegionChange({region: region, sender: _this})
            }
        });
        this.rendered = true;
    },

    _addRegionHistoryMenuItem: function (region) {
        var _this = this;
        var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + region.toString() + '</a></li>')[0];
        $(this.els.regionHistoryMenu).append(menuEntry);
        $(menuEntry).click(function () {
            var region = new Region($(this).text());
            _this._triggerRegionChange({region: region, sender: _this})
        });
    },

    _setQuickSearchMenu: function (query) {
        if (typeof this.quickSearchResultFn === 'function') {
            $(this.els.searchDataList).empty();
            this.quickSearchDataset = {};
            var items = this.quickSearchResultFn(query);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var itemKey = item;
                if ($.type(this.quickSearchDisplayKey) === "string") {
                    itemKey = item[this.quickSearchDisplayKey];
                }
                this.quickSearchDataset[itemKey] = item;
                var menuEntry = $('<option value="' + itemKey + '">')[0];
                $(this.els.searchDataList).append(menuEntry);
            }
        } else {
            console.log('the quickSearchResultFn function is not valid');
        }
    },

    _setChromosomeMenu: function () {
        var _this = this;

        $(this.els.chromosomesMenu).empty();

        //find species object
        var list = [];
        for (var i in this.availableSpecies.items) {
            for (var j in this.availableSpecies.items[i].items) {
                var species = this.availableSpecies.items[i].items[j];
                if (species.text === this.species.text) {
                    list = species.chromosomes;
                    break;
                }
            }
        }

        this.currentChromosomeList = list;
        //add bootstrap elements to the menu
        for (var i in list) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + list[i] + '</a></li>')[0];
            $(this.els.chromosomesMenu).append(menuEntry);
            $(menuEntry).click(function () {
                var region = new Region({
                    chromosome: $(this).text(),
                    start: _this.region.start,
                    end: _this.region.end
                });
                _this._triggerRegionChange({region: region, sender: _this})
            });
        }
    },

    _setSpeciesMenu: function () {
        var _this = this;

        var createEntry = function (species) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + species.text + '</a></li>')[0];
            $(_this.els.speciesMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.species = species;
                $(_this.els.speciesText).text($(this).text());
                _this._setChromosomeMenu();
                _this.trigger('species:change', {species: species, sender: _this});
            });
        };
        //find species object
        var list = [];
        for (var i in this.availableSpecies.items) {
            for (var j in this.availableSpecies.items[i].items) {
                var species = this.availableSpecies.items[i].items[j];
                createEntry(species);
            }
        }
    },
    _goRegion: function (value) {
        var reg = new Region();
        if (!reg.parse(value) || reg.start < 0 || reg.end < 0 || _.indexOf(this.currentChromosomeList, reg.chromosome) == -1) {
            $(this.els.regionField).css({opacity: 0.0});
            $(this.els.regionField).animate({opacity: 1}, 700);
        } else {
            this._triggerRegionChange({region: reg, sender: this});
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
        $(this.regionField).val(this.region.toString());
        this.trigger('region:move', {region: this.region, disp: disp, sender: this});
    },

    setVisible: function (obj) {
        for (key in obj) {
            var query = $(this.els[key]);
            if (obj[key]) {
                query.show();
            } else {
                query.hide();
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
        $(this.els.chromosomesText).text(this.region.chromosome);
        $(this.els.regionField).val(this.region.toString());
    },

    setWidth: function (width) {
        this.width = width;
    },
    draw: function () {
        if (!this.rendered) {
            console.info(this.id + ' is not rendered yet');
            return;
        }
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
        $(this.els.chromosomesText).text(this.region.chromosome);
        $(this.els.regionField).val(this.region.toString());
        $(this.els.windowSizeField).val(this.region.length());
        $(this.els.progressBar).css("width", this.zoom + '%');
    }

}
