/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'PT' | 'EN';

export const SPOT_DESCRIPTIONS_EN_BY_ID: Record<string, string> = {
  "azores-brewing-company-acores": "Taproom of the premier craft brewery in the Azores, featuring fresh local beers.",
  "beerstore-pt-acores": "Craft beer shop in the Azores with a dedicated focus on artisanal craft beers.",
  "vulcana-cerveja-artesanal-acores": "Authentic Azorean craft brewery known for artisanal island-inspired recipes.",
  "koriska-cerveja-artesanal-acores": "Active artisanal craft brewery in the Azores producing distinct regional brews.",
  "epicura-craft-beer-house-coimbra": "Home of Epicura beer with 12 rotating taps (house and guest beers). A vibrant meeting point in Coimbra.",
  "cerveja-praxis-coimbra": "Brewery, Coimbra Beer Museum, and restaurant offering guided tastings and food pairings.",
  "tough-love-tap-room-aveiro": "Taproom of Aveiro’s acclaimed brewery renowned for its bold, experimental beers.",
  "letraria-obidos-obidos": "Cerveja Letra craft beer bar in Óbidos located right next to the historic medieval wall.",
  "5-e-meio-taproom-ericeira": "Taproom for 5 e Meio craft beer brewed fresh on-site in Ericeira.",
  "o-emporio-pt-ericeira": "Craft beer bottle shop and bar with an extensive selection of national and international craft brews.",
  "mean-sardine-craft-beer-fabrica-ericeira": "Brewery production facility of the renowned Mean Sardine craft brewery in Ericeira.",
  "cervejaria-parreirinha-ericeira": "Rooftop restaurant in Ericeira serving finger food, fresh seafood, and selected craft beers.",
  "hopsin-brewpub-colares": "Brewpub where HopSin craft beers are brewed and poured in collaboration with Adega de Colares.",
  "villa-craft-beer-sintra": "Villa Craft Beer is a premier reference point for craft beer enthusiasts in Sintra.",
  "beer-cascais-cascais": "Craft beer shop and cozy bar in Cascais with selected artisanal brews.",
  "na-medida-beer-tap-house-cascais": "Tap House in Cascais featuring a cozy welcoming atmosphere and outdoor seating.",
  "the-crafty-cellar-cascais": "Specialized craft beer bar focusing on Portuguese craft breweries in central Cascais.",
  "crow-s-bar-cascais": "Crow’s Bar is a staple reference venue for craft beer lovers in Cascais.",
  "dois-corvos-taproom-marvila-lisboa": "The birthplace of Dois Corvos featuring 17 rotating taps of fresh craft beers in Marvila’s Beer District.",
  "dois-corvos-intendente-tap-room-lisboa": "Dois Corvos’ second, central Lisbon taproom, maintaining the freshness and quality of Marvila brews.",
  "musa-da-fabrica-lisboa": "Taproom with direct views of Musa’s main brewery. Industrial and relaxed atmosphere.",
  "musa-da-bica-lisboa": "Musa venue in Bairro da Bica known for its great vibe and rotating draft beer selection.",
  "fermentage-brewpub-lisboa": "Brewpub in Marvila’s Beer District featuring in-house brewing and pairing snacks.",
  "pravda-marvila-lisboa": "Pravda bar born in Ukraine with a strong international craft beer selection.",
  "lx-brewery-lisboa": "LX Brewery is a landmark spot for craft beer enthusiasts in Lisbon.",
  "oficina-da-cerveja-lisboa": "Space dedicated to promoting and tasting Portuguese and international craft beers in Lisbon.",
  "oitava-colina-taproom-lisboa": "Oitava Colina brand taproom offering fresh local craft beers and a stunning panoramic view.",
  "duque-brewpub-lisboa": "The capital’s very first Brewpub in Chiado, brewing and serving Portuguese craft beer.",
  "canil-craft-beer-bar-baixa-lisboa": "Downtown Lisbon bar with a vast craft beer selection on 32 taps (house and guest beers).",
  "canil-marques-lisboa": "Canil space with 36 taps and an innovative self-service wall for 20 Portuguese craft beers.",
  "cerveteca-lisboa-lisboa": "Cerveteca Lisboa is an iconic pioneer craft beer sanctuary in Lisbon with rotating taps.",
  "artesanalis-bottle-shop-lisboa": "Craft beer bottle shop and bar specializing in craft beers with a vegan snacks menu.",
  "flor-de-lupulo-lisboa": "Bar highlighting curated national and foreign craft beers accompanied by delicious bites.",
  "sputnik-craft-beer-lisboa": "Bar in Anjos with a solid beer selection and a friendly, relaxed neighborhood vibe.",
  "the-beer-station-lisboa": "Conveniently located in Cais do Sodré with a strong focus on draft and artisanal beer.",
  "sailors-bar-lisboa": "Bar in Parque das Nações offering craft beer, live sports broadcasts, and a vibrant terrace.",
  "gulden-draak-vasco-da-gama-lisboa": "Belgian brand beerhouse with 12 taps, traditional grilled dishes, and savory snacks.",
  "lovecraft-portugal-lisboa": "Bar inside the iconic Lx Factory complex serving craft beers and gourmet burgers.",
  "browers-lisboa": "Browers is a benchmark destination for craft beer and culinary pairing in Lisbon.",
  "the-queen-ale-lisboa": "The Queen Ale is a premier landmark for craft beer aficionados in Lisbon.",
  "funchal-tap-room-madeira": "Funchal Tap Room is a prime reference spot for craft beer enthusiasts in Madeira.",
  "fuga-cidade-2014-madeira": "Relaxed bar in Funchal renowned for its craft beer selection and Portuguese tapas.",
  "beer-house-madeira": "Historic spot at Funchal harbour in Madeira with a broad beer selection and house brew.",
  "canto-do-lobo-caminha": "Restaurant harmonizing Portuguese culinary flavors, craft beer, and regional wines.",
  "ribeiro-s-brewers-viana-do-castelo": "Craft beer bar offering 50 international and national references with tasty tapas.",
  "letraria-de-viana-do-castelo-viana-do-castelo": "Letraria de Viana do Castelo is a benchmark craft beer venue in historic Viana do Castelo.",
  "dona-beer-braga": "Charming bar with a wide selection of local and international craft beers and tapas in Braga.",
  "mal-amado-braga": "Cozy craft beer and cocktail haven situated right by the historic Braga Cathedral (Sé).",
  "craft-draft-braganca": "Regarded as the craft beer sanctuary in Trás-os-Montes, featuring a rich and curated selection.",
  "letraria-de-vila-verde-vila-verde": "Cerveja Letra’s original brewery taproom and hop garden in the Braga/Vila Verde region.",
  "hop-trip-craft-beer-shop-matosinhos": "Hop Trip - Craft Beer Shop is a reference spot for craft beer lovers in Matosinhos.",
  "tough-love-tap-room-porto": "Tough Love’s second location specializing in traditional cask-conditioned ales and fresh craft beers.",
  "gulden-draak-bierhuis-porto": "Gulden Draak Bierhuis is a benchmark Belgian and craft beer house in Porto.",
  "baobab-craft-beer-porto": "Craft beer haven in downtown Porto with a strong focus on IPAs and international rarities.",
  "cervejaria-do-carmo-porto": "Classic meeting spot offering a solid selection of craft beers and traditional snacks.",
  "musa-das-virtudes-porto": "Musa Taproom offering 15 taps of craft beer with spectacular views over the Douro River.",
  "catraio-craft-beer-shop-bar-porto": "Iconic craft beer shop and bar in Cedofeita featuring a rotating taplist and a lovely beer garden.",
  "cerveja-nortada-porto": "Cerveja Nortada is a landmark brewery and brewpub in the heart of Porto.",
  "armazem-da-cerveja-porto": "Specialized craft beer bar and shop with an excellent taplist, BYOF-friendly atmosphere.",
  "a-fabrica-da-picaria-brew-pub-porto": "A Fábrica da Picaria is a celebrated brewpub where you drink beer brewed right in front of you.",
  "cerveja-artesanal-levare-brewpub-porto": "Multifaceted space: brewery, bar, and restaurant in the center of Porto.",
  "magnifica-beer-house-evora": "Home of Cerveja Magnífica, focusing on Alentejo artisanal beers and regional tapas in Évora.",
  "barona-craft-beer-house-castelo-de-vide": "Taproom of BARONA Brewing Company, serving premier Alentejo craft beers in Castelo de Vide.",
  "skal-artesanal-craft-beer-sports-bar-setubal": "Skal Artesanal - Craft Beer & Sports Bar is a reference hub for craft beer lovers in Setúbal.",
  "capt-tap-setubal": "One of Setúbal’s most popular craft beer taprooms featuring 8 rotating taps.",
  "ophiussa-taproom-setubal": "Modern taproom of Ophiussa brewery pouring fresh IPAs, sours, and dark ales.",
  "lagos-beer-co-lagos": "Bar with a curated beer selection, gourmet burgers, pizzas, and artisan cocktails in Lagos.",
  "the-collab-bar-lagos": "Collaborative craft beer bar and community hub in Lagos featuring local and international brews.",
  "mania-beer-brewery-lagos": "Brewery and taproom of Mania Beer in Lagos, Algarve.",
  "algarvian-brewing-company-portimao": "Brewpub in Portimão with 12 craft beer taps and creative Mexican-fusion dishes.",
  "boheme-cervejaria-faro": "Craft beer bar featuring extensive national and international selections in Faro, Algarve.",
  "boheme-tavira": "Boheme is a reference spot for craft beer enthusiasts in Tavira.",
  "nanobrew-fuzeta-fuzeta": "NanoBrew Fuzeta is a charming seaside reference spot for craft beer lovers in Fuzeta.",
  "craft-heritage-beer-spirits-vila-vicosa": "Born from a passion for craft brewing, this is Portugal’s 1st integrated brewery/distillery in Vila Viçosa.",
  "vilhoa-craft-beer-warehouse-madeira": "Dedicated to Portuguese craft beers, recognized for local selections and exclusive joint brews.",
  "gulden-draak-casa-da-cerveja-lisboa": "Pub and bar near Picoas with a wide beer selection highlighting Belgian beers and tasty food.",
  "dos-santos-craft-beer-taproom-lagoa": "Craft brewery taproom in Lagoa focusing on traditional German Purity Law beers.",
  "cerveja-dos-diabos-porto": "Cerveja dos Diabos is a dedicated reference spot for craft beer lovers in Porto.",
  "cantinho-cafe-figueira-de-castelo-rodrigo": "Pilgrimage spot for craft beer fans in Castelo Rodrigo, known for warm hospitality and great brews.",
  "cerveja-acor-arganil": "Craft beer brewed with passion in Arganil, enriching beer culture with focus on local quality.",
  "cerveja-boazona-vila-nova-de-poiares": "Artisanal beer offering diverse styles from IPAs and Porters to Porto wine barrel-aged Stouts.",
  "maldita-brewpub-aveiro": "Maldita craft beer brewpub in Aveiro serving fresh tap beers with Mexican-influenced cuisine.",
  "taverna-lusitana-monsanto": "Cozy tavern in historical Monsanto offering Portuguese dishes and craft beer with outdoor seating.",
  "vadia-brewpub-oliveira-de-azemeis": "Vadia Brewpub harmonizes fresh craft beer, guided brewery tours, and artisanal food with live music.",
  "letraria-downtown-porto": "Craft beer bar and restaurant in Porto with 22 rotating taps, beer garden, and delicious pairings.",
  "deuses-do-malte-v-n-gaia": "Rustic, intimate taproom in Vila Nova de Gaia with 8 rotating taps and savory pairing dishes.",
  "12-marias-fermela": "Tasting room at the brewery in Fermelã for enjoying craft beers with snacks in an intimate vibe.",
  "monja-penafiel": "Modern historic center bar in Penafiel serving craft beer, signature pastries, toasts, and burgers.",
  "letraria-braga": "Cerveja Letra bar in Braga by the Sé, offering 23 craft beer taps, cheese boards, and book exchange.",
  "lovecraft-public-house-feira-santa-maria-da-feira": "Welcoming craft beer bar in Santa Maria da Feira with diverse beers and high-quality vegetarian/vegan snacks.",
  "quimera-brewpub-lisboa": "Unique brewpub in an 18th-century tunnel serving Quimera beers, NY Deli sandwiches, and live music.",
  "amo-brewery-lisboa": "Nano-brewery and multicultural space in Arroios/Intendente hosting craft beer tastings and pop-ups.",
  "lispoa-craft-beer-lisboa": "Brewpub in Arroios pouring directly from the source with 10 rotating taps and culinary pop-ups.",
  "outro-lado-craft-beer-lisboa": "Alfama bar specializing in national and international craft beers with 15+ curated taps.",
  "brew-portugal-lisboa": "BREW Portugal is an iconic reference spot for craft beer lovers in Lisbon.",
  "crafty-corner-lisboa": "Craft beer bar in Alfama with ~12 rotating Portuguese craft taps, cocktails, and delicious brunch.",
  "pils-lisboa-lisboa": "Historic Lisbon destination dedicated to crisp, perfectly executed Lager and Pilsner styles.",
  "musa-da-praia-colares": "Musa bar set in a former water tower in Colares (Sintra), serving 10 taps alongside local food trucks.",
  "letraria-craft-beer-vinyl-ponte-de-lima": "Letra space combining 150+ craft beer varieties, burgers, and tapas with vinyl record listening.",
  "prost-guimaraes": "Specialized craft beer bar in Guimarães on historic Praça de São Tiago with 40 beer taps.",
  "beberico-senhora-da-hora": "Craft beer shop and bar in Senhora da Hora (Greater Porto) with wide bottle and tap choices.",
  "j-agora-v-n-gaia": "Specialized craft beer haven and bar in Vila Nova de Gaia.",
  "surviaria-amarante": "The craft beer embassy in Amarante, offering top Portuguese craft beers in a warm interior haven.",
  "andsome-beer-lourinha": "Brewpub and taproom in Lourinhã producing traditional and experimental beers with 7 rotating taps.",
  "cerveja-h-ale-mary-madeira": "Cozy Madeiran craft beer spot offering a great variety of artisanal brews.",
  "bela-cerveja-acores": "Bela Cerveja is a benchmark venue for craft beer enthusiasts in the Azores.",
  "marrafa-jesufrei": "Marrafa is a recognized craft beer destination in Jesufrei.",
  "bah-craft-beer-cascais": "Proudly independent craft beer in Cascais delivering delightful, flavorful artisanal brews.",
  "malaica-caldas-da-rainha": "Malaica is a craft beer house, social space, local art gallery, and welcoming community in Caldas da Rainha.",
  "o-bandido-porto": "Celebrated for serving great burgers alongside 40+ different Portuguese and international craft beers in Porto.",
};


export const translations = {
  PT: {
    // Auth & Login/Register Screen
    welcomeTitle: 'HOP-MAP',
    welcomeSubtitle: 'Guia do Cervejeiro & Passaporte',
    loginTab: 'Iniciar Sessão',
    registerTab: 'Registar',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'email@exemplo.com',
    passwordLabel: 'Palavra-passe',
    passwordPlaceholder: '••••••••',
    nameLabel: 'Nome do Utilizador',
    namePlaceholder: 'O teu nome ou alcunha',
    loginButton: 'HOP ON',
    newSpotDiscovered: 'NOVO LOCAL DESCOBERTO. HOP ON!',
    registerButton: 'CRIAR CONTA & RECEBER 12 HOPS 🍻',
    forgotPassword: 'Esqueceste-te da palavra-passe?',
    resetPasswordTitle: 'Recuperar Palavra-passe',
    resetPasswordDesc: 'Introduz o teu e-mail para receberes as instruções de reposição.',
    sendResetEmail: 'Enviar E-mail de Reposição',
    cancel: 'Cancelar',
    firebaseNotConfigured: 'O Firebase não está configurado. Por favor, ativa o Firebase no ecrã do AI Studio.',
    fillRequiredFields: 'Por favor, preenche todos os campos obrigatórios.',
    passMinLength: 'A palavra-passe deve conter pelo menos 6 caracteres.',
    enterEmailPass: 'Por favor, introduz o e-mail e a palavra-passe.',
    accountCreatedTitle: 'Conta Criada! 🍻',
    welcomeBackTitle: 'Sessão Iniciada! 🍻',
    welcomeBackMsg: 'Bem-vindo de volta ao teu roteiro Hop-Map!',
    loginTermsAgreement: 'Ao entrar concordas em partilhar a tua localização para ver os spots onde beber cerveja artesanal em Portugal.',
    drinkResponsibly: 'Beba com responsabilidade',
    recoveryEmailSent: 'E-mail de recuperação enviado! Verifica a tua caixa de correio (e a pasta de spam).',
    recoveryPushTitle: 'Recuperação de Password',
    recoveryPushBody: 'Instruções enviadas para o teu e-mail.',
    doneBtn: 'Concluído',
    sendingBtn: 'A enviar...',
    recoverBtn: 'Recuperar',
    
    // Navigation Tabs
    tabMap: 'SPOTS',
    tabFestivals: 'FESTIVAIS',
    tabRoutes: 'ROTAS',
    tabRankings: 'HIGH SCORES',
    tabProfile: 'PERFIL',

    // Header & Global UI
    hopsUnit: 'HOPS',
    languageLabel: 'Idioma',
    appLanguage: 'Idioma',
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
    spotsConquered: 'Locais Conquistados',
    badgesUnlockedLabel: 'Badges Desbloqueados',
    globalRankLabel: 'Ranking Global',
    viewAllBadges: 'Ver Todos os Badges',
    noBadgesEarnedYet: 'Ainda não tens nenhum badge.',
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
    highScoresTitle: 'HOP-MAP by COBEER TASTE',
    tabGlobal: 'GLOBAL',
    tabFriends: 'AMIGOS',
    tabTiers: 'NÍVEIS',
    tabSpotsTiers: 'MAPA / SPOTS',
    shareRanking: 'PARTILHAR RANKING',
    closeScoreModal: '[ FECHAR ]',

    // Profile & Settings
    profileTitle: 'Perfil do Cervejeiro',
    checkinHistoryTitle: 'Histórico de Check-ins',
    checkinHistorySubtitle: 'Recorda os teus percursos e visitas aos spots de cerveja artesanal',
    noCheckinsYet: 'Ainda não fizeste nenhum check-in em spots.',
    noCheckinsSub: 'Visita um spot no mapa e faz o teu primeiro check-in a menos de 50m!',
    checkinDateLabel: 'Data da visita',
    totalCheckinsLabel: 'Total de Visitas',
    viewSpotOnMap: 'Ver no mapa',
    biometricsConfirm: 'Confirmação Biométrica (Face ID / Touch ID)',
    logoutButton: 'Terminar Sessão',
    deleteAccountButton: 'Remover Conta',
    deleteAccountTitle: 'Eliminar Conta Permanentemente',
    deleteAccountWarning: 'Tens a certeza de que desejas remover a tua conta? Esta ação é irreversível e todos os teus dados, pontos HOPS, selos, check-ins, amizades e registos na base de dados serão eliminados definitivamente.',
    deleteAccountConfirmBtn: 'Sim, Eliminar Tudo',
    deleteAccountCancelBtn: 'Cancelar',
    deleteAccountProcessing: 'A eliminar conta e dados...',
    deleteAccountSuccessTitle: 'Conta Removida',
    deleteAccountSuccessMsg: 'A tua conta e todos os respetivos dados foram eliminados com sucesso.',
    deleteAccountError: 'Erro ao remover a conta. Por favor tenta novamente.',
    loginRequiredNotice: 'Inicia sessão para acederes ao teu perfil completo, selos e histórico.',
    userLanguageUpdated: 'Idioma atualizado com sucesso!',
    copySpotUrl: 'Copiar Link do Spot',
    spotUrlCopied: 'Link do spot copiado para a área de transferência!',
    directSpotUrl: 'URL Direto do Spot',
    shareSpotBtn: 'Partilhar Spot',

    // Social Popup Modal
    followCobeerTaste: 'Segue Cobeer Taste',
    joinCommunity: 'Junta-te à nossa comunidade e acompanha todas as novidades nas redes sociais:',
    continueHopMap: 'Continuar HOP-MAP',

    // GPS Status
    gpsActive: 'Sinal GPS Ativo',
    gpsAccuracy: 'Precisão',
    gpsErrorMsg: 'Não foi possível obter a localização GPS.',

    // Notifications Push Titles
    checkinSuccessTitle: 'Check-in Realizado!',
    rankingCopiedTitle: 'Ranking Copiado! 📋',
    rankingCopiedMsg: 'O teu progresso HOP-MAP foi copiado para a área de transferência.',

    // Share Checkin Settings
    shareCheckinSettingTitle: 'Partilha de Check-in com Amigos',
    shareCheckinSettingDesc: 'Notificar os amigos da tua Lista de Amigos quando fizeres check-in num spot ou festival.',
    friendCheckinNotifTitle: 'Check-in de Amigo 🍻',

    // 8-Bit PIN Check-in Validation Modal
    pinModalTitle: 'VALIDAÇÃO DE CONSUMO',
    bartenderPinPrompt: 'Solicita ao barman para introduzir o PIN de consumo 🍻',
    bartenderPinSubtitle: 'Apenas o staff do spot tem o PIN de 4 dígitos para validar o teu check-in e consumo.',
    clearPin: 'LIMPAR',
    confirmPin: 'CONFIRMAR',
    invalidPin: 'PIN Inválido! Tenta novamente.',
    pinMustBe4Digits: 'Introduz os 4 dígitos do PIN.',
    alreadyCheckedInToday: '⛔ Já fizeste check-in e consumiste neste spot hoje! Volta amanhã.',
    gpsTooFar100m: 'Estás demasiado longe deste local para fazer check-in. Deves encontrar-te a menos de 100 metros do spot.',
    stageClear: 'STAGE CLEAR! 🍻',
    checkinSuccessCoin: '+1 HOP Conquistado! Consumo validado.',
    verifyingPin: 'A VALIDAR PIN...',
    verifyingGps: 'A ler coordenadas GPS nativo (raio de 100m)...',
    antiFraudNotice: '🔒 Sistema anti-fraude: Apenas consumos reais e validados pelo staff acumulam pontos HOP.',

    // Master Admin PINs Management Dashboard
    adminPinsDashboardTitle: 'PAINEL MASTER: GESTÃO DE PINS 🔑',
    adminPinsDashboardSubtitle: 'Administração central de códigos de consumo de 4 dígitos para o staff dos bares.',
    adminPinsBtn: 'Gerir PINs dos Spots',
    generatePinBtn: 'Gerar PIN',
    regeneratePinBtn: 'Novo PIN',
    copyPinBtn: 'Copiar',
    pinCopiedToast: 'PIN copiado com sucesso! 📋',
    sendPinsEmailBtn: 'Enviar Lista de PINs por E-mail 📧',
    copyAllPinsBtn: 'Copiar Lista Completa',
    allPinsCopiedToast: 'Lista completa de PINs copiada para a área de transferência! 📋',
    searchSpotsPlaceholder: 'Pesquisar spot por nome ou cidade...',
    totalSpotsWithPins: 'Spots Registados',
    adminAccessOnly: 'Acesso restrito ao Administrador cobeertaste@gmail.com',
    pinUpdatedSuccess: 'PIN atualizado e sincronizado na base de dados!',
    generateAllMissingPins: 'Gerar PINs em Falta',
    spotPinTableSpot: 'SPOT / BAR',
    spotPinTableZone: 'CIDADE / ZONA',
    spotPinTablePin: 'PIN CHECK-IN',
    spotPinTableActions: 'AÇÕES'
  },
  EN: {
    // Auth & Login/Register Screen
    welcomeTitle: 'HOP-MAP',
    welcomeSubtitle: 'Brewer Guide & Passport',
    loginTab: 'Login',
    registerTab: 'Register',
    emailLabel: 'E-Mail',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    nameLabel: 'Username',
    namePlaceholder: 'Your name or nickname',
    loginButton: 'HOP ON',
    newSpotDiscovered: 'NEW SPOT DISCOVERED. HOP ON!',
    registerButton: 'CREATE ACCOUNT & GET 12 HOPS 🍻',
    forgotPassword: 'Forgot password?',
    resetPasswordTitle: 'Reset Password',
    resetPasswordDesc: 'Enter your email address to receive password reset instructions.',
    sendResetEmail: 'Send Reset Email',
    cancel: 'Cancel',
    firebaseNotConfigured: 'Firebase is not configured. Please enable Firebase in AI Studio.',
    fillRequiredFields: 'Please fill in all required fields.',
    passMinLength: 'Password must be at least 6 characters.',
    enterEmailPass: 'Please enter email and password.',
    accountCreatedTitle: 'Account Created! 🍻',
    welcomeBackTitle: 'Logged In! 🍻',
    welcomeBackMsg: 'Welcome back to your Hop-Map guide!',
    loginTermsAgreement: 'By signing in you agree to share your location to discover the craft beer spots across Portugal.',
    drinkResponsibly: 'Drink Responsibly',
    recoveryEmailSent: 'Recovery email sent! Check your inbox (and your spam folder).',
    recoveryPushTitle: 'Password Recovery',
    recoveryPushBody: 'Instructions sent to your email.',
    doneBtn: 'Done',
    sendingBtn: 'Sending...',
    recoverBtn: 'Recover',

    // Navigation Tabs
    tabMap: 'SPOTS',
    tabFestivals: 'FESTIVALS',
    tabRoutes: 'HOP ROUTE',
    tabRankings: 'HIGH SCORES',
    tabProfile: 'PROFILE',

    // Header & Global UI
    hopsUnit: 'HOPS',
    languageLabel: 'Language',
    appLanguage: 'Language',
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
    spotsConquered: 'Spots Conquered',
    badgesUnlockedLabel: 'Badges Unlocked',
    globalRankLabel: 'Global Rank',
    viewAllBadges: 'View All Badges',
    noBadgesEarnedYet: 'No badges earned yet.',
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
    highScoresTitle: 'HOP-MAP by COBEER TASTE',
    tabGlobal: 'GLOBAL',
    tabFriends: 'FRIENDS',
    tabTiers: 'LEVELS',
    tabSpotsTiers: 'SPOTS LEVELS',
    shareRanking: 'SHARE RANKING',
    closeScoreModal: '[ CLOSE ]',

    // Profile & Settings
    profileTitle: 'Brewer Profile',
    checkinHistoryTitle: 'Check-in History',
    checkinHistorySubtitle: 'Recall your craft beer journeys and spot visits',
    noCheckinsYet: 'You haven\'t checked in to any spots yet.',
    noCheckinsSub: 'Visit a spot on the map and complete your first check-in within 50m!',
    checkinDateLabel: 'Visit date',
    totalCheckinsLabel: 'Total Visits',
    viewSpotOnMap: 'View on map',
    biometricsConfirm: 'Biometric Confirmation (Face ID / Touch ID)',
    logoutButton: 'Log Out',
    deleteAccountButton: 'Delete Account',
    deleteAccountTitle: 'Permanently Delete Account',
    deleteAccountWarning: 'Are you sure you want to delete your account? This action is irreversible and all your data, HOPS points, stamps, check-ins, friendships, and database records will be permanently erased.',
    deleteAccountConfirmBtn: 'Yes, Delete Everything',
    deleteAccountCancelBtn: 'Cancel',
    deleteAccountProcessing: 'Deleting account and data...',
    deleteAccountSuccessTitle: 'Account Deleted',
    deleteAccountSuccessMsg: 'Your account and all associated data have been permanently removed.',
    deleteAccountError: 'Failed to delete account. Please try again.',
    loginRequiredNotice: 'Log in to access your full profile, stamps, and history.',
    userLanguageUpdated: 'Language updated successfully!',
    copySpotUrl: 'Copy Spot Link',
    spotUrlCopied: 'Spot link copied to clipboard!',
    directSpotUrl: 'Direct Spot URL',
    shareSpotBtn: 'Share Spot',

    // Social Popup Modal
    followCobeerTaste: 'Follow Cobeer Taste',
    joinCommunity: 'Join our community and stay updated on social media:',
    continueHopMap: 'Continue HOP-MAP',

    // GPS Status
    gpsActive: 'GPS Signal Active',
    gpsAccuracy: 'Accuracy',
    gpsErrorMsg: 'Could not obtain GPS location.',

    // Notifications Push Titles
    checkinSuccessTitle: 'Check-in Complete!',
    rankingCopiedTitle: 'Ranking Copied! 📋',
    rankingCopiedMsg: 'Your HOP-MAP progress was copied to clipboard.',

    // Share Checkin Settings
    shareCheckinSettingTitle: 'Share Check-in with Friends',
    shareCheckinSettingDesc: 'Notify friends on your Friend List when you check in at any spot or festival.',
    friendCheckinNotifTitle: 'Friend Check-in 🍻',

    // 8-Bit PIN Check-in Validation Modal
    pinModalTitle: 'CONSUMPTION VALIDATION',
    bartenderPinPrompt: 'Ask the bartender to enter the consumption PIN 🍻',
    bartenderPinSubtitle: 'Only spot staff have the 4-digit PIN to validate your check-in and consumption.',
    clearPin: 'CLEAR',
    confirmPin: 'CONFIRM',
    invalidPin: 'Invalid PIN! Please try again.',
    pinMustBe4Digits: 'Enter the 4-digit PIN.',
    alreadyCheckedInToday: '⛔ You have already checked in and consumed at this spot today! Come back tomorrow.',
    gpsTooFar100m: 'You are too far from this location to check in. You must be within 100 meters of the spot.',
    stageClear: 'STAGE CLEAR! 🍻',
    checkinSuccessCoin: '+1 HOP Earned! Consumption validated.',
    verifyingPin: 'VERIFYING PIN...',
    verifyingGps: 'Reading native GPS coordinates (100m radius)...',
    antiFraudNotice: '🔒 Anti-fraud system: Only real consumptions validated by staff earn HOP points.',

    // Master Admin PINs Management Dashboard
    adminPinsDashboardTitle: 'MASTER ADMIN: SPOT PINS 🔑',
    adminPinsDashboardSubtitle: 'Central 4-digit consumption check-in PIN management for bar staff and administrators.',
    adminPinsBtn: 'Manage Spot PINs',
    generatePinBtn: 'Generate PIN',
    regeneratePinBtn: 'New PIN',
    copyPinBtn: 'Copy',
    pinCopiedToast: 'PIN copied to clipboard! 📋',
    sendPinsEmailBtn: 'Send PINs List by Email 📧',
    copyAllPinsBtn: 'Copy Full List',
    allPinsCopiedToast: 'Full PINs list copied to clipboard! 📋',
    searchSpotsPlaceholder: 'Search spot by name or city...',
    totalSpotsWithPins: 'Registered Spots',
    adminAccessOnly: 'Restricted access for Administrator cobeertaste@gmail.com',
    pinUpdatedSuccess: 'PIN updated and synced to database!',
    generateAllMissingPins: 'Generate Missing PINs',
    spotPinTableSpot: 'SPOT / BAR',
    spotPinTableZone: 'CITY / ZONE',
    spotPinTablePin: 'CHECK-IN PIN',
    spotPinTableActions: 'ACTIONS'
  }
};

/**
 * Get translated text for key.
 */
export function t(key: keyof typeof translations['PT'], lang: Language = 'PT'): string {
  const dict = translations[lang] || translations.PT;
  return dict[key] || translations.PT[key] || key;
}

export function getBarDescription(bar: { id?: string; name?: string; description?: string; descriptionPT?: string; descriptionEN?: string }, lang: Language = 'PT'): string {
  if (lang === 'EN') {
    if (bar.descriptionEN && bar.descriptionEN !== bar.descriptionPT && bar.descriptionEN !== bar.description) {
      return bar.descriptionEN;
    }
    if (bar.id && SPOT_DESCRIPTIONS_EN_BY_ID[bar.id]) {
      return SPOT_DESCRIPTIONS_EN_BY_ID[bar.id];
    }
    const ptDesc = bar.descriptionPT || bar.description || '';
    return translateDescToEN(ptDesc, bar.name);
  }
  return bar.descriptionPT || bar.description || '';
}

export function translateDescToEN(pt: string, name?: string): string {
  if (!pt) return '';

  // Check direct lookup in descriptions table if exists
  for (const [id, enText] of Object.entries(SPOT_DESCRIPTIONS_EN_BY_ID)) {
    // If exact or close match
  }

  // Common phrases and automatic substitutions
  let translated = pt
    .replace(/Consultar horários no site oficial\./g, 'Check working hours on official website.')
    .replace(/ponto de referência para os amantes de cerveja artesanal em ([^.]+)/gi, 'premier destination for craft beer lovers in $1')
    .replace(/ponto de referência para os amantes de cerveja artesanal/gi, 'reference spot for craft beer lovers')
    .replace(/Cerveja artesanal fruto da paixão pela bebida, com o desejo de proporcionar uma experiência diferente\./gi, 'Craft beer born from a passion for the drink, aiming to deliver a unique experience.')
    .replace(/Oferecem vários estilos, como/gi, 'They offer various styles, such as')
    .replace(/Brewpub da marca de cerveja artesanal ([^.]+)\. Serve as cervejas da casa em torneira, acompanhadas de comida\./gi, 'Brewpub for $1 craft beer. Pours house beers on tap paired with food.')
    .replace(/Cerveja artesanal/gi, 'Craft beer')
    .replace(/cervejas artesanais/gi, 'craft beers')
    .replace(/cerveja artesanal/gi, 'craft beer')
    .replace(/com foco em/gi, 'with a focus on')
    .replace(/e petiscos/gi, 'and snacks')
    .replace(/ao ar livre/gi, 'outdoors')
    .replace(/Fins de Semana/gi, 'Weekends')
    .replace(/segunda a sexta/gi, 'Monday to Friday')
    .replace(/sabado e domingo/gi, 'Saturday and Sunday');

  return translated;
}

export function getBarWorkingHours(bar: { workingHours: string; workingHoursPT?: string; workingHoursEN?: string }, lang: Language = 'PT'): string {
  if (lang === 'EN') {
    if (bar.workingHoursEN && bar.workingHoursEN !== bar.workingHoursPT) {
      return bar.workingHoursEN;
    }
    const pt = bar.workingHoursPT || bar.workingHours || '';
    if (pt.includes('Consultar horários')) return 'Check working hours on official website.';
    return pt
      .replace(/Segunda/gi, 'Monday')
      .replace(/Terça/gi, 'Tuesday')
      .replace(/Quarta/gi, 'Wednesday')
      .replace(/Quinta/gi, 'Thursday')
      .replace(/Sexta/gi, 'Friday')
      .replace(/Sábado/gi, 'Saturday')
      .replace(/Domingo/gi, 'Sunday')
      .replace(/às/gi, 'to')
      .replace(/a /gi, 'to ');
  }
  return bar.workingHoursPT || bar.workingHours;
}

export function getEventDescription(ev: { description: string }, lang: Language = 'PT'): string {
  if (lang !== 'EN') return ev.description;
  const map: Record<string, string> = {
    'O festival de cerveja artesanal BASH Beer Fest celebra a inovação e o espírito craft de produtores de elite.': 'The BASH Beer Fest craft beer festival celebrates innovation and the craft spirit of elite producers.',
    'Aveiro transforma-se na capital da cerveja artesanal com as melhores marcas nacionais, petiscos e música ao vivo.': 'Aveiro transforms into the capital of craft beer with top national brands, snacks, and live music.',
    'No prestigiado quarteirão cultural WOW em Vila Nova de Gaia, uma experiência sofisticada de cervejas e gastronomia.': 'In the prestigious WOW cultural district in Vila Nova de Gaia, a sophisticated beer and gastronomy experience.',
    'O mercado de cerveja traz os melhores produtores artesanais e muita animação descontraída ao coração da Maia.': 'The beer market brings top craft producers and lively entertainment to the heart of Maia.',
    'O festival urbano HOPEN em Braga reúne cerveja de excelência, street food incrível e um cartaz musical de primeira linha.': 'The HOPEN urban festival in Braga brings together excellent beer, amazing street food, and a top music lineup.',
    'Uma atmosfera rústica e acolhedora em Braga para saborear a ligação direta entre a tradição rural e a mestria cervejeira.': 'A rustic and welcoming atmosphere in Braga to savor the connection between rural tradition and brewing mastery.',
    'Cerveja artesanal fresca e o melhor ambiente na histórica e marítima cidade de Viana do Castelo.': 'Fresh craft beer and the best atmosphere in the historic coastal city of Viana do Castelo.',
    'O maior festival de cerveja artesanal ao ar livre da Península Ibérica está de volta! Mais de 40 cervejeiras mundiais e nacionais pelas históricas ruas de Caminha.': 'The largest outdoor craft beer festival in the Iberian Peninsula is back! Over 40 global and national breweries across the historic streets of Caminha.',
    'Um refrescante festival costeiro na bela Praia do Furadouro, com muito mar, sol e excelentes cervejas artesanais.': 'A refreshing coastal festival at beautiful Furadouro Beach, with plenty of sea, sun, and excellent craft beers.',
    'Um belíssimo festival no jardim histórico de Castelo de Vide, combinando a pacatez alentejana com lúpulo fresco.': 'A beautiful festival in the historic garden of Castelo de Vide, combining Alentejo peace with fresh hops.',
    'O prestigiado festival Brew! regressa a Coimbra no belo Parque Verde do Mondego com muita animação e os melhores brewers do país.': 'The prestigious Brew! festival returns to Coimbra at the beautiful Parque Verde do Mondego with great entertainment and the country\'s top brewers.',
    'O tradicional evento de inverno que junta cervejas artesanais raras, gastronomia de conforto e um ambiente caloroso em Lisboa.': 'The traditional winter event bringing together rare craft beers, comfort food, and a warm atmosphere in Lisbon.',
    'Caldas da Rainha acolhe este festival dinâmico que celebra o movimento craft com provas, concertos e street food.': 'Caldas da Rainha hosts this dynamic festival celebrating the craft movement with tastings, concerts, and street food.',
    'O grande encontro de apaixonados pela cerveja em Linhó, promovendo a partilha, workshops e os lançamentos mais recentes.': 'The great gathering of beer lovers in Linhó, promoting sharing, workshops, and the latest releases.',
    'Uma festa vibrante celebrando a melhor cerveja artesanal em Borba de Montanha, com street food fantástica e grandes concertos.': 'A vibrant festival celebrating the best craft beer in Borba de Montanha, with fantastic street food and great concerts.',
    'O maior festival urbano de cerveja artesanal no Porto, reunindo dezenas de cervejeiras nacionais e internacionais de referência.': 'The largest urban craft beer festival in Porto, bringing together dozens of leading national and international breweries.',
    'O castelo medieval e as ruas de Santa Maria da Feira enchem-se de animação, sabores maltados e lúpulo fresco.': 'The medieval castle and streets of Santa Maria da Feira fill with excitement, malty flavors, and fresh hops.',
    'Grande celebração do movimento craft em Famalicão com excelentes produtores nacionais, gastronomia regional e muito convívio.': 'Great celebration of the craft movement in Famalicão with top national producers, regional gastronomy, and socializing.',
    'A histórica cidade de Silves recebe este festival incrível no Algarve, aliando o património à paixão pela cerveja artesanal.': 'The historic city of Silves hosts this incredible festival in the Algarve, combining heritage with passion for craft beer.',
    'Um evento alternativo em Lisboa, focado na cultura independente da cerveja de autor, arte e boa música.': 'An alternative event in Lisbon, focusing on independent craft culture, art, and good music.',
    'Homenagem à história e tradição na Póvoa de Lanhoso com os melhores produtores artesanais e animação popular.': 'Tribute to history and tradition in Póvoa de Lanhoso with top craft producers and popular entertainment.',
    'A Amadora acolhe o seu festival anual de cerveja artesanal, trazendo as novidades do setor e deliciosas harmonizações gastronómicas.': 'Amadora hosts its annual craft beer festival, bringing industry updates and delicious food pairings.',
    'O festival anual de colheita do lúpulo da Cerveja Letra em Vila Verde. Uma celebração da terra e da cerveja fresca diretamente da origem.': 'The annual hop harvest festival of Cerveja Letra in Vila Verde. A celebration of land and fresh beer straight from the source.',
    'O festival dinâmico que junta artesãos da cerveja e artes tradicionais em Alvaiázere para um dia inesquecível de partilha.': 'The dynamic festival bringing together beer artisans and traditional crafts in Alvaiázere for an unforgettable day.',
    'O encanto do Arco de Baúlhe combinado com os melhores aromas do malte e do lúpulo nacionais.': 'The charm of Arco de Baúlhe combined with the finest aromas of national malt and hops.',
    'Ondas, surf e excelente cerveja artesanal na vila pitoresca e costeira da Ericeira.': 'Waves, surfing, and excellent craft beer in the picturesque coastal village of Ericeira.',
    'Inspirado no tradicional festival de Munique, com reinterpretação artesanal portuguesa de excelência em Lisboa.': 'Inspired by the traditional Munich festival, with an excellent Portuguese craft reinterpretation in Lisbon.',
    'Uma belíssima celebração no coração do Alentejo, reunindo a história milenar de Évora à paixão pela cerveja craft.': 'A beautiful celebration in the heart of Alentejo, combining Évora\'s ancient history with passion for craft beer.'
  };
  return map[ev.description] || ev.description;
}

export function getEventDate(ev: { date: string }, lang: Language = 'PT'): string {
  if (lang !== 'EN') return ev.date;
  if (ev.date === 'Sem data') return 'TBD';
  return ev.date
    .replace('de Maio de', 'May')
    .replace('de Junho de', 'June')
    .replace('de Julho de', 'July')
    .replace('de Agosto de', 'August')
    .replace('de Agosto', 'August')
    .replace('de Setembro de', 'September')
    .replace('de Outubro de', 'October')
    .replace('de Novembro de', 'November')
    .replace('de Dezembro de', 'December')
    .replace('de Janeiro de', 'January')
    .replace('de Fevereiro a', 'February to')
    .replace('de Março de', 'March')
    .replace('de Março', 'March')
    .replace('de Abril de', 'April')
    .replace(' a ', ' to ');
}

export function getBarBeerNews(bar: { latestBeerRelease?: string; latestBeerReleasePT?: string; latestBeerReleaseEN?: string }, lang: Language = 'PT'): string | null {
  if (lang === 'EN') {
    return bar.latestBeerReleaseEN || bar.latestBeerRelease || null;
  }
  return bar.latestBeerReleasePT || bar.latestBeerRelease || null;
}


