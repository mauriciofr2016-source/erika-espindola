// ============================================================
// firebase-config.example.js
// INSTRUÇÕES DE CONFIGURAÇÃO DO FIREBASE
// 
// 1. Copie este arquivo para firebase-config.js
// 2. Substitua os valores abaixo pelas suas credenciais do Firebase
// 3. NUNCA faça commit do firebase-config.js com dados reais — 
//    adicione ao .gitignore se preferir segurança extra
// ============================================================

window.FIREBASE_CONFIG = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Coleções usadas no Firestore:
// - site_config/main      → configurações gerais (WhatsApp, SEO, endereço)
// - site_content/main     → conteúdo das seções (textos, cards, FAQ)
// - site_theme/main       → cores e estilos visuais
// - site_assets/main      → URLs das imagens salvas no Storage
// - site_meta/main        → versão/última atualização para aviso mobile
//
// Firebase Storage:
// - /images/              → imagens enviadas pelo painel admin
//
// Regras de segurança sugeridas no Firestore:
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /{document=**} {
//       allow read: if true;          // site público pode ler
//       allow write: if false;        // bloqueia gravação online do admin
//     }
//   }
// }
//
// Para produção real, implemente Firebase Auth e ajuste as regras
// para permitir escrita apenas ao UID administrador.
