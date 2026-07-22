// Liga a interface (abas, formulários, tabelas/cards) às funções de
// autenticação (auth.js) e Google Drive/Sheets (drive.js).
//
// O conteúdo das abas é carregado para QUALQUER visitante, sem login. O
// login só é pedido na hora de enviar um formulário (inserir um registro,
// conteúdo ou guia).

document.addEventListener("DOMContentLoaded", () => {
  populateSelects();
  wireTabs();
  wireForms();
  wireLoginButton();

  // O conteúdo público precisa carregar mesmo que o script de login do
  // Google falhe (rede lenta, bloqueador de anúncios, firewall, etc.).
  try {
    initGoogleAuth();
  } catch (err) {
    console.error("Falha ao iniciar o login do Google:", err);
    document.getElementById("login-btn").disabled = true;
    document.getElementById("login-btn").title = "Login indisponível no momento.";
  }

  loadAtividades();
  loadConteudos();
  loadGuias();
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

function wireLoginButton() {
  document.getElementById("login-btn").addEventListener("click", async () => {
    const errorEl = document.getElementById("auth-error");
    errorEl.hidden = true;
    try {
      const user = await requestLogin();
      showLoggedInUser(user);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.hidden = false;
    }
  });
  document.getElementById("signout-btn").addEventListener("click", signOut);
}

function showLoggedInUser(user) {
  document.getElementById("login-btn").hidden = true;
  const userBar = document.getElementById("user-bar");
  userBar.hidden = false;
  document.getElementById("user-avatar").src = user.picture;
  document.getElementById("user-name").textContent = user.name;
}

// Garante que a pessoa está logada antes de continuar um envio de
// formulário; se ainda não estiver, pede login na hora.
async function ensureLoggedIn() {
  if (isLoggedIn()) return;
  const user = await requestLogin();
  showLoggedInUser(user);
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

  try {
    setStatus(form, "Fazendo login...", false);
    await ensureLoggedIn();

    setStatus(form, "Enviando registro...", false);
    const data = form.data.value;
    const territorio = form.territorio.value;
    const tipo = form.tipo.value;
    const descricao = form.descricao.value;
    const files = Array.from(form.arquivos.files || []);

    const { atividadesId } = await ensureSubfolders();
    const links = files.length ? await driveUploadMultiple(files, atividadesId) : [];

    await sheetsAppendRow("atividades", [
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

  try {
    setStatus(form, "Fazendo login...", false);
    await ensureLoggedIn();

    setStatus(form, "Publicando conteúdo...", false);
    const titulo = form.titulo.value;
    const categoria = form.categoria.value;
    const descricao = form.descricao.value;
    let link = form.link.value;
    const arquivo = form.arquivo.files[0];

    if (arquivo) {
      const { conteudosId } = await ensureSubfolders();
      const uploaded = await driveUploadFile(arquivo, conteudosId);
      link = uploaded.webViewLink;
    }

    if (!link) throw new Error("Informe um link ou envie um arquivo.");

    await sheetsAppendRow("conteudos", [
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

  try {
    setStatus(form, "Fazendo login...", false);
    await ensureLoggedIn();

    setStatus(form, "Publicando guia...", false);
    const titulo = form.titulo.value;
    const tematica = form.tematica.value;
    const descricao = form.descricao.value;
    let link = form.link.value;
    const arquivo = form.arquivo.files[0];

    if (arquivo) {
      const { guiasId } = await ensureSubfolders();
      const uploaded = await driveUploadFile(arquivo, guiasId);
      link = uploaded.webViewLink;
    }

    if (!link) throw new Error("Informe um link ou envie um arquivo.");

    await sheetsAppendRow("guias", [
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
    const rows = await publicReadSheet("atividades");
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
    showPublicLoadError("#table-atividades", err);
  }
}

async function loadConteudos() {
  const grid = document.getElementById("grid-conteudos");
  try {
    const rows = await publicReadSheet("conteudos");
    grid.innerHTML = "";
    for (const row of rows.reverse()) {
      const [registradoEm, usuario, titulo, categoria, descricao, link] = row;
      grid.appendChild(
        renderCard({ tag: categoria, titulo, descricao, link, usuario, registradoEm })
      );
    }
  } catch (err) {
    console.error(err);
    showPublicLoadError("#grid-conteudos", err);
  }
}

async function loadGuias() {
  const grid = document.getElementById("grid-guias");
  try {
    const rows = await publicReadSheet("guias");
    grid.innerHTML = "";
    for (const row of rows.reverse()) {
      const [registradoEm, usuario, titulo, tematica, descricao, link] = row;
      grid.appendChild(
        renderCard({ tag: tematica, titulo, descricao, link, usuario, registradoEm })
      );
    }
  } catch (err) {
    console.error(err);
    showPublicLoadError("#grid-guias", err);
  }
}

function showPublicLoadError(containerSelector, err) {
  const el = document.querySelector(containerSelector);
  if (el) el.innerHTML = `<p class="error-text">Não foi possível carregar os dados públicos agora: ${escapeHtml(err.message)}</p>`;
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
