/**
 * Created with IntelliJ IDEA.
 * User: jcoll
 * Date: 10/15/13
 * Time: 5:33 PM
 * To change this template use File | Settings | File Templates.
 */


function ThreeDViewer(args) {
    var _this = this;
    _.extend(this, Backbone.Events);

    this.id = Utils.genId("ThreeDViewer");
    this.targetId;


    _.extend(this, args);


    this.on(this.handlers);

    this.rendered = false;
    if (this.autoRender) {
        this.render();
    }
};

ThreeDViewer.prototype = {
    render:function(targetId){
        var _this = this;
        this.targetId = (targetId) ? targetId : this.targetId;
        if (this.rendered) {
            console.log('Already rendered');
            return;
        }
        if ($('#' + this.targetId).length < 1) {
            console.log('targetId not found in DOM');
            return;
        }

        this.targetDiv = $('#' + this.targetId)[0];
        this.div = $('<div id="' + this.id + '" class="ocb-gv ocb-box-vertical"></div>')[0];
        $(this.targetDiv).append(this.div);


        this.barDiv = $('<div id="bar-' + this.id + '" class="ocb-gv-navigation"></div>')[0];
        $(this.div).append(this.barDiv);


        this.torusDiv = $('<div id="torus-' + this.id + '" class="ocb-gv-navigation"></div>')[0];
        $(this.div).append(this.threedDiv);






        //div structure
        this.rendered = true;
    },
    draw:function(){
        if (!this.rendered) {
            console.info('ThreeDViewer is not rendered yet');
            return;
        }

        this.torus = _createTorus($(this.torusDiv).attr('id'));




    },
    _createTorus:function(targetId){

    var torus = new Torus({
        targetId:targetId
    })

    return torus;

    },
    destroy:function(){
        this.rendered = false;
    }
}