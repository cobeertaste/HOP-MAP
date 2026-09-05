/**
 * Hop-Map Full-Stack Backend Server
 * Express + Vite + Stripe & Payment API Integrations + SSG / Dynamic SEO Metadata Engine
 */

import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import { BARS_DATA } from './src/data';
import { parseRoute, getCitySlug, getSpotSlug } from './src/lib/router';
import { getSpotMeta, getCityMeta, getHomeMeta, injectMetaTags, PageMeta } from './src/lib/seo';

const uniqueZones = Array.from(new Set(BARS_DATA.map((b) => b.zone))).filter(Boolean) as string[];

function getMetaForRequest(req: Request): PageMeta {
  const url = req.originalUrl || req.url || req.path;
  const parsed = parseRoute(url, BARS_DATA, uniqueZones);
  
  // Also check query param or header
  let lang: 'PT' | 'EN' = parsed.lang || 'PT';
  const queryLang = (req.query.lang as string)?.toUpperCase();
  if (queryLang === 'EN' || queryLang === 'PT') {
    lang = queryLang;
  }

  if (parsed.bar) {
    return getSpotMeta(parsed.bar, lang);
  }
  if (parsed.zone) {
    return getCityMeta(parsed.zone, lang);
  }
  return getHomeMeta(lang);
}

// Lazy initialize Stripe instance with secret key validation (strictly server-side)
let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  const envKey = process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.trim() : '';
  let secretKey = '';

  // Ensure only valid secret/merchant keys (sk_..., rk_..., mk_...) are used on the backend and reject accidental client publishable keys (pk_...)
  if (envKey && !envKey.startsWith('pk_')) {
    secretKey = envKey;
  }

  if (!secretKey) {
    console.warn('[Stripe] No STRIPE_SECRET_KEY environment variable configured.');
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia' as any,
    });
  }
  return stripeClient;
}

// In-memory donation buffer for fast sync
interface ServerDonation {
  id: string;
  donorName: string;
  donorEmail?: string;
  userId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  timestamp: string;
  month: string;
  status: string;
}
const serverDonationsCache: ServerDonation[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Healthcheck endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'Hop-Map Backend', timestamp: new Date().toISOString() });
  });

  /**
   * Endpoint: Create Stripe Checkout Session (Card & PayPal)
   */
  app.post('/api/create-stripe-session', async (req: Request, res: Response) => {
    try {
      const { amount, donorName, donorEmail, origin } = req.body;
      const parsedAmount = Math.max(1, Math.round(Number(amount) * 100)); // in cents

      const stripe = getStripe();
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured on server' });
      }

      const appOrigin = origin || req.headers.origin || 'https://www.cobeertaste.com';
      const cleanDonor = donorName ? String(donorName).trim() : 'Apoiante Hop-Map';

      let session;
      const sessionParams = {
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'Oferece uma rodada à equipa 🍻 (Hop-Map)',
                description: `Apoio para manter os servidores e a plataforma Hop-Map 100% gratuita • Doador: ${cleanDonor}`,
                images: ['https://raw.githubusercontent.com/cobeertaste/hopmap/main/public/icon-512.png'],
              },
              unit_amount: parsedAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment' as const,
        customer_email: donorEmail ? String(donorEmail) : undefined,
        metadata: {
          donorName: cleanDonor,
          amountEur: String(Number(amount).toFixed(2)),
          app: 'Hop-Map PWA',
          targetEmail: 'cobeertaste@gmail.com',
        },
        success_url: `${appOrigin}?donation_success=true&donor=${encodeURIComponent(cleanDonor)}&amount=${(parsedAmount / 100).toFixed(2)}`,
        cancel_url: `${appOrigin}?donation_cancel=true`,
      };

      try {
        // Try creating session with automatic payment methods (supports Card, PayPal, Apple Pay, Google Pay if enabled in Stripe Dashboard)
        session = await stripe.checkout.sessions.create(sessionParams);
      } catch (stripeErr: any) {
        console.warn('[Stripe] Dynamic checkout fallback to explicit card method:', stripeErr?.message);
        // Fallback to standard card payment method
        session = await stripe.checkout.sessions.create({
          ...sessionParams,
          payment_method_types: ['card'],
        });
      }

      return res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      console.error('[API create-stripe-session error]:', error);
      return res.status(500).json({
        error: error.message || 'Erro ao criar sessão de pagamento Stripe',
      });
    }
  });

  /**
   * Endpoint: Process MB WAY Payment Request & Reference
   */
  app.post('/api/process-mbway', async (req: Request, res: Response) => {
    try {
      const { phoneNumber, amount, donorName } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Número de telemóvel é obrigatório' });
      }

      const cleanPhone = String(phoneNumber).replace(/\s+/g, '');
      const validPtPhone = /^(\+351)?9\d{8}$/.test(cleanPhone);

      if (!validPtPhone) {
        return res.status(400).json({ error: 'Por favor introduz um número de telemóvel português válido (ex: 912345678)' });
      }

      const referenceId = `MBW-${Date.now().toString().slice(-6)}`;
      const targetPhone = '+351 916259719';

      return res.json({
        status: 'pending_authorization',
        message: 'Aprova o pagamento na tua app MB WAY!',
        referenceId,
        donorPhone: cleanPhone,
        targetPhone,
        amount: Number(amount) || 2,
        instructions: `Envia ${Number(amount).toFixed(2)} € para o MB WAY ${targetPhone} com a referência ${referenceId} ou aprova o pedido no teu telemóvel.`,
      });
    } catch (error: any) {
      console.error('[API process-mbway error]:', error);
      return res.status(500).json({ error: 'Erro ao processar pedido MB WAY' });
    }
  });

  /**
   * Endpoint: Record Donation Event
   */
  app.post('/api/record-donation', (req: Request, res: Response) => {
    try {
      const donation = req.body;
      if (donation && donation.amount) {
        serverDonationsCache.unshift(donation);
        if (serverDonationsCache.length > 1000) serverDonationsCache.length = 1000;
      }
      return res.json({ success: true, count: serverDonationsCache.length });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  /**
   * Endpoint: List Donations (Server Backup)
   */
  app.get('/api/donations', (req: Request, res: Response) => {
    const month = req.query.month as string;
    if (month) {
      return res.json(serverDonationsCache.filter((d) => d.month === month));
    }
    return res.json(serverDonationsCache);
  });

  // Vite middleware in development vs static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    // Dynamic HTML serving with accurate SEO tags in dev mode (supports PT and EN)
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl || req.url;
      try {
        const templatePath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(templatePath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const meta = getMetaForRequest(req);
        const html = injectMetaTags(template, meta);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response) => {
      const url = req.path;
      const parsed = parseRoute(url, BARS_DATA, uniqueZones);
      const isEn = parsed.lang === 'EN' || req.query.lang === 'en' || req.query.lang === 'EN';

      // 1. If spot route, check pre-rendered localized file
      if (parsed.bar) {
        const city = getCitySlug(parsed.bar.zone) || 'portugal';
        const spotSlug = getSpotSlug(parsed.bar);
        
        if (isEn) {
          const enSpotPath = path.join(distPath, 'en', city, spotSlug, 'index.html');
          if (fs.existsSync(enSpotPath)) return res.sendFile(enSpotPath);
        } else {
          const ptSpotPath = path.join(distPath, city, spotSlug, 'index.html');
          if (fs.existsSync(ptSpotPath)) return res.sendFile(ptSpotPath);
        }
      } else if (parsed.zone) {
        const city = getCitySlug(parsed.zone);
        if (isEn) {
          const enCityPath = path.join(distPath, 'en', city, 'index.html');
          if (fs.existsSync(enCityPath)) return res.sendFile(enCityPath);
        } else {
          const ptCityPath = path.join(distPath, city, 'index.html');
          if (fs.existsSync(ptCityPath)) return res.sendFile(ptCityPath);
        }
      } else if (isEn) {
        const enHomePath = path.join(distPath, 'en', 'index.html');
        if (fs.existsSync(enHomePath)) return res.sendFile(enHomePath);
      }

      // 2. Fallback: dynamically inject meta tags into dist/index.html
      const templatePath = path.join(distPath, 'index.html');
      if (fs.existsSync(templatePath)) {
        const template = fs.readFileSync(templatePath, 'utf-8');
        const meta = getMetaForRequest(req);
        const html = injectMetaTags(template, meta);
        return res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      }

      return res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hop-Map Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
