/**
 * Copyright 2015-2019 OpenCB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {LitElement, html} from "/web_modules/lit-element.js";

export default class LoadingBar extends LitElement {

    constructor() {
        super();
        this._init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            cellbaseClient: {
                type: Object
            },
            query: {
                type: Object
            },
            config: {
                type: Object
            }
        }
    }

    _init(){
        /* The total number of requests made */
        this.reqsTotal = 0;

        /*The number of requests completed (either successfully or not)*/
        this.reqsCompleted = 0;

        /* The amount of time spent fetching before showing the loading bar*/
        this.latencyThreshold = 1000 //ProgressBar.latencyThreshold;

        /*$timeout handle for latencyThreshold*/
        this.startTimeout = null;

        this.startTimeout = null;

        // logic commented at the moment
        this.completeTimeout = null;

        globalThis.addEventListener("request", () => {
            if (this.reqsTotal === 0) {
                this.startTimeout = setTimeout(() => {
                    this._start();
                }, 1000);
            }
            this.reqsTotal++;
            //ProgressBar.set(this.reqsCompleted / this.reqsTotal);
            console.log("SET", this.reqsCompleted / this.reqsTotal)
            this.requestUpdate();
        }, false);

        globalThis.addEventListener("response", () => {
            this.reqsCompleted++;
            if (this.reqsCompleted >= this.reqsTotal) {
                //$rootScope.$broadcast('cfpLoadingBar:loaded', {url: response.config.url, result: response});
                this.setComplete();
            } else {
                //ProgressBar.set(this.reqsCompleted / this.reqsTotal);
                console.log("SET", this.reqsCompleted / this.reqsTotal)
            }
            this.requestUpdate();
        }, false);

        /*onResponseError() {
            this.reqsCompleted++;
            if (this.reqsCompleted >= this.reqsTotal) {
                //$rootScope.$broadcast('cfpLoadingBar:loaded', {url: rejection.config.url, result: rejection});
                this.setComplete();
            } else {
                ProgressBar.set(this.reqsCompleted / this.reqsTotal);
            }
        }*/


        this.autoIncrement = true;
        this.includeSpinner = true;
        this.includeBar = true;
        this.latencyThreshold = 100;
        this.startSize = 0.02;
        this.parentSelector = "body";
        this.spinnerTemplate = "<div id=\"loading-bar-spinner\"><div class=\"spinner-icon\"></div></div>";
        this.loadingBarTemplate = "<div id=\"loading-bar\"><div class=\"bar\"><div class=\"peg\"></div></div></div>";


        /*var $animate;
        var $parentSelector = this.parentSelector,
            loadingBarContainer = angular.element(this.loadingBarTemplate),
            loadingBar = loadingBarContainer.find("div").eq(0),
            spinner = angular.element(this.spinnerTemplate);*/

        var incTimeout,
            completeTimeout,
            started = false,
            status = 0;

        var autoIncrement = this.autoIncrement;
        var includeSpinner = this.includeSpinner;
        var includeBar = this.includeBar;
        var startSize = this.startSize;

        /*return {
            start            : _start,
            set              : _set,
            status           : _status,
            inc              : _inc,
            complete         : _complete,
            autoIncrement    : this.autoIncrement,
            includeSpinner   : this.includeSpinner,
            latencyThreshold : this.latencyThreshold,
            parentSelector   : this.parentSelector,
            startSize        : this.startSize
        };*/
    }

    connectedCallback() {
        super.connectedCallback();
        this._config = {...this.getDefaultConfig(), ...this.config};
    }

    updated(changedProperties) {
        if(changedProperties.has("property")) {
            this.propertyObserver();
        }
    }

    /**
     * Inserts the loading bar element into the dom, and sets it to 2%
     */
    _start() {

        clearTimeout(this.completeTimeout);

        // do not continually broadcast the started event:
        if (this.started) {
            return;
        }

        /*var document = $document[0];
        var parent = document.querySelector ?
            document.querySelector($parentSelector)
            : $document.find($parentSelector)[0]
        ;

        if (! parent) {
            parent = document.getElementsByTagName("body")[0];
        }

        var $parent = angular.element(parent);
        var $after = parent.lastChild && angular.element(parent.lastChild);*/

        //$rootScope.$broadcast("cfpLoadingBar:started");

        this.started = true;

        if (this.includeBar) {
            //$animate.enter(loadingBarContainer, $parent, $after);
        }

        if (this.includeSpinner) {
            //$animate.enter(spinner, $parent, loadingBarContainer);
        }

        this._set(this.startSize);
    }

    /**
     * Set the loading bar's width to a certain percent.
     * @param n any value between 0 and 1
     */
    async _set(n) {
        if (!this.started) {
            return;
        }
        this.WIDTH = (n * 100) + "%";
        await this.requestUpdate();
        //loadingBar.css("width", pct);

        this.status = n;

        // increment loadingbar to give the illusion that there is always
        // progress but make sure to cancel the previous timeouts so we don't
        // have multiple incs running at the same time.
        if (this.autoIncrement) {
            clearTimeout(this.incTimeout);
            this.incTimeout = setTimeout(() => {
                this._inc();
            }, 250);
        }
    }

    /**
     * Increments the loading bar by a random amount
     * but slows down as it progresses
     */
    _inc() {
        if (this._status() >= 1) {
            return;
        }

        var rnd = 0;

        // TODO: do this mathmatically instead of through conditions

        var stat = this._status();
        if (stat >= 0 && stat < 0.25) {
            // Start out between 3 - 6% increments
            rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
        } else if (stat >= 0.25 && stat < 0.65) {
            // increment between 0 - 3%
            rnd = (Math.random() * 3) / 100;
        } else if (stat >= 0.65 && stat < 0.9) {
            // increment between 0 - 2%
            rnd = (Math.random() * 2) / 100;
        } else if (stat >= 0.9 && stat < 0.99) {
            // finally, increment it .5 %
            rnd = 0.005;
        } else {
            // after 99%, don't increment:
            rnd = 0;
        }

        var pct = this._status() + rnd;
        this._set(pct);
    }

    _status() {
        return this.status;
    }

    _completeAnimation() {
        this.status = 0;
        this.started = false;
    }

    _complete() {
        /*if (!$animate) {
            $animate = $injector.get("$animate");
        }*/

        this._set(1);
        clearTimeout(this.completeTimeout);

        this._completeAnimation();

        // Attempt to aggregate any start/complete calls within 500ms:
        /*this.completeTimeout = setTimeout(function() {
            var promise = $animate.leave(loadingBarContainer, _completeAnimation);
            if (promise && promise.then) {
                promise.then(_completeAnimation);
            }
            $animate.leave(spinner);
            //$rootScope.$broadcast('cfpLoadingBar:completed');
        }, 500);*/
    }

    setComplete() {
        clearTimeout(this.startTimeout);
        this._complete();
        this.reqsCompleted = 0;
        this.reqsTotal = 0;
    }

    getDefaultConfig() {
        return {
        }
    }

    render() {
        return html`           
            <div id="loading-bar"><div class="bar" style="width:${this.WIDTH}"><div class="peg"></div></div></div>
        `;
    }

}

customElements.define("loading-bar", LoadingBar);

class RequestInterceptor {

    constructor() {
        /* The total number of requests made */
        this.reqsTotal = 0;

        /*The number of requests completed (either successfully or not)*/
        this.reqsCompleted = 0;

        /* The amount of time spent fetching before showing the loading bar*/
        this.latencyThreshold = 1000 //ProgressBar.latencyThreshold;

        /*$timeout handle for latencyThreshold*/
        this.startTimeout = null;
    }

    /*calls cfpLoadingBar.complete() which removes the loading bar from the DOM.*/
    setComplete() {
        clearTimeout(this.startTimeout);
        LoadingBar.complete();
        this.reqsCompleted = 0;
        this.reqsTotal = 0;
    }
/*
    onRequest() {
        //$rootScope.$broadcast('cfpLoadingBar:loading', {url: config.url});
        if (this.reqsTotal === 0) {
            this.startTimeout = setTimeout(function() {
                ProgressBar.start();
            }, 1000);
        }
        this.reqsTotal++;
        ProgressBar.set(this.reqsCompleted / this.reqsTotal);
    }

    onResponse() {
        this.reqsCompleted++;
        if (this.reqsCompleted >= this.reqsTotal) {
            //$rootScope.$broadcast('cfpLoadingBar:loaded', {url: response.config.url, result: response});
            this.setComplete();
        } else {
            ProgressBar.set(this.reqsCompleted / this.reqsTotal);
        }
    }

    onResponseError() {
        this.reqsCompleted++;
        if (this.reqsCompleted >= this.reqsTotal) {
            //$rootScope.$broadcast('cfpLoadingBar:loaded', {url: rejection.config.url, result: rejection});
            this.setComplete();
        } else {
            ProgressBar.set(this.reqsCompleted / this.reqsTotal);
        }
    }*/

}

