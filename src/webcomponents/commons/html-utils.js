import {html} from "lit-html";

export const construction = html`
    <div class="d-flex flex-column justify-content-center align-items-center pt-5">
        <i class="fas fa-pencil-ruler fa-5x"></i>
        <h3>Component under construction</h3>
        <h3>(Coming Soon)</h3>
    </div>
`;

export const guardPage = message => html`
    <div class="d-flex flex-column justify-content-center align-items-center pt-5">
        <i class="fas fa-lock fa-5x"></i>
        <h3>${message ? message : "No project available to browse. Please login to continue"}</h3>
    </div>
`;
