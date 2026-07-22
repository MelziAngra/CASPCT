// Autenticação via Google Identity Services (GIS).
// Faz duas coisas: (1) login com a conta Google, (2) autorização de acesso
// ao Drive/Sheets (apenas arquivos criados por este app, escopo drive.file).

let gisTokenClient = null;
let currentUser = null; // { name, email, picture }
let onAuthReady = null; // callback chamado quando o login+token estiverem prontos

function initGoogleAuth(callback) {
  onAuthReady = callback;

  google.accounts.id.initialize({
    client_id: CASPCT_CONFIG.CLIENT_ID,
    callback: handleGoogleIdentity,
  });

  google.accounts.id.renderButton(document.getElementById("google-signin-button"), {
    theme: "outline",
    size: "large",
    text: "signin_with",
    locale: "pt-BR",
  });

  gisTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CASPCT_CONFIG.CLIENT_ID,
    scope: CASPCT_CONFIG.SCOPES,
    callback: "", // definido dinamicamente em requestDriveAccess()
  });
}

function handleGoogleIdentity(response) {
  const payload = decodeJwt(response.credential);
  currentUser = {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
  };
  requestDriveAccess();
}

function requestDriveAccess() {
  gisTokenClient.callback = (tokenResponse) => {
    if (tokenResponse.error) {
      showAuthError(
        "Não foi possível autorizar o acesso ao Google Drive. Tente novamente."
      );
      return;
    }
    window.driveAccessToken = tokenResponse.access_token;
    if (onAuthReady) onAuthReady(currentUser);
  };
  gisTokenClient.requestAccessToken({ prompt: "" });
}

function decodeJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

function showAuthError(message) {
  const el = document.getElementById("auth-error");
  if (el) {
    el.textContent = message;
    el.hidden = false;
  }
}

function signOut() {
  if (window.driveAccessToken) {
    google.accounts.oauth2.revoke(window.driveAccessToken, () => {});
  }
  google.accounts.id.disableAutoSelect();
  currentUser = null;
  window.driveAccessToken = null;
  window.location.reload();
}
