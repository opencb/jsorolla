/**
 * Created with IntelliJ IDEA.
 * User: imedina
 * Date: 5/28/13
 * Time: 6:36 PM
 * To change this template use File | Settings | File Templates.
 */

function Track(targetId, args) {

    // Using Underscore 'extend' function to extend and add Backbone Events
    _.extend(this, Backbone.Events);

    this.region = new Region();

    this.title = "track";
    this.y = 0;
    this.width = 200;
    this.height = 25;
    this.renderedArea = {};//used for renders to store binary trees

    this.maxPixelWidth=500000;//mesa
    this.pixelPosition=this.maxPixelWidth/2;

    this.histogramZoom = -1000;//no histogram by default

    this.titleVisibility = 'visible';

    this.closable = true;

};

Track.prototype = {


}