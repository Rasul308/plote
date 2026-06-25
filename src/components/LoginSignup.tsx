import React, { useState } from "react";
import { 
  auth, 
  googleProvider, 
  facebookProvider, 
  syncUserProfile 
} from "../lib/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert,
  Database,
  Chrome,
  Facebook
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginSignupProps {
  onClose: () => void;
  currentLang: "en" | "ru" | "uz";
  onSuccess: (displayName: string) => void;
  projectId: string;
}

export default function LoginSignup({
  onClose,
  currentLang,
  onSuccess,
  projectId
}: LoginSignupProps) {
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showDevGuide, setShowDevGuide] = useState(false);

  // Translations
  const t = {
    en: {
      title: "Explorer Sanctuary",
      subtitle: "Sync your scores, challenge achievements, and explore across all devices.",
      loginTab: "Sign In",
      signupTab: "Register",
      resetTab: "Reset Password",
      emailLabel: "Email Address",
      passwordLabel: "Secret Code (Password)",
      nameLabel: "Explorer Nickname",
      emailPlh: "name@example.com",
      passwordPlh: "Enter at least 6 characters",
      namePlh: "e.g., StarNavigator",
      submitLogin: "Sign In to Sanctuary",
      submitSignup: "Create Explorer Profile",
      submitReset: "Send Reset Link",
      forgotPass: "Forgot your password?",
      orDivider: "or authenticate via",
      close: "Close Portal",
      googleBtn: "Google Account",
      facebookBtn: "Facebook Profile",
      haveAccount: "Already have a profile?",
      noAccount: "New explorer?",
      backToLogin: "Back to Sign In",
      passResetSent: "Check your inbox! We've sent instructions to reset your password.",
      welcomeBack: "Welcome back, StarNavigator!",
      accountCreated: "Profile initialized successfully!",
      guideTitle: "Firebase Setup Instructions (For You)",
      guideDesc: "Here is how to configure Firebase on your end to make social sign-ins functional and view your signed-up users.",
    },
    ru: {
      title: "Обитель Исследователя",
      subtitle: "Синхронизируйте результаты, достижения и исследуйте с любого устройства.",
      loginTab: "Войти",
      signupTab: "Регистрация",
      resetTab: "Сброс пароля",
      emailLabel: "Электронная почта",
      passwordLabel: "Секретный код (Пароль)",
      nameLabel: "Имя исследователя",
      emailPlh: "name@example.com",
      passwordPlh: "Минимум 6 символов",
      namePlh: "например, StarNavigator",
      submitLogin: "Войти в обитель",
      submitSignup: "Создать профиль",
      submitReset: "Сбросить пароль",
      forgotPass: "Забыли пароль?",
      orDivider: "или авторизуйтесь через",
      close: "Закрыть портал",
      googleBtn: "Google Аккаунт",
      facebookBtn: "Facebook Профиль",
      haveAccount: "Уже есть профиль?",
      noAccount: "Новый исследователь?",
      backToLogin: "Назад ко входу",
      passResetSent: "Проверьте почту! Мы отправили инструкции по сбросу пароля.",
      welcomeBack: "С возвращением, исследователь!",
      accountCreated: "Профиль успешно инициализирован!",
      guideTitle: "Инструкции по настройке Firebase (Для Вас)",
      guideDesc: "Вот как настроить Firebase на вашей стороне, чтобы социальные входы работали и вы могли просматривать пользователей.",
    },
    uz: {
      title: "Kashfiyotchi Maskani",
      subtitle: "Natijalarni sinxronlashtiring, yutuqlarni saqlang va har qanday qurilmada kashf qiling.",
      loginTab: "Kirish",
      signupTab: "Ro'yxatdan o'tish",
      resetTab: "Parolni tiklash",
      emailLabel: "Elektron pochta",
      passwordLabel: "Maxfiy kod (Parol)",
      nameLabel: "Kashfiyotchi taxallusi",
      emailPlh: "name@example.com",
      passwordPlh: "Kamida 6 ta belgi",
      namePlh: "masalan, StarNavigator",
      submitLogin: "Maskanga kirish",
      submitSignup: "Profil yaratish",
      submitReset: "Tiklash havolasini yuborish",
      forgotPass: "Parolni unutdingizmi?",
      orDivider: "yoki quyidagilar orqali kirish",
      close: "Portalni yopish",
      googleBtn: "Google Hisobi",
      facebookBtn: "Facebook Profili",
      haveAccount: "Profil bormi?",
      noAccount: "Yangi kashfiyotchimisiz?",
      backToLogin: "Kirish bo'limiga qaytish",
      passResetSent: "E-pochtangizni tekshiring! Parolni tiklash bo'yicha ko'rsatmalar yuborildi.",
      welcomeBack: "Xush kelibsiz, kashfiyotchi!",
      accountCreated: "Profil muvaffaqiyatli yaratildi!",
      guideTitle: "Firebase Sozlash Ko'rsatmalari (Siz uchun)",
      guideDesc: "Ijtimoiy tarmoqlar orqali kirishni ishlatish va foydalanuvchilarni ko'rish uchun Firebase-ni qanday sozlash kerakligi quyida keltirilgan.",
    }
  }[currentLang] || {
    title: "Explorer Sanctuary",
    subtitle: "Sync your scores, challenge achievements, and explore across all devices.",
    loginTab: "Sign In",
    signupTab: "Register",
    resetTab: "Reset Password",
    emailLabel: "Email Address",
    passwordLabel: "Secret Code (Password)",
    nameLabel: "Explorer Nickname",
    emailPlh: "name@example.com",
    passwordPlh: "Enter at least 6 characters",
    namePlh: "e.g., StarNavigator",
    submitLogin: "Sign In to Sanctuary",
    submitSignup: "Create Explorer Profile",
    submitReset: "Send Reset Link",
    forgotPass: "Forgot your password?",
    orDivider: "or authenticate via",
    close: "Close Portal",
    googleBtn: "Google Account",
    facebookBtn: "Facebook Profile",
    haveAccount: "Already have a profile?",
    noAccount: "New explorer?",
    backToLogin: "Back to Sign In",
    passResetSent: "Check your inbox! We've sent instructions to reset your password.",
    welcomeBack: "Welcome back, StarNavigator!",
    accountCreated: "Profile initialized successfully!",
    guideTitle: "Firebase Setup Instructions (For You)",
    guideDesc: "Here is how to configure Firebase on your end to make social sign-ins functional and view your signed-up users.",
  };

  const getCleanErrorMessage = (errCode: string) => {
    switch (errCode) {
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid credentials. Please verify your email and password.";
      case "auth/email-already-in-use":
        return "This email is already registered to another explorer.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/popup-closed-by-user":
        return "The login popup was closed. Please try again.";
      case "auth/operation-not-allowed":
        return "This sign-in provider is not enabled in your Firebase Console. Please toggle it on in Authentication.";
      default:
        return `Authentication Error: ${errCode.replace("auth/", "").replace(/-/g, " ")}`;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (mode === "signup") {
        if (!email || !password || !displayName) {
          throw new Error("Please fill in all requested fields.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        
        // 1. Create Firebase User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Set profile display name
        await updateProfile(user, { displayName });

        // 3. Sync profile metadata to Firestore
        await syncUserProfile(user);

        setSuccessMsg(t.accountCreated);
        setTimeout(() => {
          onSuccess(displayName);
          onClose();
        }, 1500);

      } else if (mode === "login") {
        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }

        // 1. Login user
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Sync profile metadata to Firestore
        await syncUserProfile(user);

        setSuccessMsg(t.welcomeBack);
        setTimeout(() => {
          onSuccess(user.displayName || user.email?.split("@")[0] || "Explorer");
          onClose();
        }, 1500);

      } else if (mode === "reset") {
        if (!email) {
          throw new Error("Please enter your email address to reset password.");
        }
        await sendPasswordResetEmail(auth, email);
        setSuccessMsg(t.passResetSent);
        setMode("login");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.code ? getCleanErrorMessage(err.code) : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (providerName: "google" | "facebook") => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const provider = providerName === "google" ? googleProvider : facebookProvider;
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Sync profile metadata to Firestore
      await syncUserProfile(user);

      setSuccessMsg(t.welcomeBack);
      setTimeout(() => {
        onSuccess(user.displayName || user.email?.split("@")[0] || "Explorer");
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.code ? getCleanErrorMessage(err.code) : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto"
      id="login_portal_backdrop"
    >
      <div className="w-full max-w-lg my-8 flex flex-col gap-4">
        
        {/* Main Card Container */}
        <motion.div 
          initial={{ scale: 0.95, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 10 }}
          className="bg-white border border-gray-250 shadow-2xl rounded-[16px] overflow-hidden flex flex-col relative z-25"
          id="login_portal_card"
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-150 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-950 text-white rounded-full flex items-center justify-center font-mono font-black shadow-sm select-none animate-[spin_20s_linear_infinite]">
                ✦
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest leading-none">
                  {t.title}
                </h3>
                <span className="text-[10px] text-gray-500 font-semibold mt-1 block">
                  Secure Identity Service
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-black w-7 h-7 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 transition-colors cursor-pointer text-xs font-black select-none"
              title="Close Portal"
            >
              ✕
            </button>
          </div>

          {/* Subtitle */}
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-6 flex flex-col gap-4">
            
            {/* Tab Swapping */}
            {mode !== "reset" && (
              <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-[10px] border border-gray-200" id="login_tabs">
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(null); }}
                  className={`py-2 text-xs font-black uppercase tracking-wider rounded-[8px] transition-all cursor-pointer ${
                    mode === "login" 
                      ? "bg-white text-gray-950 shadow-sm border border-gray-200/50" 
                      : "text-gray-500 hover:text-gray-950"
                  }`}
                >
                  {t.loginTab}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(null); }}
                  className={`py-2 text-xs font-black uppercase tracking-wider rounded-[8px] transition-all cursor-pointer ${
                    mode === "signup" 
                      ? "bg-white text-gray-950 shadow-sm border border-gray-200/50" 
                      : "text-gray-500 hover:text-gray-950"
                  }`}
                >
                  {t.signupTab}
                </button>
              </div>
            )}

            {/* Error/Success Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-[10px] flex items-start gap-2.5"
                  id="login_error_alert"
                >
                  <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-bold block">Action Blocked</span>
                    <p className="text-[10px] leading-relaxed mt-0.5 font-semibold text-rose-700">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}

              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-[10px] flex items-start gap-2.5"
                  id="login_success_alert"
                >
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-xs font-bold block">Succeeded</span>
                    <p className="text-[10px] leading-relaxed mt-0.5 font-semibold text-emerald-700">
                      {successMsg}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Core Form */}
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
              
              {/* Display Name Input (Signup Mode Only) */}
              {mode === "signup" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t.namePlh}
                    className="w-full bg-white border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-xs font-semibold placeholder:text-gray-300 focus:outline-none focus:border-black transition-all"
                  />
                </div>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlh}
                  className="w-full bg-white border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-xs font-semibold placeholder:text-gray-300 focus:outline-none focus:border-black transition-all"
                />
              </div>

              {/* Password Input (Login/Signup Only) */}
              {mode !== "reset" && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-gray-400" />
                      {t.passwordLabel}
                    </label>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => { setMode("reset"); setError(null); }}
                        className="text-[10px] font-bold text-gray-450 hover:text-black transition-colors"
                      >
                        {t.forgotPass}
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlh}
                    className="w-full bg-white border border-gray-300 rounded-[10px] px-3.5 py-2.5 text-xs font-semibold placeholder:text-gray-300 focus:outline-none focus:border-black transition-all"
                  />
                </div>
              )}

              {/* Submit Action */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-950 hover:bg-black text-white py-3 px-4 rounded-[10px] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md mt-1 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === "login" ? t.submitLogin : mode === "signup" ? t.submitSignup : t.submitReset}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Sign In Link */}
            {mode === "reset" && (
              <button
                type="button"
                onClick={() => { setMode("login"); setError(null); }}
                className="text-xs font-bold text-gray-500 hover:text-black hover:underline text-center cursor-pointer select-none py-1"
              >
                ← {t.backToLogin}
              </button>
            )}

            {/* Third-Party Authentication Providers */}
            {mode !== "reset" && (
              <div className="flex flex-col gap-3.5 pt-2 border-t border-gray-150">
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest bg-white px-2 select-none">
                    {t.orDivider}
                  </span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 gap-3" id="social_auth_providers">
                  {/* Google */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuth("google")}
                    className="bg-white border border-gray-200 hover:border-gray-950 text-gray-950 rounded-[10px] py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 select-none"
                  >
                    <Chrome className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">{t.googleBtn}</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleOAuth("facebook")}
                    className="bg-white border border-gray-200 hover:border-gray-950 text-gray-950 rounded-[10px] py-2.5 px-3 flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer disabled:opacity-50 select-none"
                  >
                    <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="truncate">{t.facebookBtn}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Admin Guide Panel */}
          <div className="bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDevGuide(!showDevGuide)}
              className="w-full text-left px-6 py-3.5 flex items-center justify-between text-xs font-bold text-gray-700 hover:text-black hover:bg-gray-100/50 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>{t.guideTitle}</span>
              </div>
              <span className="text-gray-400 font-black">{showDevGuide ? "▲" : "▼"}</span>
            </button>

            <AnimatePresence>
              {showDevGuide && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 pb-6 pt-1 flex flex-col gap-3 text-xs text-gray-600 border-t border-gray-150 leading-relaxed font-semibold border-b rounded-b-[16px] bg-white"
                  id="admin_setup_guide_content"
                >
                  <p className="text-[11px] text-gray-500 mb-1 leading-normal font-medium">
                    {t.guideDesc}
                  </p>

                  <div className="flex flex-col gap-3">
                    {/* Step 1 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">Activate Email & Password Sign-in</span>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5 font-medium">
                          Go to your <a href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-semibold">Firebase Console &rarr;</a>. Under <strong>Authentication &gt; Sign-in method</strong>, enable <strong>Email/Password</strong> and save.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">Activate Google Authentication</span>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5 font-medium">
                          In the same tab, click <strong>Add new provider</strong>, select <strong>Google</strong>, toggle it to active, configure your support email, and save.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">Activate Facebook Authentication</span>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5 font-medium">
                          Select <strong>Facebook</strong> under providers. You will need a developer account from Meta (`developers.facebook.com`) to input your Facebook App ID and App Secret.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        4
                      </div>
                      <div>
                        <span className="font-bold text-gray-950 block">Access database to see signed users</span>
                        <p className="text-[11px] text-gray-500 leading-normal mt-0.5 font-medium">
                          You can view registered accounts under the <a href={`https://console.firebase.google.com/project/${projectId}/authentication/users`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-0.5">Authentication Users list &rarr;</a>. For richer profiles, navigate to <a href={`https://console.firebase.google.com/project/${projectId}/firestore`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-0.5">Firestore Database &rarr;</a> to inspect the <code>users</code> collection where user records are synced.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
