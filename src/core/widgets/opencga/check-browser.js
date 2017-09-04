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

function CheckBrowser(appName){

    if(Ext.isIE){
        //console.time implementation for IE
        if(window.console && typeof(window.console.time) == "undefined") {
            console.time = function(name, reset){
                if(!name) { return; }
                var time = new Date().getTime();
                if(!console.timeCounters) { console.timeCounters = {} };
                var key = "KEY" + name.toString();
                if(!reset && console.timeCounters[key]) { return; }
                console.timeCounters[key] = time;
            };

            console.timeEnd = function(name){
                var time = new Date().getTime();
                if(!console.timeCounters) { return; }
                var key = "KEY" + name.toString();
                var timeCounter = console.timeCounters[key];
                if(timeCounter) {
                    var diff = time - timeCounter;
                    var label = name + ": " + diff + "ms";
                    console.info(label);
                    delete console.timeCounters[key];
                }
                return diff;
            };
        }
    }

	var browserOk = false;
	switch (appName){
	case "renato":
		if(Ext.chromeVersion>=16){
			browserOk = true;
		}
		if(Ext.safariVersion>=5){
			browserOk = true;
		}
		if(Ext.firefoxVersion>=10){
			browserOk = true;
		}
		break;
	case "variant":
		if(Ext.chromeVersion>=16){
			browserOk = true;
		}
		if(Ext.safariVersion>=5){
			browserOk = true;
		}
		if(Ext.firefoxVersion>=10){
			browserOk = true;
		}
		break;
	default:
		if(Ext.chromeVersion>=40){
			browserOk = true;
		}
		if(Ext.safariVersion>=5){
			browserOk = true;
		}
		if(Ext.firefoxVersion>=37){
			browserOk = true;
		}
		if(Ext.operaVersion>=29){
			browserOk = true;
		}
	}
//if(Ext.operaVersion<=0){
//	browserOk = true;
//}
//if(Ext.firefoxVersion<=0){
//	browserOk = true;
//}
	if(browserOk==false){
		console.log("--------------------------------------------"+browserOk)
//		Ext.create("Ext.window.Window",{
//			title:'Supported browsers',
//		modal:true,
//		resizable:false,
//		bodyStyle:"background:#ffffff;",
//		bodyPadding:15,
//		width:330,
//		height:200,
//			html:'<p>This release makes an intensive use of new web technologies and standards like HTML5, so the browsers that are fully supported from now on are:</p>'+ 
//			'<br><p class="emph">Chrome 14+</p>'+ 
//			'<p class="emph">Safari 5+</p>'+ 
//			'<br>Other browsers or may rise some errors.'
//		}).show();
		$("#checkBrowser")
//		.html('<p>This release makes an intensive use of new web technologies and standards like HTML5 and SVG, so the browsers that are fully supported and will provide the best user experience are:</p>'+ 
//				'<p class="emph">Google Chrome 14+</p>'+ 
//				'<p class="emph">Apple Safari 5+</p>'+ 
//				'Other browsers may rise some errors. Firefox11+ works very slow on Linux and Windows 7 and the usage it is not recommended. Internet Explorer 9 is not supported since they not support many of the features of HTML5, Internet Explorer 10 Consumer Preview works fine.')
		.html('This application provides the best user experience with Google Chrome and Apple Safari, otherwise some latencies may be experienced when browsing due to some problems in Firefox.')
		.css('width','540px')
		.css('height','40px')
		.css('position','absolute')
		.css('margin-left','300px')
		.css('margin-top','26px')
		.css('padding','5px')
		.css('border','1px solid #F1D031')
		.css('background','#FFFFA3')
		.css('color','#555')
		.css('position','absolute')
		.css('z-index','50000')
		.click(function(){
			$("#checkBrowser").fadeOut(function (){ $(this).remove(); });  
		});
	}
}
