/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 5/28/13
 * Time: 12:30 PM
 * To change this template use File | Settings | File Templates.
 */
function NavigationBar (targetId, args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    var _this = this;
    this.region = new Region();
    this.targetId = targetId;
    this.species = 'hsapiens';

    if (typeof args != 'undefined') {
        this.species = args.species || this.species;
        if (args.region != null) {
            this.region.load(args.region);
        }

    }

    var searchResults = Ext.create('Ext.data.Store', {
        fields: ["xrefId","displayId","description"]
    });


    var searchCombo = Ext.create('Ext.form.field.ComboBox', {
        id : this.id+'quickSearch',
        displayField: 'displayId',
        valueField: 'displayId',
        emptyText:'gene, snp',
        hideTrigger: true,
        fieldLabel:'Search:',
        labelWidth:40,
        width:150,
        store: searchResults,
        queryMode: 'local',
        typeAhead:false,
        autoSelect:false,
        queryDelay: 500,
        listeners:{
            change:function(){
                var value = this.getValue();
                var min = 2;
                if(value && value.substring(0,3).toUpperCase() == "ENS"){
                    min = 10;
                }
                if(value && value.length > min){
                    $.ajax({
                        url:new CellBaseManager().host+"/latest/"+_this.species+"/feature/id/"+this.getValue()+"/starts_with?of=json",
                        success:function(data, textStatus, jqXHR){
                            var d = JSON.parse(data);
                            searchResults.loadData(d[0]);
                            console.log(searchResults)
                        },
                        error:function(jqXHR, textStatus, errorThrown){console.log(textStatus);}
                    });
                }
            },
            select: function(field, e){
                _this._handleNavigationBar('GoToGene');
            }
//			,specialkey: function(field, e){
//				if (e.getKey() == e.ENTER) {
//					_this._handleNavigationBar('GoToGene');
//				}
//			}
        }
    });

    var navToolbar = Ext.create('Ext.toolbar.Toolbar', {
        id:this.id+"navToolbar",
        renderTo: this.targetId,
        cls:"bio-toolbar",
        region:"north",
        border:true,
        height:35,
//		enableOverflow:true,//if the field is hidden getValue() reads "" because seems the hidden field is a different object
        items : [
            {
                id:this.id+"speciesMenuButton",
                text : this.speciesName,
                menu: this._getSpeciesMenu()
            },{
                id: this.id + "chromosomeMenuButton",
                text : 'Chromosome',
                menu: this._getChromosomeMenu()
            },
            '-',
            {
                id:this.id+"karyotypeButton",
                text : 'Karyotype',
                enableToggle:true,
                pressed:false,
                toggleHandler:function() {
                    if(this.pressed){
                        Ext.getCmp(_this.id+"karyotypePanel").show();
                    }else{
                        Ext.getCmp(_this.id+"karyotypePanel").hide();
                    }
                }
            },
            {
                id:this.id+"ChromosomeToggleButton",
                text : 'Chromosome',
                enableToggle:true,
                pressed:true,
                toggleHandler:function() {
                    if(this.pressed){
                        Ext.getCmp(_this.id+"chromosomePanel").show();
                    }else{
                        Ext.getCmp(_this.id+"chromosomePanel").hide();
                    }
                }
            },
            {
                id:this.id+"RegionToggleButton",
                text : 'Region',
                enableToggle:true,
                pressed:this.regionPanelHidden,
                toggleHandler:function() {
                    if(this.pressed){
                        Ext.getCmp(_this.id+"regionPanel").show();
                    }else{
                        Ext.getCmp(_this.id+"regionPanel").hide();
                    }
                }
            },
            '-',
//		         {
//		        	 id:this.id+"left1posButton",
//		        	 text : '<',
//		        	 margin : '0 0 0 15',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('<');
//		        	 }
//		         },
            {
                id:this.id+"zoomOutButton",
                tooltip:'Zoom out',
                iconCls:'icon-zoom-out',
                margin : '0 0 0 10',
                listeners : {
                    click:{
                        fn :function() {
                            var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
                            Ext.getCmp(_this.id+'zoomSlider').setValue(current-_this.increment);
                        }
//		        			 buffer : 300
                    }
                }
            },
            this._getZoomSlider(),
            {
                id:this.id+"zoomInButton",
                margin:'0 5 0 0',
                tooltip:'Zoom in',
                iconCls:'icon-zoom-in',
                listeners : {
                    click:{
                        fn :function() {
                            var current = Ext.getCmp(_this.id+'zoomSlider').getValue();
                            Ext.getCmp(_this.id+'zoomSlider').setValue(current+_this.increment);
                        }
//		        			 buffer : 300
                    }
                }
            },'-',
//		         {
//		        	 id:this.id+"right1posButton",
//		        	 text : '>',
//		        	 handler : function() {
//		        		 _this._handleNavigationBar('>');
//		        	 }
//		         },
            {
                id:this.id+"positionLabel",
                xtype : 'label',
                text : 'Position:',
                margins : '0 0 0 10'
            },{
                id : this.id+'tbCoordinate',
                xtype : 'textfield',
                width : 165,
                value : this.region.chromosome + ":" + this.region.start,
                listeners:{
                    specialkey: function(field, e){
                        if (e.getKey() == e.ENTER) {
                            _this._handleNavigationBar('Go');
                        }
                    }
                }
            },
            {
                id : this.id+'GoButton',
                text : 'Go',
                handler : function() {
                    _this._handleNavigationBar('Go');
                }
            },'->',
//		         {
//		        	 id : this.id+'searchLabel',
//		        	 xtype : 'label',
//		        	 text : 'Quick search:',
//		        	 margins : '0 0 0 10'
//		         },
            searchCombo,
//		         {
//		        	 id : this.id+'quickSearch',
//		        	 xtype : 'textfield',
//		        	 emptyText:'gene, protein, transcript',
//		        	 name : 'field1',
//		        	 listeners:{
//		        		 specialkey: function(field, e){
//		        			 if (e.getKey() == e.ENTER) {
//		        				 _this._handleNavigationBar('GoToGene');
//		        			 }
//		        		 },
//		        		 change: function(){
//		        			 	var str = this.getValue();
//		        			 	if(str.length > 3){
//		        			 		console.log(this.getValue());
//		        			 	}
//					     }
//		        	 }
//		         },
            {
                id : this.id+'GoToGeneButton',
                iconCls:'icon-find',
                handler : function() {
                    _this._handleNavigationBar('GoToGene');
                }
            }]
    });

//    return navToolbar;

};

NavigationBar.prototype.setRegion = function(region) {
    this.region.load(region);
    Ext.getCmp(this.id+'tbCoordinate').setValue(region.toString());
}

NavigationBar.prototype._getSpeciesMenu = function() {
    //items must be added by using  setSpeciesMenu()
    if(this._specieMenu == null){
        this._specieMenu = Ext.create('Ext.menu.Menu', {
            id:this.id+"_specieMenu",
            margin : '0 0 10 0',
            floating : true,
            plain:true,
            items : []
        });
    }
    return this._specieMenu;
};
//Sets the species buttons in the menu
NavigationBar.prototype.setSpeciesMenu = function(speciesObj, popular) {
    var _this = this;

    var menu = this._getSpeciesMenu();
    //Auto generate menu items depending of AVAILABLE_SPECIES config
    menu.hide();//Hide the menu panel before remove
    menu.removeAll(); // Remove the old species

    var popularSpecies = [];

    for(var i = 0; i < speciesObj.items.length; i++){
        var phyloSpecies = speciesObj.items[i].items;
        var pyhlo = speciesObj.items[i];
        pyhlo.menu = {items:phyloSpecies};
        for(var j = 0; j < phyloSpecies.length; j++){
            var species = phyloSpecies[j];
            var text = species.text+' ('+species.assembly+')';
//            species.id = this.id+text;
            species.name = species.text;
            species.species = Utils.getSpeciesCode(species.text);
            species.text = text;
            species.speciesObj = species;
            species.iconCls = '';
//            species.icon = 'http://static.ensembl.org/i/species/48/Danio_rerio.png';
            species.handler = function(me){
                _this.setSpecies(me.speciesObj);
            };

            if(popular.indexOf(species.name) != -1){
                popularSpecies.push(species);
            }
        }
    }
    popularSpecies.sort(function(a, b) {return a.text.localeCompare(b.text);});
    popularSpecies.push('-');
    var items = popularSpecies.concat(speciesObj.items);
    menu.add(items);
};

//Sets the new specie and fires an event
NavigationBar.prototype.setSpecies = function(data){
    this.region.load(data.region);
    data["sender"]="setSpecies";
    this.onRegionChange.notify(data);
};

NavigationBar.prototype._getChromosomeMenu = function() {
    var _this = this;
    var chrStore = Ext.create('Ext.data.Store', {
        id:this.id+"chrStore",
        fields: ["name"],
        autoLoad:false
    });
    /*Chromolendar*/
    var chrView = Ext.create('Ext.view.View', {
        id:this.id+"chrView",
        width:125,
        style:'background-color:#fff',
        store : chrStore,
        selModel: {
            mode: 'SINGLE',
            listeners: {
                selectionchange:function(este,selNodes){
                    if(selNodes.length>0){
                        _this.region.chromosome = selNodes[0].data.name;
                        _this.onRegionChange.notify({sender:"_getChromosomeMenu"});
// 					_this.setChromosome(selNodes[0].data.name);
                    }
                    chromosomeMenu.hide();
                }
            }
        },
        cls: 'list',
        trackOver: true,
        overItemCls: 'list-item-hover',
        itemSelector: '.chromosome-item',
        tpl: '<tpl for="."><div style="float:left" class="chromosome-item">{name}</div></tpl>'
//	        tpl: '<tpl for="."><div class="chromosome-item">chr {name}</div></tpl>'
    });
    /*END chromolendar*/

    var chromosomeMenu = Ext.create('Ext.menu.Menu', {
        id:this.id+"chromosomeMenu",
        almacen :chrStore,
        plain: true,
        items : [/*{xtype:'textfield', width:125},*/chrView]
//        items:[ //TODO alternative
//            {
//                xtype: 'buttongroup',
//                id:this.id+'chrButtonGroup',
////                title: 'User options',
//                columns: 5,
//                defaults: {
//                    xtype: 'button',
////                    scale: 'large',
//                    iconAlign: 'left',
//                    handler:function(){}
//                },
////                items : [chrView]
////                items: []
//            }
//        ]
    });
    this._updateChrStore();
    return chromosomeMenu;
};

NavigationBar.prototype._updateChrStore = function(){
    var _this = this;
    var chrStore = Ext.getStore(this.id+"chrStore");
    var chrView = Ext.getCmp(this.id+"chrView");
//	var chrButtonGroup = Ext.getCmp(this.id+"chrButtonGroup");
    var cellBaseManager = new CellBaseManager(this.species);
    cellBaseManager.success.addEventListener(function(sender,data){
        var chromosomeData = [];
        var chrItems = [];
        var sortfunction = function(a, b) {
            var IsNumber = true;
            for (var i = 0; i < a.length && IsNumber == true; i++) {
                if (isNaN(a[i])) {
                    IsNumber = false;
                }
            }
            if (!IsNumber) return 1;
            return (a - b);
        };
        data.result.sort(sortfunction);
        for (var i = 0; i < data.result.length; i++) {
            chromosomeData.push({'name':data.result[i]});
//            chrItems.push({text:data.result[i],iconAlign: 'left'});
        }
        chrStore.loadData(chromosomeData);
//        chrButtonGroup.removeAll();
//        chrButtonGroup.add(chrItems);
//		chrView.getSelectionModel().select(chrStore.find("name",_this.chromosome));
    });
    cellBaseManager.get('feature', 'chromosome', null, 'list');
};

NavigationBar.prototype._getZoomSlider = function() {
    var _this = this;
    if(this._zoomSlider==null){
        this._zoomSlider = Ext.create('Ext.slider.Single', {
            id : this.id+'zoomSlider',
            width : 170,
            maxValue : 100,
            minValue : 0,
//			value : this.zoom,
            useTips : true,
            increment : 1,
            tipText : function(thumb) {
                return Ext.String.format('<b>{0}%</b>', thumb.value);
            },
            listeners : {
                'change': {
                    fn :function(slider, newValue) {
                        _this._handleNavigationBar("ZOOM", newValue);
                    },
                    buffer : 500
                }
            }
        });
    }
    return this._zoomSlider;
};