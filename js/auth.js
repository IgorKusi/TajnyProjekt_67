//ChceTwojego18cmPotworaDoBuzi6767
const PASSWORD_HASH = "c8df41f6cb5c6614d3aee00fca63391e9ac577512149fbf861e8c855fb39289c";

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function checkPassword(password) {
    const hash = await hashPassword(password);
    return hash === PASSWORD_HASH;
}

function isAuthenticated() {
    return sessionStorage.getItem("authenticated") === "true";
}

function authenticate() {
    sessionStorage.setItem("authenticated", "true");
}

function logout() {
    sessionStorage.removeItem("authenticated");
}