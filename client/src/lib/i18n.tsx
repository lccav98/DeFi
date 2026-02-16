import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "es" | "pt";

const translations = {
  nav: {
    dashboard: { en: "Dashboard", es: "Panel", pt: "Painel" },
    investments: { en: "Investments", es: "Inversiones", pt: "Investimentos" },
    transactions: { en: "Transactions", es: "Transacciones", pt: "Transações" },
    settings: { en: "Settings", es: "Configuración", pt: "Configurações" },
    logOut: { en: "Log Out", es: "Cerrar Sesión", pt: "Sair" },
  },
  auth: {
    title: { en: "DeFi Direct", es: "DeFi Direct", pt: "DeFi Direct" },
    welcomeBack: { en: "Welcome back. Sign in to continue.", es: "Bienvenido. Inicia sesión para continuar.", pt: "Bem-vindo de volta. Entre para continuar." },
    createAccount: { en: "Create your account to start earning.", es: "Crea tu cuenta para comenzar a ganar.", pt: "Crie sua conta para começar a ganhar." },
    displayName: { en: "Display Name", es: "Nombre para mostrar", pt: "Nome de exibição" },
    username: { en: "Username", es: "Usuario", pt: "Usuário" },
    password: { en: "Password", es: "Contraseña", pt: "Senha" },
    signIn: { en: "Sign In", es: "Iniciar Sesión", pt: "Entrar" },
    createAccountBtn: { en: "Create Account", es: "Crear Cuenta", pt: "Criar Conta" },
    noAccount: { en: "Don't have an account? Create one", es: "¿No tienes cuenta? Crea una", pt: "Não tem conta? Crie uma" },
    hasAccount: { en: "Already have an account? Sign in", es: "¿Ya tienes cuenta? Inicia sesión", pt: "Já tem conta? Entre" },
    errorExists: { en: "Username already exists", es: "El usuario ya existe", pt: "Usuário já existe" },
    errorInvalid: { en: "Invalid credentials", es: "Credenciales inválidas", pt: "Credenciais inválidas" },
    errorGeneric: { en: "Something went wrong", es: "Algo salió mal", pt: "Algo deu errado" },
    error: { en: "Error", es: "Error", pt: "Erro" },
  },
  dashboard: {
    title: { en: "Dashboard", es: "Panel", pt: "Painel" },
    welcomeBack: { en: "Welcome back, {name}. Your portfolio is growing.", es: "Bienvenido, {name}. Tu portafolio está creciendo.", pt: "Bem-vindo, {name}. Seu portfólio está crescendo." },
    networkStatus: { en: "Network Status: Optimal", es: "Estado de Red: Óptimo", pt: "Status da Rede: Ótimo" },
    totalPortfolio: { en: "Total Portfolio Value", es: "Valor Total del Portafolio", pt: "Valor Total do Portfólio" },
    loading: { en: "Loading...", es: "Cargando...", pt: "Carregando..." },
    quickDeposit: { en: "Quick Deposit", es: "Depósito Rápido", pt: "Depósito Rápido" },
    startEarning: { en: "Start Earning", es: "Comienza a Ganar", pt: "Comece a Ganhar" },
    automatedBridge: { en: "Automated bridge & stake via PIX", es: "Puente y stake automático vía PIX", pt: "Bridge e stake automático via PIX" },
    yieldOpportunities: { en: "Yield Opportunities", es: "Oportunidades de Rendimiento", pt: "Oportunidades de Rendimento" },
    duration: { en: "Duration", es: "Duración", pt: "Duração" },
    recommended: { en: "RECOMMENDED", es: "RECOMENDADO", pt: "RECOMENDADO" },
    minInvest: { en: "Min. Invest", es: "Inv. Mínima", pt: "Inv. Mínimo" },
    recentActivity: { en: "Recent Activity", es: "Actividad Reciente", pt: "Atividade Recente" },
    noTransactions: { en: "No transactions yet", es: "Sin transacciones aún", pt: "Nenhuma transação ainda" },
    firstDeposit: { en: "Make your first deposit to start earning yield.", es: "Haz tu primer depósito para empezar a ganar.", pt: "Faça seu primeiro depósito para começar a ganhar." },
  },
  plans: {
    months3: { en: "3 Months", es: "3 Meses", pt: "3 Meses" },
    months6: { en: "6 Months", es: "6 Meses", pt: "6 Meses" },
    months12: { en: "12 Months", es: "12 Meses", pt: "12 Meses" },
    low: { en: "Low", es: "Bajo", pt: "Baixo" },
    medium: { en: "Medium", es: "Medio", pt: "Médio" },
    mediumHigh: { en: "Medium-High", es: "Medio-Alto", pt: "Médio-Alto" },
  },
  transactions: {
    title: { en: "Transactions", es: "Transacciones", pt: "Transações" },
    subtitle: { en: "View your complete deposit and yield history.", es: "Consulta tu historial completo de depósitos y rendimientos.", pt: "Veja seu histórico completo de depósitos e rendimentos." },
    history: { en: "History", es: "Historial", pt: "Histórico" },
    noTransactions: { en: "No transactions yet", es: "Sin transacciones aún", pt: "Nenhuma transação ainda" },
    emptySubtitle: { en: "Your deposit and yield history will appear here.", es: "Tu historial de depósitos y rendimientos aparecerá aquí.", pt: "Seu histórico de depósitos e rendimentos aparecerá aqui." },
  },
  investments: {
    title: { en: "Investment Plans", es: "Planes de Inversión", pt: "Planos de Investimento" },
    subtitle: { en: "Choose the best yield strategy for your goals.", es: "Elige la mejor estrategia de rendimiento.", pt: "Escolha a melhor estratégia de rendimento." },
    mostPopular: { en: "Most Popular", es: "Más Popular", pt: "Mais Popular" },
    lock: { en: "Lock", es: "Bloqueo", pt: "Bloqueio" },
    riskLevel: { en: "Risk Level:", es: "Nivel de Riesgo:", pt: "Nível de Risco:" },
    autoCompound: { en: "Automated compounding daily", es: "Capitalización automática diaria", pt: "Capitalização automática diária" },
    noGasFees: { en: "No gas fees for deposits", es: "Sin comisiones de gas para depósitos", pt: "Sem taxas de gas para depósitos" },
    instantWithdraw: { en: "Instant withdrawal (with 2% fee)", es: "Retiro instantáneo (con 2% de comisión)", pt: "Saque instantâneo (com taxa de 2%)" },
    startInvesting: { en: "Start Investing", es: "Comenzar a Invertir", pt: "Começar a Investir" },
    activePositions: { en: "Your Active Positions", es: "Tus Posiciones Activas", pt: "Suas Posições Ativas" },
    assetProtocol: { en: "Asset / Protocol", es: "Activo / Protocolo", pt: "Ativo / Protocolo" },
    amountStaked: { en: "Amount Staked", es: "Monto en Stake", pt: "Valor em Stake" },
    currentValue: { en: "Current Value", es: "Valor Actual", pt: "Valor Atual" },
    apyYield: { en: "APY / Yield", es: "APY / Rendimiento", pt: "APY / Rendimento" },
    actions: { en: "Actions", es: "Acciones", pt: "Ações" },
    noActive: { en: "No active investments", es: "Sin inversiones activas", pt: "Nenhum investimento ativo" },
    depositToEarn: { en: "Deposit via PIX to start earning yield.", es: "Deposita vía PIX para comenzar a ganar.", pt: "Deposite via PIX para começar a ganhar." },
    initialDeposit: { en: "Initial Deposit", es: "Depósito Inicial", pt: "Depósito Inicial" },
    network: { en: "Network", es: "Red", pt: "Rede" },
    withdraw: { en: "Withdraw", es: "Retirar", pt: "Sacar" },
    closedPositions: { en: "Closed Positions", es: "Posiciones Cerradas", pt: "Posições Encerradas" },
    withdrawn: { en: "Withdrawn", es: "Retirado", pt: "Sacado" },
  },
  settings: {
    title: { en: "Settings", es: "Configuración", pt: "Configurações" },
    subtitle: { en: "Manage your account preferences and security.", es: "Administra tus preferencias y seguridad.", pt: "Gerencie suas preferências e segurança." },
    noKyc: { en: "No-KYC", es: "Sin-KYC", pt: "Sem-KYC" },
    privacyFirst: { en: "Privacy First", es: "Privacidad Primero", pt: "Privacidade em Primeiro" },
    notifications: { en: "Notifications", es: "Notificaciones", pt: "Notificações" },
    depositConfirmations: { en: "Deposit Confirmations", es: "Confirmaciones de Depósito", pt: "Confirmações de Depósito" },
    depositConfirmationsDesc: { en: "Receive alerts when your PIX deposits arrive.", es: "Recibe alertas cuando lleguen tus depósitos PIX.", pt: "Receba alertas quando seus depósitos PIX chegarem." },
    yieldUpdates: { en: "Yield Updates", es: "Actualizaciones de Rendimiento", pt: "Atualizações de Rendimento" },
    yieldUpdatesDesc: { en: "Daily summary of your earnings.", es: "Resumen diario de tus ganancias.", pt: "Resumo diário dos seus ganhos." },
    newOpportunities: { en: "New Opportunities", es: "Nuevas Oportunidades", pt: "Novas Oportunidades" },
    newOpportunitiesDesc: { en: "Alerts for high-APY pools.", es: "Alertas de pools con alto APY.", pt: "Alertas de pools com alto APY." },
    securityPrivacy: { en: "Security & Privacy", es: "Seguridad y Privacidad", pt: "Segurança e Privacidade" },
    biometricLogin: { en: "Biometric Login", es: "Inicio Biométrico", pt: "Login Biométrico" },
    biometricLoginDesc: { en: "Use FaceID/TouchID to access the app.", es: "Usa FaceID/TouchID para acceder.", pt: "Use FaceID/TouchID para acessar." },
    privacyMode: { en: "Privacy Mode", es: "Modo Privacidad", pt: "Modo Privacidade" },
    privacyModeDesc: { en: "Hide balances when opening the app.", es: "Ocultar saldos al abrir la app.", pt: "Ocultar saldos ao abrir o app." },
    changePassword: { en: "Change Password", es: "Cambiar Contraseña", pt: "Alterar Senha" },
    twoFactor: { en: "Two-Factor Authentication (2FA)", es: "Autenticación de Dos Factores (2FA)", pt: "Autenticação de Dois Fatores (2FA)" },
    language: { en: "Language", es: "Idioma", pt: "Idioma" },
    languageDesc: { en: "Choose your preferred language.", es: "Elige tu idioma preferido.", pt: "Escolha seu idioma preferido." },
  },
  deposit: {
    investViaPix: { en: "Invest via PIX", es: "Invertir vía PIX", pt: "Investir via PIX" },
    scanPay: { en: "Scan & Pay", es: "Escanear y Pagar", pt: "Escanear e Pagar" },
    automatingDefi: { en: "Automating DeFi...", es: "Automatizando DeFi...", pt: "Automatizando DeFi..." },
    investmentActive: { en: "Investment Active!", es: "¡Inversión Activa!", pt: "Investimento Ativo!" },
    amountBrl: { en: "Amount (BRL)", es: "Monto (BRL)", pt: "Valor (BRL)" },
    minAmount: { en: "Min: R$ 50.00", es: "Mín: R$ 50.00", pt: "Mín: R$ 50,00" },
    grossUsd: { en: "Gross USD Value", es: "Valor Bruto USD", pt: "Valor Bruto USD" },
    platformFee: { en: "Platform Fee", es: "Comisión de Plataforma", pt: "Taxa da Plataforma" },
    netStaked: { en: "Net Staked Amount", es: "Monto Neto en Stake", pt: "Valor Líquido em Stake" },
    estApy: { en: "Est. APY", es: "APY Est.", pt: "APY Est." },
    generatePix: { en: "Generate PIX Code", es: "Generar Código PIX", pt: "Gerar Código PIX" },
    payWithPix: { en: "Pay with PIX", es: "Pagar con PIX", pt: "Pagar com PIX" },
    payWithApp: { en: "Pay with your banking app", es: "Paga con tu app bancaria", pt: "Pague com seu app bancário" },
    copyPix: { en: "Copy PIX Code", es: "Copiar Código PIX", pt: "Copiar Código PIX" },
    waitingPayment: { en: "Waiting for payment...", es: "Esperando pago...", pt: "Aguardando pagamento..." },
    pixRedirect: { en: "Complete the PIX payment in the Stripe window. Once paid, your investment will start automatically.", es: "Completa el pago PIX en la ventana de Stripe. Una vez pagado, tu inversión comenzará automáticamente.", pt: "Complete o pagamento PIX na janela do Stripe. Após o pagamento, seu investimento será iniciado automaticamente." },
    confirmingPayment: { en: "Confirming your payment...", es: "Confirmando tu pago...", pt: "Confirmando seu pagamento..." },
    paymentConfirmed: { en: "Payment confirmed! Starting DeFi pipeline...", es: "¡Pago confirmado! Iniciando pipeline DeFi...", pt: "Pagamento confirmado! Iniciando pipeline DeFi..." },
    paymentFailed: { en: "Payment failed or was cancelled", es: "El pago falló o fue cancelado", pt: "Pagamento falhou ou foi cancelado" },
    tryAgain: { en: "Try Again", es: "Intentar de Nuevo", pt: "Tentar Novamente" },
    stripeSecure: { en: "Payment secured by Stripe", es: "Pago asegurado por Stripe", pt: "Pagamento protegido por Stripe" },
    cpfRequired: { en: "Required for PIX payments in Brazil", es: "Requerido para pagos PIX en Brasil", pt: "Obrigatório para pagamentos PIX no Brasil" },
    depositBtn: { en: "Deposit PIX & Start Earning", es: "Depositar PIX y Ganar", pt: "Depositar PIX e Ganhar" },
    pixKeyCopied: { en: "PIX Key Copied", es: "Clave PIX Copiada", pt: "Chave PIX Copiada" },
    pixKeyCopiedDesc: { en: "Paste this code in your banking app to pay.", es: "Pega este código en tu app bancaria para pagar.", pt: "Cole este código no seu app bancário para pagar." },
    errorGenerating: { en: "Failed to generate PIX code", es: "Error al generar código PIX", pt: "Falha ao gerar código PIX" },
    successTitle: { en: "Investment Active!", es: "¡Inversión Activa!", pt: "Investimento Ativo!" },
    successDesc: { en: "Your funds have been successfully bridged and staked.", es: "Tus fondos han sido bridged y staked exitosamente.", pt: "Seus fundos foram bridged e staked com sucesso." },
    stakedAmount: { en: "Staked Amount", es: "Monto en Stake", pt: "Valor em Stake" },
    protocol: { en: "Protocol", es: "Protocolo", pt: "Protocolo" },
    returnDashboard: { en: "Return to Dashboard", es: "Volver al Panel", pt: "Voltar ao Painel" },
    fee: { en: "Fee", es: "Comisión", pt: "Taxa" },
    staked: { en: "Staked", es: "En Stake", pt: "Em Stake" },
    stage1: { en: "Detecting PIX Deposit", es: "Detectando Depósito PIX", pt: "Detectando Depósito PIX" },
    stage2: { en: "Minting Digital Real (DPIX)", es: "Mintando Real Digital (DPIX)", pt: "Mintando Real Digital (DPIX)" },
    stage3: { en: "Bridging to DeFi Network", es: "Bridge a la Red DeFi", pt: "Bridge para a Rede DeFi" },
    stage4: { en: "Staking in Yield Protocol", es: "Staking en Protocolo de Yield", pt: "Staking no Protocolo de Yield" },
  },
  withdraw: {
    title: { en: "Withdraw Funds", es: "Retirar Fondos", pt: "Sacar Fundos" },
    processing: { en: "Processing...", es: "Procesando...", pt: "Processando..." },
    complete: { en: "Withdrawal Complete!", es: "¡Retiro Completado!", pt: "Saque Concluído!" },
    earlyWarningTitle: { en: "Early withdrawal", es: "Retiro anticipado", pt: "Saque antecipado" },
    earlyWarningDesc: { en: "A 2% fee applies to all withdrawals.", es: "Se aplica una comisión del 2% a todos los retiros.", pt: "Uma taxa de 2% se aplica a todos os saques." },
    positionValue: { en: "Position Value", es: "Valor de la Posición", pt: "Valor da Posição" },
    protocol: { en: "Protocol", es: "Protocolo", pt: "Protocolo" },
    withdrawalFee: { en: "Withdrawal Fee (2%)", es: "Comisión de Retiro (2%)", pt: "Taxa de Saque (2%)" },
    netAmountUsd: { en: "Net Amount (USD)", es: "Monto Neto (USD)", pt: "Valor Líquido (USD)" },
    youReceive: { en: "You Receive (BRL)", es: "Recibes (BRL)", pt: "Você Recebe (BRL)" },
    pixKeyLabel: { en: "Your PIX Key (optional)", es: "Tu Clave PIX (opcional)", pt: "Sua Chave PIX (opcional)" },
    pixKeyPlaceholder: { en: "CPF, email, phone or random key", es: "CPF, email, teléfono o clave aleatoria", pt: "CPF, email, telefone ou chave aleatória" },
    confirmBtn: { en: "Confirm Withdrawal", es: "Confirmar Retiro", pt: "Confirmar Saque" },
    processingText: { en: "Processing withdrawal", es: "Procesando retiro", pt: "Processando saque" },
    processingDesc: { en: "Unstaking → Bridging → Converting to PIX...", es: "Unstaking → Bridge → Convirtiendo a PIX...", pt: "Unstaking → Bridge → Convertendo para PIX..." },
    sentToPix: { en: "Sent to your PIX!", es: "¡Enviado a tu PIX!", pt: "Enviado para seu PIX!" },
    fundsUnstaked: { en: "Funds have been unstaked and converted.", es: "Los fondos fueron unstaked y convertidos.", pt: "Os fundos foram unstaked e convertidos." },
    amountSent: { en: "Amount Sent", es: "Monto Enviado", pt: "Valor Enviado" },
    feeCharged: { en: "Fee Charged", es: "Comisión Cobrada", pt: "Taxa Cobrada" },
    returnInvestments: { en: "Return to Investments", es: "Volver a Inversiones", pt: "Voltar aos Investimentos" },
    errorTitle: { en: "Error", es: "Error", pt: "Erro" },
    errorDesc: { en: "Failed to process withdrawal. Please try again.", es: "Error al procesar el retiro. Intenta de nuevo.", pt: "Falha ao processar saque. Tente novamente." },
  },
  notFound: {
    title: { en: "404 Page Not Found", es: "404 Página No Encontrada", pt: "404 Página Não Encontrada" },
    subtitle: { en: "The page you're looking for doesn't exist.", es: "La página que buscas no existe.", pt: "A página que você procura não existe." },
  },
  blockchain: {
    viewOnExplorer: { en: "View on Explorer", es: "Ver en Explorer", pt: "Ver no Explorer" },
    txHash: { en: "TX Hash", es: "Hash TX", pt: "Hash TX" },
    onChainProof: { en: "On-Chain Proof", es: "Prueba On-Chain", pt: "Prova On-Chain" },
    mintProof: { en: "DPIX Mint Proof", es: "Prueba de Mint DPIX", pt: "Prova de Mint DPIX" },
    bridgeProof: { en: "Bridge Proof", es: "Prueba de Bridge", pt: "Prova de Bridge" },
    stakeProof: { en: "Stake Proof", es: "Prueba de Stake", pt: "Prova de Stake" },
    unstakeProof: { en: "Unstake Proof", es: "Prueba de Unstake", pt: "Prova de Unstake" },
    verified: { en: "Verified On-Chain", es: "Verificado On-Chain", pt: "Verificado On-Chain" },
    pending: { en: "Pending", es: "Pendiente", pt: "Pendente" },
    networkLabel: { en: "Network", es: "Red", pt: "Rede" },
    chainId: { en: "Chain ID", es: "Chain ID", pt: "Chain ID" },
    statusTitle: { en: "Blockchain Status", es: "Estado Blockchain", pt: "Status Blockchain" },
    configured: { en: "Connected to blockchain", es: "Conectado a blockchain", pt: "Conectado à blockchain" },
    simulated: { en: "Simulated mode", es: "Modo simulado", pt: "Modo simulado" },
    realMode: { en: "Live Blockchain", es: "Blockchain en Vivo", pt: "Blockchain ao Vivo" },
    simulatedMode: { en: "Demo Mode", es: "Modo Demo", pt: "Modo Demo" },
    transparencyTitle: { en: "Transaction Transparency", es: "Transparencia de Transacciones", pt: "Transparência das Transações" },
    transparencyDesc: { en: "Every step is recorded on-chain and can be verified by anyone.", es: "Cada paso se registra on-chain y puede ser verificado por cualquiera.", pt: "Cada etapa é registrada on-chain e pode ser verificada por qualquer pessoa." },
    verifyYourself: { en: "Verify yourself on", es: "Verifique usted mismo en", pt: "Verifique você mesmo no" },
  },
  common: {
    status: {
      completed: { en: "completed", es: "completado", pt: "concluído" },
      processing: { en: "processing", es: "procesando", pt: "processando" },
      pending: { en: "pending", es: "pendiente", pt: "pendente" },
      failed: { en: "failed", es: "fallido", pt: "falhou" },
    },
  },
} as const;

type Translations = typeof translations;
type NestedKeys<T, Prefix extends string = ""> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<"en" | "es" | "pt", string>
        ? `${Prefix}${K}`
        : NestedKeys<T[K], `${Prefix}${K}.`>;
    }[keyof T & string]
  : never;

type TranslationKey = NestedKeys<Translations>;

function getNestedValue(obj: any, path: string): Record<Language, string> | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return undefined;
    current = current[key];
  }
  return current;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LANG_LABELS: Record<Language, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
};

export { LANG_LABELS };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("defi-direct-lang");
    if (saved === "en" || saved === "es" || saved === "pt") return saved;
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === "es") return "es";
    if (browserLang === "pt") return "pt";
    return "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("defi-direct-lang", lang);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      const entry = getNestedValue(translations, key);
      if (!entry) return key;
      let text = entry[language] || entry.en || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, v);
        });
      }
      return text;
    },
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslation must be used within I18nProvider");
  return ctx;
}
