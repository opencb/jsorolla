function GenomeBrowser(){
	
	  this.genomeViewer = new MasterSlaveGenomeViewer("id", "container_map");
	  this.karyotypeWidget = new KaryotypePanel("human", "container_map_karyotype", {"width":1000, "height":200, "trackWidth":15});
};

GenomeBrowser.prototype.draw = function(){
	var top = Ext.create('Ext.panel.Panel', {
        width: '1300',
        margins:'5 5 5 5',
        flex:3,
        //padding: '5 5 5 5',
        html:'<div id = "container_map"></div>'
		});

	var coordinatePanel = Ext.create('Ext.panel.Panel', {
        width: '1300',
        margins:'5 5 5 5',
       // height: '50px',
        //padding: '5 5 5 5',
        html:'<div id = "coordinates"><form><label >Location:&nbsp;&nbsp;</label><input type="hidden" name="db" value="core"><input name="r" id="loc_r" class="location_selector" style="width:250px" value="6:133017695-133161157" type="text">&nbsp;&nbsp;<input value="Go" type="submit" class="go-button"></form></div>'
		});  
		
		
	var bot = Ext.create('Ext.panel.Panel', {
        title:'bot',
        width: '100%',
        flex:1,
        split: true,
        html:'<div id = "container_map_karyotype" style="padding:0 0 0 200;text-align: center;width:100%;" ></div>'
		});

	 var handleAction = function(action){
			 if (action == 'ZoomIn'){
			 	genomeViewer.zoomIn();
			 }

			 if (action == 'ZoomOut'){
				 	genomeViewer.zoomOut();
				 }
			 
	       // Ext.example.msg('<b>Action</b>', 'You clicked "' + action + '"');
	    };

	    
	var menu = Ext.create('Ext.toolbar.Toolbar', {
		width: '100%',
        items: [
           /*     {
            xtype:'splitbutton',
            text: 'Menu Button',
            iconCls: 'add16',
            menu: [{text: 'Menu Item 1', handler: Ext.Function.pass(handleAction, 'Menu Item 1')}]
        },'-',*/
        {
            text: 'Zoom In',
            iconCls: 'add16',
            handler: Ext.Function.pass(handleAction, 'ZoomIn')
        },{
        	text: 'Zoom Out',
            iconCls: 'add16',
            
            handler: Ext.Function.pass(handleAction, 'ZoomOut')
        }
        //,'-',{
        //    text: 'Format',
       //     iconCls: 'add16',
          //  handler: Ext.Function.pass(handleAction, 'Format')
       // },'->',{
       //     text: 'Right',
       //     iconCls: 'add16',
          //  handler: Ext.Function.pass(handleAction, 'Right')
       // }
        ]

		});
		
	var center = Ext.create('Ext.panel.Panel', {
		layout : 'vbox',
        region: 'center',
        margins:5,
		items:[menu, top,coordinatePanel, bot]
		});

      var item2 = Ext.create('Ext.Panel', {
          title: 'Control',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item3 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 3',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item4 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 4',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });

      var item5 = Ext.create('Ext.Panel', {
          title: 'Accordion Item 5',
          html: '&lt;empty panel&gt;',
          cls:'empty'
      });


      
      
	var west = Ext.create('Ext.panel.Panel', {
        region: 'west',
        width: 200,
        margins:'5 5 5 5',
        split:true,
        width: 210,
        layout:'accordion',
        items: [ item2, item3, item4, item5]

		});

		
	
	var port = Ext.create('Ext.container.Viewport', {
    layout: 'border',
    items: [
    	center,
    	west,
    ]
	});

  
    this.genomeViewer.draw(1, 25000000);
        

	
	
    this.karyotypeWidget.getFromCellBase();
};
	
