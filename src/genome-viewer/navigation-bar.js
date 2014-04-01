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

    this.species = 'Homo sapiens';
    this.increment = 3;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);

    this.currentChromosomeList = [];

    this.on(this.handlers);

    this.zoomChanging = false;

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

NavigationBar.prototype = {

    render: function (targetId) {
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        var navgationHtml = '' +
            '<div class="btn-toolbar" role="toolbar">' +
            '   <div class="btn-group">' +
            '       <button id="restoreDefaultRegionButton" class="btn btn-default btn-xs" type="button"><span class="glyphicon glyphicon-repeat"></span></button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="regionHistoryButton" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="glyphicon glyphicon-time"></span> <span class="caret"></button>' +
            '       <ul id="regionHistoryMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="speciesButton" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"  type="button" >' +
            '           <span id="speciesText"></span>&nbsp;<span class="caret"></span>' +
            '       </button>' +
            '       <ul id="speciesMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group">' +
//            '       <div class="pull-left" style="height:22px;line-height: 22px;color:#708090">Chr&nbsp;</div>' +
            '       <button id="chromosomesButton" class="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown"  type="button" >' +
            '           <span id="chromosomesText"></span>&nbsp;<span class="caret"></span>' +
            '       </button>' +
            '       <ul id="chromosomesMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group" data-toggle="buttons">' +
            '       <label id="karyotypeButton" class="btn btn-default btn-xs"><input type="checkbox"><span class="ocb-icon ocb-icon-karyotype"></span></label>' +
            '       <label id="chromosomeButton" class="btn btn-default btn-xs"><input type="checkbox"><span class="ocb-icon ocb-icon-chromosome"></span></label>' +
            '       <label id="regionButton" class="btn btn-default btn-xs"><input type="checkbox"><span class="ocb-icon ocb-icon-region"></span></label>' +
            '   </div>' +
            '   <div class="btn-group" style="margin:0px 0px 0px 15px;">' +
            '       <button id="zoomOutButton" class="btn btn-default btn-xs" type="button"><span class="glyphicon glyphicon-minus"></span></button>' +
            '       <div id="progressBarCont" class="progress pull-left" style="width:120px;height:10px;margin:5px 2px 0px 2px;background-color: #d5d5d5">' +
            '           <div id="progressBar" class="progress-bar" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
            '           </div>' +
            '       </div>' +
            '       <button id="zoomInButton" class="btn btn-default btn-xs" type="button"><span class="glyphicon glyphicon-plus"></span></button>' +
            '   </div>' +
            '   <div class="btn-group" style="margin:0px 0px 0px 10px;">' +
            '       <div class="pull-left" style="height:22px;line-height: 22px;font-size:14px;">Window size:&nbsp;</div>' +
            '       <input id="windowSizeField" type="text" class="form-control pull-left" placeholder="Window size" style="padding:0px 4px;height:22px;width:60px">' +
            '   </div>' +
            '   <div class="btn-group" style="margin:0px 0px 0px 10px;">' +
            '       <div class="pull-left" style="height:22px;line-height: 22px;font-size:14px;">Position:&nbsp;</div>' +
            '       <div class="input-group pull-left">' +
            '           <input id="regionField" type="text" class="form-control" placeholder="region..." style="padding:0px 4px;width:160px;height:22px">' +
            '       </div>' +
            '       <button id="goButton" class="btn btn-default btn-xs" type="button">Go!</button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="moveFurtherLeftButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-arrow-w-bold"></span></button>' +
            '       <button id="moveLeftButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-arrow-w"></span></button>' +
            '       <button id="moveRightButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-arrow-e"></span></button>' +
            '       <button id="moveFurtherRightButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-arrow-e-bold"></span></button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="autoheightButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon ocb-icon-track-autoheight"></span></button>' +
            '   </div>' +
            '    <div class="btn-group">' +
            '       <button id="compactButton" class="btn btn-default btn-xs" type="button"><span class="ocb-icon glyphicon glyphicon-compressed"></span></button>' +
            '   </div>' +
            '   <div class="btn-group pull-right">' +
            '       <div class="pull-left" style="height:22px;line-height: 22px;font-size:14px;">Search:&nbsp;</div>' +
            '       <div class="input-group pull-left">' +
            '           <input id="searchField" list="searchDataList" type="text" class="form-control" placeholder="gene, snp..." style="padding:0px 4px;height:22px;width:100px">' +
            '           <datalist id="searchDataList">' +
            '           </datalist>' +
            '       </div>' +
//            '       <ul id="quickSearchMenu" class="dropdown-menu" role="menu">' +
//            '       </ul>' +
            '       <button id="quickSearchButton" class="btn btn-default btn-xs" type="button"><span class="glyphicon glyphicon-search"></span></button>' +
            '   </div>' +
            '</div>' +
            '';


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.div).css({
            height: '33px'
        });
        $(this.targetDiv).append(this.div);


        this.restoreDefaultRegionButton = $(this.div).find('#restoreDefaultRegionButton')[0];

        this.regionHistoryButton = $(this.div).find('#regionHistoryButton')[0];
        this.regionHistoryMenu = $(this.div).find('#regionHistoryMenu')[0];

        this.speciesButton = $(this.div).find('#speciesButton')[0];
        this.speciesText = $(this.div).find('#speciesText')[0];
        this.speciesMenu = $(this.div).find('#speciesMenu')[0];

        this.chromosomesButton = $(this.div).find('#chromosomesButton')[0];
        this.chromosomesText = $(this.div).find('#chromosomesText')[0];
        this.chromosomesMenu = $(this.div).find('#chromosomesMenu')[0];

        this.karyotypeButton = $(this.div).find('#karyotypeButton')[0];
        this.chromosomeButton = $(this.div).find('#chromosomeButton')[0];
        this.regionButton = $(this.div).find('#regionButton')[0];

        this.progressBar = $(this.div).find('#progressBar')[0];
        this.progressBarCont = $(this.div).find('#progressBarCont')[0];
        this.zoomOutButton = $(this.div).find('#zoomOutButton')[0];
        this.zoomInButton = $(this.div).find('#zoomInButton')[0];

        this.regionField = $(this.div).find('#regionField')[0];
        this.goButton = $(this.div).find('#goButton')[0];

        this.moveFurtherLeftButton = $(this.div).find('#moveFurtherLeftButton');
        this.moveFurtherRightButton = $(this.div).find('#moveFurtherRightButton');
        this.moveLeftButton = $(this.div).find('#moveLeftButton');
        this.moveRightButton = $(this.div).find('#moveRightButton');

        this.autoheightButton = $(this.div).find('#autoheightButton');
        this.compactButton = $(this.div).find('#compactButton');

        this.searchField = $(this.div).find('#searchField')[0];
//        this.quickSearchMenu = $(this.div).find('#quickSearchMenu')[0];
        this.searchDataList = $(this.div).find('#searchDataList')[0];
        this.quickSearchButton = $(this.div).find('#quickSearchButton')[0];
        this.windowSizeField = $(this.div).find('#windowSizeField')[0];

        /*** ***/
        $(this.restoreDefaultRegionButton).click(function (e) {
            _this.trigger('restoreDefaultRegion:click', {clickEvent: e, sender: {}})
        });

        this._addRegionHistoryMenuItem(this.region);
        this._setChromosomeMenu();
        this._setSpeciesMenu();
        $(this.chromosomesText).text(this.region.chromosome);
        $(this.speciesText).text(this.species.text);


        $(this.karyotypeButton).click(function () {
            _this.trigger('karyotype-button:change', {selected: $(this).hasClass('active'), sender: _this});
        });
        $(this.chromosomeButton).click(function () {
            _this.trigger('chromosome-button:change', {selected: $(this).hasClass('active'), sender: _this});
        });
        $(this.regionButton).click(function () {
            _this.trigger('region-button:change', {selected: $(this).hasClass('active'), sender: _this});
        });


        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });
        $(this.progressBarCont).click(function (e) {
            var offsetX = e.clientX - $(this).offset().left;
            console.log('offsetX '+offsetX);
            console.log('e.offsetX '+ e.offsetX);
            var zoom = 100 / $(this).width() * offsetX;
            if (!_this.zoomChanging) {
                $(_this.progressBar).width(offsetX);
                _this.zoomChanging = true;
                setTimeout(function () {
                    _this._handleZoomSlider(zoom);
                    _this.zoomChanging = false;
                }, 500);
            }
        });
        $(this.regionField).val(this.region.toString());

        $(this.goButton).click(function () {
            _this._goRegion($(_this.regionField).val());
        });

        $(this.moveFurtherLeftButton).click(function () {
            _this._handleMoveRegion(10);
        });

        $(this.moveFurtherRightButton).click(function () {
            _this._handleMoveRegion(-10);
        });

        $(this.moveLeftButton).click(function () {
            _this._handleMoveRegion(1);
        });

        $(this.moveRightButton).click(function () {
            _this._handleMoveRegion(-1);
        });

        $(this.autoheightButton).click(function (e) {
            _this.trigger('autoHeight-button:click', {clickEvent: e, sender: _this});
        });

        $(this.compactButton).click(function (e) {
            _this.trigger('autoHeight-button:click', {clickEvent: e, sender: _this});
            $(".ocb-compactable").toggle();
        });


//        var speciesCode = Utils.getSpeciesCode(this.species.text).substr(0, 3);
//        var url = CellBaseManager.url({
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
        $(this.searchField).bind("keyup", function (event) {
            var query = $(this).val();
            if (query.length > 2 && lastQuery !== query && event.which !== 13) {
                _this._setQuickSearchMenu(query);
                lastQuery = query;
            }
            if (event.which === 13) {
                debugger
                var item = _this.quickSearchDataset[query];
                _this.trigger('quickSearch:select', {item: item, sender: _this});
            }
        });

        $(this.quickSearchButton).click(function () {
            var query = $(_this.searchField).val();
            var item = _this.quickSearchDataset[query];
            _this.trigger('quickSearch:go', {item: item, sender: _this});
        });

        $(this.windowSizeField).val(this.region.length());
        $(this.windowSizeField).bind("keyup", function (event) {
            var value = $(this).val();
            var pattern = /^([0-9])+$/;
            if (event.which === 13 && pattern.test(value)) {
                var regionSize = parseInt(value);
                var haflRegionSize = Math.floor(regionSize / 2);
                var start = _this.region.center() - haflRegionSize;
                var end = _this.region.center() + haflRegionSize;
                _this.region.start = start;
                _this.region.end = end;
                _this.trigger('region:change', {region: _this.region});
            }
        });
        this.rendered = true;
    },

    _addRegionHistoryMenuItem: function (region) {
        var _this = this;
        var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + region.toString() + '</a></li>')[0];
        $(this.regionHistoryMenu).append(menuEntry);
        $(menuEntry).click(function () {
            _this.region.parse($(this).text());
            $(_this.chromosomesText).text(_this.region.chromosome);
            $(_this.regionField).val(_this.region.toString());
            _this.trigger('region:change', {region: _this.region, sender: _this});
            console.log($(this).text());
        });
    },

    _setQuickSearchMenu: function (query) {
        if (typeof this.quickSearchResultFn === 'function') {
            $(this.searchDataList).empty();
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
                $(this.searchDataList).append(menuEntry);
            }
        } else {
            console.log('the quickSearchResultFn function is not valid');
        }
    },

    _setChromosomeMenu: function () {
        var _this = this;

        $(this.chromosomesMenu).empty();

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
            $(this.chromosomesMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.region.chromosome = $(this).text();
                $(_this.chromosomesText).text($(this).text());
                $(_this.regionField).val(_this.region.toString());
                _this._addRegionHistoryMenuItem(_this.region);
                _this.trigger('region:change', {region: _this.region, sender: _this});
                console.log($(this).text());
            });
        }
    },

    _setSpeciesMenu: function () {
        var _this = this;

        var createEntry = function (species) {
            var menuEntry = $('<li role="presentation"><a tabindex="-1" role="menuitem">' + species.text + '</a></li>')[0];
            $(_this.speciesMenu).append(menuEntry);
            $(menuEntry).click(function () {
                _this.species = species;
                $(_this.speciesText).text($(this).text());
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
            $(this.regionField).css({opacity: 0.0});
            $(this.regionField).animate({opacity: 1}, 700);
        } else {
            this.region.load(reg);
            $(this.windowSizeField).val(this.region.length());
            $(this.chromosomesText).text(this.region.chromosome);
            this._addRegionHistoryMenuItem(this.region);
            this.trigger('region:change', {region: this.region, sender: this});
        }
    },

    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
    },
    _handleZoomSlider: function (value) {
        this.zoom = value;
        this.trigger('zoom:change', {zoom: this.zoom, sender: this});
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
            var query = $(this.div).find('#' + key);
            if (obj[key]) {
                query.show();
            } else {
                query.hide();
            }
        }
    },

    setRegion: function (region) {
        this.region.load(region);
        $(this.chromosomesText).text(this.region.chromosome);
        $(this.regionField).val(this.region.toString());
        $(this.windowSizeField).val(this.region.length());
        this._addRegionHistoryMenuItem(region);
    },
    moveRegion: function (region) {
        this.region.load(region);
        $(this.chromosomesText).text(this.region.chromosome);
        $(this.regionField).val(this.region.toString());
    },

    setWidth: function (width) {
        this.width = width;
    },
    setZoom: function (zoom) {
        this.zoom = zoom;
        $(this.progressBar).css("width", this.zoom + '%');
    },
    draw: function () {
        if (!this.rendered) {
            console.info(this.id + ' is not rendered yet');
            return;
        }
    }
}