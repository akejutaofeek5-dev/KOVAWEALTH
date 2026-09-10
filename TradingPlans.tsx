import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  ["3 Month Plan", "Quarterly", ["Basic strategy training", "Weekly market analysis", "Entry & exit signals", "Stop loss guidance"]],
  ["6 Month Plan", "Semi-Annual", ["Advanced strategy training", "Bi-weekly coaching", "Real-time signals", "Portfolio management", "Risk management toolkit", "Priority support"]],
  ["1 Year Plan", "Annual", ["Complete trading mastery", "Daily market insights", "24/7 live signals", "1-on-1 mentoring", "Advanced analytics", "VIP support", "Lifetime access to updates"]],
] as const;

export default function TradingPlans({ onAuth }: { onAuth: () => void }) {
  return <section id="plans" className="order-3 border-t border-white/5 bg-[#090909] px-6 py-10 sm:py-12"><style>{`main.flex.flex-col > section:nth-child(3){order:4}main.flex.flex-col > section:nth-child(4){order:5}main.flex.flex-col > section:nth-child(5){order:6}main.flex.flex-col > section:nth-child(6){order:7}main.flex.flex-col > section:nth-child(7){order:8}`}</style><div className="mx-auto max-w-6xl"><div className="mb-8 text-center"><p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Trading Plans</p><h2 className="mt-3 text-4xl font-light">Choose Your Trading Plan</h2><p className="mt-3 text-zinc-400">Flexible plans designed to match your trading journey</p></div><div className="grid gap-6 md:grid-cols-3">{plans.map(([name, duration, features], index) => <div key={name} className={`relative flex min-h-[510px] flex-col rounded-lg border p-8 ${index === 1 ? "border-orange-500/70 bg-[#1c1510]" : "border-white/10 bg-[#111111]"}`}>{index === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-4 py-1 text-xs font-semibold">Most Popular</div>}<h3 className="text-2xl font-semibold">{name}</h3><p className="mt-2 text-sm text-zinc-400">{duration}</p><ul className="mt-8 flex-1 space-y-4">{features.map(feature => <li key={feature} className="flex gap-3 text-sm text-zinc-300"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-500" />{feature}</li>)}</ul><Button onClick={onAuth} className={index === 1 ? "bg-orange-500 text-white hover:bg-orange-600" : "border border-white/20 bg-[#111a2f] text-white hover:bg-white/10"}>Get Started</Button></div>)}</div></div></section>;
}
