# CASPCT - Sistema de Registro de Território

Site estático (sem servidor próprio) para a **Coordenação de Atenção à Saúde de
Povos e Comunidades Tradicionais (CASPCT)** publicar e registrar:

- **Registro Diário**: atividades realizadas no território (data, comunidade
  tradicional, tipo de atividade, descrição e documentos).
- **Minivídeos e Minicursos**: conteúdos em vídeo/curso, por link ou upload.
- **Guias e Temáticas de Saúde**: guias e materiais organizados por temática.
- **Sobre a CASPCT**: informações institucionais e base legal (Decreto nº
  6.040/2007 — Política Nacional de Desenvolvimento Sustentável dos Povos e
  Comunidades Tradicionais).

## Como funciona o acesso

- **Ver o conteúdo é público.** Qualquer pessoa que abrir o link consegue ver
  os registros, vídeos/cursos e guias, sem precisar fazer login.
- **Inserir conteúdo exige login com Google**, e só funciona para quem estiver
  cadastrado como "usuário de teste" do projeto no Google Cloud Console — para
  qualquer outra pessoa, o próprio Google recusa o login. Não existe senha
  cadastrada no site: o controle de quem pode inserir é feito inteiramente
  pela lista de usuários de teste (passo 3 abaixo).
- Todos os dados (planilha e documentos) ficam numa **pasta e planilha únicas
  do Google Drive, de uma conta institucional da coordenação** — não no Drive
  de cada pessoa que loga. Não há banco de dados nem backend: tudo roda no
  navegador, direto contra as APIs do Google Drive/Sheets.

## Preparo único (antes de usar)

Esses passos só precisam ser feitos **uma vez**, pela conta institucional da
coordenação.

### 1. Criar a pasta e a planilha compartilhadas

Logado com a **conta institucional** da CASPCT no https://drive.google.com:

1. Crie uma pasta chamada, por exemplo, **"CASPCT - Registros"**.
2. Clique com o botão direito na pasta > **Compartilhar > Acesso geral** >
   mude de "Restrito" para **"Qualquer pessoa com o link"**, com papel
   **"Leitor"**. Isso permite que o público veja/abra os documentos.
3. Ainda em "Compartilhar", **adicione o e-mail de cada pessoa da equipe** que
   vai inserir registros, com papel **"Editor"**.
4. Copie o **ID da pasta**: é o trecho da URL depois de `/folders/`, por
   exemplo em `drive.google.com/drive/folders/1AbCdEfGhIjK...`, o ID é
   `1AbCdEfGhIjK...`.
5. Dentro dessa pasta, crie uma planilha Google Sheets chamada, por exemplo,
   **"CASPCT - Sistema de Registro"**, com três abas (nomes exatos):
   `Atividades`, `Conteudos` e `Guias`. Em cada aba, coloque na primeira linha
   os cabeçalhos:
   - **Atividades**: `Registrado em`, `Usuário`, `Data da atividade`,
     `Território/Comunidade`, `Tipo de atividade`, `Descrição`, `Documentos`
   - **Conteudos**: `Registrado em`, `Usuário`, `Título`, `Categoria`,
     `Descrição`, `Link`
   - **Guias**: `Registrado em`, `Usuário`, `Título`, `Temática de saúde`,
     `Descrição`, `Link`
6. Compartilhe a planilha do mesmo jeito que a pasta: **"Qualquer pessoa com o
   link" / "Leitor"** para o público, e **"Editor"** para cada pessoa da
   equipe.
7. Copie o **ID da planilha**: é o trecho da URL depois de `/d/`, por exemplo
   em `docs.google.com/spreadsheets/d/1XyZ.../edit`, o ID é `1XyZ...`.

### 2. Criar as credenciais do Google (OAuth Client ID)

1. Acesse https://console.cloud.google.com/ e crie um novo projeto (ex:
   "CASPCT Registro").
2. Em **APIs e serviços > Biblioteca**, ative:
   - **Google Drive API**
   - **Google Sheets API**
3. Em **APIs e serviços > Tela de consentimento OAuth**:
   - Tipo de usuário: **Externo** (ou **Interno**, se todos usarem contas do
     mesmo Google Workspace institucional).
   - Preencha nome do app, e-mail de suporte e e-mail de contato.
   - Em **Usuários de teste**, adicione o e-mail de **cada pessoa da equipe**
     que vai inserir conteúdo (limite de 100). **Só quem estiver nessa lista
     consegue logar** — esse é o controle de acesso do site.
4. Em **APIs e serviços > Credenciais > Criar credenciais > ID do cliente
   OAuth**:
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Em **Origens JavaScript autorizadas**, adicione a URL onde o site vai
     ficar publicado, por exemplo `https://melziangra.github.io` (sem
     caminho, só o domínio — ajuste se for diferente, veja o passo 4).
   - Copie o **Client ID** gerado.

> Como o app pede acesso amplo ao Drive/Sheets (para poder escrever na pasta
> da coordenação, que não pertence a quem loga), o Google mostra uma tela de
> aviso "app não verificado" para os usuários de teste. Isso é normal para
> ferramentas internas: quem for logar deve clicar em **Avançado** e depois em
> **Ir para [nome do app] (não seguro)** para continuar.

### 3. Preencher `js/config.js`

Abra [`js/config.js`](js/config.js) e preencha os três valores:

```js
CLIENT_ID: "...",                 // do passo 2
SHARED_FOLDER_ID: "...",          // do passo 1.4
SHARED_SPREADSHEET_ID: "...",     // do passo 1.7
```

Depois, faça commit e push dessas alterações.

### 4. Publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings > Pages**.
2. Em **Source**, selecione a branch onde este código está (ex: `main`) e a
   pasta `/ (root)`. Deixe o campo **"Custom domain" em branco**, a não ser
   que você realmente tenha um domínio próprio configurado.
3. Salve. Em alguns minutos o site estará disponível em uma URL do tipo:
   `https://<usuario-ou-organizacao>.github.io/<nome-do-repositorio>/`
4. Volte ao Google Cloud Console (passo 2) e confirme que essa URL (só o
   domínio, sem o caminho) está cadastrada em **Origens JavaScript
   autorizadas** — sem isso o login falha.

## Uso do dia a dia

- **Qualquer visitante** abre o link e já vê o conteúdo das quatro abas, sem
  precisar logar.
- **Quem for da equipe** clica em "Entrar (equipe CASPCT)" no topo, loga com a
  própria conta Google (a mesma cadastrada como usuário de teste) e passa a
  conseguir enviar os formulários de registro/conteúdo/guia.
- Para adicionar ou remover alguém da equipe, é só atualizar a lista de
  **usuários de teste** no Google Cloud Console e a lista de **Editores** na
  pasta/planilha do Drive.

## Estrutura de arquivos

```
index.html        Estrutura da página e das abas
style.css         Estilo visual
js/config.js      Client ID, IDs da pasta/planilha compartilhadas e opções dos formulários
js/auth.js        Login Google sob demanda (só ao inserir conteúdo)
js/drive.js       Leitura pública (Google Visualization API) e escrita autenticada (Drive/Sheets API)
js/app.js         Lógica das abas, formulários e listagens
assets/           Logos da Secretaria da Saúde e da CASPCT
```

## Base legal

O sistema segue a definição de Povos e Comunidades Tradicionais do
**Decreto Federal nº 6.040, de 7 de fevereiro de 2007**, que institui a
Política Nacional de Desenvolvimento Sustentável dos Povos e Comunidades
Tradicionais (PNPCT), contemplando povos indígenas, comunidades quilombolas,
povos ciganos, povos de terreiro, comunidades ribeirinhas, pescadores e
pescadoras artesanais, povos de fundo de pasto e extrativistas.
