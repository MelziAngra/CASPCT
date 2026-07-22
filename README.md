# CASPCT - Sistema de Registro de Território

Site estático (sem servidor próprio) para a **Coordenação de Atenção à Saúde de
Povos e Comunidades Tradicionais (CASPCT)** registrar:

- **Registro Diário**: atividades realizadas no território (data, comunidade
  tradicional, tipo de atividade, descrição e documentos).
- **Minivídeos e Minicursos**: conteúdos em vídeo/curso, por link ou upload.
- **Guias e Temáticas de Saúde**: guias e materiais organizados por temática.
- **Sobre a CASPCT**: informações institucionais e base legal (Decreto nº
  6.040/2007 — Política Nacional de Desenvolvimento Sustentável dos Povos e
  Comunidades Tradicionais).

Cada pessoa entra com a própria conta Google. Os documentos enviados e as
planilhas de registro são salvos **no Google Drive de quem estiver logado**
(pasta "CASPCT - Registros", criada automaticamente no primeiro uso). Não há
banco de dados nem backend: tudo roda no navegador.

> Se a ideia é centralizar tudo numa única conta/pasta da coordenação (em vez
> de cada pessoa ter sua própria cópia), basta a pessoa responsável logar com
> a conta da coordenação sempre que for consolidar os registros, ou combinar
> de todos usarem a mesma conta institucional para logar no sistema.

## 1. Criar as credenciais do Google (OAuth Client ID)

Isso só precisa ser feito **uma vez**, por quem administra o projeto.

1. Acesse https://console.cloud.google.com/ e crie um novo projeto (ex:
   "CASPCT Registro").
2. No menu lateral, vá em **APIs e serviços > Biblioteca** e ative:
   - **Google Drive API**
   - **Google Sheets API**
3. Vá em **APIs e serviços > Tela de consentimento OAuth**:
   - Tipo de usuário: **Externo** (ou **Interno**, se todos usarem contas
     `@upe.br`/institucionais do mesmo Google Workspace).
   - Preencha nome do app ("CASPCT - Registro de Território"), e-mail de
     suporte e e-mail de contato.
   - Em **Escopos**, não é necessário adicionar nada manualmente (o app pede
     o escopo em tempo de execução).
   - Em **Usuários de teste** (se o app ficar em modo "Testing"), adicione os
     e-mails de todas as pessoas que vão usar o sistema (limite de 100). Isso
     evita ter que passar pelo processo de verificação do Google, já que é um
     uso interno.
4. Vá em **APIs e serviços > Credenciais > Criar credenciais > ID do cliente
   OAuth**:
   - Tipo de aplicativo: **Aplicativo da Web**.
   - Em **Origens JavaScript autorizadas**, adicione a URL onde o site vai
     ficar publicado, por exemplo:
     `https://melziangra.github.io`
     (ajuste para o domínio real do GitHub Pages — veja o passo 3).
   - Não é necessário preencher "URIs de redirecionamento".
   - Clique em criar e copie o **Client ID** gerado (algo como
     `123456789-abc.apps.googleusercontent.com`).

## 2. Configurar o Client ID no projeto

Abra o arquivo [`js/config.js`](js/config.js) e substitua:

```js
CLIENT_ID: "SEU_CLIENT_ID_AQUI.apps.googleusercontent.com",
```

pelo Client ID copiado no passo anterior. Depois, faça commit e push dessa
alteração.

## 3. Publicar no GitHub Pages

1. No GitHub, abra o repositório e vá em **Settings > Pages**.
2. Em **Source**, selecione a branch onde este código está (ex: `main`) e a
   pasta `/ (root)`.
3. Salve. Em alguns minutos o site estará disponível em uma URL do tipo:
   `https://<usuario-ou-organizacao>.github.io/<nome-do-repositorio>/`
4. Volte ao passo 1 e confirme que essa URL está cadastrada em **Origens
   JavaScript autorizadas** no Google Cloud Console (sem isso o login falha).

## 4. Uso do dia a dia

- Cada pessoa acessa o link do GitHub Pages e faz login com a conta Google.
- Na primeira vez, o Google vai pedir permissão para o app acessar o Drive —
  isso é esperado, e o acesso é restrito apenas a arquivos que o próprio app
  cria (escopo `drive.file`), nunca aos outros arquivos da conta.
- Os registros ficam disponíveis na própria página (tabelas e cards) e também
  podem ser conferidos diretamente na planilha "CASPCT - Sistema de Registro"
  e na pasta "CASPCT - Registros", dentro do Google Drive de quem logou.

## Estrutura de arquivos

```
index.html        Estrutura da página e das abas
style.css         Estilo visual
js/config.js      Client ID, nomes de pastas/planilha e opções dos formulários
js/auth.js        Login Google + autorização de acesso ao Drive
js/drive.js       Chamadas às APIs do Google Drive e Google Sheets
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
