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
- Todos os dados (planilhas e documentos) ficam numa **pasta e planilhas
  únicas do Google Drive**, na conta institucional da coordenação — não no
  Drive de cada pessoa que loga. Não há banco de dados nem backend: tudo roda
  no navegador, direto contra as APIs do Google Drive/Sheets.
- Em vez de uma única planilha com três abas, existem **três planilhas
  separadas** (uma para Atividades, uma para Conteúdos e uma para Guias),
  cada uma com uma única aba — isso simplifica a leitura pública dos dados.

## Preparo único (antes de usar)

Esses passos só precisam ser feitos **uma vez**, pela conta institucional da
coordenação.

### 1. Compartilhar a pasta e as planilhas

A pasta **"CASPCT - Registros"** e as três planilhas dentro dela (**"CASPCT -
Atividades"**, **"CASPCT - Conteudos"**, **"CASPCT - Guias"**) já foram
criadas e os IDs já estão preenchidos em [`js/config.js`](js/config.js). Falta
só configurar o compartilhamento — isso não dá para automatizar, precisa ser
feito manualmente pela tela do Google Drive:

1. Abra a pasta **"CASPCT - Registros"** no https://drive.google.com.
2. Clique com o botão direito na pasta > **Compartilhar > Acesso geral** >
   mude de "Restrito" para **"Qualquer pessoa com o link"**, com papel
   **"Leitor"**. Isso permite que o público abra os documentos enviados.
3. Ainda em "Compartilhar", **adicione o e-mail de cada pessoa da equipe** que
   vai inserir registros, com papel **"Editor"**.
4. Repita os passos 2 e 3 para **cada uma das três planilhas** dentro da
   pasta (Atividades, Conteudos, Guias): "Qualquer pessoa com o link" /
   "Leitor" para o público, e "Editor" para cada pessoa da equipe.

> Se no futuro for preciso recriar a pasta ou as planilhas (ou criar em outra
> conta), os IDs ficam na URL: o ID da pasta é o trecho depois de `/folders/`,
> e o ID de uma planilha é o trecho depois de `/d/` na URL do Google Sheets.

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

### 3. Conferir `js/config.js`

`SHARED_FOLDER_ID` e `SPREADSHEET_IDS` já estão preenchidos em
[`js/config.js`](js/config.js). Só falta o `CLIENT_ID` do passo 2 (se ainda
não tiver sido preenchido). Depois de qualquer alteração, faça commit e push.

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
  pasta e nas planilhas do Drive.

## Estrutura de arquivos

```
index.html        Estrutura da página e das abas
style.css         Estilo visual
js/config.js      Client ID, IDs da pasta/planilhas compartilhadas e opções dos formulários
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
