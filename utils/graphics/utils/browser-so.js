      
  


function getSO(){
   	
   	var navInfo = window.navigator.appVersion.toLowerCase();
   	var so = 'Unknown';    
    if(navInfo.indexOf('win') != -1){  
    	so = 'Windows';  
    }else if(navInfo.indexOf('x11') != -1){  
		so = 'Linux';
	}else if(navInfo.indexOf('mac') != -1){  
		so = 'Macintosh'; 
	}
	return so;  
  }  


/**

BROWSER: encapsula todos los métodos que nos dan información sobre el navegador

**/
var Browser = {};

Browser.getappCodeName = function() {
	return navigator.appCodeName;
};

Browser.getappVersion = function() {
	return navigator.appVersion;
};

Browser.cookieEnabled = function() {
	return navigator.cookieEnabled;
};

Browser.getPlatform = function() {
	return navigator.platform;
};

Browser.getuserAgent = function() {
	return navigator.userAgent;
};



  function getBrowser(){
  var version ='';
  var browser='';
  	$.each($.browser, function(i, val){
		
		if (i == 'version'){
			version=val
		}
		if (val == true){
			browser = i;
		}
  	});
	return "Browser: "+ browser + " V."+ version;
  }
  
  
  function getBrowserName(){
  var version ='';
  var browser='';
  	$.each($.browser, function(i, val){
		if (val == true){
			browser = i;
		}
  	});
	return browser;
  }
  