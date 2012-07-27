//js-commons-lib/ui-widgets
(function(){
	var f = [
	         "/bioinfo-js/js-commons-lib/ui-widgets/ux-window.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/attributes-widget.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/attributes-panel.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/genomic-attributes-widget.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/expression-genomic-attributes-widget.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/genotype-genomic-attributes-widget.js",

	         "/bioinfo-js/js-commons-lib/ui-widgets/list/list-panel.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/list/genomic-list-panel.js",

	         "/bioinfo-js/js-commons-lib/ui-widgets/list/list-widget.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/list/genomic-list-widget.js",


	         "/bioinfo-js/js-commons-lib/ui-widgets/input-list-widget.js",
	         "/bioinfo-js/js-commons-lib/ui-widgets/chart-widget.js"
	  ];     

	for ( var i = 0; i < f.length; i++) {
		var s = document.createElement("script");
		s.setAttribute("type","text/javascript");
		s.setAttribute("src",f[i]);
		document.head.appendChild(s);
	}
})(this);