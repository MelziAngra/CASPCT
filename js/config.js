// Configurações do sistema CASPCT.
// Preencha CLIENT_ID depois de criar as credenciais OAuth no Google Cloud Console
// (veja o passo a passo no README.md).
const CASPCT_CONFIG = {
  CLIENT_ID: "SEU_CLIENT_ID_AQUI.apps.googleusercontent.com",

  // Apenas o escopo drive.file: o app só enxerga/edita arquivos que ele mesmo cria.
  SCOPES: "https://www.googleapis.com/auth/drive.file",

  // Nomes usados no Google Drive de quem estiver logado.
  ROOT_FOLDER_NAME: "CASPCT - Registros",
  SUBFOLDERS: {
    atividades: "Documentos de Atividades no Território",
    conteudos: "Minivídeos e Minicursos",
    guias: "Guias e Materiais Temáticos",
  },
  SPREADSHEET_NAME: "CASPCT - Sistema de Registro",
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
