# Erika Espíndola — Site Institucional

Site profissional para Erika Espíndola, terapeuta pós-graduada em Psicologia Analítica Junguiana, com atendimento presencial em Goiânia e online.

## Estrutura de arquivos

```text
/
├── index.html
├── privacy.html
├── terms.html
├── styles.css
├── script.js
├── manifest.json
├── sw.js
├── README.md
└── assets/
    ├── img/
    │   ├── erika-hero.jpg
    │   ├── erika-experiencia.jpg
    │   ├── espaco-consultorio.jpg
    │   ├── espaco-jardim.jpg
    │   ├── espaco-sala.jpg
    │   ├── decorativo-diario.png
    │   └── decorativo-agua.png
    └── icons/
        ├── favicon.png
        ├── icon-192.png
        └── icon-512.png
```

## Como trocar o WhatsApp

O número está centralizado em `script.js`:

```js
const WHATSAPP_NUMBER = "5562999999999";
```

Troque apenas esse valor pelo número real com código do país e DDD, sem `+`, espaços ou pontuação.

## Como confirmar o CRP

O rodapé usa o placeholder `CRP a confirmar — Goiânia, GO`. Quando o número estiver confirmado, atualize esse texto no `index.html`. Não afirme título profissional regulamentado nem exiba CRP sem confirmação.

## Como trocar imagens e ícones

Substitua os arquivos mantendo os mesmos nomes e pastas:

- Imagens do site: `assets/img/`
- Ícones e favicon: `assets/icons/`

Se alterar nomes de arquivos, atualize também `index.html`, `manifest.json` e `sw.js`.

## PWA e cache

O cache do service worker está versionado como:

```js
const CACHE_NAME = 'erika-site-v1';
```

Ao mudar arquivos importantes de layout, JavaScript, manifest ou assets cacheados, incremente a versão, por exemplo `erika-site-v2`. O service worker usa caminhos relativos para funcionar no GitHub Pages e ignora assets ausentes durante a instalação para evitar quebra do PWA.

## Deploy no GitHub Pages

Publique a pasta raiz do projeto. Os caminhos estão preparados para GitHub Pages com arquivos estáticos, sem backend.

## Tecnologias

- HTML5 semântico
- CSS3 com Custom Properties
- JavaScript vanilla
- Google Fonts: Cormorant Garamond + Jost
- PWA com `manifest.json` e `sw.js`

## Notas éticas e privacidade

- Sem promessas de cura ou resultados
- Sem depoimentos fictícios
- Sem linguagem sensacionalista
- Formulário envia pelo WhatsApp e não salva dados pessoais no navegador
- Aviso de emergência mantido no rodapé
- `privacy.html` e `terms.html` descrevem o funcionamento sem backend
