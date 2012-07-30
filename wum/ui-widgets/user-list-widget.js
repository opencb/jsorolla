function UserListWidget (args){
	var _this = this;
	this.id = "UserListWidget_"+ Math.round(Math.random()*10000000);
	this.data = new Array();
	
	this.args = new Object();
	this.timeout = 4000;
	this.pagedViewList = args.pagedViewList;
	this.suiteId=-1;
	
	if (args != null){
        if (args.timeout != null && args.timeout > 4000){
        	this.timeout = args.timeout;       
        }
        if (args.suiteId != null){
        	this.suiteId = args.suiteId;       
        }
    }
//	console.warn(this.id+' Minimum period is 4000 milliseconds, smaller values will be ignored');
};

UserListWidget.prototype.draw =  function (){
	var _this = this;
	
	this.getResponse();
	this.interval = setInterval(function () {_this.getResponse(); }, this.timeout);
};


UserListWidget.prototype.getData =  function (){
	return this.data;
};

UserListWidget.prototype.getCount = function() {
	return this.data.length;
};

UserListWidget.prototype.getResponse = function(){
	/**Que cada clase hija llame a la funcion de WumDataAdapter que necesite**/
	throw "abstract method must be implemented in child classes";
};

UserListWidget.prototype.render =  function (data){
	/**Que cada clase hija renderize como quiera los datos, ya sea con sencha o con sencho**/
	throw "abstract method must be implemented in child classes";
};
