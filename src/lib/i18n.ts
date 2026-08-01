/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'PT' | 'EN';

export const translations = {
  PT: {
    // Auth & Login/Register Screen
    welcomeTitle: 'HOP MAP',
    welcomeSubtitle: 'Guia do Cervejeiro & Passaporte',
    loginTab: 'Iniciar Sessão',
    registerTab: 'Registar',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'email@exemplo.com',
    passwordLabel: 'Palavra-passe',
    passwordPlaceholder: '••••••••',
    nameLabel: 'Nome do Utilizador',
    namePlaceholder: 'O teu nome ou alcunha',
    loginButton: 'ENTRAR NO HOP MAP 🍻',
    registerButton: 'CRIAR CONTA & RECEBER 12 HOPS 🍻',
    forgotPassword: 'Esqueceste-te da palavra-passe?',
    resetPasswordTitle: 'Recuperar Palavra-passe',
    resetPasswordDesc: 'Introduz o teu e-mail para receberes as instruções de reposição.',
    sendResetEmail: 'Enviar E-mail de Reposição',
    cancel: 'Cancelar',
    orContinueAs: 'OU CONTINUA COMO',
    guestMode: 'MODO CONVIDADO',
    firebaseNotConfigured: 'O Firebase não está configurado. Por favor, ativa o Firebase no ecrã do AI Studio.',
    fillRequiredFields: 'Por favor, preenche todos os campos obrigatórios.',
    passMinLength: 'A palavra-passe deve conter pelo menos 6 caracteres.',
    enterEmailPass: 'Por favor, introduz o e-mail e a palavra-passe.',
    accountCreatedTitle: 'Conta Criada! 🍻',
    welcomeBackTitle: 'Sessão Iniciada! 🍻',
    welcomeBackMsg: 'Bem-vindo de volta ao teu roteiro Hop Map!',
    
    // Navigation Tabs
    tabMap: 'ROTEIRO',
    tabFestivals: 'FESTIVAIS',
    tabRoutes: 'ROTAS',
    tabRankings: 'HIGH SCORES',
    tabProfile: 'PERFIL',

    // Header & Global UI
    hopsUnit: 'HOPS',
    languageLabel: 'Idioma',
    appLanguage: 'Idioma da Aplicação',
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    notificationsTitle: 'Notificações',
    noNotifications: 'Sem notificações recentes',
    markAllRead: 'Marcar todas como lidas',
    clearNotifications: 'Limpar',

    // Explore / Map / Spot Filter
    searchPlaceholder: 'Pesquisar por spot, estilo de cerveja ou zona...',
    allZones: 'Todas as Zonas',
    openNow: 'Abertos Agora',
    applePayFilter: 'Apple Pay',
    favoritesFilter: 'Favoritos',
    minRating: 'Avaliação Mínima',
    clearFilters: 'Limpar Filtros',
    spotsFound: 'Spots Encontrados',
    noSpotsFound: 'Nenhum spot encontrado com os filtros selecionados.',
    spotDetails: 'Detalhes do Spot',
    getDirections: 'Como Chegar',
    checkinAction: 'Fazer Check-in',
    checkedInDone: 'Check-in Efetuado',
    kmAway: 'km de distância',
    workingHours: 'Horário',
    tapsAvailable: 'Torneiras Ativas',
    beerStyles: 'Estilos de Cerveja',
    rateSpot: 'Avaliar Spot',
    reviewsTitle: 'Avaliações e Opiniões',
    writeReview: 'Escrever Avaliação',
    alreadyReviewed: 'Já Avaliado',
    noReviewsYet: 'Ainda sem avaliações. Sê o primeiro a avaliar!',
    yourComment: 'O teu comentário...',
    submitReview: 'Submeter Avaliação',
    reviewSubmitted: 'Avaliação Submetida!',
    stampCard: 'Cartão de Selos',
    stampsProgress: 'selos de',
    rewardLabel: 'Recompensa',
    myPassport: 'O Meu Passaporte',
    myFavorites: 'Favoritos Guardados',

    // Festivals
    festivalsTitle: 'Festivais e Eventos de Cerveja',
    festivalsDesc: 'Participa nos maiores festivais, acumula selos e ganha HOPS extra!',
    buyTicketApplePay: 'Comprar Bilhete com  Pay',
    ticketPurchased: 'Bilhete Adquirido',
    organizerLabel: 'Organizador',
    festivalCheckin: 'Check-in no Festival (+2 HOPS)',

    // Custom Routes
    routesTitle: 'Rotas Cervejeiras Personalizadas',
    routesDesc: 'Cria ou otimiza o teu itinerário de degustação entre os teus spots favoritos.',
    optimizeRoute: 'Otimizar Rota (Menor Distância)',
    addStop: 'Adicionar Spot à Rota',
    removeStop: 'Remover',
    clearRoute: 'Limpar Rota',
    totalDistance: 'Distância Total Aprox.',
    totalDuration: 'Tempo Estimado a Pé',

    // High Scores Modal
    highScoresTitle: 'HOP MAP by COBEER TASTE',
    tabGlobal: 'GLOBAL',
    tabFriends: 'AMIGOS',
    tabTiers: 'NÍVEIS',
    tabSpotsTiers: 'MAPA / SPOTS',
    shareRanking: 'PARTILHAR RANKING',
    closeScoreModal: '[ FECHAR ]',

    // Profile & Settings
    profileTitle: 'Perfil do Cervejeiro',
    biometricsConfirm: 'Confirmação Biométrica (Face ID / Touch ID)',
    logoutButton: 'Terminar Sessão',
    loginRequiredNotice: 'Inicia sessão para acederes ao teu perfil completo, selos e histórico.',
    userLanguageUpdated: 'Idioma atualizado com sucesso!',

    // Social Popup Modal
    followCobeerTaste: 'Segue Cobeer Taste! 🍻',
    joinCommunity: 'Junta-te à nossa comunidade e acompanha todas as novidades nas redes sociais:',
    continueHopMap: 'Continuar HOP MAP',

    // GPS Status
    gpsActive: 'Sinal GPS Ativo',
    gpsAccuracy: 'Precisão',
    gpsErrorMsg: 'Não foi possível obter a localização GPS.',

    // Notifications Push Titles
    checkinSuccessTitle: 'Check-in Realizado!',
    rankingCopiedTitle: 'Ranking Copiado! 📋',
    rankingCopiedMsg: 'O teu progresso HOP MAP foi copiado para a área de transferência.'
  },
  EN: {
    // Auth & Login/Register Screen
    welcomeTitle: 'HOP MAP',
    welcomeSubtitle: 'Brewer Guide & Passport',
    loginTab: 'Login',
    registerTab: 'Register',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    nameLabel: 'Username',
    namePlaceholder: 'Your name or nickname',
    loginButton: 'LOG IN TO HOP MAP 🍻',
    registerButton: 'CREATE ACCOUNT & GET 12 HOPS 🍻',
    forgotPassword: 'Forgot password?',
    resetPasswordTitle: 'Reset Password',
    resetPasswordDesc: 'Enter your email address to receive password reset instructions.',
    sendResetEmail: 'Send Reset Email',
    cancel: 'Cancel',
    orContinueAs: 'OR CONTINUE AS',
    guestMode: 'GUEST MODE',
    firebaseNotConfigured: 'Firebase is not configured. Please enable Firebase in AI Studio.',
    fillRequiredFields: 'Please fill in all required fields.',
    passMinLength: 'Password must be at least 6 characters.',
    enterEmailPass: 'Please enter email and password.',
    accountCreatedTitle: 'Account Created! 🍻',
    welcomeBackTitle: 'Logged In! 🍻',
    welcomeBackMsg: 'Welcome back to your Hop Map guide!',

    // Navigation Tabs
    tabMap: 'MAP',
    tabFestivals: 'FESTIVALS',
    tabRoutes: 'ROUTES',
    tabRankings: 'HIGH SCORES',
    tabProfile: 'PROFILE',

    // Header & Global UI
    hopsUnit: 'HOPS',
    languageLabel: 'Language',
    appLanguage: 'Application Language',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    notificationsTitle: 'Notifications',
    noNotifications: 'No recent notifications',
    markAllRead: 'Mark all as read',
    clearNotifications: 'Clear',

    // Explore / Map / Spot Filter
    searchPlaceholder: 'Search by spot, beer style or zone...',
    allZones: 'All Zones',
    openNow: 'Open Now',
    applePayFilter: 'Apple Pay',
    favoritesFilter: 'Favorites',
    minRating: 'Minimum Rating',
    clearFilters: 'Clear Filters',
    spotsFound: 'Spots Found',
    noSpotsFound: 'No spots found matching selected filters.',
    spotDetails: 'Spot Details',
    getDirections: 'Get Directions',
    checkinAction: 'Check-in',
    checkedInDone: 'Checked In',
    kmAway: 'km away',
    workingHours: 'Hours',
    tapsAvailable: 'Active Taps',
    beerStyles: 'Beer Styles',
    rateSpot: 'Rate Spot',
    reviewsTitle: 'Reviews & Feedback',
    writeReview: 'Write Review',
    alreadyReviewed: 'Already Reviewed',
    noReviewsYet: 'No reviews yet. Be the first to review!',
    yourComment: 'Your comment...',
    submitReview: 'Submit Review',
    reviewSubmitted: 'Review Submitted!',
    stampCard: 'Stamp Card',
    stampsProgress: 'stamps of',
    rewardLabel: 'Reward',
    myPassport: 'My Passport',
    myFavorites: 'Saved Favorites',

    // Festivals
    festivalsTitle: 'Beer Festivals & Events',
    festivalsDesc: 'Attend top festivals, collect stamps and earn extra HOPS!',
    buyTicketApplePay: 'Buy Ticket with  Pay',
    ticketPurchased: 'Ticket Purchased',
    organizerLabel: 'Organizer',
    festivalCheckin: 'Festival Check-in (+2 HOPS)',

    // Custom Routes
    routesTitle: 'Custom Craft Beer Routes',
    routesDesc: 'Create or optimize your tasting itinerary between favorite spots.',
    optimizeRoute: 'Optimize Route (Shortest Distance)',
    addStop: 'Add Spot to Route',
    removeStop: 'Remove',
    clearRoute: 'Clear Route',
    totalDistance: 'Approx. Total Distance',
    totalDuration: 'Estimated Walk Time',

    // High Scores Modal
    highScoresTitle: 'HOP MAP by COBEER TASTE',
    tabGlobal: 'GLOBAL',
    tabFriends: 'FRIENDS',
    tabTiers: 'TIERS',
    tabSpotsTiers: 'MAP / SPOTS',
    shareRanking: 'SHARE RANKING',
    closeScoreModal: '[ CLOSE ]',

    // Profile & Settings
    profileTitle: 'Brewer Profile',
    biometricsConfirm: 'Biometric Confirmation (Face ID / Touch ID)',
    logoutButton: 'Log Out',
    loginRequiredNotice: 'Log in to access your full profile, stamps, and history.',
    userLanguageUpdated: 'Language updated successfully!',

    // Social Popup Modal
    followCobeerTaste: 'Follow Cobeer Taste! 🍻',
    joinCommunity: 'Join our community and stay updated on social media:',
    continueHopMap: 'Continue HOP MAP',

    // GPS Status
    gpsActive: 'GPS Signal Active',
    gpsAccuracy: 'Accuracy',
    gpsErrorMsg: 'Could not obtain GPS location.',

    // Notifications Push Titles
    checkinSuccessTitle: 'Check-in Complete!',
    rankingCopiedTitle: 'Ranking Copied! 📋',
    rankingCopiedMsg: 'Your HOP MAP progress was copied to clipboard.'
  }
};

/**
 * Get translated text for key.
 */
export function t(key: keyof typeof translations['PT'], lang: Language = 'PT'): string {
  const dict = translations[lang] || translations.PT;
  return dict[key] || translations.PT[key] || key;
}
