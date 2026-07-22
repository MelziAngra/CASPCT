// Configurações do sistema CASPCT.
//
// CLIENT_ID: credencial OAuth do Google Cloud Console.
// SHARED_FOLDER_ID / SPREADSHEET_IDS: a pasta e as 3 planilhas "oficiais" da
// CASPCT no Google Drive (uma planilha por tipo de conteúdo, cada uma com
// uma única aba), compartilhadas publicamente para leitura e com a equipe
// autorizada para edição. Veja o passo a passo de compartilhamento no
// README.md, seção "Preparo único".
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

  SHARED_FOLDER_ID: "1dlSIqMuObmY4x-SbHpTA6rX0E0D4C50M",
  SPREADSHEET_IDS: {
    atividades: "1WmzN_8nFfOe6iihJaj5YgaMtgCY-93Xgy_MLfCQcOdc",
    conteudos: "1ecdxgUMk2oNgHbdZF6UYaILxW1OwZdz77BzgHTmOWeA",
    guias: "1tSxq2wSa3U9Fma3JSuGlswW-2C5o7-fpfB5TgCO54Xc",
  },

  SUBFOLDERS: {
    atividades: "Documentos de Atividades no Território",
    conteudos: "Minivídeos e Minicursos",
    guias: "Guias e Materiais Temáticos",
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
