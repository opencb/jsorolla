//js-commons-lib/ui-widgets
console.log("js-commons-lib/ui-widgets included.");
include([
         "/bioinfo-js/js-commons-lib/ui-widgets/ux-window.js",
         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/attributes-widget.js",
         "/bioinfo-js/js-commons-lib/ui-widgets/attributes/attributes-panel.js",
         ["/bioinfo-js/js-commons-lib/ui-widgets/attributes/genomic-attributes-widget.js",function(){
        	 include(["/bioinfo-js/js-commons-lib/ui-widgets/attributes/expression-genomic-attributes-widget.js",
        	          "/bioinfo-js/js-commons-lib/ui-widgets/attributes/genotype-genomic-attributes-widget.js"]);
         }],
         ["/bioinfo-js/js-commons-lib/ui-widgets/list/list-panel.js",function(){
        	 include("/bioinfo-js/js-commons-lib/ui-widgets/list/genomic-list-panel.js");
         }],
         ["/bioinfo-js/js-commons-lib/ui-widgets/list/list-widget.js",function(){
        	 include("/bioinfo-js/js-commons-lib/ui-widgets/list/genomic-list-widget.js");
         }],

         "/bioinfo-js/js-commons-lib/ui-widgets/input-list-widget.js",
         "/bioinfo-js/js-commons-lib/ui-widgets/chart-widget.js"
         ]);	