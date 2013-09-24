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
    this.zoom;

    //set instantiation args, must be last
    _.extend(this, args);

    //set new region object
    this.region = new Region(this.region);

    this.currentChromosomeList = [];

    this.on(this.handlers);

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

        var navgationHtml =
            '<a id="restoreDefaultRegionButton">&nbsp;</a>' +
                '<button id="regionHistoryButton">&nbsp;</button>' +
                '<ul id="regionHistoryMenu" style="display: inline-block; position: absolute; width: 150px; z-index:100000"></ul>' +
                '<button id="speciesButton"><span id="speciesText">' + this.species.text + '</span></button>' +
                '<ul id="speciesMenu" style="display: inline-block; position: absolute; width: 200px; z-index:100000"></ul>' +
                '<button id="chromosomesButton"> <span id="chromosomesText">' + this.region.chromosome + '</span></button>' +
                '<ul id="chromosomesMenu" style="display: inline-block; position: absolute; width: 100px; z-index:100000"></ul>' +
                '<div class="buttonset inlineblock">' +
                '<input type="checkbox" checked="true" id="karyotypeButton" /><label for="karyotypeButton"></label>' +
                '<input type="checkbox" checked="true" id="chromosomeButton" /><label for="chromosomeButton"></label>' +
                '<input type="checkbox" checked="true" id="regionButton" /><label for="regionButton"></label>' +
                '</div>' +
                '<a id="zoomOutButton">&nbsp;</a>' +
                '<div id="slider" class="ocb-zoom-slider"></div>' +
                '<a id="zoomInButton">&nbsp;</a>' +
                '<label class="ocb-text" style="margin-left:10px" for="regionField">Position:</label><input id="regionField" class="ocb-input-text" placeholder="Enter region..." type="text">' +
                '<button id="goButton">Go!</button>' +
                '<div class="buttonset inlineblock">' +
                '<a id="moveFurtherLeftButton">&nbsp;</a>' +
                '<a id="moveLeftButton">&nbsp;</a>' +
                '<a id="moveRightButton">&nbsp;</a>' +
                '<a id="moveFurtherRightButton">&nbsp;</a>' +
                '</div>' +
                '<label class="ocb-text" style="margin-left:10px" for="searchField">Search</label><input id="searchField" class="ocb-input-text" placeholder="gene, snp..." size="8" type="text">' +
//                '<a id="fullScreenButton" style="margin-left:10px" >&nbsp;</a>' +
                '<a id="autoheightButton" style="margin-left:10px" >&nbsp;</a>' +
                '';


        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="navigation-bar" class="gv-navigation-bar unselectable">' + navgationHtml + '</div>')[0];
        $(this.targetDiv).append(this.div);

        $(this.div).find('.buttonset').buttonset().css({margin: '0px 10px'});


        this.restoreDefaultRegionButton = $(this.div).find('#restoreDefaultRegionButton').button({icons: {primary: 'ocb-icon-repeat'}, text: false});

        $(this.restoreDefaultRegionButton).click(function (e) {
            _this.trigger('restoreDefaultRegion:click', {clickEvent: e, sender: {}})
        });


        this.regionHistoryButton = $(this.div).find('#regionHistoryButton').button({
            icons: {primary: 'ocb-icon-clock', secondary: 'ui-icon-triangle-1-s'}, text: ' '
        });
        this.regionHistoryMenu = $(this.div).find('#regionHistoryMenu').hide().menu();
        this._addRegionHistoryMenuItem(this.region);
        $(this.regionHistoryButton).click(function () {
            var menu = $(_this.regionHistoryMenu);
            if ($(menu).css('display') == 'none') {
                $(menu).show().position({
                    my: "left top",
                    at: "left bottom",
                    of: this
                });
                $(document).one("click", function () {
                    menu.hide();
                });
            } else {
                menu.hide();
            }
            return false;
        });


        this.speciesButton = $(this.div).find('#speciesButton').button({
            icons: {secondary: 'ui-icon-triangle-1-s'}
        });
        this.speciesText = $(this.div).find('#speciesText');
        this.speciesMenu = $(this.div).find('#speciesMenu').hide().menu();
        this._setSpeciesMenu();

        $(this.speciesButton).click(function () {
                var menu = $(_this.speciesMenu);
                if ($(menu).css('display') == 'none') {
                    $(menu).show().position({
                        my: "left top",
                        at: "left bottom",
                        of: this
                    });
                    $(document).one("click", function () {
                        menu.hide();
                    });
                } else {
                    menu.hide();
                }
                return false;
            }
        )
        ;

        this.chromosomesButton = $(this.div).find('#chromosomesButton').button({
            icons: {primary: 'ocb-icon-chromosome', secondary: 'ui-icon-triangle-1-s'}
        });
        this.chromosomesText = $(this.div).find('#chromosomesText');
        this.chromosomesMenu = $(this.div).find('#chromosomesMenu').hide().menu();
        this._setChromosomeMenu();

        $(this.chromosomesButton).click(function () {
            var menu = $(_this.chromosomesMenu);
            if ($(menu).css('display') == 'none') {
                $(menu).show().position({
                    my: "left top",
                    at: "left bottom",
                    of: this
                });
                $(document).one("click", function () {
                    menu.hide();
                });
            } else {
                menu.hide();
            }
            return false;
        });

        this.karyotypeButton = $(this.div).find('#karyotypeButton').button({icons: {primary: 'ocb-icon-karyotype'}, text: false, label: 'karyotype'});
        this.chromosomeButton = $(this.div).find('#chromosomeButton').button({icons: {primary: 'ocb-icon-chromosome'}, text: false, label: 'chromosome'});
        this.regionButton = $(this.div).find('#regionButton').button({icons: {primary: 'ocb-icon-region'}, text: false, label: 'region'});
        $(this.div).find('.buttonset').find('.ui-icon').css({'margin-left': '-9px'});

        $(this.karyotypeButton).click(function () {
            _this.trigger('karyotype-button:change', {selected: $(this).is(':checked'), sender: _this});
        });
        $(this.chromosomeButton).click(function () {
            _this.trigger('chromosome-button:change', {selected: $(this).is(':checked'), sender: _this});
        });
        $(this.regionButton).click(function () {
            _this.trigger('region-button:change', {selected: $(this).is(':checked'), sender: _this});
        });

        this.zoomSlider = $(this.div).find("#slider");
        $(this.zoomSlider).slider({
            range: "min",
            value: this.zoom,
            min: 0,
            max: 100,
            step: Number.MIN_VALUE,
            stop: function (event, ui) {
                _this._handleZoomSlider(ui.value);
            }
        });

        this.zoomInButton = $(this.div).find('#zoomInButton').button({icons: {primary: 'ocb-icon-plus'}, text: false});
        this.zoomOutButton = $(this.div).find('#zoomOutButton').button({icons: {primary: 'ocb-icon-minus'}, text: false});
        $(this.zoomOutButton).click(function () {
            _this._handleZoomOutButton();
        });
        $(this.zoomInButton).click(function () {
            _this._handleZoomInButton();
        });

        this.regionField = $(this.div).find('#regionField')[0];
        $(this.regionField).bind('keypress', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code == 13) { //Enter keycode
                _this._goRegion($(this).val());
            }
        });
        $(this.regionField).val(this.region.toString());

        this.goButton = $(this.div).find('#goButton').button();
        $(this.goButton).click(function () {
            _this._goRegion($(_this.regionField).val());

        });

        this.moveFurtherLeftButton = $(this.div).find('#moveFurtherLeftButton').button({icons: {primary: 'ocb-icon-arrow-w-bold'}, text: false});
        this.moveFurtherRightButton = $(this.div).find('#moveFurtherRightButton').button({icons: {primary: 'ocb-icon-arrow-e-bold'}, text: false});
        this.moveLeftButton = $(this.div).find('#moveLeftButton').button({icons: {primary: 'ocb-icon-arrow-w'}, text: false});
        this.moveRightButton = $(this.div).find('#moveRightButton').button({icons: {primary: 'ocb-icon-arrow-e'}, text: false});

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


        this.fullScreenButton = $(this.div).find('#fullScreenButton').button({icons: {primary: 'ocb-icon-resize'}, text: false});

        $(this.fullScreenButton).click(function (e) {
            _this.trigger('fullscreen:click', {clickEvent: e, sender: {}})
        });

        this.autoheightButton = $(this.div).find('#autoheightButton').button({icons: {primary: 'ocb-icon-track-autoheight'}, text: false});

        $(this.autoheightButton).click(function (e) {
            _this.trigger('autoHeight-button:click', {clickEvent: e,sender: _this});
        });


//        this.searchButton = $(this.div).find('#searchButton');
        this.searchField = $(this.div).find('#searchField');


        $(this.searchField).autocomplete({
            source: function (query, process) {
                process(_this._quickSearch(query));
            },
            minLength: 3
        });
//

//
//
//        $(this.searchButton).click(function () {
//            _this._goFeature();
//        });
//
//
//        $(this.searchField).typeahead({
//            source: function (query, process) {
//                process(_this._quickSearch(query));
//            },
//            minLength: 3,
//            items: 50
//        });
//
//        $(this.searchField).bind('keypress', function (e) {
//            var code = (e.keyCode ? e.keyCode : e.which);
//            if (code == 13) { //Enter keycode
//                _this._goFeature();
//            }
//        });
//
//        //by default all buttons are pressed
//        $(this.karyotypeButton).button('toggle');
//        $(this.chromosomeButton).button('toggle');
//        $(this.regionButton).button('toggle');
//
//        $(this.regionField).val(this.region.toString());

        this.rendered = true;
    },

    _addRegionHistoryMenuItem: function (region) {
        var _this = this;
        var menuEntry = $('<li class="ui-menu-item" role="presentation"><a id="ui-id-1" class="ui-corner-all" tabindex="-1" role="menuitem">' + region.toString() + '</a></li>')[0];
        $(this.regionHistoryMenu).append(menuEntry);
        $(menuEntry).click(function () {
            _this.region.parse($(this).text());
            _this._recalculateZoom();
            _this.trigger('region:change', {region: _this.region, sender: _this});
            console.log($(this).text());
        });
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
            var menuEntry = $('<li class="ui-menu-item" role="presentation"><a id="ui-id-1" class="ui-corner-all" tabindex="-1" role="menuitem">' + list[i] + '</a></li>')[0];
            $(this.chromosomesMenu).append(menuEntry);
            $(menuEntry).click(function () {
                $(_this.chromosomesText).text($(this).text());
                _this.region.chromosome = $(this).text();
                _this._recalculateZoom();
                _this._addRegionHistoryMenuItem(_this.region);
                _this.trigger('region:change', {region: _this.region, sender: _this});
                console.log($(this).text());
            });
        }
    },

    _setSpeciesMenu: function () {
        var _this = this;

        var createEntry = function (species) {
            var menuEntry = $('<li class="ui-menu-item" role="presentation"><a id="ui-id-1" class="ui-corner-all" tabindex="-1" role="menuitem">' + species.text + '</a></li>')[0];
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
            $(this.chromosomeText).text(this.region.chromosome);
            this._recalculateZoom();
            this._addRegionHistoryMenuItem(this.region);
            this.trigger('region:change', {region: this.region, sender: this});
        }
    },

    _quickSearch: function (query) {
        var results = [];
        var speciesCode = Utils.getSpeciesCode(this.species.text).substr(0, 3);
//        var host = new CellBaseManager().host;
        var host = 'http://ws.bioinfo.cipf.es/cellbase/rest';
        $.ajax({
            url: host + '/latest/' + speciesCode + '/feature/id/' + query.term + '/starts_with?of=json',
            async: false,
            dataType: 'json',
            success: function (data, textStatus, jqXHR) {
                for (var i in data[0]) {
                    results.push(data[0][i].displayId);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            }
        });
        return results;
    },

    _goFeature: function (featureName) {
        if (featureName != null) {
            if (featureName.slice(0, "rs".length) == "rs" || featureName.slice(0, "AFFY_".length) == "AFFY_" || featureName.slice(0, "SNP_".length) == "SNP_" || featureName.slice(0, "VAR_".length) == "VAR_" || featureName.slice(0, "CRTAP_".length) == "CRTAP_" || featureName.slice(0, "FKBP10_".length) == "FKBP10_" || featureName.slice(0, "LEPRE1_".length) == "LEPRE1_" || featureName.slice(0, "PPIB_".length) == "PPIB_") {
                this.openSNPListWidget(featureName);
            } else {
                this.openGeneListWidget(featureName);
            }
        }
    },

    _handleZoomOutButton: function () {
        this._handleZoomSlider(Math.max(0, this.zoom - 1));
        $(this.zoomSlider).slider("value", this.zoom);
    },
    _handleZoomSlider: function (value) {
        this.zoom = value;
        this.region.load(this._calculateRegionByZoom());
        $(this.regionField).val(this.region.toString());
        this._addRegionHistoryMenuItem(this.region);
        this.trigger('region:change', {region: this.region, sender: this});
    },
    _handleZoomInButton: function () {
        this._handleZoomSlider(Math.min(100, this.zoom + 1));
        $(this.zoomSlider).slider("value", this.zoom);
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
        $(this.chromosomeText).text(this.region.chromosome);
        $(this.regionField).val(this.region.toString());
        this._recalculateZoom();
        this._addRegionHistoryMenuItem(region);
    },
    moveRegion: function (region) {
        this.region.load(region);
        $(this.chromosomeText).text(this.region.chromosome);
        $(this.regionField).val(this.region.toString());
        this._recalculateZoom();
    },

    setWidth: function (width) {
        this.width = width;
        this._recalculateZoom();
    },

    _recalculateZoom: function () {
        this.zoom = this._calculateZoomByRegion();
        $(this.zoomSlider).slider("value", this.zoom);
    },

    draw: function () {
        if (!this.rendered) {
            console.info(this.id + ' is not rendered yet');
            return;
        }

        // Visual components creation, all theses components will be
        // added to the navigation bar below.

//        this.speciesMenu = this._createSpeciesMenu();
//        this.chromosomeMenu = this._createChromosomeMenu();
//        this.karyotypeButton = this._createKaryotypeButton();
//        this.chromosomeButton = this._createChromosomeButton();
//        this.regionButton = this._createRegionButton();
//
//        // ...
//        this.searchComboBox = this._createSearchComboBox();
//        this.fullscreenButton = this._createFullScreenButton();
//
//        var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
//            id: this.id+"navToolbar",
//            renderTo: $(this.div).attr('id'),
//            cls:'nav',
//            region:"north",
//            width:'100%',
//            border: false,
//            height: 35,
////		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
//            items : [
//                {
//                    id: this.id+"speciesMenuButton",
//                    text : 'Species',
//                    menu: this.speciesMenu
//                },
//                {
//                    id: this.id + "chromosomeMenuButton",
//                    text : 'Chromosome',
//                    menu: this.chromosomeMenu
//                },
//                '-',
//                this.karyotypeButton,
//                this.chromosomeButton,
//                this.regionButton,
//                '-',
////		         {
////		        	 id:this.id+"left1posButton",
////		        	 text : '<',
////		        	 margin : '0 0 0 15',
////		        	 handler : function() {
////		        		 _this._handleNavigationBar('<');
////		        	 }
////		         },
//                {
//                    id:this.id+"zoomOutButton",
//                    tooltip:'Zoom out',
//                    iconCls:'icon-zoom-out',
//                    margin : '0 0 0 10',
//                    listeners : {
//                        click:{
//                            fn :function() {
//                                var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
//                                Ext.getCmp(_this.id+'zoomSlider').setValue(current-_this.increment);
//                            }
////		        			 buffer : 300
//                        }
//                    }
//                },
//                this._getZoomSlider(),
//                {
//                    id:this.id+"zoomInButton",
//                    margin:'0 5 0 0',
//                    tooltip:'Zoom in',
//                    iconCls:'icon-zoom-in',
//                    listeners : {
//                        click:{
//                            fn :function() {
//                                var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
//                                Ext.getCmp(_this.id+'zoomSlider').setValue(current+_this.increment);
//                            }
////		        			 buffer : 300
//                        }
//                    }
//                },'-',
////		         {
////		        	 id:this.id+"right1posButton",
////		        	 text : '>',
////		        	 handler : function() {
////		        		 _this._handleNavigationBar('>');
////		        	 }
////		         },
//                {
//                    id:this.id+'positionLabel',
//                    xtype : 'label',
//                    text : 'Position:',
//                    margins : '0 0 0 10'
//                },{
//                    id : this.id+'tbCoordinate',
//                    xtype : 'textfield',
//                    width : 165,
//                    value : this.region.toString(),
//                    listeners:{
//                        specialkey: function(field, e){
//                            if (e.getKey() == e.ENTER) {
//                                _this._handleNavigationBar('Go');
//                            }
//                        }
//                    }
//                },
//                {
//                    id : this.id+'GoButton',
//                    text : 'Go',
//                    handler : function() {
//                        _this._handleNavigationBar('Go');
//                    }
//                },'->',
////		         {
////		        	 id : this.id+'searchLabel',
////		        	 xtype : 'label',
////		        	 text : 'Quick search:',
////		        	 margins : '0 0 0 10'
////		         },
//                this.searchComboBox,
////		         {
////		        	 id : this.id+'quickSearch',
////		        	 xtype : 'textfield',
////		        	 emptyText:'gene, protein, transcript',
////		        	 name : 'field1',
////		        	 listeners:{
////		        		 specialkey: function(field, e){
////		        			 if (e.getKey() == e.ENTER) {
////		        				 _this._handleNavigationBar('GoToGene');
////		        			 }
////		        		 },
////		        		 change: function(){
////		        			 	var str = this.getValue();
////		        			 	if(str.length > 3){
////		        			 		console.log(this.getValue());
////		        			 	}
////					     }
////		        	 }
////		         },
//                {
//                    id : this.id+'GoToGeneButton',
//                    iconCls:'icon-find',
//                    handler : function() {
//                        _this._handleNavigationBar('GoToGene');
//                    }
//                },
//                this.fullscreenButton
//            ]
//        });
//
//        //    return navToolbar;
//        this.setSpeciesMenu({}, this.availableSpecies);
    },

//    _createSpeciesMenu: function () {
//        //items must be added by using  setSpeciesMenu()
//        var speciesMenu = Ext.create('Ext.menu.Menu', {
//            id: this.id + "speciesMenu",
//            margin: '0 0 10 0',
//            floating: true,
//            plain: true,
//            items: []
//        });
//
//        return speciesMenu;
//    },
//
//    getSpeciesMenu: function () {
//        return this.speciesMenu;
//    },

//    //Sets the species buttons in the menu
//    setSpeciesMenu: function (speciesObj, popular) {
//        var _this = this;
//
//        var menu = this.getSpeciesMenu();
//        //Auto generate menu items depending of AVAILABLE_SPECIES config
//        menu.hide();//Hide the menu panel before remove
//        menu.removeAll(); // Remove the old species
//
//        var popularSpecies = [];
//
//        var items;
//        if (typeof popular != 'undefined') {
//            popular.sort(function (a, b) {
//                return a.text.localeCompare(b.text);
//            });
//            items = popular;
//        }
//
//        if (typeof speciesObj.items != 'undefined') {
//            items.push('-');
//            for (var i = 0; i < speciesObj.items.length; i++) {
//                var phylo = speciesObj.items[i];
//                var phyloSpecies = phylo.items;
//                phylo.menu = {items: phyloSpecies};
//                for (var j = 0; j < phyloSpecies.length; j++) {
//                    var species = phyloSpecies[j];
//                    var text = species.text + ' (' + species.assembly + ')';
////            species.id = this.id+text;
//                    species.name = species.text;
//                    species.species = Utils.getSpeciesCode(species.text);
//                    species.text = text;
//                    species.speciesObj = species;
//                    species.iconCls = '';
////            species.icon = 'http://static.ensembl.org/i/species/48/Danio_rerio.png';
//                    species.handler = function (me) {
//                        _this.selectSpecies(me.speciesObj.text);
//                    };
//
//                    if (popular.indexOf(species.name) != -1) {
//                        items.push(species);
//                    }
//                }
//            }
//        }
//
//        menu.add(items);
//    },

//    //Sets the new specie and fires an event
//    selectSpecies: function (data) {
////        this.region.load(data.region);
//        data["sender"] = "setSpecies";
////        this.onRegionChange.notify(data);
//        this.trigger('species:change', {species: data, sender: this});
//    },


//    _createChromosomeMenu: function () {
//        var _this = this;
//        var chrStore = Ext.create('Ext.data.Store', {
//            id: this.id + "chrStore",
//            fields: ["name"],
//            autoLoad: false
//        });
//        /*Chromolendar*/
//        var chrView = Ext.create('Ext.view.View', {
//            id: this.id + "chrView",
//            width: 125,
//            style: 'background-color:#fff',
//            store: chrStore,
//            selModel: {
//                mode: 'SINGLE',
//                listeners: {
//                    selectionchange: function (este, selNodes) {
//                        if (selNodes.length > 0) {
//                            _this.region.chromosome = selNodes[0].data.name;
//                            _this.onRegionChange.notify({sender: "_getChromosomeMenu"});
//// 					_this.setChromosome(selNodes[0].data.name);
//                        }
//                        chromosomeMenu.hide();
//                    }
//                }
//            },
//            cls: 'list',
//            trackOver: true,
//            overItemCls: 'list-item-hover',
//            itemSelector: '.chromosome-item',
//            tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
////	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
//        });
//        /*END chromolendar*/
//
//        var chromosomeMenu = Ext.create('Ext.menu.Menu', {
//            id: this.id + "chromosomeMenu",
//            almacen: chrStore,
//            plain: true,
//            items: [/*{xtype:'textfield', width:125},*/chrView]
////        items:[ //TODO alternative
////            {
////                xtype: 'buttongroup',
////                id:this.id+'chrButtonGroup',
//////                title: 'User options',
////                columns: 5,
////                defaults: {
////                    xtype: 'button',
//////                    scale: 'large',
////                    iconAlign: 'left',
////                    handler:function(){}
////                },
//////                items : [chrView]
//////                items: []
////            }
////        ]
//        });
//        var chromosomeData = [];
//        for (var i = 0; i < this.availableSpecies[1].chromosomes.length; i++) {
//            chromosomeData.push({'name': this.availableSpecies[1].chromosomes[i]});
//        }
//        chrStore.loadData(chromosomeData);
////        this.setChromosomes(this.availableSpecies[1].chromosomes);
//        return chromosomeMenu;
//    },

//    getChromosomeMenu: function () {
//        return this.chromosomeMenu;
//    },
//
//    setChromosomes: function (chromosomes) {
//        var _this = this;
//        var chrStore = Ext.getStore(this.id + "chrStore");
//        var chrView = Ext.getCmp(this.id + "chrView");
//
//        var chromosomeData = [];
//        for (var i = 0; i < chromosomes.length; i++) {
//            chromosomeData.push({'name': chromosomes[i]});
//        }
//        chrStore.loadData(chromosomeData);
//
////	var chrButtonGroup = Ext.getCmp(this.id+"chrButtonGroup");
////        var cellBaseManager = new CellBaseManager(this.species);
////        cellBaseManager.success.addEventListener(function(sender,data){
////            var chromosomeData = [];
////            var chrItems = [];
////            var sortfunction = function(a, b) {
////                var IsNumber = true;
////                for (var i = 0; i < a.length && IsNumber == true; i++) {
////                    if (isNaN(a[i])) {
////                        IsNumber = false;
////                    }
////                }
////                if (!IsNumber) return 1;
////                return (a - b);
////            };
////            data.result.sort(sortfunction);
////            for (var i = 0; i < data.result.length; i++) {
////                chromosomeData.push({'name':data.result[i]});
//////            chrItems.push({text:data.result[i],iconAlign: 'left'});
////            }
////            chrStore.loadData(chromosomeData);
//////        chrButtonGroup.removeAll();
//////        chrButtonGroup.add(chrItems);
//////		chrView.getSelectionModel().select(chrStore.find("name",_this.chromosome));
////        });
////        cellBaseManager.get('feature', 'chromosome', null, 'list');
//    },


//    _createKaryotypeButton: function () {
//        var _this = this;
//        var karyotypeButton = Ext.create('Ext.Button', {
//            id: this.id + "karyotypeButton",
//            text: 'Karyotype',
//            enableToggle: true,
//            pressed: true,
//            toggleHandler: function () {
//                _this.trigger('karyotype-button:change', {selected: this.pressed, sender: _this});
//            }
//        });
//        return karyotypeButton;
//    },
//
//    _createChromosomeButton: function () {
//        var _this = this;
//        var chromosomeButton = Ext.create('Ext.Button', {
//            id: this.id + "ChromosomeButton",
//            text: 'Chromosome',
//            enableToggle: true,
//            pressed: true,
////            overCls: 'custom-button-over',
////            pressedCls: 'custom-button-pressed',
//            toggleHandler: function () {
//                _this.trigger('chromosome-button:change', {selected: this.pressed, sender: _this});
//            }
//        });
//        return chromosomeButton;
//    },
//
//    getKaryotypeButton: function (presses) {
//        return this.karyotypeButton;
//    },
//
//    setKaryotypeToogleButton: function () {
////        this.karyotypeButton.set
//        this.trigger('karyotype-button:change', {selected: this.karyotypeButton.pressed, sender: _this});
//    },
//
//    _createRegionButton: function () {
//        var _this = this;
//        var regionButton = Ext.create('Ext.Button', {
//            id: this.id + "RegionButton",
//            text: 'Region',
//            enableToggle: true,
//            pressed: true,
//            toggleHandler: function () {
//                _this.trigger('region-button:change', {selected: this.pressed, sender: _this});
//            }
//
//        });
//        return regionButton;
//    },

//    _getZoomSlider: function () {
//        var _this = this;
//        if (this._zoomSlider == null) {
//            this._zoomSlider = Ext.create('Ext.slider.Single', {
//                id: this.id + 'zoomSlider',
//                width: 170,
//                maxValue: 100,
//                minValue: 0,
//                value: this.zoom,
//                useTips: true,
//                increment: 1,
//                tipText: function (thumb) {
//                    return Ext.String.format('<b>{0}%</b>', thumb.value);
//                },
//                listeners: {
//                    'change': {
//                        fn: function (slider, newValue) {
//                            _this.zoom = newValue;
//                            _this.region.load(_this._calculateRegionByZoom());
//                            Ext.getCmp(_this.id + 'tbCoordinate').setValue(_this.region.toString());
//                            _this.trigger('region:change', {region: _this.region, sender: _this});
//                        },
//                        buffer: 500
//                    }
//                }
//            });
//        }
//        return this._zoomSlider;
//    },
    _calculateRegionByZoom: function () {
        var zoomBaseLength = (this.width - this.svgCanvasWidthOffset) / Utils.getPixelBaseByZoom(this.zoom);
        var centerPosition = this.region.center();
        var aux = Math.ceil((zoomBaseLength / 2) - 1);
        var start = Math.floor(centerPosition - aux);
        var end = Math.floor(centerPosition + aux);
        return {start: start, end: end};
    },
    _calculateZoomByRegion: function () {
        return Utils.getZoomByPixelBase((this.width - this.svgCanvasWidthOffset) / this.region.length());
    },

//    _createSearchComboBox: function () {
//        var _this = this;
//
//        var searchResults = Ext.create('Ext.data.Store', {
//            fields: ["xrefId", "displayId", "description"]
//        });
//
//        var searchCombo = Ext.create('Ext.form.field.ComboBox', {
//            id: this.id + '-quick-search',
//            displayField: 'displayId',
//            valueField: 'displayId',
//            emptyText: 'gene, snp, ...',
//            hideTrigger: true,
//            fieldLabel: 'Search:',
//            labelWidth: 40,
//            width: 150,
//            store: searchResults,
//            queryMode: 'local',
//            typeAhead: false,
//            autoSelect: false,
//            queryDelay: 500,
//            listeners: {
//                change: function () {
//                    var value = this.getValue();
//                    var min = 2;
//                    if (value && value.substring(0, 3).toUpperCase() == "ENS") {
//                        min = 10;
//                    }
//                    if (value && value.length > min) {
//                        $.ajax({
////                        url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
//                            url: "http://ws.bioinfo.cipf.es/cellbase/rest/latest/hsa/feature/id/" + this.getValue() + "/starts_with?of=json",
//                            success: function (data, textStatus, jqXHR) {
//                                var d = JSON.parse(data);
//                                searchResults.loadData(d[0]);
//                                console.log(searchResults)
//                            },
//                            error: function (jqXHR, textStatus, errorThrown) {
//                                console.log(textStatus);
//                            }
//                        });
//                    }
//                },
//                select: function (field, e) {
//                    _this._handleNavigationBar('GoToGene');
//                }
////			,specialkey: function(field, e){
////				if (e.getKey() == e.ENTER) {
////					_this._handleNavigationBar('GoToGene');
////				}
////			}
//            },
//            tpl: Ext.create('Ext.XTemplate',
//                '<tpl for=".">',
//                '<div class="x-boundlist-item">{displayId} ({displayId})</div>',
//                '</tpl>'
//            )
//        });
//        return searchCombo;
//    },
//
//    _createFullScreenButton: function () {
//        var _this = this;
//        var regionButton = Ext.create('Ext.Button', {
//            id: this.id + "FullScreenButton",
//            text: 'F11',
//            cls: 'x-btn-text-icon',
//            enableToggle: false,
//            toggleHandler: function () {
//                var elem = document.getElementById("genome-viewer");
//                req = elem.requestFullScreen || elem.webkitRequestFullScreen || elem.mozRequestFullScreen;
//                req.call(elem);
////                if (elem.requestFullscreen) {
////                    elem.requestFullscreen();
////                } else if (elem.mozRequestFullScreen) {
////                    elem.mozRequestFullScreen();
////                } else if (elem.webkitRequestFullscreen) {
////                    elem.webkitRequestFullscreen();
////                }
//            }
//
//        });
//        return regionButton;
//    },

    _handleNavigationBar: function (action, args) {
////	var _this = this;
//        if (action == 'OptionMenuClick') {
//            this.genomeWidget.showTranscripts = Ext.getCmp("showTranscriptCB").checked;
//            this.genomeWidgetProperties.setShowTranscripts(Ext.getCmp("showTranscriptCB").checked);
//            this.refreshMasterGenomeViewer();
//        }
////        if (action == 'ZOOM'){
////            this.setZoom(args);
////            this.onRegionChange.notify({sender:"zoom"});
////        }
        if (action == 'GoToGene') {
            var geneName = Ext.getCmp(this.id + 'quickSearch').getValue();
            if (geneName != null) {
                if (geneName.slice(0, "rs".length) == "rs" || geneName.slice(0, "AFFY_".length) == "AFFY_" || geneName.slice(0, "SNP_".length) == "SNP_" || geneName.slice(0, "VAR_".length) == "VAR_" || geneName.slice(0, "CRTAP_".length) == "CRTAP_" || geneName.slice(0, "FKBP10_".length) == "FKBP10_" || geneName.slice(0, "LEPRE1_".length) == "LEPRE1_" || geneName.slice(0, "PPIB_".length) == "PPIB_") {
                    this.openSNPListWidget(geneName);
                } else {
                    this.openGeneListWidget(geneName);
                }
            }
        }
//        if (action == '+'){
////  	var zoom = this.genomeWidgetProperties.getZoom();
//            var zoom = this.zoom;
//            if (zoom < 100){
//                this.setZoom(zoom + this.increment);
//            }
//        }
//        if (action == '-'){
////    	 var zoom = this.genomeWidgetProperties.getZoom();
//            var zoom = this.zoom;
//            if (zoom >= 5){
//                this.setZoom(zoom - this.increment);
//            }
//        }

//        if (action == 'Go') {
//            var value = Ext.getCmp(this.id + 'tbCoordinate').getValue();
//
//            var reg = new Region({str: value});
//
//            // Validate chromosome and position
//            if (isNaN(reg.start) || reg.start < 0) {
//                Ext.getCmp(this.id + 'tbCoordinate').markInvalid("Position must be a positive number");
//            }
//            else if (Ext.getCmp(this.id + "chromosomeMenu").almacen.find("name", reg.chromosome) == -1) {
//                Ext.getCmp(this.id + 'tbCoordinate').markInvalid("Invalid chromosome");
//            }
//            else {
//                this.region.load(reg);
////            this.onRegionChange.notify({sender:"GoButton"});
//                this._recalculateZoom();
//
//                this.trigger('region:change', {region: this.region, sender: this});
//            }
//
//        }
    },
    setSpeciesVisible: function (bool) {
        if (bool) {
            Ext.getCmp(this.id + "speciesMenuButton").show();
        } else {
            Ext.getCmp(this.id + "speciesMenuButton").hide();
        }
    },
    setChromosomeMenuVisible: function (bool) {
        if (bool) {
            Ext.getCmp(this.id + "chromosomeMenuButton").show();
        } else {
            Ext.getCmp(this.id + "chromosomeMenuButton").hide();
        }
    },
    setKaryotypePanelButtonVisible: function (bool) {
        this.karyotypeButton.setVisible(bool);
    },
    setChromosomePanelButtonVisible: function (bool) {
        this.chromosomeButton.setVisible(bool);
    },
    setRegionOverviewPanelButtonVisible: function (bool) {
        this.regionButton.setVisible(bool);
    },
    setRegionTextBoxVisible: function (bool) {
        if (bool) {
            Ext.getCmp(this.id + "positionLabel").show();
            Ext.getCmp(this + "tbCoordinate").show();
            Ext.getCmp(this.id + "GoButton").show();
        } else {
            Ext.getCmp(this.id + "positionLabel").hide();
            Ext.getCmp(this.id + "tbCoordinate").hide();
            Ext.getCmp(this.id + "GoButton").hide();
        }
    },
    setSearchVisible: function (bool) {
        if (bool) {
            this.searchComboBox.show();
            Ext.getCmp(this.id + "GoToGeneButton").show();
        } else {
            this.searchComboBox.hide();
            Ext.getCmp(this.id + "GoToGeneButton").hide();
        }
    },
    setFullScreenButtonVisible: function (bool) {
        this.fullscreenButton.setVisible(bool);
    }

}