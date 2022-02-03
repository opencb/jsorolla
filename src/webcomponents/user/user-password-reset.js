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
        this.userName = "";
        this.password = "";
        this.buttonText = "Sign in";
        this.signingIn = false;
    }

    redirect(to) {
        LitUtils.dispatchCustomEvent(this, "redirect", null, {hash: to});
    }

    onSubmit() {
        // TODO
    }

    checkEnterKey(e) {
        if (e.keyCode === 13) {
            // this.login();
        }
    }

    render() {
        return html`
            <div class="container-fluid" style="max-width:380px;">
                <div class="panel panel-default" style="margin-top:96px;">
                    <div class="panel-body" style="padding:24px;">
                        <div align="center">
                            <h3 style="font-weight:bold;">Reset your password</h3>
                        </div>
                        <div class="paragraph" style="margin-bottom:16px;">
                            Please enter your user ID and we will send you an email with your password reset link.
                        </div>
                        <div class="form-group has-feedback">
                            <div class="input-group">
                                <span class="input-group-addon" id="username">
                                    <i class="fa fa-user fa-lg"></i>
                                </span>
                                <input id="user" type="text" class="form-control" placeholder="User ID">
                            </div>
                        </div>
                        <button class="btn btn-lg btn-primary btn-block" @click="${() => this.onSubmit()}">
                            Reset password
                        </button>
                    </div>
                </div>
                <div align="center">
                    <a @click="${() => this.redirect("#login")}" style="cursor:pointer;">Cancel</a>
                </div>
            </div>
        `;
    }

}

customElements.define("user-password-reset", UserPasswordReset);
