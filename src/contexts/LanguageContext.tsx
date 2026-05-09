import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'English' | 'Spanish' | 'Português' | 'French';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  English: {
    discover: "Discover",
    foryou: "For You",
    mylist: "My List",
    profile: "Profile",
    settings: "Settings",
    language: "Language",
    userContract: "User Agreement",
    privacyPolicy: "Privacy Policy",
    notifications: "Notifications",
    accountManagement: "Account Management",
    clearCache: "Clear cache",
    clear: "Clear",
    clearing: "Clearing cache...",
    cleared: "Cache cleared successfully!",
    clearCacheConfirm: "Are you sure you want to clear the cache?",
    yes: "Yes",
    no: "No",
    emailTaken: "This email is already in use. Please log in or delete your account.",
    deleteAccount: "Delete Account",
    confirmDeleteAccount: "Are you sure you want to delete your account? This action cannot be undone.",
    accountDeleted: "Account successfully deleted!",
    login: "Login",
    register: "Register",
    welcome: "Welcome to DramasFlix!",
    continueWithFacebook: "Continue with Facebook",
    continueWithGoogle: "Continue with Google",
    continueWithApple: "Continue with Apple",
    continueWithEmail: "Continue with Email",
    byContinuing: "By continuing, you indicate that you have read and agree to the",
    andThe: "and the",
    guest: "Guest",
    wallet: "Wallet",
    recharge: "Recharge",
    bonus: "Bonus",
    history: "History",
    unlockHistory: "Unlock History",
    bonusHistory: "Bonus History",
    helpCenter: "Help Center",
    customerService: "Customer Service",
    comments: "Comments",
    account: "Account",
    details: "Plans",
    coins: "Coins",
    earnRewards: "Earn rewards",
    earnFreeBonus: "Earn free bonus",
    watchHistory: "Watch History",
    myDownload: "My Download",
    dailyReward: "Daily reward",
    quality1080: "1080p Quality",
    download: "Download",
    allDramas: "All dramas free",
    vipDiscount: "VIP Discounts $ 245.78",
    weeklyVip: "Weekly VIP",
    forgotPassword: "Forgot password?",
    recoverPassword: "Recover Password",
    emailSent: "Recovery email sent!",
    sendRecoveryEmail: "Send Recovery Email",
    emailPlaceholder: "Enter your email"
  },
  Spanish: {
    discover: "Descubrir",
    foryou: "Para ti",
    mylist: "Mi Lista",
    profile: "Perfil",
    settings: "Configuración",
    language: "Idioma",
    userContract: "Contrato del Usuario",
    privacyPolicy: "Política de Privacidad",
    notifications: "Notificación",
    accountManagement: "Gestión de Cuenta",
    clearCache: "Limpiar caché",
    clear: "Limpiar",
    clearing: "Limpiando caché...",
    cleared: "¡Caché limpiado con éxito!",
    clearCacheConfirm: "¿Estás seguro de que quieres limpiar el caché?",
    yes: "Sí",
    no: "No",
    emailTaken: "Este e-mail ya está en uso. Inicia sesión o elimina tu cuenta.",
    deleteAccount: "Eliminar cuenta",
    confirmDeleteAccount: "¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
    accountDeleted: "¡Cuenta eliminada con éxito!",
    login: "Iniciar sesión",
    register: "Registrarse",
    welcome: "¡Bienvenido a DramasFlix!",
    continueWithFacebook: "Continuar con Facebook",
    continueWithGoogle: "Continuar con Google",
    continueWithApple: "Continuar con Apple",
    continueWithEmail: "Continuar con Email",
    byContinuing: "Al continuar, aceptas que has leído y estás de acuerdo con el",
    andThe: "y la",
    guest: "Invitado",
    wallet: "Cartera",
    recharge: "Recargas",
    bonus: "Bono",
    history: "Historial",
    unlockHistory: "Historial de Desbloqueos",
    bonusHistory: "Historial de Bonos",
    helpCenter: "Centro de Ayuda",
    customerService: "Servicio al Cliente",
    comments: "Comentarios",
    account: "Cuenta",
    details: "Planes",
    coins: "Monedas",
    earnRewards: "Gana recompensas",
    earnFreeBonus: "Gana bonos gratis",
    watchHistory: "Ver historial",
    myDownload: "Mis descargas",
    dailyReward: "Recompensa diaria",
    quality1080: "Calidad 1080p",
    download: "Descargar",
    allDramas: "Todos los dramas gra...",
    vipDiscount: "Descuentos VIP $ 245.78",
    weeklyVip: "VIP Semanal",
    forgotPassword: "¿Olvidaste tu contraseña?",
    recoverPassword: "Recuperar Contraseña",
    emailSent: "¡Correo de recuperación enviado!",
    sendRecoveryEmail: "Enviar Correo de Recuperación",
    emailPlaceholder: "Ingresa tu correo"
  },
  Português: {
    discover: "Descobrir",
    foryou: "Para você",
    mylist: "Minha Lista",
    profile: "Perfil",
    settings: "Configurações",
    language: "Idioma",
    userContract: "Contrato do Usuário",
    privacyPolicy: "Política de Privacidade",
    notifications: "Notificação",
    accountManagement: "Gestão de Conta",
    clearCache: "Limpar o cache",
    clear: "Limpar",
    clearing: "Limpando cache...",
    cleared: "Cache limpo com sucesso!",
    clearCacheConfirm: "Tem certeza que deseja limpar o cache?",
    yes: "Sim",
    no: "Não",
    emailTaken: "Esse e-mail já está em uso. Faça login ou exclua sua conta.",
    deleteAccount: "Excluir conta",
    confirmDeleteAccount: "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.",
    accountDeleted: "Conta excluída com sucesso!",
    login: "Login",
    register: "Registrar",
    welcome: "Bem-vindo ao DramasFlix!",
    continueWithFacebook: "Entrar com o Facebook",
    continueWithGoogle: "Continuar com o Google",
    continueWithApple: "Entrar com a Apple",
    continueWithEmail: "Entrar com o Email",
    byContinuing: "Se você continuar, presumiremos que você leu e concordou com o",
    andThe: "e a",
    guest: "Visitante",
    wallet: "Carteira",
    recharge: "Recargas",
    bonus: "Bônus",
    history: "Histórico",
    unlockHistory: "Histórico de Desbloqueio",
    bonusHistory: "Histórico de Bônus",
    helpCenter: "Centro de Ajuda / Q&A",
    customerService: "Serviço de Atendimento",
    comments: "Comentários",
    account: "Conta",
    details: "Planos",
    coins: "Moedas",
    earnRewards: "Ganhe recompensas",
    earnFreeBonus: "Ganhe bônus grátis",
    watchHistory: "Assistir ao histórico",
    myDownload: "Meu Download",
    dailyReward: "Recompensa diária",
    quality1080: "Qualidade 1080p",
    download: "Baixar",
    allDramas: "Todos os dramas grat...",
    vipDiscount: "Descontos VIP R$ 245,78",
    weeklyVip: "VIP Semanal",
    forgotPassword: "Esqueci minha senha",
    recoverPassword: "Recuperar Senha",
    emailSent: "E-mail de recuperação enviado!",
    sendRecoveryEmail: "Enviar E-mail de Recuperação",
    emailPlaceholder: "Digite seu e-mail"
  },
  French: {
    discover: "Découvrir",
    foryou: "Pour toi",
    mylist: "Ma Liste",
    profile: "Profil",
    settings: "Paramètres",
    language: "Langue",
    userContract: "Accord de l'utilisateur",
    privacyPolicy: "Politique de confidentialité",
    notifications: "Notifications",
    accountManagement: "Gestion du compte",
    clearCache: "Vider le cache",
    clear: "Vider",
    clearing: "Nettoyage du cache...",
    cleared: "Cache vidé avec succès!",
    clearCacheConfirm: "Êtes-vous sûr de vouloir vider le cache ?",
    yes: "Oui",
    no: "Non",
    emailTaken: "Cet e-mail est déjà utilisé. Veuillez vous connecter ou supprimer votre compte.",
    deleteAccount: "Supprimer le compte",
    confirmDeleteAccount: "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
    accountDeleted: "Compte supprimé avec succès !",
    login: "Connexion",
    register: "S'inscrire",
    welcome: "Bienvenue sur DramasFlix!",
    continueWithFacebook: "Continuer avec Facebook",
    continueWithGoogle: "Continuer avec Google",
    continueWithApple: "Continuer avec Apple",
    continueWithEmail: "Continuer avec l'e-mail",
    byContinuing: "En continuant, vous indiquez que vous avez lu et accepté le",
    andThe: "et la",
    guest: "Invité",
    wallet: "Portefeuille",
    recharge: "Recharger",
    bonus: "Bonus",
    history: "Historique",
    unlockHistory: "Historique de déblocage",
    bonusHistory: "Historique des bonus",
    helpCenter: "Centre d'aide",
    customerService: "Service client",
    comments: "Commentaires",
    account: "Compte",
    details: "Forfaits",
    coins: "Pièces",
    earnRewards: "Gagner des récomp.",
    earnFreeBonus: "Gagner un bonus",
    watchHistory: "Historique",
    myDownload: "Mes téléchargements",
    dailyReward: "Récompense quoti.",
    quality1080: "Qualité 1080p",
    download: "Télécharger",
    allDramas: "Tous les drames",
    vipDiscount: "Réduction VIP 245,78 €",
    weeklyVip: "VIP Hebdomadaire",
    forgotPassword: "Mot de passe oublié ?",
    recoverPassword: "Récupérer le mot de passe",
    emailSent: "E-mail de récupération envoyé !",
    sendRecoveryEmail: "Envoyer l'e-mail de récupération",
    emailPlaceholder: "Entrez votre e-mail"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('Português');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('dramasflix-language');
    if (savedLanguage && ['English', 'Spanish', 'Português', 'French'].includes(savedLanguage)) {
      setLanguageState(savedLanguage as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dramasflix-language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
