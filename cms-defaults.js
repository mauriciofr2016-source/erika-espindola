/* ============================================================
   cms-defaults.js
   Conteúdo padrão do site — usado como fallback quando o
   Firebase não está configurado ou falha ao carregar.
   O painel admin grava no Firestore e sobrescreve estes valores.
   ============================================================ */

const CMS_DEFAULTS = {

  config: {
    whatsapp: "5562999999999",
    whatsappMessages: {
      header:    "Olá, gostaria de agendar uma conversa.",
      hero:      "Olá, gostaria de agendar uma conversa.",
      horarios:  "Olá, gostaria de saber os valores e disponibilidade de agenda.",
      footer:    "Olá, gostaria de falar com a Erika.",
      contato:   "Olá, gostaria de falar com a Erika.",
      float:     "Olá, gostaria de agendar uma conversa."
    },
    siteTitle:   "Erika Espíndola | Abordagem Junguiana | Goiânia e Online",
    siteDesc:    "Erika Espíndola, terapeuta com abordagem junguiana. Atendimento presencial em Goiânia e online para todo o Brasil. Um espaço de acolhimento, escuta e autoconhecimento.",
    siteKeywords:"abordagem junguiana, Goiânia, ansiedade, autoconhecimento, atendimento terapêutico online, Erika Espíndola",
    ogTitle:     "Erika Espíndola | Abordagem Junguiana | Goiânia e Online",
    ogDesc:      "Um espaço de acolhimento, escuta terapêutica e autoconhecimento. Atendimento presencial em Goiânia e online para todo o Brasil.",
    ogImage:     "assets/img/erika-hero.jpg",
    favicon:     "assets/icons/favicon.png",
    endereco:    "Goiânia — GO. Endereço completo informado após o agendamento.",
    footerCrp:   "Terapeuta — Goiânia, GO",
    footerTag:   "Terapeuta com abordagem junguiana",
    footerReach: "Atendimento online para todo o Brasil",
    copyright:   "© 2025 Erika Espíndola. Todos os direitos reservados.",
    legal: {
      termsUpdated: "Última atualização: agosto de 2025",
      privacyUpdated: "Última atualização: agosto de 2025",
      termsHtml: "",
      privacyHtml: ""
    }
  },

  theme: {
    cream:       "#f7f3ee",
    creamDark:   "#f0ebe3",
    sand:        "#e8ddd0",
    sandMid:     "#d6c9b8",
    mocha:       "#9c7b5a",
    mochaDark:   "#7a5c3e",
    mochaLight:  "#b8956f",
    brownSoft:   "#c4a882",
    nude:        "#e6d5c3",
    warmGray:    "#9e9188",
    textDark:    "#2d2520",
    textMid:     "#5a4e45",
    textLight:   "#8a7d73",
    sectionV:    "120px",
    radiusSm:    "12px",
    radiusMd:    "24px",
    radiusXl:    "60px"
  },

  content: {
    hero: {
      tag:      "Abordagem junguiana",
      title:    "Um espaço de<br /><em>acolhimento, escuta</em><br />e autoconhecimento.",
      sub:      "Atendimento presencial em Goiânia<br />e online para todo o Brasil.",
      btnPrimary: "Agendar pelo WhatsApp",
      btnGhost:   "Conhecer meu trabalho"
    },
    sobre: {
      label:    "Sobre meu trabalho",
      title:    "Cada pessoa carrega histórias,<br /><em>dores e potenciais únicos.</em>",
      p1:       "O primeiro passo do nosso encontro é a <strong>entrevista inicial</strong> — um momento de escuta e acolhimento para compreender suas necessidades, expectativas e trajetória de vida. Essa sessão tem duração aproximada de 50 minutos e é fundamental para que possamos construir juntos o caminho terapêutico.",
      p2:       "A partir daí, iniciamos os <strong>atendimentos terapêuticos</strong>, que podem abordar questões emocionais e relacionais, processos de autoconhecimento e transformação pessoal.",
      p3:       "Minha prática é guiada pela <strong>abordagem junguiana</strong>, que valoriza símbolos, sonhos e experiências como ferramentas de autodescoberta e desenvolvimento.",
      cards: [
        { title: "Questões emocionais",    text: "Ansiedade, angústia, insegurança e medos que impactam o dia a dia." },
        { title: "Relacionamentos e vínculos", text: "Padrões relacionais, vínculos afetivos e dinâmicas interpessoais." },
        { title: "Autoconhecimento",       text: "Desenvolvimento pessoal e compreensão mais profunda de si mesmo." },
        { title: "Transformação e crises", text: "Atravessar momentos difíceis e encontrar novos caminhos de vida." }
      ]
    },
    atendimentos: {
      label: "Áreas de atendimento",
      title: "O que podemos<br /><em>trabalhar juntos</em>",
      cards: [
        { title: "Ansiedade",              text: "Identificar padrões, acolher a angústia e desenvolver recursos internos." },
        { title: "Angústia e medos",       text: "Compreender a origem e encontrar formas de atravessar o que pesa." },
        { title: "Insegurança",            text: "Fortalecer a autoconfiança e a conexão com os próprios valores." },
        { title: "Relacionamentos",        text: "Explorar dinâmicas afetivas, vínculos e padrões que se repetem." },
        { title: "Autoconhecimento",       text: "Aprofundar a compreensão de si mesmo, seus desejos e potenciais." },
        { title: "Desenvolvimento pessoal",text: "Ressignificar experiências e construir uma vida com mais sentido." },
        { title: "Enfrentamento de crises",text: "Apoio para atravessar momentos de ruptura, luto e transições." },
        { title: "Transformação pessoal",  text: "Processos de mudança profunda e reconexão com sua essência." }
      ]
    },
    junguiana: {
      label:  "Abordagem",
      title:  "Abordagem<br /><em>Junguiana</em>",
      p1:     "Desenvolvida por Carl Gustav Jung, essa abordagem compreende o ser humano em sua totalidade — consciente e inconsciente, razão e emoção, luz e sombra.",
      p2:     "No atendimento terapêutico, <strong>símbolos, sonhos e vivências</strong> tornam-se pontes para o autoconhecimento. Não se trata de encontrar respostas prontas, mas de aprofundar a escuta de si mesmo.",
      p3:     "Cada pessoa é única em sua história, e o processo se constrói de forma singular, respeitando seu tempo, suas dores e seus potenciais.",
      pillars: ["Símbolos", "Sonhos", "Inconsciente", "Autoconhecimento"]
    },
    espaco: {
      label:  "Conheça meu espaço",
      title:  "Um ambiente pensado<br /><em>para você se sentir em casa</em>",
      sub:    "O espaço foi planejado para oferecer calma, acolhimento e sigilo — um lugar onde você pode falar sobre o que carrega com segurança e leveza.",
      values: [
        { title: "Calma",       text: "Ambiente pensado para desacelerar e se conectar consigo mesmo." },
        { title: "Acolhimento", text: "Um espaço que recebe sua história sem julgamentos." },
        { title: "Sigilo",      text: "Total confidencialidade, respeitando princípios éticos e limites legais aplicáveis." },
        { title: "Segurança",   text: "Um ambiente seguro para falar sobre o que carrega." }
      ]
    },
    processo: {
      label: "Como funciona",
      title: "O caminho do<br /><em>nosso encontro</em>",
      steps: [
        { num: "01", title: "Primeiro contato",        text: "Você entra em contato pelo WhatsApp para tirar dúvidas iniciais e verificar disponibilidade de agenda." },
        { num: "02", title: "Entrevista inicial",      text: "Nossa primeira sessão — um momento de escuta acolhedora para compreender sua história, necessidades e expectativas." },
        { num: "03", title: "Compreensão da demanda",  text: "Juntos, identificamos o que está pesando e como o atendimento terapêutico pode apoiar sua trajetória." },
        { num: "04", title: "Atendimento terapêutico", text: "Encontros semanais de 50 minutos, construídos de forma singular para cada pessoa, respeitando seu ritmo." },
        { num: "05", title: "Acompanhamento contínuo", text: "O processo evolui junto com você — com espaço para revisitar e aprofundar o que surge ao longo do caminho." }
      ]
    },
    horarios: {
      label:   "Horários e valores",
      title:   "Disponibilidade<br /><em>e formas de atendimento</em>",
      schedule: [
        { label: "Dias",       value: "Segunda a sábado" },
        { label: "Horários",   value: "08h às 19h" },
        { label: "Duração",    value: "50 minutos por sessão" },
        { label: "Frequência", value: "1 vez por semana" }
      ],
      cards: [
        { title: "Sessão avulsa",  text: "Valor individual por atendimento, ideal para quem está começando ou tem demanda pontual.", cta: "Consulte disponibilidade e valores pelo WhatsApp." },
        { title: "Pacote mensal",  text: "Valor reduzido por mês para quem opta pelo processo contínuo e frequência semanal.", cta: "Consulte disponibilidade e valores pelo WhatsApp." }
      ],
      pagamento: ["PIX", "Transferência", "Cartão"],
      btnText: "Consultar pelo WhatsApp"
    },
    experiencia: {
      label: "Minha experiência",
      title: "Uma prática<br /><em>fundamentada e humana</em>",
      p1:    "Sou terapeuta com <strong>abordagem junguiana</strong> e atuação em atendimento terapêutico individual.",
      p2:    "Minha prática busca compreender símbolos, sonhos e vivências como caminhos de <strong>autoconhecimento e transformação pessoal</strong>.",
      p3:    "Trago em cada atendimento o compromisso de oferecer um <strong>espaço seguro, ético e acolhedor</strong>, no qual cada pessoa possa se sentir respeitada em sua singularidade e apoiada em seu processo de desenvolvimento pessoal.",
      btnText: "Quero começar"
    },
    faq: {
      label: "Perguntas frequentes",
      title: "Ainda tem<br /><em>dúvidas?</em>",
      items: [
        { q: "Como funciona a primeira sessão?",        a: "A primeira sessão é a entrevista inicial — um momento de escuta, sem julgamentos. Você compartilha o que quiser sobre sua trajetória, necessidades e expectativas. Essa conversa tem duração de aproximadamente 50 minutos e é fundamental para construirmos juntos o caminho terapêutico mais adequado para você." },
        { q: "O atendimento online funciona bem?",      a: "Sim. O atendimento online pode ser uma alternativa adequada para muitas pessoas e é realizado por videochamada em plataformas seguras. Você pode fazer sua sessão de onde estiver — de casa, do trabalho ou de qualquer lugar no Brasil. O sigilo e a qualidade do vínculo terapêutico são preservados." },
        { q: "Quanto tempo dura cada encontro?",        a: "Os encontros têm duração aproximada de 50 minutos. Esse tempo favorece uma escuta cuidadosa e consistente a cada atendimento." },
        { q: "Qual a frequência ideal de atendimento?", a: "A frequência costuma ser semanal. Esse ritmo favorece continuidade, vínculo e aprofundamento do processo de autoconhecimento." },
        { q: "O atendimento é sigiloso?",               a: "Sim. O sigilo é um princípio fundamental do atendimento terapêutico. Tudo o que você compartilhar é tratado com confidencialidade, dentro dos limites legais e éticos aplicáveis. Você pode falar com liberdade e segurança." },
        { q: "Como funciona o agendamento?",            a: "O agendamento é feito pelo WhatsApp. Você entra em contato, verificamos a disponibilidade de agenda e combinamos dia, horário e modalidade (presencial ou online). Simples e sem burocracia." },
        { q: "Quais formas de pagamento são aceitas?",  a: "São aceitos PIX, transferência bancária e cartão de crédito ou débito. Para saber os valores e condições detalhadas, entre em contato pelo WhatsApp." }
      ]
    },
    contato: {
      label:   "Contato",
      title:   "Vamos<br /><em>conversar?</em>",
      sub:     "Dar o primeiro passo é o mais importante. Entre em contato e vamos encontrar o melhor caminho para você.",
      formTitle: "Enviar uma mensagem",
      formSub:   "O envio abrirá o WhatsApp com sua mensagem preenchida."
    },
    menu: {
      links: [
        { label: "Início",       href: "#inicio",      visible: true },
        { label: "Sobre",        href: "#sobre",       visible: true },
        { label: "Atendimentos", href: "#atendimentos",visible: true },
        { label: "Espaço",       href: "#espaco",      visible: true },
        { label: "Horários",     href: "#horarios",    visible: true },
        { label: "FAQ",          href: "#faq",         visible: true },
        { label: "Contato",      href: "#contato",     visible: true }
      ],
      ctaText: "Agendar conversa"
    },
    sections: [
      { id: "inicio", visible: true },
      { id: "sobre", visible: true },
      { id: "atendimentos", visible: true },
      { id: "junguiana", visible: true },
      { id: "espaco", visible: true },
      { id: "processo", visible: true },
      { id: "horarios", visible: true },
      { id: "experiencia", visible: true },
      { id: "faq", visible: true },
      { id: "contato", visible: true }
    ],
    blocks: []
  },

  assets: {
    "erika-hero": { src: "assets/img/erika-hero.jpg", alt: "Erika Espíndola, terapeuta junguiana, sorrindo", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "erika-experiencia": { src: "assets/img/erika-experiencia.jpg", alt: "Erika Espíndola em atendimento terapêutico", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "espaco-consultorio": { src: "assets/img/espaco-consultorio.jpg", alt: "Espaço de atendimento terapêutico", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "espaco-jardim": { src: "assets/img/espaco-jardim.jpg", alt: "Área acolhedora do espaço", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "espaco-sala": { src: "assets/img/espaco-sala.jpg", alt: "Sala de escuta terapêutica", width: "", height: "", fit: "cover", position: "center", radius: "" },
    "decorativo-agua": { src: "assets/img/decorativo-agua.png", alt: "Imagem decorativa com água", width: "", height: "", fit: "cover", position: "center", radius: "" }
  }
};

// Exporta para uso no admin e no site
if (typeof module !== 'undefined') module.exports = CMS_DEFAULTS;
