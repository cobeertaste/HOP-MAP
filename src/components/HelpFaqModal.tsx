/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, HelpCircle, ChevronDown, ChevronUp, MapPin, 
  Trophy, Award, Beer, MessageSquare, Mail, ExternalLink,
  Sparkles, Compass, ShieldCheck
} from 'lucide-react';
import { PixelIcon } from './PixelIcons';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'PT' | 'EN';
}

interface FaqItem {
  id: string;
  category: 'general' | 'checkins' | 'hops' | 'community' | 'support';
  questionPT: string;
  questionEN: string;
  answerPT: string;
  answerEN: string;
  icon: React.ReactNode;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-what-is',
    category: 'general',
    questionPT: 'O que é o HOP-MAP?',
    questionEN: 'What is HOP-MAP?',
    answerPT: 'O HOP-MAP é o teu guia e passaporte interativo da cerveja artesanal em Portugal. Explora mais de 100 cervejarias, brewpubs e taprooms selecionados de norte a sul e ilhas, descobre eventos, otimiza percursos de degustação e desbloqueia conquistas cervejeiras.',
    answerEN: 'HOP-MAP is your interactive craft beer guide and passport in Portugal. Explore over 100 craft breweries, brewpubs, and curated taprooms across mainland and islands, discover events, plan hop crawls, and unlock craft achievements.',
    icon: <PixelIcon name="beer-mug" size={18} overrideColor="#1B2036" />
  },
  {
    id: 'faq-checkin-gps',
    category: 'checkins',
    questionPT: 'Como funcionam os Check-ins e a validação GPS?',
    questionEN: 'How do Check-ins and GPS validation work?',
    answerPT: 'Para garantir a autenticidade das visitas aos spots artesanais, o check-in requer que estejas a menos de 50 metros do local com o sinal GPS ativo. Cada check-in diário no mesmo spot atribui pontos HOPS e carimba o teu Cartão de Selos com uma animação exclusiva.',
    answerEN: 'To ensure genuine visits, checking in requires being within 50 meters of the venue with active GPS permission. Each daily check-in rewards HOPS points and stamps your virtual Stamp Card with a custom retro animation.',
    icon: <MapPin className="w-4 h-4 text-[#12908C]" />
  },
  {
    id: 'faq-hops-levels',
    category: 'hops',
    questionPT: 'Como acumular pontos HOPS e subir de nível?',
    questionEN: 'How to earn HOPS points and level up?',
    answerPT: 'Os pontos HOPS medem a tua jornada! Ganhas pontos ao fazer check-in num spot (+1 HOP / 1 ponto), ao submeter uma avaliação de um spot (+1 HOP / 1 ponto), ao fazer check-in num festival (+3 HOPS / 3 pontos) e ao completar uma rota cervejeira (+5 HOPS / 5 pontos). Do lado dos spots, por cada utilizador que faça check-in num spot, esse spot acumula 1 TAP (1 ponto). Mais pontos desbloqueiam novos escalões na Tabela de Classificações.',
    answerEN: 'HOPS points measure your craft exploration! Earn points with spot check-ins (+1 HOP / 1 point), submitting a spot review (+1 HOP / 1 point), festival check-ins (+3 HOPS / 3 points), and completing a hop crawl route (+5 HOPS / 5 points). For spots, every user check-in accumulates 1 TAP (1 point). More points unlock higher brewer tiers on the Leaderboard.',
    icon: <Trophy className="w-4 h-4 text-[#F2A93B]" />
  },
  {
    id: 'faq-stamp-card',
    category: 'checkins',
    questionPT: 'O que é o cartão de selos (10 check-in)?',
    questionEN: 'What is the stamp card (10 check-ins)?',
    answerPT: 'Cada spot participante tem um Cartão de Selos virtual de 10 visitas (máximo 1 selo por dia por spot). Válido apenas em spots parceiros. Ao carimbares o 10º selo, desbloqueias benefícios especiais do espaço e a animação retro de Stage Clear!',
    answerEN: 'Every participating venue features a 10-stamp loyalty card (max 1 stamp per day per spot). Valid only at partner spots. Upon collecting the 10th stamp, you unlock exclusive venue perks and the retro Stage Clear celebration!',
    icon: <Award className="w-4 h-4 text-[#E85B41]" />
  },
  {
    id: 'faq-badges',
    category: 'hops',
    questionPT: 'Como desbloquear Badges e Conquistas?',
    questionEN: 'How do I unlock Badges and Achievements?',
    answerPT: 'Existem badges distribuídos por categorias: Check-ins, Spots, Regiões (Norte, Lisboa, Centro, Açores, Madeira...), Comunidade, Estilos Cervejeiros e Dias Festivos. Consulta o ecrã de Badges no teu Perfil para ver todos os requisitos.',
    answerEN: 'There are badges across multiple categories: Check-ins, Spots, Regions (North, Lisbon, Center, Azores, Madeira...), Community, Beer Styles, and Commemorative Dates. Check the Badges modal in your Profile to view requirements.',
    icon: <Sparkles className="w-4 h-4 text-[#F2A93B]" />
  },
  {
    id: 'faq-chat',
    category: 'community',
    questionPT: 'Como funciona o HOP-Chat Comunidade?',
    questionEN: 'How does Community HOP-Chat work?',
    answerPT: 'O HOP-Chat é o espaço de convívio ao vivo entre todos os utilizadores do HOP-MAP. Podes partilhar que cervejas estão na torneira, convidar amigos para uma rodada, comentar festivais e trocar sugestões em tempo real.',
    answerEN: 'HOP-Chat is a live hangout space for all HOP-MAP members. Share what fresh brews are currently on tap, invite friends for a pint, discuss upcoming festivals, and exchange recommendations in real time.',
    icon: <MessageSquare className="w-4 h-4 text-[#12908C]" />
  },
  {
    id: 'faq-round',
    category: 'support',
    questionPT: 'O que é a opção "Oferece uma rodada"?',
    questionEN: 'What is "Buy us a round"?',
    answerPT: 'O HOP-MAP é desenvolvido de forma independente e apaixonada para apoiar o ecossistema artesanal em Portugal. Se aprecias a plataforma e queres ajudar nos custos de manutenção e novos recursos, podes oferecer uma rodada via MB WAY, Apple/Google Pay, Revolut ou Cartão.',
    answerEN: 'HOP-MAP is independently crafted with passion to promote Portugal’s craft beer scene. If you enjoy the platform and wish to support its servers and development, you can buy the team a round via MB WAY, Apple/Google Pay, Revolut, or Card.',
    icon: <Beer className="w-4 h-4 text-[#F2A93B]" />
  },
  {
    id: 'faq-contact',
    category: 'support',
    questionPT: 'Como sugerir um novo spot ou pedir ajuda?',
    questionEN: 'How to suggest a spot or request support?',
    answerPT: 'Tens uma cervejaria ou taproom para adicionar? Encontraste dados desatualizados? Entra em contacto direto com a equipa Cobeer Taste por e-mail (cobeertaste@gmail.com) ou através do Instagram oficial @cobeertaste.',
    answerEN: 'Have a brewery or taproom to recommend? Found outdated information? Reach out directly to the Cobeer Taste team via email (cobeertaste@gmail.com) or on our official Instagram @cobeertaste.',
    icon: <Mail className="w-4 h-4 text-[#1B2036]" />
  }
];

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({
  isOpen,
  onClose,
  lang = 'PT'
}) => {
  const [openItem, setOpenItem] = useState<string | null>('faq-what-is');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'general' | 'checkins' | 'hops' | 'community' | 'support'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isPT = lang === 'PT';

  const categories = [
    { id: 'all', labelPT: 'Todas', labelEN: 'All' },
    { id: 'general', labelPT: 'Geral', labelEN: 'General' },
    { id: 'checkins', labelPT: 'Check-ins & GPS', labelEN: 'Check-ins & GPS' },
    { id: 'hops', labelPT: 'HOPS & Badges', labelEN: 'HOPS & Badges' },
    { id: 'community', labelPT: 'Comunidade', labelEN: 'Community' },
    { id: 'support', labelPT: 'Apoio & Contacto', labelEN: 'Support & Contact' },
  ];

  const filteredItems = FAQ_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const qText = isPT ? item.questionPT : item.questionEN;
    const aText = isPT ? item.answerPT : item.answerEN;
    const matchesSearch = searchQuery.trim() === '' || 
      qText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      aText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItem(prev => prev === id ? null : id);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[350] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs select-none"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl max-h-[90vh] flex flex-col bg-[#F6EFDC] border-3 border-[#1B2036] rounded-2xl shadow-[6px_6px_0px_#1B2036] overflow-hidden text-[#1B2036]"
          id="modal-help-faq"
        >
          {/* Header */}
          <div className="px-4 py-3 sm:py-3.5 bg-[#EFE6CC] border-b-2 border-[#1B2036] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F2A93B] border-2 border-[#1B2036] flex items-center justify-center shadow-[1.5px_1.5px_0px_#1B2036]">
                <HelpCircle className="w-5 h-5 text-[#1B2036]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold font-press text-[#1B2036] tracking-wide">
                  {isPT ? 'AJUDA & QUESTÕES' : 'HELP & FAQ'}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-[#1B2036]/75 font-mono">
                  HOP-MAP by Cobeer Taste
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#FAF6EB] border-2 border-[#1B2036] hover:bg-[#E85B41] hover:text-white transition-colors flex items-center justify-center cursor-pointer shadow-[1.5px_1.5px_0px_#1B2036] active:scale-95"
              id="btn-close-help-faq"
              aria-label={isPT ? 'Fechar' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Categories */}
          <div className="p-3 sm:p-4 bg-[#F6EFDC] border-b-2 border-[#1B2036]/20 space-y-2.5 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isPT ? 'Pesquisar dúvidas ou palavras-chave...' : 'Search questions or keywords...'}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FAF6EB] border-2 border-[#1B2036] rounded-xl text-[#1B2036] placeholder-[#1B2036]/50 focus:outline-hidden focus:bg-white shadow-[2px_2px_0px_#1B2036]"
              id="input-faq-search"
            />

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all border-2 border-[#1B2036] cursor-pointer shrink-0 shadow-[1px_1px_0px_#1B2036] ${
                    selectedCategory === cat.id
                      ? 'bg-[#12908C] text-white'
                      : 'bg-[#EFE6CC] text-[#1B2036] hover:bg-[#FAF6EB]'
                  }`}
                >
                  {isPT ? cat.labelPT : cat.labelEN}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-[#F6EFDC]">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#1B2036]/70">
                {isPT ? 'Nenhuma resposta encontrada para a pesquisa.' : 'No answers found for your search.'}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isOpenAccordion = openItem === item.id;
                return (
                  <div
                    key={item.id}
                    className="border-2 border-[#1B2036] rounded-xl overflow-hidden bg-[#FAF6EB] shadow-[2px_2px_0px_#1B2036] transition-all"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-3.5 py-3 text-left flex items-center justify-between gap-2.5 hover:bg-[#EFE6CC] transition-colors cursor-pointer"
                      id={`btn-faq-item-${item.id}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0">
                          {item.icon}
                        </div>
                        <span className="text-xs font-bold text-[#1B2036] leading-snug">
                          {isPT ? item.questionPT : item.questionEN}
                        </span>
                      </div>
                      <div className="shrink-0 text-[#1B2036]/70">
                        {isOpenAccordion ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpenAccordion && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden border-t-2 border-[#1B2036]/20 bg-[#F6EFDC] px-3.5 py-3 text-xs leading-relaxed font-sans text-[#1B2036]/90"
                        >
                          <p>{isPT ? item.answerPT : item.answerEN}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}

            {/* Support footer card */}
            <div className="mt-4 p-3.5 rounded-xl border-2 border-[#1B2036] bg-[#EFE6CC] shadow-[2px_2px_0px_#1B2036] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-[#1B2036]">
                  {isPT ? 'Ainda tens dúvidas?' : 'Still have questions?'}
                </h4>
                <p className="text-[10px] text-[#1B2036]/75 font-mono">
                  {isPT ? 'Contacta diretamente a equipa Cobeer Taste:' : 'Get in touch with the Cobeer Taste team:'}
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href="mailto:cobeertaste@gmail.com"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FAF6EB] border-2 border-[#1B2036] rounded-lg hover:bg-[#F2A93B] transition-colors shadow-[1.5px_1.5px_0px_#1B2036] active:scale-95 text-[#1B2036]"
                  id="btn-faq-email"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
                <a
                  href="https://www.instagram.com/cobeertaste"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FAF6EB] border-2 border-[#1B2036] rounded-lg hover:bg-[#F2A93B] transition-colors shadow-[1.5px_1.5px_0px_#1B2036] active:scale-95 text-[#1B2036]"
                  id="btn-faq-instagram"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer close */}
          <div className="p-3 bg-[#EFE6CC] border-t-2 border-[#1B2036] flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold bg-[#FAF6EB] border-2 border-[#1B2036] rounded-xl hover:bg-[#12908C] hover:text-white transition-all shadow-[2px_2px_0px_#1B2036] active:scale-95 cursor-pointer"
              id="btn-faq-close-footer"
            >
              {isPT ? 'Fechar' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
