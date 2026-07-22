// Funções de acesso ao Google Drive e Google Planilhas (Sheets), usando
// apenas fetch + o token de acesso obtido em auth.js. Não depende de
// nenhuma biblioteca externa além do próprio navegador.

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

async function driveFindOrCreateFolder(name, parentId) {
  const parent = parentId || "root";
  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and '${parent}' in parents and trashed=false`
  );
  const found = await apiFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`);
  if (found.files && found.files.length > 0) return found.files[0].id;

  const created = await apiFetch(`${DRIVE_API}/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parent],
    }),
  });
  return created.id;
}

let cachedFolders = null;

async function ensureFolderStructure() {
  if (cachedFolders) return cachedFolders;
  const rootId = await driveFindOrCreateFolder(CASPCT_CONFIG.ROOT_FOLDER_NAME);
  const atividadesId = await driveFindOrCreateFolder(CASPCT_CONFIG.SUBFOLDERS.atividades, rootId);
  const conteudosId = await driveFindOrCreateFolder(CASPCT_CONFIG.SUBFOLDERS.conteudos, rootId);
  const guiasId = await driveFindOrCreateFolder(CASPCT_CONFIG.SUBFOLDERS.guias, rootId);
  cachedFolders = { rootId, atividadesId, conteudosId, guiasId };
  return cachedFolders;
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

let cachedSpreadsheetId = null;
const HEADERS = {
  atividades: ["Registrado em", "Usuário", "Data da atividade", "Território/Comunidade", "Tipo de atividade", "Descrição", "Documentos"],
  conteudos: ["Registrado em", "Usuário", "Título", "Categoria", "Descrição", "Link"],
  guias: ["Registrado em", "Usuário", "Título", "Temática de saúde", "Descrição", "Link"],
};

async function ensureSpreadsheet() {
  if (cachedSpreadsheetId) return cachedSpreadsheetId;
  const { rootId } = await ensureFolderStructure();

  const q = encodeURIComponent(
    `mimeType='application/vnd.google-apps.spreadsheet' and name='${CASPCT_CONFIG.SPREADSHEET_NAME}' and '${rootId}' in parents and trashed=false`
  );
  const found = await apiFetch(`${DRIVE_API}/files?q=${q}&fields=files(id,name)`);

  if (found.files && found.files.length > 0) {
    cachedSpreadsheetId = found.files[0].id;
    return cachedSpreadsheetId;
  }

  const created = await apiFetch(`${DRIVE_API}/files?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: CASPCT_CONFIG.SPREADSHEET_NAME,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [rootId],
    }),
  });
  cachedSpreadsheetId = created.id;

  const sheetNames = Object.values(CASPCT_CONFIG.SHEETS);
  await apiFetch(`${SHEETS_API}/${cachedSpreadsheetId}:batchUpdate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        { updateSheetProperties: { properties: { sheetId: 0, title: sheetNames[0] }, fields: "title" } },
        ...sheetNames.slice(1).map((title) => ({ addSheet: { properties: { title } } })),
      ],
    }),
  });

  for (const [key, sheetName] of Object.entries(CASPCT_CONFIG.SHEETS)) {
    await apiFetch(
      `${SHEETS_API}/${cachedSpreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [HEADERS[key]] }),
      }
    );
  }

  return cachedSpreadsheetId;
}

async function sheetsAppendRow(sheetName, values) {
  const spreadsheetId = await ensureSpreadsheet();
  await apiFetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [values] }),
    }
  );
}

async function sheetsGetRows(sheetName) {
  const spreadsheetId = await ensureSpreadsheet();
  const result = await apiFetch(
    `${SHEETS_API}/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A2:Z1000`
  );
  return result.values || [];
}
