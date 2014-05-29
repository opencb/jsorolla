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
    this.componentsConfig = {};

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

        var navgationHtml = '' +
            '<div style="width: 1350px">' +
            '   <div class="btn-group">' +
            '       <button id="restoreDefaultRegionButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="glyphicon glyphicon-repeat"></span></button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="regionHistoryButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" ><span class="glyphicon glyphicon-time"></span> <span class="caret"></button>' +
            '       <ul id="regionHistoryMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="speciesButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" >' +
            '           <span id="speciesText"></span>&nbsp;<span class="caret"></span>' +
            '       </button>' +
            '       <ul id="speciesMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group">' +
//            '       <div class="pull-left" style="height:22px;line-height: 22px;color:#708090">Chr&nbsp;</div>' +
            '       <button id="chromosomesButton" class="btn btn-default btn-xs custom-xs dropdown-toggle" data-toggle="dropdown"  type="button" >' +
            '           <span id="chromosomesText"></span>&nbsp;<span class="caret"></span>' +
            '       </button>' +
            '       <ul id="chromosomesMenu" class="dropdown-menu" role="menu">' +
            '       </ul>' +
            '   </div>' +
            '   <div class="btn-group" data-toggle="buttons">' +
            '       <button id="karyotypeButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-karyotype"></span></button>' +
            '       <button id="chromosomeButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-chromosome"></span></button>' +
            '       <button id="regionButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-region"></span></button>' +
            '   </div>' +


            '   <div id="zoomControl" class="btn-group" style="margin-left:5px;">' +
            '       <button id="zoomMinButton" class="btn btn-default custom-xs" type="button" style="width:31px">0</button>' +
            '       <button id="zoomOutButton" class="btn btn-default custom-xs" type="button"><span class="glyphicon glyphicon-minus"></span></button>' +
            '       <div id="progressBarCont" class="progress pull-left" style="width:120px;height:22px;margin:0px;background-color: #d5d5d5;border-radius: 0px;">' +
            '           <div id="progressBar" class="progress-bar" role="progressbar" aria-valuenow="45" aria-valuemin="0" aria-valuemax="100" style="width: 100%">' +
            '           </div>' +
            '       </div>' +
            '       <button id="zoomInButton" class="btn btn-default custom-xs" type="button"><span class="glyphicon glyphicon-plus"></span></button>' +
            '       <button id="zoomMaxButton" class="btn btn-default custom-xs" type="button" style="width:31px">100</button>' +
            '   </div>' +


            '   <div id="windowSizeControl" class="btn-group" style="width:150px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"> Window size: </span>' +
            '       <input id="windowSizeField" type="text" class="form-control custom-xs" placeholder="Window size">' +
            '   </div>' +
            '   </div>' +


            '   <div id="positionControl" class="btn-group" style="width:250px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"> Position: </span>' +
            '       <input id="regionField" type="text" class="form-control custom-xs" placeholder="1:10000-20000">' +
            '       <div class="input-group-btn">' +
            '           <button id="goButton" class="btn btn-default btn-sm custom-xs" type="button">Go!</button>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +


            '   <div id="moveControl" class="btn-group">' +
            '       <button id="moveFurtherLeftButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-arrow-w-bold"></span></button>' +
            '       <button id="moveLeftButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-arrow-w"></span></button>' +
            '       <button id="moveRightButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-arrow-e"></span></button>' +
            '       <button id="moveFurtherRightButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-arrow-e-bold"></span></button>' +
            '   </div>' +
            '   <div class="btn-group">' +
            '       <button id="autoheightButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon ocb-icon-track-autoheight"></span></button>' +
            '   </div>' +
            '    <div class="btn-group">' +
            '       <button id="compactButton" class="btn btn-default btn-xs custom-xs" type="button"><span class="ocb-icon glyphicon glyphicon-compressed"></span></button>' +
            '   </div>' +

            '   <div id="searchControl" class="btn-group" style="width:250px">' +
            '   <div class="input-group input-group-sm">' +
            '       <span class="input-group-addon custom-xs"> Search: </span>' +
            '       <input id="searchField" list="searchDataList" type="text" class="form-control custom-xs" placeholder="gene, snp...">' +
            '       <datalist id="searchDataList">' +
            '       </datalist>' +
            '       <div class="input-group-btn">' +
            '           <button id="quickSearchButton" class="btn btn-default btn-sm custom-xs" type="button"><span class="glyphicon glyphicon-search"></span></button>' +
            '       </div>' +
            '   </div>' +
            '   </div>' +

//            '   <div class="btn-group pull-right">' +
//            '       <div class="pull-left" style="height:22px;line-height: 22px;font-size:14px;">Search:&nbsp;</div>' +
//            '       <div class="input-group pull-left">' +
//            '           <input id="searchField" list="searchDataList" type="text" class="form-control" placeholder="gene, snp..." style="padding:0px 4px;height:22px;width:100px">' +
//            '           <datalist id="searchDataList">' +
//            '           </datalist>' +
//            '       </div>' +
////            '       <ul id="quickSearchMenu" class="dropdown-menu" role="menu">' +
////            '       </ul>' +
//            '       <button id="quickSearchButton" class="btn btn-default btn-xs" type="button"><span class="glyphicon glyphicon-search"></span></button>' +
//            '   </div>' +
            '</div>' +
            '';


        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.div).css({
            height: '32px'
        });
        $(this.targetDiv).append(this.div);

        $(this.div).find('.custom-xs').css({
            padding: '2px 4px',
            height: '22px',
            lineHeight: '16px',
            fontSize: '14px'
        });

        var els = $(this.div).find('*[id]');
        for (var i = 0; i < els.length; i++) {
            var elid = els[i].getAttribute('id');
            if (elid) {
                this.els[elid] = els[i];
            }
        }

        /**Check components config**/
        for (var key in this.componentsConfig) {
            if (!this.componentsConfig[key]) {
                $(this.els[key]).hide();
            }
        }
        /*****/

        /*** ***/
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
