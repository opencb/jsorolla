/**
 * esinstall configuration file
 * https://github.com/snowpackjs/snowpack/tree/main/esinstall
 *
 */
import {install} from 'esinstall';

await install([
    "lit-element",
    "lit-html",
    "lit-html/directives/class-map.js",
    "lit-html/directives/if-defined.js",
    "@vaadin/router"
], {
    /*options*/
});
