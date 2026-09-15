import React from 'react';
import { motion } from 'motion/react';
import { Star, X, Check, Clock, AlertCircle } from 'lucide-react';

interface ReviewEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: string;
    barId: string;
    barName: string;
    stars: number;
    texto_rating: string;
    tipo_cerveja?: string;
    createdAt?: string | number;
  } | null;
  onSave: (updatedReview: { id: string; barId: string; barName: string; stars: number; texto_rating: string; tipo_cerveja: string; createdAt: any }) => void;
  lang: 'PT' | 'EN';
  darkMode: boolean;
}

export const ReviewEditModal: React.FC<ReviewEditModalProps> = ({
  isOpen,
  onClose,
  review,
  onSave,
  lang,
  darkMode,
}) => {
  const [rating, setRating] = React.useState<number>(review?.stars || 5);
  const [comment, setComment] = React.useState<string>(review?.texto_rating || '');
  const [beerStyle, setBeerStyle] = React.useState<string>(review?.tipo_cerveja || '');
  const [errorMsg, setErrorMsg] = React.useState<string>('');

  React.useEffect(() => {
    if (review) {
      setRating(review.stars || 5);
      setComment(review.texto_rating || '');
      setBeerStyle(review.tipo_cerveja || '');
      setErrorMsg('');
    }
  }, [review]);

  if (!isOpen || !review) return null;

  const createdAtTime = review.createdAt ? new Date(review.createdAt).getTime() : Date.now();
  const timeDifferenceHours = (Date.now() - createdAtTime) / (1000 * 60 * 60);
  const isEditable = !review.createdAt || timeDifferenceHours <= 24;
  const remainingHours = Math.max(0, Math.floor(24 - timeDifferenceHours));
  const remainingMinutes = Math.max(0, Math.floor(((24 - timeDifferenceHours) % 1) * 60));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) {
      setErrorMsg(
        lang === 'PT' 
          ? 'Esta avaliação foi submetida há mais de 24 horas e já não pode ser editada.' 
          : 'This review was submitted more than 24 hours ago and can no longer be edited.'
      );
      return;
    }
    if (!comment.trim()) {
      setErrorMsg(
        lang === 'PT' 
          ? 'Por favor, escreve um breve comentário sobre a tua experiência.' 
          : 'Please write a brief comment about your experience.'
      );
      return;
    }

    onSave({
      id: review.id,
      barId: review.barId,
      barName: review.barName,
      stars: rating,
      texto_rating: comment.slice(0, 100),
      tipo_cerveja: beerStyle.trim(),
      createdAt: review.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[450] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-sm rounded-3xl p-5 border-2 border-black bg-[#FAF6EB] text-[#1B2036] shadow-[4px_4px_0px_#000000] z-10 space-y-4 font-sans text-xs"
      >
        {/* Header */}
        <div className="flex justify-between items-start border-b border-black/10 pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-xs font-black uppercase tracking-wider font-display text-black">
                {lang === 'PT' ? 'Editar Avaliação' : 'Edit Review'}
              </h3>
            </div>
            <span className="text-[10px] text-zinc-600 font-mono mt-0.5 block">
              Spot: <strong className="text-black">{review.barName}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black flex items-center justify-center transition cursor-pointer shadow-md"
            title={lang === 'PT' ? 'Fechar' : 'Close'}
          >
            <X className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          </button>
        </div>

        {/* 24-Hour Edit Time Window Status */}
        {isEditable ? (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-900 text-[9.5px] font-bold font-mono">
            <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-700" />
            <span>
              {lang === 'PT'
                ? `Podes editar esta avaliação durante as primeiras 24h (restam aprox. ${remainingHours}h ${remainingMinutes}m).`
                : `You can edit this review within the first 24h (approx. ${remainingHours}h ${remainingMinutes}m remaining).`}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 text-[9.5px]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {lang === 'PT'
                ? 'Prazo expirado: Já passaram mais de 24 horas desde que submeteste esta avaliação. Já não é possível editá-la.'
                : 'Deadline expired: More than 24 hours have passed since submitting this review. It can no longer be edited.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {/* Star rating selector */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-bold uppercase tracking-wider text-black pl-1 font-display">
              {lang === 'PT' ? 'Pontuação Geral (1 a 5 Estrelas)' : 'Overall Rating (1 to 5 Stars)'}
            </label>
            <div className="flex items-center space-x-1.5 p-1.5 rounded-xl border-2 border-black bg-white w-fit shadow-[1px_1px_0px_#000000]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={!isEditable}
                  onClick={() => setRating(star)}
                  className={`p-1 transition-transform active:scale-90 ${
                    !isEditable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110'
                  }`}
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'fill-amber-500 text-amber-500' : 'text-zinc-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-extrabold font-mono text-black pl-2">
                {rating}.0
              </span>
            </div>
          </div>

          {/* Beer style input */}
          <div className="space-y-1">
            <label className="text-[9.5px] font-bold uppercase tracking-wider text-black pl-1 font-display">
              {lang === 'PT' ? 'Cerveja que bebeste (Estilo/Marca)' : 'Beer you drank (Style/Brand)'}
            </label>
            <input
              type="text"
              disabled={!isEditable}
              value={beerStyle}
              onChange={(e) => setBeerStyle(e.target.value)}
              placeholder={lang === 'PT' ? "Ex: West Coast IPA Letra" : "E.g. West Coast IPA Letra"}
              className={`w-full px-3 py-2 text-xs rounded-xl border-2 border-black bg-white text-black shadow-[1px_1px_0px_#000000] transition-all outline-none focus:border-amber-500 placeholder:text-zinc-400 ${
                !isEditable ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {/* Review comment input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center pr-1">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-black pl-1 font-display">
                {lang === 'PT' ? 'A tua opinião' : 'Your review'}
              </label>
              <span className="text-[8.5px] font-mono font-bold text-zinc-600">
                {comment.length}/100
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={100}
              disabled={!isEditable}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={lang === 'PT' ? "Características da cerveja, atendimento ou ambiente..." : "Beer flavors, service, or atmosphere..."}
              className={`w-full px-3 py-2 text-xs rounded-xl border-2 border-black bg-white text-black shadow-[1px_1px_0px_#000000] transition-all outline-none resize-none focus:border-amber-500 placeholder:text-zinc-400 ${
                !isEditable ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
          </div>

          {errorMsg && (
            <p className="text-[10px] text-rose-600 font-bold pl-1 leading-tight">
              {errorMsg}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold rounded-xl border-2 border-black bg-[#F6EFDC] hover:bg-[#EFE6CC] text-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition cursor-pointer font-display uppercase tracking-wider"
            >
              {lang === 'PT' ? 'Cancelar' : 'Cancel'}
            </button>

            {isEditable && (
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] transition flex items-center justify-center gap-1.5 font-display uppercase tracking-wider cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{lang === 'PT' ? 'Guardar' : 'Save'}</span>
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
};
