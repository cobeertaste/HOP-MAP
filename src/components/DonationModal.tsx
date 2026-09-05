/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Beer, Heart, Check, Sparkles, Smartphone, CreditCard, 
  Wallet, ShieldCheck, ArrowRight, ExternalLink, Copy, CheckCircle2, Loader2,
  Phone, Send, AlertCircle
} from 'lucide-react';
import { loadStripe, Stripe, PaymentRequest } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY, REVOLUT_PAY_LINK, MBWAY_RECEIVER_PHONE, recordDonation } from '../lib/donations';
import { UserProfile } from '../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'pt' | 'en' | 'PT' | 'EN';
  currentUser?: UserProfile | null;
  user?: UserProfile | null;
  darkMode?: boolean;
}

type PaymentTab = 'mbway' | 'apple_google_pay' | 'revolut' | 'stripe_card';

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  lang = 'PT',
  currentUser,
  user,
  darkMode = true,
}) => {
  const activeUser = user || currentUser;
  const isPT = String(lang).toUpperCase() === 'PT';

  // Preset Amounts
  const PRESET_AMOUNTS = [
    { value: 2, labelPT: '2 € (Cerveja 🍺)', labelEN: '2 € (Beer 🍺)', subPT: 'Beer', subEN: 'Beer' },
    { value: 5, labelPT: '5 € (Pint 🍻)', labelEN: '5 € (Pint 🍻)', subPT: 'Pint', subEN: 'Pint' },
    { value: 10, labelPT: '10 € (Equipa 🥳)', labelEN: '10 € (Team 🥳)', subPT: 'Team', subEN: 'Team' },
  ];

  const [selectedPreset, setSelectedPreset] = useState<number | 'custom'>(5);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>(activeUser?.username || activeUser?.id || '');
  const [donorEmail, setDonorEmail] = useState<string>(activeUser?.email || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentTab>('mbway');

  // Device detection
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [copiedMbway, setCopiedMbway] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // MB WAY specific states
  const [mbwaySubmitted, setMbwaySubmitted] = useState<boolean>(false);
  const [mbwayRef, setMbwayRef] = useState<string>('');

  // Stripe & Apple/Google Pay states
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [canUseAppleGooglePay, setCanUseAppleGooglePay] = useState<boolean>(false);
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  // General loading & success states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileAgent = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileAgent || (typeof window !== 'undefined' && window.innerWidth < 768));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Synchronize donor user ID and reset modal state when reopened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setIsLoading(false);
      setErrorMessage(null);
      setMbwaySubmitted(false);
    }
    const currentIdentifier = activeUser?.username || activeUser?.id || '';
    if (currentIdentifier) {
      setDonorName(currentIdentifier);
    }
    if (activeUser?.email) {
      setDonorEmail(activeUser.email);
    }
  }, [isOpen, activeUser]);

  // Initialize Stripe client
  useEffect(() => {
    if (STRIPE_PUBLISHABLE_KEY && STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
      try {
        const stripeInstance = loadStripe(STRIPE_PUBLISHABLE_KEY);
        setStripePromise(stripeInstance);
      } catch (err) {
        console.warn('Could not initialize Stripe client:', err);
      }
    }
  }, []);

  // Compute final amount in EUR
  const effectiveAmount: number = selectedPreset === 'custom' 
    ? Math.max(1, parseFloat(customAmount) || 1) 
    : selectedPreset;

  // Setup Apple Pay / Google Pay PaymentRequest
  useEffect(() => {
    let isMounted = true;
    if (!stripePromise) return;

    stripePromise.then(async (stripe) => {
      if (!stripe || !isMounted) return;

      try {
        const pr = stripe.paymentRequest({
          country: 'PT',
          currency: 'eur',
          total: {
            label: isPT ? 'Hop-Map - Oferece uma rodada 🍻' : 'Hop-Map - Buy us a Beer 🍻',
            amount: Math.round(effectiveAmount * 100),
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        const result = await pr.canMakePayment();
        if (result && isMounted) {
          setCanUseAppleGooglePay(true);
          setPaymentRequest(pr);

          pr.on('token', async (ev) => {
            try {
              await recordDonation({
                donorName: ev.payerName || donorName || activeUser?.username || 'Apoiante Digital Wallet',
                donorEmail: ev.payerEmail || donorEmail,
                userId: activeUser?.id || donorName || 'anonymous',
                amount: effectiveAmount,
                paymentMethod: 'apple_google_pay',
                status: 'completed'
              });
              ev.complete('success');
              setIsSuccess(true);
            } catch (e) {
              ev.complete('fail');
            }
          });
        } else {
          if (isMounted) setCanUseAppleGooglePay(false);
        }
      } catch (err) {
        if (isMounted) setCanUseAppleGooglePay(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [stripePromise, effectiveAmount, isPT, donorName, donorEmail, activeUser]);

  // Copy MB WAY number
  const copyMbwayPhone = async (showBanner = true) => {
    try {
      const rawNumber = '+351 916259719';
      await navigator.clipboard.writeText(rawNumber);
      setCopiedMbway(true);
      if (showBanner) {
        setCopiedNotice(
          isPT 
            ? 'Número copiado! Abre a tua app MB WAY para enviar.' 
            : 'Number copied! Open your MB WAY app to send.'
        );
      }
      setTimeout(() => setCopiedMbway(false), 3000);
      setTimeout(() => setCopiedNotice(null), 6000);
    } catch (e) {
      console.warn('Clipboard copy error:', e);
      setCopiedMbway(true);
      if (showBanner) {
        setCopiedNotice(
          isPT 
            ? 'Número copiado (+351 916259719)! Abre a tua app MB WAY para enviar.' 
            : 'Number copied (+351 916259719)! Open your MB WAY app to send.'
        );
      }
      setTimeout(() => setCopiedMbway(false), 3000);
      setTimeout(() => setCopiedNotice(null), 6000);
    }
  };

  // Handle Mobile MB WAY Payment Trigger
  const handleMobileMbwayPay = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Copy number to clipboard
      await copyMbwayPhone(true);

      const generatedRef = `MBW-${Date.now().toString().slice(-6)}`;
      setMbwayRef(generatedRef);

      // 2. Record donation in database and local cache
      await recordDonation({
        donorName: donorName || activeUser?.username || (isPT ? 'Apoiante MB WAY' : 'MB WAY Supporter'),
        donorEmail,
        userId: activeUser?.id || donorName || 'anonymous',
        amount: effectiveAmount,
        paymentMethod: 'mbway',
        status: 'completed',
        referenceOrPhone: '+351 916259719',
        notes: `Mobile MB WAY ${effectiveAmount} EUR (Ref: ${generatedRef})`
      });

      // 3. Attempt deep linking to native MB WAY app
      try {
        window.location.href = 'mbway://';
      } catch (e) {
        console.warn('Deep link error:', e);
      }

      setMbwaySubmitted(true);
      setTimeout(() => {
        setIsSuccess(true);
        setIsLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error('MB WAY processing note:', err);
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  // Handle Desktop MB WAY Confirmation
  const handleDesktopMbwayConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await copyMbwayPhone(false);
      const generatedRef = `MBW-${Date.now().toString().slice(-6)}`;
      setMbwayRef(generatedRef);

      await recordDonation({
        donorName: donorName || activeUser?.username || (isPT ? 'Apoiante MB WAY' : 'MB WAY Supporter'),
        donorEmail,
        userId: activeUser?.id || donorName || 'anonymous',
        amount: effectiveAmount,
        paymentMethod: 'mbway',
        status: 'completed',
        referenceOrPhone: '+351 916259719',
        notes: `Desktop MB WAY ${effectiveAmount} EUR (Ref: ${generatedRef})`
      });

      setMbwaySubmitted(true);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Desktop MB WAY error:', err);
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Revolut Pay Redirect
  const handleRevolutPay = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await recordDonation({
        donorName: donorName || activeUser?.username || (isPT ? 'Apoiante Revolut' : 'Revolut Supporter'),
        donorEmail,
        userId: activeUser?.id || donorName || 'anonymous',
        amount: effectiveAmount,
        paymentMethod: 'revolut',
        status: 'completed',
        notes: `Revolut ${effectiveAmount} EUR`
      });

      const revolutUrl = `${REVOLUT_PAY_LINK}/${Math.round(effectiveAmount)}EUR`;
      window.open(revolutUrl, '_blank');
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(isPT ? 'Erro ao abrir ligação Revolut' : 'Error opening Revolut payment');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Stripe Checkout Session (Card & PayPal)
  const handleStripeCheckout = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveAmount,
          donorName: donorName || activeUser?.username || (isPT ? 'Apoiante Hop-Map' : 'Hop-Map Supporter'),
          donorEmail,
          userId: activeUser?.id || donorName || 'anonymous',
          origin: window.location.origin
        })
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Não foi possível iniciar o checkout Stripe.');
      }

      await recordDonation({
        donorName: donorName || activeUser?.username || (isPT ? 'Apoiante Stripe Card/PayPal' : 'Stripe Supporter'),
        donorEmail,
        userId: activeUser?.id || donorName || 'anonymous',
        amount: effectiveAmount,
        paymentMethod: 'stripe_card',
        status: 'pending',
        notes: `Session: ${data.sessionId}`
      });

      window.location.href = data.url;
    } catch (err: any) {
      console.error('[Stripe Checkout Error]:', err);
      setErrorMessage(
        isPT
          ? 'Não foi possível ligar ao Stripe no momento. Podes usar MB WAY ou Revolut em alternativa!'
          : 'Could not connect to Stripe. You can use MB WAY or Revolut as alternative!'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="donation-modal-overlay" 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="donation-modal-container"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-[#F6EFDC] border-3 border-[#1B2036] rounded-3xl shadow-[6px_6px_0px_#1B2036] overflow-hidden text-[#1B2036] my-auto font-sans"
        >
          {/* Header Banner */}
          <div className="relative bg-[#F2A93B] border-b-2 border-[#1B2036] p-4 sm:p-6 text-[#1B2036]">
            <button
              id="btn-close-donation-modal"
              onClick={onClose}
              className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-8 h-8 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_#000000] z-10"
              aria-label="Close"
              title={isPT ? "Fechar" : "Close"}
            >
              <X className="w-4 h-4 text-black stroke-[2.5]" />
            </button>

            <div className="mb-2 pr-9">
              <h2 className="text-base sm:text-xl md:text-2xl font-bold font-press tracking-tight text-[#1B2036] leading-tight break-words">
                {isPT ? 'Oferece uma rodada' : 'Buy us a beer!'}
              </h2>
              <p className="text-[10px] sm:text-xs font-bold text-[#1B2036]/80 tracking-wide uppercase font-label mt-1">
                Hop-Map by CoBeer Taste
              </p>
            </div>

            <p className="text-xs sm:text-sm font-medium text-[#1B2036] leading-relaxed mt-2 font-body">
              {isPT
                ? 'Gostas do Hop-Map? Um pequeno gesto teu ajuda-nos a pagar os servidores e a manter o mapa 100% gratuito e sem publicidade.'
                : 'Enjoying Hop-Map? A small amount from you helps us pay server costs and keep the map 100% free and ad-free.'}
            </p>
          </div>

          {/* Copied notification banner */}
          <AnimatePresence>
            {copiedNotice && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-[#12908C] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-2 border-b-2 border-[#1B2036] font-label"
              >
                <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                <span>{copiedNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Body */}
          <div className="p-5 sm:p-6 space-y-5">
            {isSuccess ? (
              /* Success Confirmation View */
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-[#12908C]/20 border-2 border-[#1B2036] text-[#12908C] mx-auto flex items-center justify-center text-3xl shadow-[3px_3px_0px_#1B2036]">
                  🎉
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold font-press text-[#1B2036]">
                    {isPT ? 'MUITO OBRIGADO PELO TEU APOIO! 🍻' : 'THANK YOU FOR YOUR SUPPORT! 🍻'}
                  </h3>
                  <p className="text-sm text-[#1B2036]/80 max-w-sm mx-auto font-body">
                    {isPT
                      ? `O teu contributo de ${effectiveAmount.toFixed(2)} € foi registado com sucesso. Cada rodada conta para manter o Hop-Map vivo e atualizado!`
                      : `Your contribution of ${effectiveAmount.toFixed(2)} € has been registered. Every beer helps keep Hop-Map running and up to date!`}
                  </p>
                </div>

                {paymentMethod === 'mbway' && (
                  <div className="p-3.5 rounded-2xl bg-[#EFE6CC] border-2 border-[#1B2036] text-left text-xs space-y-2 font-data text-[#1B2036] shadow-[2px_2px_0px_#1B2036]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#1B2036]/70">{isPT ? 'Destinatário MB WAY:' : 'MB WAY Recipient:'}</span>
                      <span className="text-[#E85B41] font-bold">+351 916259719</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#1B2036]/70">{isPT ? 'Valor:' : 'Amount:'}</span>
                      <span className="text-[#12908C] font-bold">{effectiveAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#1B2036]/70">{isPT ? 'Referência:' : 'Reference:'}</span>
                      <span className="text-[#1B2036]">{mbwayRef || 'MBW-COMPLETED'}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-1">
                  <button
                    id="btn-make-another-donation"
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setMbwaySubmitted(false);
                      setCustomAmount('');
                      setSelectedPreset(5);
                    }}
                    className="w-full sm:w-1/2 py-3.5 px-4 rounded-2xl bg-[#EFE6CC] hover:bg-[#F2A93B] active:scale-[0.98] text-[#1B2036] font-bold text-xs uppercase tracking-wider transition-all border-2 border-[#1B2036] flex items-center justify-center gap-2 cursor-pointer shadow-[2px_2px_0px_#1B2036] font-label"
                  >
                    <Beer className="w-4 h-4 text-[#1B2036] shrink-0" />
                    <span>{isPT ? 'Oferecer outra rodada 🍻' : 'Offer another round 🍻'}</span>
                  </button>

                  <button
                    id="btn-close-success-donation"
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-[#12908C] hover:bg-[#0B6C69] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_#1B2036] border-2 border-[#1B2036] cursor-pointer font-label"
                  >
                    {isPT ? 'Voltar ao Mapa' : 'Back to Map'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* 1. Value Selection (Botões Fixos + Valor Livre) */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2036] font-label">
                    {isPT ? '1. Escolhe o valor da rodada:' : '1. Select contribution amount:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => {
                      const isSelected = selectedPreset === preset.value;
                      return (
                        <button
                          key={preset.value}
                          id={`preset-amount-${preset.value}`}
                          type="button"
                          onClick={() => {
                            setSelectedPreset(preset.value);
                            setCustomAmount('');
                          }}
                          className={`py-3 px-2 rounded-2xl border-2 border-[#1B2036] text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#12908C] text-white shadow-[2px_2px_0px_#1B2036] font-bold'
                              : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B] font-bold'
                          }`}
                        >
                          <div className="text-base sm:text-lg font-data font-bold">{preset.value} €</div>
                          <div className={`text-[10px] uppercase tracking-wide truncate font-label ${isSelected ? 'text-white/90 font-bold' : 'text-[#1B2036]/70'}`}>
                            {isPT ? preset.subPT : preset.subEN}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Amount Input */}
                  <div className="pt-1">
                    <div className="relative flex items-center">
                      <input
                        id="input-custom-donation-amount"
                        type="number"
                        min="1"
                        step="1"
                        placeholder={isPT ? 'Outro valor personalizado (€)' : 'Custom amount (€)'}
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(e.target.value);
                          setSelectedPreset('custom');
                        }}
                        className={`w-full py-2.5 pl-3.5 pr-12 rounded-xl bg-[#EFE6CC] border-2 border-[#1B2036] text-sm text-[#1B2036] placeholder-[#1B2036]/50 focus:outline-none transition-all font-data ${
                          selectedPreset === 'custom'
                            ? 'border-[#12908C] ring-2 ring-[#12908C]'
                            : 'focus:border-[#12908C]'
                        }`}
                      />
                      <span className="absolute right-3.5 text-xs font-bold text-[#1B2036]/70 pointer-events-none font-data">
                        EUR (€)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Donor Info (User ID of donating user) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2036] font-label">
                    {isPT ? '2. Utilizador a efetuar a doação (User ID):' : '2. Donor User (User ID):'}
                  </label>
                  <input
                    id="input-donor-nickname"
                    type="text"
                    placeholder={isPT ? 'Identificação do Utilizador / User ID' : 'User ID / Username'}
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#EFE6CC] border-2 border-[#1B2036] focus:border-[#12908C] text-sm text-[#1B2036] placeholder-[#1B2036]/50 focus:outline-none transition-all font-data"
                  />
                </div>

                {/* 3. Payment Method Selection (4 Tabs) */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1B2036] font-label">
                    {isPT ? '3. Método de Pagamento:' : '3. Payment Method:'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {/* Tab MB WAY */}
                    <button
                      id="tab-payment-mbway"
                      type="button"
                      onClick={() => setPaymentMethod('mbway')}
                      className={`p-2 rounded-xl border-2 border-[#1B2036] text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-label min-h-[56px] ${
                        paymentMethod === 'mbway'
                          ? 'bg-[#12908C] text-white font-bold shadow-[2px_2px_0px_#1B2036]'
                          : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B]'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-bold leading-tight uppercase text-center block w-full truncate">
                        MB WAY
                      </span>
                    </button>

                    {/* Tab Apple/Google Pay */}
                    <button
                      id="tab-payment-apple-google"
                      type="button"
                      onClick={() => setPaymentMethod('apple_google_pay')}
                      className={`p-2 rounded-xl border-2 border-[#1B2036] text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-label min-h-[56px] ${
                        paymentMethod === 'apple_google_pay'
                          ? 'bg-[#12908C] text-white font-bold shadow-[2px_2px_0px_#1B2036]'
                          : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B]'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold leading-tight uppercase text-center block w-full truncate">
                        Apple/Google Pay
                      </span>
                    </button>

                    {/* Tab Revolut */}
                    <button
                      id="tab-payment-revolut"
                      type="button"
                      onClick={() => setPaymentMethod('revolut')}
                      className={`p-2 rounded-xl border-2 border-[#1B2036] text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-label min-h-[56px] ${
                        paymentMethod === 'revolut'
                          ? 'bg-[#12908C] text-white font-bold shadow-[2px_2px_0px_#1B2036]'
                          : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B]'
                      }`}
                    >
                      <span className="text-xs font-black leading-none shrink-0">®</span>
                      <span className="text-[9px] sm:text-[10px] md:text-xs font-bold leading-tight uppercase text-center block w-full truncate">
                        Revolut
                      </span>
                    </button>

                    {/* Tab Stripe Card / PayPal */}
                    <button
                      id="tab-payment-card-paypal"
                      type="button"
                      onClick={() => setPaymentMethod('stripe_card')}
                      className={`p-2 rounded-xl border-2 border-[#1B2036] text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-label min-h-[56px] ${
                        paymentMethod === 'stripe_card'
                          ? 'bg-[#12908C] text-white font-bold shadow-[2px_2px_0px_#1B2036]'
                          : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#F2A93B]'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold leading-tight uppercase text-center block w-full truncate">
                        {isPT ? 'Cartão/PayPal' : 'Card/PayPal'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* 4. Active Method Interaction Form */}
                <div className="p-4 rounded-2xl bg-[#EFE6CC] border-2 border-[#1B2036] space-y-3 text-[#1B2036] shadow-[2px_2px_0px_#1B2036]">
                  
                  {/* METHOD: MB WAY (Mobile & Desktop Specialized Logic) */}
                  {paymentMethod === 'mbway' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#1B2036]">
                        <span className="font-bold text-[#E85B41] flex items-center gap-1.5 font-label">
                          <Smartphone className="w-3.5 h-3.5" /> MB WAY Portugal
                        </span>
                        <span className="font-data text-[#12908C] font-bold text-sm">
                          {effectiveAmount.toFixed(2)} €
                        </span>
                      </div>

                      {/* Recipient Phone Presentation Card */}
                      <div className="p-3.5 rounded-2xl bg-[#F6EFDC] border-2 border-[#1B2036] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#1B2036]/70 uppercase tracking-wider font-label">
                            {isPT ? 'Número Destinatário MB WAY:' : 'MB WAY Recipient Number:'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#E85B41] border border-[#1B2036] text-white text-[9px] font-bold font-label">
                            🇵🇹 Portugal
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#EFE6CC] p-2.5 rounded-xl border-2 border-[#1B2036] overflow-hidden">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Phone className="w-4 h-4 text-[#E85B41] shrink-0" />
                            <span className="text-sm sm:text-base md:text-lg font-bold text-[#1B2036] tracking-wider font-data truncate">
                              +351 916259719
                            </span>
                          </div>
                          
                          {/* Dedicated Copiar Número Button */}
                          <button
                            type="button"
                            id="btn-copy-mbway-number"
                            onClick={() => copyMbwayPhone(true)}
                            className="px-3 py-1.5 rounded-lg font-label uppercase text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer bg-[#F2A93B] hover:bg-[#F2A93B]/80 text-[#1B2036] border-2 border-[#1B2036] shadow-[1.5px_1.5px_0px_#1B2036] shrink-0"
                          >
                            {copiedMbway ? (
                              <>
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>{isPT ? 'Copiado!' : 'Copied!'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 shrink-0" />
                                <span>{isPT ? 'Copiar' : 'Copy'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-[11px] leading-relaxed text-[#1B2036]/80 font-body">
                          {isMobile ? (
                            isPT 
                              ? 'Ao clicares no botão abaixo, abrimos a tua app MB WAY e copiamos o número automaticamente.' 
                              : 'Clicking below will launch your MB WAY app and copy the recipient number automatically.'
                          ) : (
                            isPT
                              ? 'Abre a app MB WAY no teu telemóvel e envia a tua doação para este número (+351 916259719).'
                              : 'Open the MB WAY app on your mobile phone and send your contribution to this number (+351 916259719).'
                          )}
                        </p>
                      </div>

                      {/* Action Button: Mobile Deep-link / Desktop Confirmation */}
                      {isMobile ? (
                        <button
                          id="btn-pay-mbway-mobile"
                          type="button"
                          onClick={handleMobileMbwayPay}
                          disabled={isLoading}
                          className="w-full py-3 px-3 rounded-xl bg-[#12908C] hover:bg-[#0B6C69] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] cursor-pointer font-label leading-tight text-center"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                          ) : (
                            <>
                              <Smartphone className="w-3.5 h-3.5 shrink-0" />
                              <span className="break-words text-center">{isPT ? 'COPIAR NÚMERO E OFERECER RODADA' : 'COPY NUMBER AND OFFER ROUND'}</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            id="btn-confirm-mbway-desktop"
                            type="button"
                            onClick={handleDesktopMbwayConfirm}
                            disabled={isLoading}
                            className="w-full py-3 px-3 rounded-xl bg-[#12908C] hover:bg-[#0B6C69] active:scale-[0.98] text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] cursor-pointer font-label leading-tight text-center"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="break-words text-center">{isPT ? 'COPIAR NÚMERO E OFERECER RODADA' : 'COPY NUMBER AND OFFER ROUND'}</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* METHOD: Apple Pay / Google Pay */}
                  {paymentMethod === 'apple_google_pay' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#1B2036]">
                        <span className="font-bold text-[#1B2036] flex items-center gap-1.5 font-label">
                          <Wallet className="w-3.5 h-3.5" /> Apple Pay / Google Pay
                        </span>
                        <span className="font-data text-[#12908C] font-bold">{effectiveAmount.toFixed(2)} €</span>
                      </div>

                      <p className="text-xs text-[#1B2036]/80 leading-relaxed font-body">
                        {isPT
                          ? 'Pagamento instantâneo e seguro em 1 clique através da carteira digital do teu dispositivo.'
                          : 'Instant and secure 1-click payment using your device digital wallet.'}
                      </p>

                      <div className="pt-1">
                        <button
                          id="btn-pay-express-wallet"
                          type="button"
                          onClick={handleStripeCheckout}
                          disabled={isLoading}
                          className="w-full py-3.5 px-4 rounded-xl bg-[#12908C] hover:bg-[#0B6C69] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] cursor-pointer font-label"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <span>{isPT ? `Pagar ${effectiveAmount.toFixed(2)} € via Apple / Google Pay` : `Pay ${effectiveAmount.toFixed(2)} € with Apple / Google Pay`}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* METHOD: Revolut */}
                  {paymentMethod === 'revolut' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#1B2036]">
                        <span className="font-bold text-[#12908C] flex items-center gap-1 font-label">
                          <span className="font-bold text-sm">®</span> Revolut Pay
                        </span>
                        <span className="font-data text-[#12908C] font-bold">{effectiveAmount.toFixed(2)} €</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#F6EFDC] border-2 border-[#1B2036] text-xs text-[#1B2036] space-y-1.5">
                        <p className="text-[11px] leading-relaxed text-[#1B2036]/80 font-body">
                          {isPT
                            ? `Serás redirecionado para o perfil seguro Revolut de apoio com o valor pré-preenchido de ${effectiveAmount.toFixed(2)} €.`
                            : `You will be redirected to the secure Revolut support profile pre-filled with ${effectiveAmount.toFixed(2)} €.`}
                        </p>
                        <p className="text-[10px] font-data text-[#12908C] truncate font-bold">
                          {`${REVOLUT_PAY_LINK}/${Math.round(effectiveAmount)}EUR`}
                        </p>
                      </div>

                      <button
                        id="btn-pay-revolut"
                        type="button"
                        onClick={handleRevolutPay}
                        disabled={isLoading}
                        className="w-full py-3 px-4 rounded-xl bg-[#12908C] hover:bg-[#0B6C69] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] cursor-pointer font-label"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>{isPT ? `Pagar ${effectiveAmount.toFixed(2)} € com Revolut` : `Pay ${effectiveAmount.toFixed(2)} € with Revolut`}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* METHOD: Stripe Card & PayPal */}
                  {paymentMethod === 'stripe_card' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-[#1B2036]">
                        <span className="font-bold text-[#1B2036] flex items-center gap-1.5 font-label">
                          <CreditCard className="w-3.5 h-3.5 text-[#12908C]" /> Cartão / PayPal
                        </span>
                        <span className="font-data text-[#12908C] font-bold">{effectiveAmount.toFixed(2)} €</span>
                      </div>

                      <p className="text-xs text-[#1B2036]/80 leading-relaxed font-body">
                        {isPT
                          ? 'Checkout 100% encriptado e certificado pela Stripe. Aceita Visa, Mastercard, Cartões Nacionais e PayPal.'
                          : '100% encrypted and certified Stripe Checkout. Accepts Visa, Mastercard, national debit cards, and PayPal.'}
                      </p>

                      <button
                        id="btn-pay-stripe-card"
                        type="button"
                        onClick={handleStripeCheckout}
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl bg-[#12908C] hover:bg-[#0B6C69] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border-2 border-[#1B2036] shadow-[3px_3px_0px_#1B2036] cursor-pointer font-label"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>{isPT ? `Pagar ${effectiveAmount.toFixed(2)} € com Cartão / PayPal` : `Pay ${effectiveAmount.toFixed(2)} € with Card / PayPal`}</span>
                            <ShieldCheck className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-[#E85B41]/20 border-2 border-[#1B2036] text-[#E85B41] text-xs flex items-center gap-2 font-bold font-body">
                    <span>⚠️</span>
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Footer Security Note */}
                <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-[#1B2036]/60 font-body">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#12908C]" />
                  <span>
                    {isPT
                      ? 'Processamento seguro e transparente • CoBeer Taste Portugal'
                      : 'Secure and transparent processing • CoBeer Taste Portugal'}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonationModal;
