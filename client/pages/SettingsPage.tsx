import { useEffect, useState } from "react";
import { Check, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hashPasscode } from "@/lib/passcode";

type Profile = { email: string; full_name: string | null; status: string };

export default function SettingsPage({ onSignOut }: { onSignOut: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [saved, setSaved] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [savingPasscode, setSavingPasscode] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("email,full_name,status").eq("id", user.id).single();
      if (data) {
        setProfile(data);
        setName(data.full_name || "");
      }
    })();
  }, []);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", user.id);
    if (!error) {
      setProfile(current => current ? { ...current, full_name: name } : current);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    }
  };

  const updatePasscode = async (event: React.FormEvent) => {
    event.preventDefault();
    setSecurityMessage("");
    if (!/^\d{6}$/.test(passcode)) {
      setSecurityMessage("PIN must be exactly 6 numbers.");
      return;
    }
    if (passcode !== confirmPasscode) {
      setSecurityMessage("Passcodes do not match.");
      return;
    }
    setSavingPasscode(true);
    const { error } = await supabase.auth.updateUser({ data: { passcode_hash: await hashPasscode(passcode) } });
    setSavingPasscode(false);
    if (error) {
      setSecurityMessage(error.message);
      return;
    }
    setPasscode("");
    setConfirmPasscode("");
    setSecurityMessage("Passcode updated successfully.");
  };

  const displayName = profile?.full_name || "Your profile";
  const initials = displayName.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();

  return <div><p className="text-sm text-slate-400">Account</p><h1 className="mt-1 text-3xl font-semibold text-white">Settings</h1><p className="mt-2 text-sm text-slate-500">Manage your wallet profile and security.</p><Card className="mt-8 max-w-2xl border-slate-800 bg-slate-900/70 p-6 shadow-none"><div className="flex items-center gap-4 border-b border-slate-800 pb-6"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#a79be7] to-[#8d80d9] text-xl font-semibold text-slate-950">{initials}</div><div><h2 className="text-lg font-semibold text-white">{displayName}</h2><p className="mt-1 text-sm text-slate-500">{profile?.email || "Loading account..."}</p></div><span className="ml-auto rounded-full bg-emerald-400/10 px-3 py-1 text-xs capitalize text-emerald-300">{profile?.status || "active"}</span></div><div className="mt-6 space-y-4"><label className="block text-sm text-slate-300">Full name<Input value={name} onChange={event => setName(event.target.value)} className="mt-2 border-slate-700 bg-slate-950 text-white" /></label><div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-4"><UserRound className="h-4 w-4 text-[#a79be7]" /><div className="flex-1"><p className="text-xs text-slate-500">Email address</p><p className="mt-1 text-sm text-slate-300">{profile?.email || "Loading..."}</p></div><Check className="h-4 w-4 text-emerald-400" /></div><Button onClick={save} className="bg-[#8d80d9] text-white hover:bg-[#a79be7]">{saved ? "Saved" : "Save profile"}</Button></div></Card><Card className="mt-6 max-w-2xl border-slate-800 bg-slate-900/70 p-6 shadow-none"><div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#a79be7]" /><div><h2 className="font-semibold text-white">6-digit PIN</h2><p className="mt-1 text-sm text-slate-500">Set or change the PIN used to sign in.</p></div></div><form onSubmit={updatePasscode} className="mt-5 space-y-4"><label className="block text-sm text-slate-300">New PIN<Input required maxLength={6} inputMode="numeric" type="password" value={passcode} onChange={event => /^\d{0,6}$/.test(event.target.value) && setPasscode(event.target.value)} placeholder="6 numbers" className="mt-2 border-slate-700 bg-slate-950 text-white" /></label><label className="block text-sm text-slate-300">Confirm PIN<Input required maxLength={6} inputMode="numeric" type="password" value={confirmPasscode} onChange={event => /^\d{0,6}$/.test(event.target.value) && setConfirmPasscode(event.target.value)} placeholder="Enter it again" className="mt-2 border-slate-700 bg-slate-950 text-white" /></label>{securityMessage && <p className="text-sm text-slate-300">{securityMessage}</p>}<Button type="submit" disabled={savingPasscode} className="bg-[#8d80d9] text-white hover:bg-[#a79be7]">{savingPasscode ? "Updating..." : "Save PIN"}</Button></form></Card><Button variant="outline" onClick={onSignOut} className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800"><LogOut className="h-4 w-4" />Sign out</Button></div>;
}
