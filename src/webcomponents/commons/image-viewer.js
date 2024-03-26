/*
 * Copyright 2015-2024 OpenCB
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
// import "../download-button.js";

export default class ImageViewer extends LitElement {

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            title: {
                type: String
            },
            data: {
                type: String
            }
        };
    }

    render() {
        if (!this.data) {
            return html`<div>No base64 data provided</div>`;
        }

        // TODO: add the download button and the optional title
        return html`
            <img
                class="img-thumbnail"
                id="thumbnail"
                src="data:image/png;base64, ${this.data}"
            />
        `;
    }

}

customElements.define("image-viewer", ImageViewer);
