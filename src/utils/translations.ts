
export type Language = 'fr' | 'en' | 'es' | 'ar' | 'sw';

export type TranslationKeys = {
  welcome: string;
  trackContributions: string;
  createNewGroup: string;
  totalContributions: string;
  availableBalance: string;
  activeGroups: string;
  nextPayout: string;
  yourGroups: string;
  viewAll: string;
  paymentCalendar: string;
  recentMembers: string;
  recentActivity: string;
  receivedPayout: string;
  joinedGroup: string;
  madeContribution: string;
  hoursAgo: string;
  yesterday: string;
  daysAgo: string;
  members: string;
  contribution: string;
  nextDue: string;
  active: string;
  pending: string;
  paid: string;
  groupName: string;
  contributionAmount: string;
  contributionFrequency: string;
  startDate: string;
  payoutMethod: string;
  inviteMembers: string;
  createGroup: string;
  weekly: string;
  biweekly: string;
  monthly: string;
  rotation: string;
  randomSelection: string;
  biddingSystem: string;
  dashboard: string;
  myGroups: string;
  profile: string;
  currency: string;
  language: string;
  settings: string;
  payments: string;
  darkMode: string;
  lightMode: string;
  pageNotFound: string;
  returnToDashboard: string;
};

type TranslationsType = {
  [key in Language]: TranslationKeys;
};

export const translations: TranslationsType = {
  en: {
    welcome: 'Welcome Back!',
    trackContributions: 'Track your tontine contributions and manage your savings groups',
    createNewGroup: 'Create New Group',
    totalContributions: 'Total Contributions',
    availableBalance: 'Available Balance',
    activeGroups: 'Active Groups',
    nextPayout: 'Next Payout',
    yourGroups: 'Your Tontine Groups',
    viewAll: 'View All',
    paymentCalendar: 'Payment Calendar',
    recentMembers: 'Recent Members',
    recentActivity: 'Recent Activity',
    receivedPayout: 'You received a payout of',
    joinedGroup: 'joined',
    madeContribution: 'You made a contribution of',
    hoursAgo: 'hours ago',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    members: 'members',
    contribution: 'Contribution',
    nextDue: 'Next Due',
    active: 'Active',
    pending: 'Pending',
    paid: 'Paid',
    groupName: 'Group Name',
    contributionAmount: 'Contribution Amount',
    contributionFrequency: 'Contribution Frequency',
    startDate: 'Start Date',
    payoutMethod: 'Payout Method',
    inviteMembers: 'Invite Members (email addresses, comma separated)',
    createGroup: 'Create Tontine Group',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    rotation: 'Rotation',
    randomSelection: 'Random Selection',
    biddingSystem: 'Bidding System',
    dashboard: 'Dashboard',
    myGroups: 'My Groups',
    profile: 'Profile',
    currency: 'Currency',
    language: 'Language',
    settings: 'Settings',
    payments: 'Payments',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    pageNotFound: 'Oops! Page not found',
    returnToDashboard: 'Return to Dashboard'
  },
  fr: {
    welcome: 'Bienvenue !',
    trackContributions: 'Suivez vos contributions à la tontine et gérez vos groupes d\'épargne',
    createNewGroup: 'Créer un Nouveau Groupe',
    totalContributions: 'Contributions Totales',
    availableBalance: 'Solde Disponible',
    activeGroups: 'Groupes Actifs',
    nextPayout: 'Prochain Versement',
    yourGroups: 'Vos Groupes de Tontine',
    viewAll: 'Voir Tout',
    paymentCalendar: 'Calendrier de Paiement',
    recentMembers: 'Membres Récents',
    recentActivity: 'Activité Récente',
    receivedPayout: 'Vous avez reçu un versement de',
    joinedGroup: 'a rejoint',
    madeContribution: 'Vous avez fait une contribution de',
    hoursAgo: 'heures',
    yesterday: 'Hier',
    daysAgo: 'jours',
    members: 'membres',
    contribution: 'Contribution',
    nextDue: 'Prochaine Échéance',
    active: 'Actif',
    pending: 'En attente',
    paid: 'Payé',
    groupName: 'Nom du Groupe',
    contributionAmount: 'Montant de la Contribution',
    contributionFrequency: 'Fréquence de Contribution',
    startDate: 'Date de Début',
    payoutMethod: 'Méthode de Versement',
    inviteMembers: 'Inviter des Membres (adresses e-mail, séparées par des virgules)',
    createGroup: 'Créer un Groupe de Tontine',
    weekly: 'Hebdomadaire',
    biweekly: 'Bimensuel',
    monthly: 'Mensuel',
    rotation: 'Rotation',
    randomSelection: 'Sélection Aléatoire',
    biddingSystem: 'Système d\'Enchères',
    dashboard: 'Tableau de Bord',
    myGroups: 'Mes Groupes',
    profile: 'Profil',
    currency: 'Devise',
    language: 'Langue',
    settings: 'Paramètres',
    payments: 'Paiements',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    pageNotFound: 'Oups ! Page non trouvée',
    returnToDashboard: 'Retourner au Tableau de Bord'
  },
  es: {
    welcome: '¡Bienvenido de Nuevo!',
    trackContributions: 'Sigue tus contribuciones a la tontina y administra tus grupos de ahorro',
    createNewGroup: 'Crear Nuevo Grupo',
    totalContributions: 'Contribuciones Totales',
    availableBalance: 'Saldo Disponible',
    activeGroups: 'Grupos Activos',
    nextPayout: 'Próximo Pago',
    yourGroups: 'Tus Grupos de Tontina',
    viewAll: 'Ver Todo',
    paymentCalendar: 'Calendario de Pagos',
    recentMembers: 'Miembros Recientes',
    recentActivity: 'Actividad Reciente',
    receivedPayout: 'Recibiste un pago de',
    joinedGroup: 'se unió a',
    madeContribution: 'Hiciste una contribución de',
    hoursAgo: 'horas atrás',
    yesterday: 'Ayer',
    daysAgo: 'días atrás',
    members: 'miembros',
    contribution: 'Contribución',
    nextDue: 'Próximo Vencimiento',
    active: 'Activo',
    pending: 'Pendiente',
    paid: 'Pagado',
    groupName: 'Nombre del Grupo',
    contributionAmount: 'Monto de Contribución',
    contributionFrequency: 'Frecuencia de Contribución',
    startDate: 'Fecha de Inicio',
    payoutMethod: 'Método de Pago',
    inviteMembers: 'Invitar Miembros (direcciones de correo, separadas por comas)',
    createGroup: 'Crear Grupo de Tontina',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    rotation: 'Rotación',
    randomSelection: 'Selección Aleatoria',
    biddingSystem: 'Sistema de Pujas',
    dashboard: 'Panel',
    myGroups: 'Mis Grupos',
    profile: 'Perfil',
    currency: 'Moneda',
    language: 'Idioma',
    settings: 'Ajustes',
    payments: 'Pagos',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    pageNotFound: '¡Ups! Página no encontrada',
    returnToDashboard: 'Volver al Panel'
  },
  ar: {
    welcome: 'مرحبًا بعودتك!',
    trackContributions: 'تتبع مساهماتك في التونتين وإدارة مجموعات التوفير الخاصة بك',
    createNewGroup: 'إنشاء مجموعة جديدة',
    totalContributions: 'إجمالي المساهمات',
    availableBalance: 'الرصيد المتاح',
    activeGroups: 'المجموعات النشطة',
    nextPayout: 'الدفعة التالية',
    yourGroups: 'مجموعات التونتين الخاصة بك',
    viewAll: 'عرض الكل',
    paymentCalendar: 'تقويم الدفع',
    recentMembers: 'الأعضاء الأخيرون',
    recentActivity: 'النشاط الأخير',
    receivedPayout: 'لقد تلقيت دفعة بقيمة',
    joinedGroup: 'انضم إلى',
    madeContribution: 'قمت بمساهمة بقيمة',
    hoursAgo: 'ساعات مضت',
    yesterday: 'الأمس',
    daysAgo: 'أيام مضت',
    members: 'الأعضاء',
    contribution: 'المساهمة',
    nextDue: 'الاستحقاق التالي',
    active: 'نشط',
    pending: 'قيد الانتظار',
    paid: 'مدفوع',
    groupName: 'اسم المجموعة',
    contributionAmount: 'مبلغ المساهمة',
    contributionFrequency: 'تكرار المساهمة',
    startDate: 'تاريخ البدء',
    payoutMethod: 'طريقة الدفع',
    inviteMembers: 'دعوة أعضاء (عناوين البريد الإلكتروني، مفصولة بفواصل)',
    createGroup: 'إنشاء مجموعة تونتين',
    weekly: 'أسبوعي',
    biweekly: 'نصف شهري',
    monthly: 'شهري',
    rotation: 'تناوب',
    randomSelection: 'اختيار عشوائي',
    biddingSystem: 'نظام المزايدة',
    dashboard: 'لوحة التحكم',
    myGroups: 'مجموعاتي',
    profile: 'الملف الشخصي',
    currency: 'العملة',
    language: 'اللغة',
    settings: 'الإعدادات',
    payments: 'المدفوعات',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    pageNotFound: 'عذراً! الصفحة غير موجودة',
    returnToDashboard: 'العودة إلى لوحة التحكم'
  },
  sw: {
    welcome: 'Karibu Tena!',
    trackContributions: 'Fuatilia michango yako ya tontine na usimamie vikundi vyako vya akiba',
    createNewGroup: 'Unda Kikundi Kipya',
    totalContributions: 'Michango Yote',
    availableBalance: 'Salio Linalotumika',
    activeGroups: 'Vikundi Vinavyofanya Kazi',
    nextPayout: 'Malipo Yajayo',
    yourGroups: 'Vikundi Vyako vya Tontine',
    viewAll: 'Tazama Vyote',
    paymentCalendar: 'Kalenda ya Malipo',
    recentMembers: 'Wanachama wa Hivi Karibuni',
    recentActivity: 'Shughuli za Hivi Karibuni',
    receivedPayout: 'Umepokea malipo ya',
    joinedGroup: 'alijiunga na',
    madeContribution: 'Umetoa mchango wa',
    hoursAgo: 'saa zilizopita',
    yesterday: 'Jana',
    daysAgo: 'siku zilizopita',
    members: 'wanachama',
    contribution: 'Mchango',
    nextDue: 'Inayofuata',
    active: 'Inayofanya Kazi',
    pending: 'Inasubiri',
    paid: 'Imelipwa',
    groupName: 'Jina la Kikundi',
    contributionAmount: 'Kiasi cha Mchango',
    contributionFrequency: 'Mara ya Mchango',
    startDate: 'Tarehe ya Kuanza',
    payoutMethod: 'Njia ya Malipo',
    inviteMembers: 'Alika Wanachama (barua pepe, zitenganishwe kwa koma)',
    createGroup: 'Unda Kikundi cha Tontine',
    weekly: 'Kila Wiki',
    biweekly: 'Kila Wiki Mbili',
    monthly: 'Kila Mwezi',
    rotation: 'Mzunguko',
    randomSelection: 'Uchaguzi wa Kinasibu',
    biddingSystem: 'Mfumo wa Zabuni',
    dashboard: 'Dashibodi',
    myGroups: 'Vikundi Vyangu',
    profile: 'Wasifu',
    currency: 'Sarafu',
    language: 'Lugha',
    settings: 'Mipangilio',
    payments: 'Malipo',
    darkMode: 'Hali ya Giza',
    lightMode: 'Hali ya Mwanga',
    pageNotFound: 'Samahani! Ukurasa haukupatikana',
    returnToDashboard: 'Rudi kwenye Dashibodi'
  }
};

// Define available currencies
export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'KES', symbol: 'Ksh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' }
];
