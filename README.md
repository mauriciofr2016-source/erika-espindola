# Erika Espíndola — Site Institucional

Site institucional com painel administrativo para edição de conteúdo.

---

## Estrutura de Arquivos

```
├── index.html              # Site público principal
├── styles.css              # Estilos do site público
├── script.js               # Scripts do site público
├── cms-defaults.js         # Conteúdo padrão (fallback)
├── cms-loader.js           # Aplica conteúdo CMS ao site público
├── legal-loader.js         # Aplica textos legais editados em terms/privacy
├── admin.html              # Painel administrativo
├── admin.css               # Estilos do painel admin
├── admin.js                # Scripts do painel admin
├── firebase-config.js      # Configuração local do Firebase (fallback seguro vazio)
├── firebase-config.example.js  # Modelo de configuração do Firebase
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (v3)
├── privacy.html            # Política de Privacidade
├── terms.html              # Termos de Uso
└── assets/
    ├── img/                # Imagens do site
    └── icons/              # Ícones PWA
```

Os caminhos usados no projeto seguem formato web com barra `/`, por exemplo `assets/img/erika-hero.jpg` e `assets/icons/icon-192.png`. Isso mantém compatibilidade com GitHub Pages/Linux. Não use caminhos com `\` no HTML, CSS, JS, manifest ou service worker.

---

## Acesso ao Painel Admin

1. Acesse `/admin.html`
2. Entre com o e-mail cadastrado no Firebase Authentication.
3. Usuário autorizado atual: `erika@gmail.com`

> O painel usa Firebase Authentication real. Não há senha hardcoded no código.
> Para trocar o usuário autorizado, altere `AUTHORIZED_EMAIL` em `admin.js` e ajuste as regras do Firestore/Storage com o mesmo e-mail.

---

## Configuração do Firebase (recomendado para produção)

Para que as edições do admin apareçam para todos os visitantes (não apenas no mesmo navegador), configure o Firebase:

### 1. Crie um projeto no Firebase Console

Acesse: https://console.firebase.google.com

### 2. Ative Firestore e Storage

- **Firestore Database**: crie no modo de produção
- **Storage**: ative para upload de imagens

### 3. Configure as credenciais

Copie `firebase-config.example.js` para `firebase-config.js` e preencha:

```js
window.FIREBASE_CONFIG = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### 4. Scripts Firebase já carregados

`admin.html`, `index.html`, `terms.html` e `privacy.html` já carregam os SDKs compatíveis do Firebase e o arquivo `firebase-config.js`.

Se `firebase-config.js` ficar vazio (`window.FIREBASE_CONFIG = window.FIREBASE_CONFIG || null;`), o projeto não quebra: o site usa o HTML original e o admin salva apenas no LocalStorage do navegador. Para salvar online e mostrar as edições para todos os usuários, é obrigatório preencher `firebase-config.js`, ativar Firestore/Storage e configurar regras.

### 5. Coleções no Firestore

O painel usa as seguintes coleções:

| Coleção | Documento | Conteúdo |
|---------|-----------|----------|
| `site_config` | `main` | WhatsApp, SEO, endereço, rodapé |
| `site_content` | `main` | Textos, cards, FAQ, menu |
| `site_theme` | `main` | Cores, espaçamentos, bordas |
| `site_assets` | `main` | URLs e alts das imagens |
| `site_meta` | `main` | Versão/última atualização do CMS |

O site público tenta carregar nesta ordem:

1. Firestore
2. LocalStorage
3. HTML original como fallback seguro

Em celular Android/iOS, quando o admin salva uma alteração no Firestore, o site público recebe um aviso discreto de “Nova atualização disponível”. Ao tocar em “Atualizar”, a página recarrega e busca o conteúdo mais recente.

### 6. Regras de segurança sugeridas (Firestore)

#### Regra temporária apenas para teste

Use por poucos minutos em ambiente de teste para confirmar se o admin grava no Firestore. Não use em produção.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

#### Regra bloqueada segura

Esta regra é segura para leitura pública, mas bloqueia qualquer escrita do admin. Com `allow write: if false`, o painel continuará funcionando só no fallback local.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;    // site público lê livremente
      allow write: if false;  // escrita controlada
    }
  }
}
```

#### Regra recomendada com Firebase Auth

Crie Firebase Authentication e libere escrita apenas para o UID administrador.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && request.auth.uid == "COLOQUE_AQUI_O_UID_ADMIN";
    }

    match /{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

### Regras de segurança sugeridas (Storage)

#### Storage temporário apenas para teste

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

#### Storage seguro com Auth

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null
        && request.auth.uid == "COLOQUE_AQUI_O_UID_ADMIN";
    }

    match /images/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

Para produção com upload pelo painel, use a regra com Firebase Auth. Regras temporárias abertas servem apenas para teste rápido.

---

## Segurança do CMS

- O login hardcoded (`erika` / `223687`) é apenas proteção visual e não deve ser considerado segurança real.
- O caminho recomendado é migrar o login para Firebase Auth e restringir escrita no Firestore/Storage por UID administrador.
- Campos com HTML nos textos legais e nos blocos dinâmicos são sanitizados para remover scripts, eventos inline e URLs perigosas.
- Mesmo com sanitização no frontend, só conceda acesso ao admin para pessoas confiáveis.

---

## Como fazer deploy

### GitHub Pages

1. Faça push para o repositório GitHub
2. Vá em Settings → Pages → selecione a branch `main`
3. O site ficará disponível em `https://seuusuario.github.io/nomerepo/`

### Netlify / Vercel

Conecte o repositório e faça deploy direto. Não requer configuração adicional para o site estático.

---

## Funcionamento sem Firebase

Se o Firebase não estiver configurado:
- O site público usa o conteúdo do `index.html` original como fallback
- As edições do admin são salvas no **LocalStorage** do navegador
- As edições só aparecem no mesmo navegador/dispositivo
- WhatsApp, formulário e PWA continuam funcionando normalmente

---

## Como atualizar o cache PWA

Sempre que fizer mudanças grandes no site, incremente a versão no `sw.js`:

```js
const CACHE_NAME = 'erika-site-v3'; // ← incrementar
```

---

## Aviso Legal

A Erika Espíndola é apresentada no site como terapeuta com abordagem junguiana.
O site usa linguagem adequada para essa atuação:

✅ Terapeuta  
✅ Atendimento terapêutico  
✅ Escuta terapêutica  
✅ Abordagem junguiana  
✅ Autoconhecimento  
✅ Desenvolvimento pessoal  

❌ Títulos profissionais regulamentados sem habilitação formal  
❌ Termos clínicos regulamentados usados como oferta profissional  
❌ Afirmações que sugiram exercício profissional regulamentado por conselho de classe  
❌ Promessas de cura ou resultado garantido  
