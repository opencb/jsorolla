function TEMPLATEWIDGET(args){
	var _this=this;
	this.id = "TEMPLATEWIDGET_" + Math.round(Math.random()*10000000);
	this.targetId = null;
	
	this.title = null;
	this.width = 800;
	this.height = 400;
	
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
	
	this.adapter=new WumRestAdapter();
	this.adapter.onGetJobs.addEventListener(function(sender,data){
		_this._render(JSON.parse(data));
	});
};

TEMPLATEWIDGET.prototype.draw = function (){
	
	this.adapter.getJobs($.cookie('bioinfo_sid'));
	
};

TEMPLATEWIDGET.prototype._render = function (data){
	var _this=this;
	if(this._panel==null){
		
		this._panel = Ext.create('Ext.panel.Panel', {
			
		});
	}
};



//var widget = new TEMPLATEWIDGET(args);
//
//widget.draw();

function MyClass(){
	var me = this;
	
	//properties
	this.cero='0';
	//private method
	var someFn = function(){
		return this;
	};

	console.log(MyClass.prototype);
	//methods
	this.getCero = function(){
		return this.cero;
	};
	
	
};
MyClass.prototype.setCero = function(cero){
	this.cero = cero;
};

function GFFDataset(){
	var self = this;

	//properties
	self.a='0';

	//methods
	this.prototype.seta(x) = GenericDataset.geta();
	
	//provate method
	var f = geta(){
		return a;
	};
	
};
