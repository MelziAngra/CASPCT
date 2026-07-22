// Configurações do sistema CASPCT.
//
// Duas coisas precisam ser preenchidas depois de um preparo único feito pela
// conta institucional da coordenação (veja o passo a passo no README.md):
//   1. CLIENT_ID: credencial OAuth do Google Cloud Console.
//   2. SHARED_FOLDER_ID / SHARED_SPREADSHEET_ID: a pasta e a planilha
//      "oficiais" da CASPCT no Google Drive, compartilhadas publicamente
//      para leitura e com a equipe autorizada para edição.
const CASPCT_CONFIG = {
  CLIENT_ID: "35105006923-45lc7pphk0ugvr4i4jalif4lqcv581d4.apps.googleusercontent.com",

  // Escopo mais amplo: necessário porque várias pessoas da equipe (cada uma
  // com sua própria conta Google) precisam escrever numa pasta/planilha que
  // pertence à conta institucional, e não a elas. Só quem estiver na lista
  // de "usuários de teste" do projeto no Google Cloud Console consegue
  // completar o login — para qualquer outra pessoa o próprio Google barra o
  // acesso. A visualização do site (abas de conteúdo) NÃO exige login.
  SCOPES: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ].join(" "),

  // IDs da pasta e da planilha "oficiais" da CASPCT (preencher depois do
  // preparo único — veja README.md, seção "Preparo único").
  SHARED_FOLDER_ID: "COLOQUE_AQUI_O_ID_DA_PASTA_COMPARTILHADA",
  SHARED_SPREADSHEET_ID: "COLOQUE_AQUI_O_ID_DA_PLANILHA_COMPARTILHADA",

  SUBFOLDERS: {
    atividades: "Documentos de Atividades no Território",
    conteudos: "Minivídeos e Minicursos",
    guias: "Guias e Materiais Temáticos",
  },
  SHEETS: {
    atividades: "Atividades",
    conteudos: "Conteudos",
    guias: "Guias",
  },

  // Segmentos de povos e comunidades tradicionais atendidos pela CASPCT,
  // conforme o Decreto Federal nº 6.040/2007 (Política Nacional de
  // Desenvolvimento Sustentável dos Povos e Comunidades Tradicionais).
  TERRITORIOS: [
    "Povos Indígenas",
    "Comunidades Quilombolas",
    "Povos Ciganos",
    "Povos de Terreiro / Matriz Africana",
    "Comunidades Ribeirinhas",
    "Pescadores e Pescadoras Artesanais",
    "Povos de Fundo de Pasto",
    "Extrativistas",
    "Outra comunidade tradicional",
  ],

  TIPOS_ATIVIDADE: [
    "Visita técnica ao território",
    "Articulação intersetorial",
    "Monitoramento de indicadores de saúde",
    "Apoio à equipe de saúde da família/indígena",
    "Entrega ou recebimento de documentos",
    "Reunião com lideranças/comunidade",
    "Capacitação ou educação em saúde",
    "Outra atividade",
  ],

  CATEGORIAS_CONTEUDO: ["Minivídeo", "Minicurso"],

  TEMATICAS_SAUDE: [
    "Saúde Indígena",
    "Saúde da População Negra e Quilombola",
    "Saúde Mental",
    "Imunização",
    "Plantas Medicinais e Práticas Integrativas",
    "Saúde da Mulher",
    "IST/HIV/Hepatites Virais",
    "Vigilância Epidemiológica",
    "Direitos e Legislação",
    "Outra temática",
  ],
};
