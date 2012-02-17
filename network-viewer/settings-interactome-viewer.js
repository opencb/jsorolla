function SettingsInteractomeViewer(args){
	var _this=this;
	this.id = "SettingsInteractomeViewer" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = "Background Settings";
	this.width = 300;
	this.height = 300;
	
	if (args != null){
        if (args.targetId!= null){
        	this.targetId = args.targetId;       
        }
        if (args.title!= null){
        	this.title = args.title;       
        }
        if (args.width!= null){
        	this.width = args.width;       
        }
        if (args.height!= null){
        	this.height = args.height;       
        }
    }
	
	this.specieChanged = new Event(this);
}


///Private method
SettingsInteractomeViewer.prototype.render = function(formatter){
	var _this = this;
	
	this.imageLibrary = Ext.create('Ext.data.Store', {
		    fields: ['name'],
		    data : InteractomeBackgroundManager.getKeys()
		});
	 
	this.comboImages = Ext.create('Ext.form.field.ComboBox', {
		    emptyText: 'Example images',
		    displayField: 'name',
		    store: this.imageLibrary,
		    queryMode: 'local',
		    typeAhead: true,
		    listeners: {
				change: {
	            fn: function(sender, newValue, oldValue){
					formatter.setBackgroundImage(InteractomeBackgroundManager.getImage(newValue));
				}
	        }}
		    
		});
	
	this.colorTextField = Ext.create('Ext.form.field.Text', {
		emptyText: '#RGB',
		name: 'color',
		listeners: {
		   change: {
           fn: function(sender, value){
           		var patt = /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/;
				if (patt.test(value)){
					formatter.setBackgroundColor(value);
				}else{
					formatter.setBackgroundColor("#FFFFFF");
				}
			}
       }}
	});

	var innerColorPicker = Ext.create('Ext.picker.Color', {
	    value: '993300',
	    listeners: {
	    	scope:this,
	        select: function(picker, selColor) {
	        	this.colorTextField.setValue('#'+selColor);
	        }
	    }
	});
    var innerColorButton = Ext.create('Ext.button.Button',{
		    text : 'Background color',
		    menu: new Ext.menu.Menu({
					items: [innerColorPicker,this.colorTextField]
		          })
	});
	
	this.uploadField = Ext.create('Ext.form.field.File', {
		msgTarget : 'side',
		flex:1,
        allowBlank: false,
        emptyText: 'Custom image',
		buttonText : 'Browse',
		listeners : {
			change : {
				fn : function() {
					var file = document.getElementById(_this.uploadField.fileInputEl.id).files[0];
					var  reader = new FileReader();
					reader.readAsDataURL(file); 
					reader.onload = function(evt) {
						formatter.setBackgroundImage(evt.target.result);
						
					};
				}
			}
		}
	});
	
	this.widthSlider = Ext.create('Ext.slider.Single', {
		minValue: 0,
		maxValue: 2000,
		flex:3,
		hideLabel: false,
		fieldLabel:"Width",
		labelWidth:40,
		tipText : function(thumb) {
			return Ext.String.format('<b>{0}px</b>', thumb.value);
		}
	});
	this.widthField = Ext.create('Ext.form.field.Number', {
		minValue: 0,
		maxValue: 2000,
		margin:'0 0 0 5',
		flex:1,
		listeners : {
			change : function(field, newValue) {
				_this.widthSlider.setValue(newValue);
			}
		}
	});
	var widthContainer = Ext.create('Ext.container.Container', {
		layout:{type:'hbox'},
		items:[this.widthSlider,this.widthField]	
	});
	this.widthSlider.on("change", function(slider, newValue) {
		_this.widthField.setValue(newValue);
	 	if (formatter.getBackgroundImage() != null){
	 		formatter.setBackgroundImageWidth(newValue);
	 	}
	});
		
		
	this.heightSlider =  Ext.create('Ext.slider.Single', {
		minValue: 0,
		maxValue: 2000,
		flex:3,
		hideLabel: false,
		fieldLabel:"Height",
		labelWidth:40,
		tipText : function(thumb) {
			return Ext.String.format('<b>{0}px</b>', thumb.value);
		}
	});
	this.heightField = Ext.create('Ext.form.field.Number', {
		minValue: 0,
		maxValue: 2000,
		margin:'0 0 0 5',
		flex:1,
		listeners : {
			change : function(field, newValue) {
				_this.heightSlider.setValue(newValue);
			}
		}
	});
	var heightContainer = Ext.create('Ext.container.Container', {
		layout:{type:'hbox'},
		items:[this.heightSlider,this.heightField]	
	});
	this.heightSlider.on("change", function(slider, newValue) {
		_this.heightField.setValue(newValue);
		if (formatter.getBackgroundImage() != null){
			formatter.setBackgroundImageHeight(newValue);
		}
	});
	 
	 
	 this.XSlider =  Ext.create('Ext.slider.Single', {
		 minValue: -500,
		 maxValue: 2000,
		 flex: 3,
		 hideLabel: false,
		 fieldLabel:"X",
		 labelWidth:40,
		 tipText : function(thumb) {
			 return Ext.String.format('<b>{0}px</b>', thumb.value);
		 }
	 });
	 this.XField = Ext.create('Ext.form.field.Number', {
		 minValue: -500,
		 maxValue: 2000,
		 margin:'0 0 0 5',
		 flex:1,
		 listeners : {
			 change : function(field, newValue) {
				 _this.XSlider.setValue(newValue);
			 }
		 }
	 });
	var XContainer = Ext.create('Ext.container.Container', {
		layout:{type:'hbox'},
		items:[this.XSlider,this.XField]	
	});
	this.XSlider.on("change", function(slider, newValue) {
		_this.XField.setValue(newValue);
		 if (formatter.getBackgroundImage() != null){
			 formatter.setBackgroundImageX(newValue);
		 }
	});
	 
	this.YSlider =  Ext.create('Ext.slider.Single', {
		minValue: 0,
		maxValue: 2000,
		flex: 3,
		hideLabel: false,
		fieldLabel:"Y",
		labelWidth:40,
		tipText : function(thumb) {
			return Ext.String.format('<b>{0}px</b>', thumb.value);
		}
    });
	 this.YField = Ext.create('Ext.form.field.Number', {
		 minValue: 0,
		 maxValue: 2000,
		 margin:'0 0 0 5',
		 flex:1,
		 listeners : {
			 change : function(field, newValue) {
				 _this.YSlider.setValue(newValue);
			 }
		 }
	 });
	var YContainer = Ext.create('Ext.container.Container', {
		layout:{type:'hbox'},
		items:[this.YSlider,this.YField]
	});
	this.YSlider.on("change", function(slider, newValue) {
		_this.YField.setValue(newValue);
		if (formatter.getBackgroundImage() != null){
			formatter.setBackgroundImageY(newValue);
		}
	});
	
	this.window = Ext.create('Ext.ux.Window', {
	    title: this.title,
	    width: this.width,
	    height: this.height,
	    resizable:false,
//	    bodyPadding:5,
	    defaults:{margin:"3 5 2 5"},
	    layout:{type:'vbox',align:'stretch'},
	    items:[innerColorButton, this.comboImages, this.uploadField, widthContainer, heightContainer, XContainer, YContainer],
	    buttons: [{
            text: 'Close',
            handler: function(){
	    		_this.window.close();
	    	}
        }]
	});
	
	
	this.window.show();
	
};


SettingsInteractomeViewer.prototype.draw = function(formatter){
	this.render(formatter);
};

