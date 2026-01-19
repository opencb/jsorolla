import {render, nothing} from "lit";
import {directive, PartType} from "lit/directive.js";
import { AsyncDirective } from "lit/async-directive.js";

class PortalDirective extends AsyncDirective {
    constructor(partInfo) {
        super(partInfo);
        if (partInfo.type !== PartType.CHILD) {
            throw new Error("portal directive must be used in child position");
        }
        this._target = null;
        this._container = null;
        this._content = null;
    }

    update(part, [nextTarget, nextContent]) {
        // 1. check if target has changed. in that case, clear previous target
        if (this._container && this._target && this._target !== nextTarget) {
            this._target.removeChild(this._container);
            this._container = null; // reset container reference
        }

        // 2. update internal references to next target and content
        this._content = nextContent || null;
        this._target = nextTarget || null;

        // 3. render content into target
        if (this._target) {
            if (!this._container) {
                this._container = document.createElement("div");
                this._target.appendChild(this._container);
            }
            render(this._content, this._container);
        }
    }

    disconnected() {
        if (this._container && this._target) {
            this._target.removeChild(this._container);
            this._container = null;
        }
    }

    reconnected() {
        if (this._container && this._content) {
            render(this._content, this._container);
        }
    }

    render() {
        // do not render nothing in place
        return nothing;
    }

}

export const portal = directive(PortalDirective);
