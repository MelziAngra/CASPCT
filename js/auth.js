// Autenticação via Google Identity Services (GIS).
//
// O login NÃO é exigido para visualizar o site — as abas de conteúdo são
// públicas. Ele só é pedido quando alguém tenta inserir um novo registro,
// vídeo/curso ou guia. Como o app usa escopos amplos do Drive/Sheets (para
// escrever na pasta/planilha compartilhada da coordenação, que não pertence
// a quem loga), só e-mails cadastrados como "usuário de teste" no Google
// Cloud Console conseguem concluir o login — para qualquer outra pessoa o
// próprio Google bloqueia o acesso.

let gisInitialized = false;
let gisTokenClient = null;
let currentUser = null; // { name, email, picture }

function initGoogleAuth() {
  google.accounts.id.initialize({
    client_id: CASPCT_CONFIG.CLIENT_ID,
    callback: handleGoogleIdentity,
  });

  gisTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CASPCT_CONFIG.CLIENT_ID,
    scope: CASPCT_CONFIG.SCOPES,
    callback: "", // definido dinamicamente em requestLogin()
  });

  gisInitialized = true;
}

// Chamado quando a pessoa clica em "Entrar" no topo da página.
// Retorna uma Promise que resolve com o usuário logado, ou rejeita em caso
// de erro/recusa.
function requestLogin() {
  return new Promise((resolve, reject) => {
    if (!gisInitialized) {
      reject(new Error("O login do Google ainda não carregou. Aguarde alguns segundos e tente novamente."));
      return;
    }
    gisTokenClient.callback = (tokenResponse) => {
      if (tokenResponse.error) {
        reject(new Error("Login não autorizado. Confirme se o seu e-mail está liberado como usuário de teste no Google Cloud Console."));
        return;
      }
      window.driveAccessToken = tokenResponse.access_token;
      fetchProfile()
        .then((user) => {
          currentUser = user;
          resolve(user);
        })
        .catch(reject);
    };
    gisTokenClient.requestAccessToken({ prompt: "" });
  });
}

async function fetchProfile() {
  const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${window.driveAccessToken}` },
  });
  if (!res.ok) throw new Error("Não foi possível obter os dados da conta Google.");
  const profile = await res.json();
  return { name: profile.name, email: profile.email, picture: profile.picture };
}

function isLoggedIn() {
  return !!window.driveAccessToken && !!currentUser;
}

function signOut() {
  if (window.driveAccessToken) {
    google.accounts.oauth2.revoke(window.driveAccessToken, () => {});
  }
  currentUser = null;
  window.driveAccessToken = null;
  window.location.reload();
}
