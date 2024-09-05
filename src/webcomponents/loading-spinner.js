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

import {LitElement, html} from "lit";

export default class LoadingSpinner extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            description: {
                type: String
            }
        };
    }

    renderStyle() {
        return html`
        <style>
            .loading-spinner-wrapper {
                text-align: center;
                height: 100px;
                clear:both;
                padding-top: 3px;
            }

            .DNA_cont {
                display: inline-block;
                position: relative;
                -webkit-transform: scaleX(-0.45) scaleY(0.45);
                transform: scaleX(-0.45) scaleY(0.45);
                margin-top: 20px;
            }

            .nucleobase {
                display: inline-block;
                position: relative;
                vertical-align: middle;
            }

            .nucleobase:not(:last-child) {
                margin-right: 35px;
            }

            .nucleobase:before, .nucleobase:after {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                position: absolute;
            }

            .nucleobase:nth-child(1) {
                -webkit-animation-delay: -1.869s;
                animation-delay: -1.869s;
            }

            .nucleobase:nth-child(1):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -1.869s;
                animation-delay: -1.869s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(1):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -1.869s;
                animation-delay: -1.869s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(2) {
                -webkit-animation-delay: -3.738s;
                animation-delay: -3.738s;
            }

            .nucleobase:nth-child(2):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -3.738s;
                animation-delay: -3.738s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(2):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -3.738s;
                animation-delay: -3.738s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(3) {
                -webkit-animation-delay: -5.607s;
                animation-delay: -5.607s;
            }

            .nucleobase:nth-child(3):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -5.607s;
                animation-delay: -5.607s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(3):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -5.607s;
                animation-delay: -5.607s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(4) {
                -webkit-animation-delay: -7.476s;
                animation-delay: -7.476s;
            }

            .nucleobase:nth-child(4):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -7.476s;
                animation-delay: -7.476s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(4):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -7.476s;
                animation-delay: -7.476s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(5) {
                -webkit-animation-delay: -9.345s;
                animation-delay: -9.345s;
            }

            .nucleobase:nth-child(5):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -9.345s;
                animation-delay: -9.345s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(5):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -9.345s;
                animation-delay: -9.345s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(6) {
                -webkit-animation-delay: -11.214s;
                animation-delay: -11.214s;
            }

            .nucleobase:nth-child(6):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -11.214s;
                animation-delay: -11.214s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(6):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -11.214s;
                animation-delay: -11.214s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(7) {
                -webkit-animation-delay: -13.083s;
                animation-delay: -13.083s;
            }

            .nucleobase:nth-child(7):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -13.083s;
                animation-delay: -13.083s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(7):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -13.083s;
                animation-delay: -13.083s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(8) {
                -webkit-animation-delay: -14.952s;
                animation-delay: -14.952s;
            }

            .nucleobase:nth-child(8):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -14.952s;
                animation-delay: -14.952s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(8):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -14.952s;
                animation-delay: -14.952s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(9) {
                -webkit-animation-delay: -16.821s;
                animation-delay: -16.821s;
            }

            .nucleobase:nth-child(9):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -16.821s;
                animation-delay: -16.821s;
                background-color: #7191e6;
            }

            .nucleobase:nth-child(9):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -16.821s;
                animation-delay: -16.821s;
                background-color: #4d68ec;
            }

            .nucleobase:nth-child(10) {
                -webkit-animation-delay: -18.69s;
                animation-delay: -18.69s;
            }

            .nucleobase:nth-child(10):before {
                -webkit-animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animBefore 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -18.69s;
                animation-delay: -18.69s;
                background-color: #7ba3ff;
            }

            .nucleobase:nth-child(10):after {
                -webkit-animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                animation: animAfter 2.1s cubic-bezier(0.42, 0, 0.58, 1) infinite;
                -webkit-animation-delay: -18.69s;
                animation-delay: -18.69s;
                background-color: #4d68ec;
            }

            @-webkit-keyframes animBefore {
                0% {
                    top: -60vh;
                    z-index: 1;
                }
                25% {
                    -webkit-transform: scale(1.2);
                    transform: scale(1.2);
                    z-index: 1;
                }
                50% {
                    top: 6vh;
                    z-index: -1;
                }
                75% {
                    background-color: #b2daff;
                    -webkit-transform: scale(0.8);
                    transform: scale(0.8);
                    z-index: -1;
                }
                100% {
                    top: -6vh;
                    z-index: -1;
                }
            }

            @keyframes animBefore {
                0% {
                    top: -60px;
                    z-index: 1;
                }
                25% {
                    -webkit-transform: scale(1.2);
                    transform: scale(1.2);
                    z-index: 1;
                }
                50% {
                    top: 60px;
                    z-index: -1;
                }
                75% {
                    background-color: #b2daff;
                    -webkit-transform: scale(0.8);
                    transform: scale(0.8);
                    z-index: -1;
                }
                100% {
                    top: -60px;
                    z-index: -1;
                }
            }

            @-webkit-keyframes animAfter {
                0% {
                    top: 6vh;
                    z-index: -1;
                }
                25% {
                    background-color: #3755d2;
                    -webkit-transform: scale(0.8);
                    transform: scale(0.8);
                    z-index: -1;
                }
                50% {
                    top: -6vh;
                    z-index: 1;
                }
                75% {
                    -webkit-transform: scale(1.2);
                    transform: scale(1.2);
                    z-index: 1;
                }
                100% {
                    top: 6vh;
                    z-index: 1;
                }
            }

            @keyframes animAfter {
                0% {
                    top: 60px;
                    z-index: -1;
                }
                25% {
                    background-color: #3755d2;
                    -webkit-transform: scale(0.8);
                    transform: scale(0.8);
                    z-index: -1;
                }
                50% {
                    top: -60px;
                    z-index: 1;
                }
                75% {
                    -webkit-transform: scale(1.2);
                    transform: scale(1.2);
                    z-index: 1;
                }
                100% {
                    top: 60px;
                    z-index: 1;
                }
            }

            .loading-spinner-wrapper .loading-text {
                font-size: 19px !important; /* Bootstrap Table forces font-size: 32px on .loading-text for some reason */
                font-variant: all-small-caps;
                letter-spacing: .3em;
                margin: 25px 0 0 20px;
                text-align: left;
            }

            .loading-spinner-wrapper .description {
                font-size: 17px;
                font-variant: all-small-caps;
                letter-spacing: .3em;
            }

            .loading-text-wrapper {
                width: 140px;
                margin: 0 auto;
            }

            /*.text:after {
                overflow: hidden;
                display: inline-block;
                vertical-align: bottom;
                -webkit-animation: ellipsis steps(4,end) 900ms infinite;
                animation: ellipsis steps(4,end) 900ms infinite;
                content: "\\2026"; !* ascii code for the ellipsis character *!
                width: 0px;
                margin-left: -8px;
            }

            @keyframes ellipsis {
                to {
                  width: 1.25em;
                }
            }*/

            @-webkit-keyframes ellipsis {
                to {
                  width: 1.25em;
                }
            }

        </style>
        `;
    }

    render() {
        return html`
            ${this.renderStyle()}
            <div class="loading-spinner-wrapper">
                <div class="DNA_cont">
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                    <div class="nucleobase"></div>
                </div>
                <div class="loading-text-wrapper">
                    <div class="loading-text">
                        Loading...
                    </div>

                </div>
                ${this.description ? html`<p class="description">${this.description}</p>` : null}
            </div>
        `;
    }

}

customElements.define("loading-spinner", LoadingSpinner);
