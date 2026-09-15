import React from 'react';
import { Search, User, X } from 'lucide-react';
import { getLevelDetails } from '../data';

interface UserSearchProps {
  friendSearchQuery: string;
  setFriendSearchQuery: (query: string) => void;
  friendSearchResults: Array<{ id: string; username: string; points: number }>;
  isFriendSearching: boolean;
  friendSearchMessage: string;
  user: { id: string; username: string; friends?: string[] };
  sentPendingRequests: string[];
  handleAddFriend: (id: string, username: string) => void;
  handleRemoveFriend: (id: string, username: string) => void;
  lang: 'PT' | 'EN';
  darkMode: boolean;
  compact?: boolean;
}

export const UserSearchComponent: React.FC<UserSearchProps> = ({
  friendSearchQuery,
  setFriendSearchQuery,
  friendSearchResults,
  isFriendSearching,
  friendSearchMessage,
  user,
  sentPendingRequests,
  handleAddFriend,
  handleRemoveFriend,
  lang,
  darkMode,
  compact = false,
}) => {
  return (
    <div className={`w-full rounded-2xl border transition-all ${
      darkMode 
        ? 'bg-zinc-900/90 border-white/10 text-white shadow-md backdrop-blur-md' 
        : 'bg-white border-neutral-200 text-neutral-900 shadow-sm'
    } ${compact ? 'p-3' : 'p-3.5'} space-y-2`}>
      <div className="flex items-center justify-between">
        <h5 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-display flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'PT' ? 'Pesquisar Utilizadores' : 'Search Users'}</span>
        </h5>
        {isFriendSearching && (
          <div className="w-3.5 h-3.5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
        <input
          type="text"
          value={friendSearchQuery}
          onChange={(e) => setFriendSearchQuery(e.target.value)}
          placeholder={lang === 'PT' ? "Pesquisa por nome de utilizador..." : "Search by username..."}
          className={`w-full pl-8.5 pr-8 py-2 text-[10.5px] rounded-xl outline-none border transition-all ${
            darkMode 
              ? 'bg-black/40 border-white/10 text-white placeholder-zinc-500 focus:border-amber-500/60 focus:bg-black/60' 
              : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-amber-500 focus:bg-white'
          }`}
          id="input-user-search-component"
        />
        {friendSearchQuery && (
          <button
            type="button"
            onClick={() => setFriendSearchQuery('')}
            className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-200 cursor-pointer p-0.5"
            title={lang === 'PT' ? 'Limpar pesquisa' : 'Clear search'}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dynamic search results dropdown / box */}
      {friendSearchQuery.trim() !== '' && (
        <div>
          {friendSearchResults.length > 0 ? (
            <div className={`mt-1.5 rounded-xl p-1.5 border space-y-1 max-h-[160px] overflow-y-auto ${
              darkMode ? 'bg-black/60 border-white/10 divide-y divide-white/5' : 'bg-zinc-50/90 border-zinc-200 divide-y divide-zinc-200/50'
            }`}>
              {friendSearchResults.map(res => {
                const isAlreadyFriend = (user.friends || []).includes(res.id);
                const isSentPending = sentPendingRequests.includes(res.id);
                const isSelf = res.id === user.id || res.username.toLowerCase() === user.username.toLowerCase();

                return (
                  <div 
                    key={res.id} 
                    className={`flex items-center justify-between p-1.5 rounded-lg transition ${
                      darkMode ? 'hover:bg-white/5' : 'hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      <span className="text-base select-none shrink-0">{getLevelDetails(res.points).badge}</span>
                      <div className="text-left truncate">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10.5px] font-bold truncate ${darkMode ? 'text-zinc-100' : 'text-zinc-800'}`}>
                            {res.username}
                          </span>
                          {isSelf && (
                            <span className="text-[7px] font-mono text-amber-500 uppercase px-1 rounded bg-amber-500/10 border border-amber-500/20">
                              {lang === 'PT' ? 'Tu' : 'You'}
                            </span>
                          )}
                        </div>
                        <div className="text-[8.5px] text-zinc-400 font-mono">
                          {res.points} HOPS • {getLevelDetails(res.points, lang).title}
                        </div>
                      </div>
                    </div>

                    {!isSelf && (
                      <div className="shrink-0">
                        {isAlreadyFriend ? (
                          <button
                            type="button"
                            onClick={() => handleRemoveFriend(res.id, res.username)}
                            className="px-2.5 py-1 text-[8.5px] font-extrabold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <X className="w-2.5 h-2.5" />
                            <span>{lang === 'PT' ? 'Remover' : 'Remove'}</span>
                          </button>
                        ) : isSentPending ? (
                          <span className="px-2.5 py-1 text-[8.5px] font-extrabold text-zinc-400 bg-zinc-500/10 border border-zinc-500/20 rounded-lg select-none flex items-center gap-1">
                            <span>{lang === 'PT' ? 'Pendente ⏳' : 'Pending ⏳'}</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddFriend(res.id, res.username)}
                            className="px-2.5 py-1 text-[8.5px] font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/25 rounded-lg hover:bg-amber-500/20 hover:text-amber-300 transition cursor-pointer flex items-center gap-1 active:scale-95"
                          >
                            <User className="w-2.5 h-2.5" />
                            <span>{lang === 'PT' ? 'Adicionar' : 'Add'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : !isFriendSearching && (
            <div className={`mt-1.5 p-3 rounded-xl border text-center ${
              darkMode ? 'bg-black/30 border-white/5 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
            }`}>
              <p className="text-[9.5px]">
                {friendSearchMessage || (lang === 'PT' ? 'Nenhum utilizador encontrado com esse nome.' : 'No users found with that username.')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
