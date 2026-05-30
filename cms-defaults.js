/* ============================================================
   cms-defaults.js
   Conteúdo padrão do site — usado como fallback quando o
   Firebase não está configurado ou falha ao carregar.
   ============================================================ */

const CMS_DEFAULTS = {
  config: {
    whatsapp: "5562999999999",
    whatsappMessages: {
      header: "Olá! Gostaria de entender melhor os serviços do Espaço Erika Espíndola e verificar qual acompanhamento faz mais sentido para minha necessidade.",
      hero: "Olá! Gostaria de entender melhor os serviços do Espaço Erika Espíndola e verificar qual acompanhamento faz mais sentido para minha necessidade.",
      horarios: "Olá! Gostaria de entender melhor os serviços do Espaço Erika Espíndola e verificar qual acompanhamento faz mais sentido para minha necessidade.",
      footer: "Olá! Gostaria de entender melhor os serviços do Espaço Erika Espíndola e verificar qual acompanhamento faz mais sentido para minha necessidade.",
      contato: "Olá! Gostaria de entender melhor os serviços do Espaço Erika Espíndola e verificar qual acompanhamento faz mais sentido para minha necessidade.",
      float: "Olá! Gostaria de entender melhor os serviços do Espaço Erika Espíndola e verificar qual acompanhamento faz mais sentido para minha necessidade."
    },
    siteTitle: "Espaço Erika Espíndola | Acolhimento emocional e desenvolvimento humano",
    siteDesc: "Atendimentos, avaliações, acompanhamento infantil e oficinas terapêuticas para crianças, adolescentes, mulheres e famílias em um ambiente acolhedor, seguro e humanizado.",
    siteKeywords: "Erika Espíndola, acolhimento emocional, avaliação psicológica, avaliação neuropsicológica, acompanhamento infantil, ABA, AT, oficinas terapêuticas, orientação familiar",
    ogTitle: "Espaço Erika Espíndola | Acolhimento emocional e desenvolvimento humano",
    ogDesc: "Um espaço seguro para crianças, adolescentes, mulheres e famílias. Escuta, acolhimento e cuidado integrado em cada etapa.",
    ogImage: "assets/img/erika-hero.jpg",
    favicon: "assets/icons/favicon.png",
    endereco: "Espaço Erika Espíndola. Endereço informado pelo WhatsApp conforme agendamento.",
    footerCrp: "Espaço Erika Espíndola",
    footerTag: "acolhimento emocional • desenvolvimento humano • cuidado integrado",
    footerReach: "Atendimento para crianças, adolescentes, mulheres e famílias",
    copyright: "© 2026 Espaço Erika Espíndola. Todos os direitos reservados.",
    legal: { termsUpdated: "Última atualização: maio de 2026", privacyUpdated: "Última atualização: maio de 2026", termsHtml: "", privacyHtml: "" }
  },
  theme: {
    cream: "#f7f3ee", creamDark: "#f0ebe3", sand: "#e8ddd0", sandMid: "#d6c9b8", mocha: "#9c7b5a", mochaDark: "#7a5c3e", mochaLight: "#b8956f", brownSoft: "#c4a882", nude: "#e6d5c3", warmGray: "#9e9188", textDark: "#2d2520", textMid: "#5a4e45", textLight: "#8a7d73", sectionV: "120px", radiusSm: "12px", radiusMd: "24px", radiusXl: "60px"
  },
  content: {
    layoutVersion: "espaco-erika-v2-2026-05-30",
    hero: {
      tag: "Acolhimento emocional • desenvolvimento humano • cuidado integrado",
      title: "Um espaço de acolhimento e desenvolvimento emocional para crianças, adolescentes, mulheres e famílias.",
      sub: "Atendimentos, avaliações, acompanhamento infantil e oficinas terapêuticas em um ambiente humanizado, seguro e pensado para cuidar de cada história com sensibilidade, respeito e direção.",
      btnPrimary: "Falar pelo WhatsApp",
      btnGhost: "Conhecer os serviços"
    },
    sobre: {
      label: "Nosso espaço",
      title: "Um espaço criado para acolher, orientar e desenvolver.",
      p1: "O Espaço Erika Espíndola nasce do desejo de construir um ambiente acolhedor, sensível e humanizado, onde crianças, adolescentes, mulheres e famílias possam encontrar escuta, orientação e desenvolvimento emocional.",
      p2: "Mais do que atendimentos, acreditamos na construção de vínculos, no cuidado respeitoso e em experiências que favoreçam pertencimento, expressão emocional e crescimento humano.",
      p3: "Cada pessoa é recebida com atenção à sua história, necessidades e tempo, integrando diferentes formas de cuidado em um espaço seguro, leve e acolhedor.",
      cards: []
    },
    atendimentos: {
      label: "Para quem é o espaço",
      title: "Para quem busca cuidado, direção e acolhimento.",
      cards: [
        { title: "Crianças", text: "Acompanhamento do desenvolvimento, expressão emocional, suporte às demandas comportamentais e atividades que favorecem vínculo, autonomia e comunicação." },
        { title: "Adolescentes", text: "Escuta, orientação e apoio em fases de mudança, inseguranças, relações, emoções intensas e construção de identidade." },
        { title: "Mulheres", text: "Acolhimento para mulheres sobrecarregadas, mães, profissionais e pessoas que sentem que têm cuidado de tudo, menos de si." },
        { title: "Famílias", text: "Orientação, devolutivas, escuta familiar e construção de caminhos possíveis para apoiar o desenvolvimento emocional e relacional." }
      ]
    },
    junguiana: {
      label: "Nossos serviços",
      title: "Cuidado integrado para diferentes momentos e necessidades.",
      p1: "Avaliações, atendimentos, acompanhamento infantil, oficinas terapêuticas e orientação familiar reunidos em uma proposta de cuidado sensível, ética e direcionada.",
      p2: "Cada serviço pode ser indicado conforme a necessidade da pessoa ou da família, respeitando o momento, o contexto e os objetivos do acompanhamento.",
      p3: "O primeiro contato ajuda a compreender qual caminho faz mais sentido para cada história.",
      pillars: ["Avaliação", "Atendimento", "Acompanhamento", "Oficinas", "Família"],
      services: [
        { title: "Avaliação Psicológica e Neuropsicológica", text: "Avaliações conduzidas por profissional habilitada, auxiliando na compreensão do funcionamento emocional, cognitivo e comportamental de crianças, adolescentes e adultos.", cta: "Indicado para: dificuldades de aprendizagem; alterações no desenvolvimento; questões emocionais e comportamentais; orientação escolar e familiar; necessidade de laudos e relatórios técnicos." },
        { title: "Atendimento Psicológico", text: "Atendimento realizado com escuta ética, acolhedora e individualizada, voltado à compreensão das emoções, relações, conflitos internos e processos de desenvolvimento pessoal.", cta: "Indicado para: ansiedade; insegurança; conflitos emocionais; relacionamentos; fases de transição; sofrimento emocional." },
        { title: "Acompanhamento Infantil • ABA • AT", text: "Acompanhamento voltado ao desenvolvimento infantil, com apoio individualizado, atividades direcionadas, estímulo à autonomia, comunicação, interação social e organização comportamental.", cta: "Indicado para: atrasos no desenvolvimento; suporte comportamental; habilidades sociais; rotina e autonomia; acompanhamento terapêutico." },
        { title: "Oficinas Terapêuticas e Emocionais", text: "Experiências em grupo que utilizam recursos expressivos, criativos e relacionais para trabalhar emoções, vínculos, autoestima, pertencimento e desenvolvimento humano.", cta: "Possíveis oficinas: Oficina das Emoções; Oficina de Pintura e Expressão; Grupo para Mulheres; Grupo de Adolescentes; Oficina Mães e Filhos; Vivências de Autoconhecimento." },
        { title: "Orientação Familiar", text: "Encontros voltados à escuta da família, compreensão das demandas e construção de estratégias de cuidado, vínculo, rotina e acompanhamento do desenvolvimento.", cta: "Indicado para: famílias em processo de avaliação; pais que se sentem perdidos; mães sobrecarregadas; alinhamento entre escola, família e acompanhamento." }
      ]
    },
    processo: {
      label: "Como funciona",
      title: "Como começa o cuidado",
      steps: [
        { num: "1", title: "Primeiro contato", text: "A pessoa ou família entra em contato pelo WhatsApp para compartilhar brevemente sua demanda." },
        { num: "2", title: "Acolhimento inicial", text: "Realizamos uma escuta inicial para compreender a necessidade e indicar o melhor caminho dentro do espaço." },
        { num: "3", title: "Direcionamento", text: "A demanda pode ser encaminhada para avaliação, atendimento psicológico, acompanhamento infantil, oficinas ou orientação familiar." },
        { num: "4", title: "Plano de cuidado", text: "A equipe organiza a melhor forma de acompanhamento, respeitando o momento, contexto e necessidade de cada pessoa." },
        { num: "5", title: "Acompanhamento", text: "O processo acontece de forma humanizada, com cuidado, devolutivas e acompanhamento contínuo quando necessário." }
      ]
    },
    horarios: {
      label: "Projetos e oficinas",
      title: "Projetos criados para fortalecer vínculos, expressão e pertencimento.",
      schedule: [],
      cards: [
        { title: "Oficina das Emoções", text: "Atividades lúdicas e expressivas para ajudar crianças a compreenderem, nomearem e expressarem emoções de forma saudável.", cta: "" },
        { title: "Roda de Acolhimento para Mulheres", text: "Um espaço de escuta, partilha e acolhimento para mulheres emocionalmente sobrecarregadas, mães e profissionais que sentem dificuldade em cuidar de si.", cta: "" },
        { title: "Grupo de Adolescentes", text: "Espaço voltado ao diálogo, expressão emocional, pertencimento, autoestima e construção de identidade.", cta: "" },
        { title: "Oficina Mães e Filhos", text: "Vivências criadas para fortalecer vínculo, comunicação afetiva e presença emocional entre mães e crianças.", cta: "" }
      ],
      pagamento: [],
      btnText: "Falar pelo WhatsApp"
    },
    experiencia: {
      label: "Diferenciais",
      title: "Mais do que atendimentos, acreditamos em cuidado com presença.",
      p1: "ambiente acolhedor e humanizado; cuidado integrado; escuta individualizada; atenção à singularidade de cada pessoa; experiências emocionais e oficinas; suporte às famílias; acolhimento respeitoso e sensível.",
      p2: "",
      p3: "",
      btnText: "Falar pelo WhatsApp"
    },
    faq: { label: "", title: "", items: [] },
    contato: {
      label: "",
      title: "Você não precisa atravessar tudo sozinho.",
      sub: "Se você sente que precisa de acolhimento, orientação ou um espaço seguro para cuidar de si ou de alguém da sua família, entre em contato. Vamos entender sua necessidade e indicar o melhor caminho.",
      formTitle: "Falar pelo WhatsApp",
      formSub: "O envio abrirá o WhatsApp com sua mensagem preenchida."
    },
    menu: {
      links: [
        { label: "Início", href: "#inicio", visible: true },
        { label: "Nosso espaço", href: "#sobre", visible: true },
        { label: "Para quem", href: "#atendimentos", visible: true },
        { label: "Serviços", href: "#junguiana", visible: true },
        { label: "Como funciona", href: "#processo", visible: true },
        { label: "Projetos", href: "#horarios", visible: true },
        { label: "Contato", href: "#contato", visible: true }
      ],
      ctaText: "Falar pelo WhatsApp"
    },
    sections: [
      { id: "inicio", visible: true }, { id: "sobre", visible: true }, { id: "atendimentos", visible: true }, { id: "junguiana", visible: true }, { id: "processo", visible: true }, { id: "horarios", visible: true }, { id: "experiencia", visible: true }, { id: "contato", visible: true }
    ],
    blocks: []
  },
  assets: {
    "erika-hero": { src: "assets/img/erika-hero.jpg", alt: "Erika Espíndola no Espaço Erika Espíndola", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "erika-experiencia": { src: "assets/img/erika-experiencia.jpg", alt: "Erika Espíndola em ambiente profissional", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "espaco-consultorio": { src: "assets/img/espaco-consultorio.jpg", alt: "Espaço de atendimento acolhedor", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "espaco-jardim": { src: "assets/img/espaco-jardim.jpg", alt: "Área externa do espaço", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "espaco-sala": { src: "assets/img/espaco-sala.jpg", alt: "Sala do espaço terapêutico", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "decorativo-agua": { src: "assets/img/decorativo-agua.png", alt: "Imagem decorativa", width: "", height: "", fit: "cover", position: "center", radius: "" }
  }
};

if (typeof module !== 'undefined') module.exports = CMS_DEFAULTS;
