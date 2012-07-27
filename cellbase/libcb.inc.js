//js-commons-lib/cellbase
(function(){
	var f = [
	         //ui-widgets
	         "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/info-widget.js",
	         "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/gene-info-widget.js",
	         "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/transcript-info-widget.js",
	         "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/protein-info-widget.js",
	         "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/snp-info-widget.js",
	         "/bioinfo-js/js-commons-lib/cellbase/ui-widgets/vcf-variant-info-widget.js",

	         //ws-manager
	         "/bioinfo-js/js-commons-lib/cellbase/cellbase-manager.js"
];
	for ( var i = 0; i < f.length; i++) {
		var s = document.createElement("script");
		s.setAttribute("type","text/javascript");
		s.setAttribute("src",f[i]);
		document.head.appendChild(s);
	}
})(this);