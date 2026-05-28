# Erika Espíndola — Site Institucional

Site institucional com painel administrativo (CMS) e login seguro via Firebase Authentication.

---

## Estrutura de Arquivos

```
├── index.html              # Site público principal
├── styles.css              # Estilos do site público
├── script.js               # Scripts do site público
├── cms-defaults.js         # Conteúdo padrão (fallback)
├── cms-loader.js           # Aplica conteúdo CMS ao site público
├── legal-loader.js         # Aplica textos legais editados pelo admin
├── admin.html              # Painel administrativo
├── admin.css               # Estilos do painel admin
├── admin.js                # Scripts do painel admin (Firebase Auth)
├── firebase-config.js      # Configuração real do Firebase (não commitar com dados)
├── firebase-config.example.js  # Modelo de configuração
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker (v5)
├── privacy.html            # Política de Privacidade
├── terms.html              # Termos de Uso
└── assets/
    ├── img/                # Imagens do site
    └── icons/              # Ícones PWA
```

---

## Acesso ao Painel Admin

1. Acesse `/admin.html`
2. Informe o **e-mail**: `erika@gmail.com`
3. Informe a **senha** cadastrada no Firebase Console

> O admin usa **Firebase Authentication** real.
> Não há mais usuário/senha hardcoded no código.
> A sessão persiste entre abas e recarregamentos enquanto não fizer logout.

---

## Configuração do Firebase

### 1. Criar projeto no Firebase Console

Acesse: https://console.firebase.google.com

### 2. Ativar os serviços necessários

- **Authentication** → Ativar o provedor **E-mail/senha**
- **Firestore Database** → Criar banco em modo produção
- **Storage** → Ativar para upload de imagens

### 3. Criar o usuário administrador

No Firebase Console:
→ Authentication → Users → Add user
- **E-mail**: `erika@gmail.com`
- **Senha**: defina uma senha segura

> Se precisar mudar o e-mail autorizado, edite apenas esta linha em `admin.js`:
> ```js
> const AUTHORIZED_EMAIL = 'erika@gmail.com';
> ```

### 4. Configurar as credenciais do app

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

> **Segurança**: `firebase-config.js` pode estar no repositório pois as credenciais
> do Firebase Web SDK são públicas por design. A segurança real vem das Regras do
> Firestore/Storage e do Firebase Auth.

### 5. Regras de segurança — Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leitura pública para o site funcionar
    match /{document=**} {
      allow read: if true;
    }
    // Escrita apenas para o admin autenticado
    match /{document=**} {
      allow write: if request.auth != null
                   && request.auth.token.email == "erika@gmail.com";
    }
  }
}
```

### 6. Regras de segurança — Storage

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read:  if true;
      allow write: if request.auth != null
                   && request.auth.token.email == "erika@gmail.com";
    }
  }
}
```

### 7. Coleções usadas no Firestore

| Coleção | Documento | Conteúdo |
|---------|-----------|----------|
| `site_config` | `main` | WhatsApp, SEO, endereço, rodapé |
| `site_content` | `main` | Textos, cards, FAQ, menu |
| `site_theme` | `main` | Cores, espaçamentos, bordas |
| `site_assets` | `main` | URLs e alts das imagens |
| `site_meta` | `main` | Metadados de atualização |

---

## Como fazer deploy

### GitHub Pages

1. Faça push para o repositório GitHub
2. Settings → Pages → selecione a branch `main`
3. Disponível em `https://seuusuario.github.io/nomerepo/`

### Netlify / Vercel

Conecte o repositório e faça deploy direto.

---

## Funcionamento sem Firebase

Se o Firebase não estiver configurado:
- O site público usa o conteúdo do `index.html` original como fallback
- O painel admin exibe: "Firebase Auth não configurado. Configure o Firebase para usar o painel online."
- WhatsApp, formulário e PWA continuam funcionando normalmente

---

## Como atualizar o cache PWA

Incremente a versão em `sw.js` após mudanças grandes:

```js
const CACHE_NAME = 'erika-site-v6'; // ← incrementar
```

---

## Aviso Legal

Linguagem usada no site:

✅ Terapeuta
✅ Atendimento terapêutico
✅ Escuta terapêutica
✅ Abordagem junguiana
✅ Autoconhecimento
✅ Desenvolvimento pessoal

❌ Psicóloga (exige CRP regulamentado)
❌ Psicoterapia (no sentido clínico regulamentado pelo CFP)
❌ Promessas de cura ou resultado garantido
