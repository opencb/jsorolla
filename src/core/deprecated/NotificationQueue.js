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

import UtilsNew from "../utils-new.js";
import {html} from "lit-html";

export class NotificationQueue {

    constructor() {
        if (!NotificationQueue.instance) {
            NotificationQueue.instance = this;
        }
        this.queue = [];
        return NotificationQueue.instance;
    }

    setContext(context) {
        this.context = context;
    }

    async push(title, details = "", severity = "info", dismissible = true, autoDismiss = true) {
        const id = UtilsNew.randomString(6);
        const msg = {id, title, details, severity, dismissible, autoDismiss};
        this.queue = [...this.queue, msg];
        this.context.requestUpdate();
        await this.context.updateComplete;
        if (autoDismiss) {
            await UtilsNew.sleep(5000);
            this.remove(id);
            this.context.requestUpdate();
            await this.context.updateComplete;
        }
    }

    // temp fix
    pushRemainingTime(remainingMinutes, opencgaClient) {
        const msg = html`Your session is close to expire. <strong>${remainingMinutes} minutes remaining</strong> <a href="javascript:void 0" @click="${() => {
            this.refreshToken(opencgaClient);
        }}"> Click here to refresh </a>`;
        this.push(msg);
    }

    remove(id) {
        this.queue = this.queue.filter(item => item.id !== id);
        this.context.requestUpdate();
    }

    get() {
        return this.queue;
    }

    refreshToken(opencgaClient) {
        opencgaClient.refresh().then(response => {
            const sessionId = response.getResult(0).token;
            const decoded = jwt_decode(sessionId);
            const dateExpired = new Date(decoded.exp * 1000);
            const validTimeSessionId = moment(dateExpired, "YYYYMMDDHHmmss").format("D MMM YY HH:mm:ss");
            const _message = "Your session is now valid until " + validTimeSessionId;
            this.push(_message, "", "info");
        });
    }

}
