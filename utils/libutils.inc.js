//js-commons-lib/utils
(function(){
	var f = [
	         "/bioinfo-js/js-commons-lib/utils/event.js",
	         "/bioinfo-js/js-commons-lib/utils/graphics/svg.js",
	         "/bioinfo-js/js-commons-lib/utils/normalization.js",
	         "/bioinfo-js/js-commons-lib/utils/colors.js",
	         "/bioinfo-js/js-commons-lib/utils/dom.js"
	];

	for ( var i = 0; i < f.length; i++) {
		var s = document.createElement("script");
		s.setAttribute("type","text/javascript");
		s.setAttribute("src",f[i]);
		document.head.appendChild(s);
	}
	
	
})(this);
