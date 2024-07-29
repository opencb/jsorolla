import {LitElement, html} from "lit";
import LitUtils from "../commons/utils/lit-utils.js";
import NotificationUtils from "../commons/utils/notification-utils.js";


export default class UserPasswordReset extends LitElement {

    constructor() {
        super();
        this.#init();
    }

    createRenderRoot() {
        return this;
    }

    static get properties() {
        return {
            opencgaSession: {
                type: Object
            },
        };
    }

    #init() {
        this.hasEmptyUser = false;
    }

    redirect(to) {
        LitUtils.dispatchCustomEvent(this, "redirect", null, {hash: to});
    }

    onSubmit(e) {
        e.preventDefault();
        const user = (this.querySelector("#user").value || "").trim();

        // Check for empty user ID
        this.hasEmptyUser = user.length === 0;
        if (this.hasEmptyUser) {
            return this.requestUpdate();
        }

        // Reset password mockup
        // TODO: call openCGA to the correct endpoint
        Promise.resolve().then(() => {
            NotificationUtils.dispatch(this, NotificationUtils.NOTIFY_SUCCESS, {
                "message": "We have just send you an email with the new password.",
            });

            this.querySelector("#user").value = "";
            this.hasEmptyUser = false;
            this.requestUpdate();
        });
    }

    // Handle keyup event --> check for enter key to submit the form
    onKeyUp(e) {
        if (e.key === "Enter") {
            return this.onSubmit(e);
        }
    }

    render() {
        return html`
            <div class="container-fluid" style="max-width:380px;">
                <div class="card" style="margin-top:96px;">
                    <div class="card-body" style="padding:32px;">
                        <div align="center">
                            <h3 style="font-weight:bold;margin-top:0px;">
                                Reset your password
                            </h3>
                        </div>
                        <div class="paragraph" style="margin-bottom:16px;">
                            Please enter your user ID and we will send you an email with your password reset link.
                        </div>
                        <div class="form-group ${this.hasEmptyUser ? "has-error" : ""}">
                            <div class="input-group">
                                <span class="input-group-addon" id="username">
                                    <i class="fa fa-user fa-lg"></i>
                                </span>
                                <input id="user" type="text" class="form-control" placeholder="User ID" @keyup="${e => this.onKeyUp(e)}">
                            </div>
                        </div>
                        <button class="btn btn-primary btn-block" @click="${e => this.onSubmit(e)}">
                            <strong>Reset Password</strong>
                        </button>
                    </div>
                </div>
                <div align="center">
                    <a @click="${() => this.redirect("#login")}" style="cursor:pointer;">Go back to Login</a>
                </div>
            </div>
        `;
    }

}

customElements.define("user-password-reset", UserPasswordReset);
