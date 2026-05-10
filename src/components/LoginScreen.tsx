import { Play, Facebook, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import React, { useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "motion/react";

interface LoginScreenProps {
  onLogin: () => void;
  onClose: () => void;
}

export default function LoginScreen({ onLogin, onClose }: LoginScreenProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isRecovering, setIsRecovering] = useState(false);
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = useCallback(async (provider: 'google' | 'facebook' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error(error);
      alert(error.message);
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (isRegistering && (!username || !phone)) return;
    if (isRegistering && password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem.");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");

    try {
      if (isRegistering) {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, phone, password })
        });
        const data = await res.json();
        if (data.success) {
          // Automatic login after registration
          const loginRes = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
          const loginData = await loginRes.json();
          if (loginData.success) {
            try {
              localStorage.setItem(`logged_user`, JSON.stringify(loginData.user));
            } catch (e) {}
            onLogin();
          }
        } else {
          setErrorMsg(data.error || "Erro ao cadastrar.");
        }
      } else {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          try {
            localStorage.setItem(`logged_user`, JSON.stringify(data.user));
          } catch (e) {}
          onLogin();
        } else {
          setErrorMsg(data.error || "Erro ao autenticar.");
        }
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account`,
    });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setEmailSent(true);
      setTimeout(() => {
        setIsRecovering(false);
        setEmailSent(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col justify-end"
    >
      {/* Background with fading image/gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800" 
          alt="Movies background" 
          className="w-full h-full object-cover opacity-40 capitalize"
          loading="eager"
        />
      </div>

      {/* Back button */}
      <button 
        onClick={() => {
          if (isRecovering) setIsRecovering(false);
          else if (isEmailLogin) setIsEmailLogin(false);
          else onClose();
        }}
        className="absolute top-6 left-4 z-20 p-2 text-white/80 hover:text-white"
      >
        <ArrowLeft className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center px-6 pb-8 w-full">
        <AnimatePresence mode="wait">
          {!isEmailLogin && !isRecovering ? (
            <motion.div 
              key="main"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center"
            >
              <div className="w-[84px] h-[84px] bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                <div className="w-0 h-0 border-t-[18px] border-t-transparent border-l-[28px] border-l-[#F12B55] border-b-[18px] border-b-transparent ml-2 rounded-sm" />
              </div>
              
              <h1 className="text-3xl font-bold mb-2 tracking-tight">DramasFlix</h1>
              <p className="text-[17px] text-gray-200 mb-14 font-medium tracking-wide text-center">{t("welcome")}</p>

              <div className="w-full space-y-3.5 mb-8">
                <button 
                  onClick={() => handleOAuthLogin('facebook')}
                  className="w-full bg-[#3b5998] hover:bg-[#344e86] text-white py-3.5 rounded-full flex items-center justify-center gap-3 font-semibold text-[15px] transition"
                >
                  <Facebook className="w-5 h-5 fill-current" />
                  <span>{t("continueWithFacebook")}</span>
                </button>

                <button 
                  onClick={() => handleOAuthLogin('google')}
                  className="w-full bg-[#333333] hover:bg-[#404040] text-white py-3.5 rounded-full flex items-center justify-center gap-3 font-semibold text-[15px] transition"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>{t("continueWithGoogle")}</span>
                </button>

                <button 
                  onClick={() => handleOAuthLogin('apple')}
                  className="w-full bg-white hover:bg-gray-100 text-black py-3.5 rounded-full flex items-center justify-center gap-3 font-semibold text-[15px] transition"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.65-.72 1.62.13 2.95.83 3.76 2.05-1.57.94-1.92 2.76-.32 3.86-.33 1.05-.8 1.95-1.43 2.8-.82 1.14-1.72 2.3-2.8 2.25l-1.04-.03V20.28z" />
                    <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span>{t("continueWithApple")}</span>
                </button>

                <button 
                  onClick={() => setIsEmailLogin(true)}
                  className="w-full bg-transparent text-white py-3.5 rounded-full flex items-center justify-center gap-3 font-semibold text-[15px] transition border border-white/20"
                >
                  <Mail className="w-5 h-5" />
                  <span>{t("continueWithEmail")}</span>
                </button>
              </div>
            </motion.div>
          ) : isRecovering ? (
            <motion.div 
              key="recover"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full bg-[#1c1c1e]/80 backdrop-blur-md p-6 rounded-2xl mb-8 border border-neutral-800"
            >
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold">{t("recoverPassword")}</h2>
              </div>
              
              {emailSent ? (
                <div className="bg-green-500/20 text-green-400 p-4 rounded-xl text-sm font-medium text-center border border-green-500/30">
                  {t("emailSent")}
                </div>
              ) : (
                <form onSubmit={handleRecover} className="space-y-4">
                  <div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      className="w-full bg-[#2c2c2e] text-white px-4 py-3.5 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#F12B55] hover:bg-[#ff3b65] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-lg transition disabled:opacity-50"
                  >
                    {loading ? "..." : t("sendRecoveryEmail")}
                  </button>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full bg-[#1c1c1e]/80 backdrop-blur-md p-6 rounded-2xl mb-8 border border-neutral-800"
            >
              <div className="flex items-center mb-6">
                <h2 className="text-xl font-semibold">{isRegistering ? t("register") : t("login")}</h2>
              </div>
              
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {errorMsg && <p className="text-red-400 text-sm font-medium mb-2">{errorMsg}</p>}
                
                {isRegistering && (
                  <>
                    <div>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Nome de usuário"
                        className="w-full bg-[#2c2c2e] text-white px-4 py-3.5 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition"
                        required={isRegistering}
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Telefone"
                        className="w-full bg-[#2c2c2e] text-white px-4 py-3.5 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition"
                        required={isRegistering}
                      />
                    </div>
                  </>
                )}

                <div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className="w-full bg-[#2c2c2e] text-white px-4 py-3.5 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition"
                    required
                  />
                </div>
                <div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Senha"
                      className="w-full bg-[#2c2c2e] text-white px-4 py-3.5 pr-12 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {isRegistering && (
                  <div>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua senha"
                        className="w-full bg-[#2c2c2e] text-white px-4 py-3.5 pr-12 rounded-xl text-[15px] placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#F12B55] transition"
                        required={isRegistering}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                )}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#F12B55] hover:bg-[#ff3b65] text-white py-3.5 rounded-xl font-bold text-[15px] shadow-lg transition disabled:opacity-50"
                >
                  {loading ? "..." : (isRegistering ? t("register") : t("login"))}
                </button>

                <div className="flex justify-between mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[13px] text-gray-300 hover:text-white transition"
                  >
                    {isRegistering ? t("login") : t("register")}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsEmailLogin(false);
                      setIsRecovering(true);
                    }}
                    className="text-[13px] text-gray-300 hover:text-white transition underline"
                  >
                    {t("forgotPassword")}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-[12px] leading-relaxed text-gray-400 max-w-[320px]">
          {t("byContinuing")}{' '}
          <button onClick={() => { onClose(); navigate("/user-contract"); }} className="underline hover:text-white transition decoration-gray-500">{t("userContract")}</button> {t("andThe")}{' '}
          <button onClick={() => { onClose(); navigate("/privacy-policy"); }} className="underline hover:text-white transition decoration-gray-500">{t("privacyPolicy")}</button>.
        </p>
      </div>
    </motion.div>
  );
}

