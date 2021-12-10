/**
 * Copyright 2015-present OpenCB
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

import {LitElement} from "lit";

export default class CustomRouter extends LitElement {

    static get properties() {
        return {
            content: {
                type: Function,
            },
        };
    }

    createRenderRoot() {
        return this;
    }

    // Component added to DOM --> register event listeners
    connectedCallback() {
        super.connectedCallback();
        window.addEventListener("hashchange", this.handleHashChange);
    }

    // Component removed from DOM --> remove event listeners
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("hashchange", this.handleHashChange);
    }

    handleHashChange = () => {
        this.requestUpdate();
    }

    render() {
        return this.content && this.content();
    }

}

customElements.define("custom-router", CustomRouter);
