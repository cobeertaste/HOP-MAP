# HOP-MAP 🍻

> **PT:** Guia interativo e rota de cervejas artesanais em Portugal (Continente, Madeira e Açores).  
> **EN:** Interactive guide and craft beer route in Portugal (Mainland, Madeira & Azores).

---

## 🔒 Segurança e Boas Práticas / Security & Best Practices

1. **Nunca partilhes nem envies ficheiros `.env` para o GitHub / Never commit `.env` files to GitHub:**
   - O ficheiro `.gitignore` já está devidamente configurado para ignorar `.env*`, `node_modules/`, `dist/` e ficheiros temporários.
   - Utiliza o `.env.example` como modelo de referência para configurar as variáveis de ambiente no teu ambiente local e no Netlify.

2. **Segredos no Netlify / Secrets on Netlify:**
   - Todas as variáveis com o prefixo `VITE_` são injetadas durante o build estático pelo Vite e ficam disponíveis na aplicação web (ex: `VITE_FIREBASE_API_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`).
   - Nunca coloques chaves secretas privadas (ex: `STRIPE_SECRET_KEY`) em variáveis públicas `VITE_`.

---

## 🚀 Como Executar Localmente / Local Development

```bash
# 1. Instalar dependências / Install dependencies
npm install

# 2. Criar ficheiro .env baseado no .env.example / Create .env from template
cp .env.example .env

# 3. Iniciar o servidor de desenvolvimento / Start dev server
npm run dev
```

---

## 🌐 Como Publicar no Netlify / How to Deploy to Netlify

### Passo 1: Enviar código para o GitHub / Push to GitHub
1. Cria um repositório no GitHub (ex: `hop-map`).
2. No teu terminal:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit with netlify and security setup"
   git branch -M main
   git remote add origin https://github.com/<teu-utilizador>/hop-map.git
   git push -u origin main
   ```

### Passo 2: Ligar ao Netlify / Connect to Netlify
1. Acede a [Netlify](https://app.netlify.com) e clica em **Add new site** > **Import an existing project** > **GitHub**.
2. Seleciona o repositório `hop-map`.
3. As configurações de Build serão detetadas automaticamente a partir do `netlify.toml`:
   - **Build command:** `npm run build:client`
   - **Publish directory:** `dist`
4. Em **Site configuration** > **Environment variables**, adiciona as tuas variáveis (ex: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_STRIPE_PUBLISHABLE_KEY`, etc.).
5. Clica em **Deploy Site**.

---

## 📋 Scripts Disponíveis / Available Scripts

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build:client`: Compila a aplicação estática (Vite) para a pasta `dist/` (ideal para Netlify, Vercel e GitHub Pages).
- `npm run build`: Compila a aplicação completa (SPA + servidor SSR/Node).
- `npm run preview`: Pré-visualiza a pasta `dist/` localmente.
- `npm run lint`: Valida tipos TypeScript (`tsc --noEmit`).
