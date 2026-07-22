// Liga a interface (abas, formulários, tabelas/cards) às funções de
// autenticação (auth.js) e Google Drive/Sheets (drive.js).

document.addEventListener("DOMContentLoaded", () => {
  populateSelects();
  wireTabs();
  wireForms();
  initGoogleAuth(onLoggedIn);
});

function populateSelects() {
  fillSelect('select[name="territorio"]', CASPCT_CONFIG.TERRITORIOS);
  fillSelect('select[name="tipo"]', CASPCT_CONFIG.TIPOS_ATIVIDADE);
  fillSelect('select[name="categoria"]', CASPCT_CONFIG.CATEGORIAS_CONTEUDO);
  fillSelect('select[name="tematica"]', CASPCT_CONFIG.TEMATICAS_SAUDE);
}

function fillSelect(selector, options) {
  document.querySelectorAll(selector).forEach((select) => {
    for (const opt of options) {
      const el = document.createElement("option");
      el.value = opt;
      el.textContent = opt;
      select.appendChild(el);
    }
  });
}

function wireTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    });
  });
}

function onLoggedIn(user) {
  document.getElementById("login-screen").hidden = true;
  document.getElementById("app-screen").hidden = false;

  const userBar = document.getElementById("user-bar");
  userBar.hidden = false;
  document.getElementById("user-avatar").src = user.picture;
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("signout-btn").addEventListener("click", signOut);

  loadAtividades();
  loadConteudos();
  loadGuias();
}

function setStatus(form, message, isError) {
  const status = form.querySelector(".form-status");
  status.textContent = message;
  status.hidden = false;
  status.classList.toggle("error", !!isError);
  status.classList.toggle("ok", !isError);
}

function wireForms() {
  document.getElementById("form-atividades").addEventListener("submit", submitAtividade);
  document.getElementById("form-conteudos").addEventListener("submit", submitConteudo);
  document.getElementById("form-guias").addEventListener("submit", submitGuia);
}

async function submitAtividade(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  setStatus(form, "Enviando registro...", false);

  try {
    const data = form.data.value;
    const territorio = form.territorio.value;
    const tipo = form.tipo.value;
    const descricao = form.descricao.value;
    const files = Array.from(form.arquivos.files || []);

    const { atividadesId } = await ensureFolderStructure();
    const links = files.length ? await driveUploadMultiple(files, atividadesId) : [];

    await sheetsAppendRow(CASPCT_CONFIG.SHEETS.atividades, [
      new Date().toLocaleString("pt-BR"),
      currentUser.email,
      data,
      territorio,
      tipo,
      descricao,
      links.join(", "),
    ]);

    form.reset();
    setStatus(form, "Registro salvo com sucesso.", false);
    loadAtividades();
  } catch (err) {
    console.error(err);
    setStatus(form, "Erro ao salvar o registro: " + err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function submitConteudo(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  setStatus(form, "Publicando conteúdo...", false);

  try {
    const titulo = form.titulo.value;
    const categoria = form.categoria.value;
    const descricao = form.descricao.value;
    let link = form.link.value;
    const arquivo = form.arquivo.files[0];

    if (arquivo) {
      const { conteudosId } = await ensureFolderStructure();
      const uploaded = await driveUploadFile(arquivo, conteudosId);
      link = uploaded.webViewLink;
    }

    if (!link) throw new Error("Informe um link ou envie um arquivo.");

    await sheetsAppendRow(CASPCT_CONFIG.SHEETS.conteudos, [
      new Date().toLocaleString("pt-BR"),
      currentUser.email,
      titulo,
      categoria,
      descricao,
      link,
    ]);

    form.reset();
    setStatus(form, "Conteúdo publicado com sucesso.", false);
    loadConteudos();
  } catch (err) {
    console.error(err);
    setStatus(form, "Erro ao publicar: " + err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function submitGuia(event) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector("button[type=submit]");
  submitBtn.disabled = true;
  setStatus(form, "Publicando guia...", false);

  try {
    const titulo = form.titulo.value;
    const tematica = form.tematica.value;
    const descricao = form.descricao.value;
    let link = form.link.value;
    const arquivo = form.arquivo.files[0];

    if (arquivo) {
      const { guiasId } = await ensureFolderStructure();
      const uploaded = await driveUploadFile(arquivo, guiasId);
      link = uploaded.webViewLink;
    }

    if (!link) throw new Error("Informe um link ou envie um arquivo.");

    await sheetsAppendRow(CASPCT_CONFIG.SHEETS.guias, [
      new Date().toLocaleString("pt-BR"),
      currentUser.email,
      titulo,
      tematica,
      descricao,
      link,
    ]);

    form.reset();
    setStatus(form, "Guia publicado com sucesso.", false);
    loadGuias();
  } catch (err) {
    console.error(err);
    setStatus(form, "Erro ao publicar: " + err.message, true);
  } finally {
    submitBtn.disabled = false;
  }
}

async function loadAtividades() {
  const tbody = document.querySelector("#table-atividades tbody");
  try {
    const rows = await sheetsGetRows(CASPCT_CONFIG.SHEETS.atividades);
    tbody.innerHTML = "";
    for (const row of rows.reverse()) {
      const [, usuario, data, territorio, tipo, descricao, documentos] = row;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(data)}</td>
        <td>${escapeHtml(usuario)}</td>
        <td>${escapeHtml(territorio)}</td>
        <td>${escapeHtml(tipo)}</td>
        <td>${escapeHtml(descricao)}</td>
        <td>${linkify(documentos)}</td>`;
      tbody.appendChild(tr);
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadConteudos() {
  const grid = document.getElementById("grid-conteudos");
  try {
    const rows = await sheetsGetRows(CASPCT_CONFIG.SHEETS.conteudos);
    grid.innerHTML = "";
    for (const row of rows.reverse()) {
      const [registradoEm, usuario, titulo, categoria, descricao, link] = row;
      grid.appendChild(
        renderCard({ tag: categoria, titulo, descricao, link, usuario, registradoEm })
      );
    }
  } catch (err) {
    console.error(err);
  }
}

async function loadGuias() {
  const grid = document.getElementById("grid-guias");
  try {
    const rows = await sheetsGetRows(CASPCT_CONFIG.SHEETS.guias);
    grid.innerHTML = "";
    for (const row of rows.reverse()) {
      const [registradoEm, usuario, titulo, tematica, descricao, link] = row;
      grid.appendChild(
        renderCard({ tag: tematica, titulo, descricao, link, usuario, registradoEm })
      );
    }
  } catch (err) {
    console.error(err);
  }
}

function renderCard({ tag, titulo, descricao, link, usuario, registradoEm }) {
  const div = document.createElement("div");
  div.className = "content-card";
  div.innerHTML = `
    <span class="tag">${escapeHtml(tag || "")}</span>
    <h4>${escapeHtml(titulo || "")}</h4>
    <p>${escapeHtml(descricao || "")}</p>
    ${link ? `<a href="${escapeAttr(link)}" target="_blank" rel="noopener">Abrir</a>` : ""}
    <p class="meta">${escapeHtml(usuario || "")} · ${escapeHtml(registradoEm || "")}</p>`;
  return div;
}

function linkify(commaSeparatedLinks) {
  if (!commaSeparatedLinks) return "";
  return commaSeparatedLinks
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l, i) => `<a href="${escapeAttr(l)}" target="_blank" rel="noopener">arquivo ${i + 1}</a>`)
    .join(", ");
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}
