import { useState } from "react";
import { LockKeyhole, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hashPasscode } from "@/lib/passcode";

type Stage = "auth" | "setup" | "verify";

export default function PinAuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [stage, setStage] = useState<Stage>("auth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const resendVerificationEmail = async () => {
    if (!email) {
      setMessage("Enter your email address first.");
      return;
    }
    setResendLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: "https://www.kovawealthpro.com/email-confirmed" },
      });
      if (error) throw error;
      setMessage("A new KovaWealthpro verification email has been sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend the verification email.");
    } finally {
      setResendLoading(false);
    }
  };

  const savePasscode = async () => {
    if (!/^\d{6}$/.test(passcode)) {
      setMessage("Passcode must be exactly 6 numbers.");
      return false;
    }
    if (passcode !== confirmPasscode) {
      setMessage("Passcodes do not match.");
      return false;
    }
    const { error } = await supabase.auth.updateUser({ data: { passcode_hash: await hashPasscode(passcode) } });
    if (error) {
      setMessage(error.message);
      return false;
    }
    return true;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      if (stage === "setup") {
        if (await savePasscode()) onSuccess();
        return;
      }
      if (stage === "verify") {
        const expected = String((await supabase.auth.getUser()).data.user?.user_metadata?.passcode_hash || "");
        if (!expected || (await hashPasscode(passcode)) !== expected) {
          setMessage("Incorrect passcode.");
          return;
        }
        onSuccess();
        return;
      }
      if (!email || password.length < 8) {
        setMessage("Enter your email and a password with at least 8 characters.");
        return;
      }
      if (mode === "signup") {
        if (!name.trim()) {
          setMessage("Please enter your full name.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: "https://www.kovawealthpro.com/email-confirmed",
          },
        });
        if (error) throw error;
        if (!data.session) {
          setVerificationPending(true);
          setMessage("Account created. Verify your email, then sign in with your password to create your passcode.");
        } else {
          setStage("setup");
        }
        return;
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error("Unable to sign in");
      if (data.user.user_metadata?.passcode_hash) setStage("verify");
      else setStage("setup");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const title = stage === "setup" ? "Secure your account" : stage === "verify" ? "Enter your passcode" : mode === "signup" ? "Create your account" : "Welcome back";
  const description = stage === "setup" ? "Create a separate 6-digit passcode for extra account security." : stage === "verify" ? "Enter your passcode after your password to open your wallet." : mode === "signup" ? "Create your account with an email and password." : "Sign in with your email and password.";

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"><Card className="w-full max-w-md border-white/10 bg-[#17142c] p-7 shadow-[0_20px_70px_rgba(141,128,217,.18)]"><div className="flex items-start justify-between"><div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8d80d9] text-slate-950"><LockKeyhole className="h-5 w-5" /></div><h2 className="mt-5 text-2xl font-semibold text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{description}</p></div><button type="button" onClick={onClose} aria-label="Close authentication" className="text-slate-500 hover:text-white"><X className="h-5 w-5" /></button></div><form onSubmit={submit} className="mt-6 space-y-4">{stage === "auth" && mode === "signup" && <label className="block text-sm text-slate-300">Full name<Input required value={name} onChange={event => setName(event.target.value)} className="mt-2 h-11 border-slate-700 bg-slate-900 text-white" /></label>}{stage === "auth" && <><label className="block text-sm text-slate-300">Email address<Input required type="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 h-11 border-slate-700 bg-slate-900 text-white" /></label><label className="block text-sm text-slate-300">Password<Input required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 h-11 border-slate-700 bg-slate-900 text-white" /></label></>}{stage === "setup" && <><label className="block text-sm text-slate-300">New 6-digit passcode<Input required inputMode="numeric" maxLength={6} type="password" value={passcode} onChange={event => /^\d{0,6}$/.test(event.target.value) && setPasscode(event.target.value)} className="mt-2 h-11 border-slate-700 bg-slate-900 text-white" /></label><label className="block text-sm text-slate-300">Confirm passcode<Input required inputMode="numeric" maxLength={6} type="password" value={confirmPasscode} onChange={event => /^\d{0,6}$/.test(event.target.value) && setConfirmPasscode(event.target.value)} className="mt-2 h-11 border-slate-700 bg-slate-900 text-white" /></label></>}{stage === "verify" && <label className="block text-sm text-slate-300">6-digit passcode<Input required inputMode="numeric" maxLength={6} type="password" value={passcode} onChange={event => /^\d{0,6}$/.test(event.target.value) && setPasscode(event.target.value)} className="mt-2 h-11 border-slate-700 bg-slate-900 text-white" /></label>}{message && <p className="text-sm text-amber-300">{message}</p>}{verificationPending && stage === "auth" && <button type="button" onClick={resendVerificationEmail} disabled={resendLoading} className="w-full text-sm font-medium text-[#a79be7] hover:text-white disabled:opacity-60">{resendLoading ? "Sending verification email..." : "Resend verification email"}</button>}<Button disabled={loading} className="h-11 w-full bg-[#8d80d9] font-semibold text-white hover:bg-[#a79be7]">{loading ? "Please wait..." : stage === "setup" ? "Save passcode" : stage === "verify" ? "Unlock wallet" : mode === "signup" ? "Create account" : "Continue"}</Button></form>{stage === "auth" && <p className="mt-5 text-center text-sm text-slate-500">{mode === "signup" ? "Already have an account?" : "New to KovaWealth?"} <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setVerificationPending(false); setMessage(""); }} className="font-medium text-[#a79be7]">{mode === "signup" ? "Sign in" : "Create an account"}</button></p>}</Card></div>;
}
