// Funções de acesso ao Google Drive e Google Planilhas (Sheets).
//
// Leitura (para qualquer visitante, sem login): busca os dados direto da
// planilha compartilhada da CASPCT através do endpoint público do Google
// Visualization API — funciona porque a planilha está compartilhada como
// "Qualquer pessoa com o link pode visualizar". Não usa nenhuma chave de
// API nem exige autenticação.
//
// Escrita (só depois de login): usa fetch + o token de acesso obtido em
// auth.js, contra a pasta/planilha fixas configuradas em config.js
// (SHARED_FOLDER_ID / SHARED_SPREADSHEET_ID).

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

function authHeaders() {
  return { Authorization: `Bearer ${window.driveAccessToken}` };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Falha na chamada à API (${res.status}): ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// ---------- Leitura pública (sem login) ----------

async function publicReadSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${CASPCT_CONFIG.SHARED_SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      "Não foi possível carregar os dados públicos. Confirme se a planilha está compartilhada como \"Qualquer pessoa com o link pode visualizar\"."
    );
  }
  const text = await res.text();
  // A resposta vem envolta em "google.visualization.Query.setResponse(...)".
  const jsonText = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const data = JSON.parse(jsonText);
  const rows = data.table.rows || [];
  return rows.map((row) => row.c.map((cell) => (cell ? cell.v : "")));
}

// ---------- Escrita (exige login) ----------

async function driveFindOrCreateFolder(name, parentId) {
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and '${parentId}' in parents and trashed=false`
  );
  const found = await apiFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`);
  if (found.files && found.files.length > 0) return found.files[0].id;

  const created = await apiFetch(`${DRIVE_API}/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
  return created.id;
}

let cachedSubfolders = null;

async function ensureSubfolders() {
  if (cachedSubfolders) return cachedSubfolders;
  const rootId = CASPCT_CONFIG.SHARED_FOLDER_ID;
  const atividadesId = await driveFindOrCreateFolder(CASPCT_CONFIG.SUBFOLDERS.atividades, rootId);
  const conteudosId = await driveFindOrCreateFolder(CASPCT_CONFIG.SUBFOLDERS.conteudos, rootId);
  const guiasId = await driveFindOrCreateFolder(CASPCT_CONFIG.SUBFOLDERS.guias, rootId);
  cachedSubfolders = { atividadesId, conteudosId, guiasId };
  return cachedSubfolders;
}

async function driveUploadFile(file, folderId) {
  const metadata = { name: file.name, parents: [folderId] };
  const boundary = "caspct-" + Math.random().toString(36).slice(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const fileData = await file.arrayBuffer();
  const metadataPart =
    delimiter +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type || "application/octet-stream"}\r\n\r\n`;

  const body = new Blob([metadataPart, fileData, closeDelim]);

  const created = await apiFetch(
    `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,webViewLink`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    }
  );

  // Torna o arquivo acessível a qualquer pessoa com o link, já que a página
  // é pública e outras pessoas (sem login) precisam conseguir abrir os
  // documentos/links listados nas abas.
  await apiFetch(`${DRIVE_API}/files/${created.id}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role: "reader", type: "anyone" }),
  });

  return created; // { id, webViewLink }
}

async function driveUploadMultiple(files, folderId) {
  const links = [];
  for (const file of files) {
    const uploaded = await driveUploadFile(file, folderId);
    links.push(uploaded.webViewLink);
  }
  return links;
}

async function sheetsAppendRow(sheetName, values) {
  const spreadsheetId = CASPCT_CONFIG.SHARED_SPREADSHEET_ID;
  await apiFetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    }
  );
}
