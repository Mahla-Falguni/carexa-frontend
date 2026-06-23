import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
    FaLayerGroup, FaCheckCircle, FaRupeeSign, FaClock,
    FaTimesCircle, FaStar, FaCalendarAlt, FaShieldAlt,
    FaRedo, FaBolt, FaExclamationTriangle
} from "react-icons/fa";

const HospitalPlans = () => {
    const [plans,        setPlans]        = useState([]);
    const [currentPlan,  setCurrentPlan]  = useState(null);
    const [lastPlan,     setLastPlan]     = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [subscribing,  setSubscribing]  = useState(null);
    const [refreshing,   setRefreshing]   = useState(false);

    const token   = localStorage.getItem("HospitalToken");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);
        try {
            const [plansRes, currentRes] = await Promise.all([
                axios.get("https://carexa-backend.vercel.app/planapi/get-all-plans",   { headers }),
                axios.get("https://carexa-backend.vercel.app/hospitalapi/get-my-plan", { headers }),
            ]);
            const activePlans = (plansRes.data.plans || []).filter(p => p.plan_status === "ACTIVE");
            setPlans(activePlans);
            setCurrentPlan(currentRes.data.subscription || null);

            // ── lastSubscription comes from the API (most recent past sub regardless of status) ──
            setLastPlan(currentRes.data.lastSubscription || null);
        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const daysRemaining = (expiryDate) => {
        if (!expiryDate) return null;
        return Math.max(0, Math.ceil((new Date(expiryDate) - new Date()) / 86400000));
    };

    // ── Pick the best plan to renew:
    //    Priority 1: Same plan if it's still ACTIVE in the plans list
    //    Priority 2: Cheapest available plan as fallback
    //    Priority 3: null if no plans available at all
    const getRenewPlan = (activePlans) => {
        if (!lastPlan || activePlans.length === 0) return activePlans[0] || null;

        const lastPlanId = lastPlan.plan_id?._id?.toString() || lastPlan.plan_id?.toString();
        const samePlan   = activePlans.find(p => p._id?.toString() === lastPlanId);

        if (samePlan) return samePlan;                                          // original still available
        return [...activePlans].sort((a, b) => a.plan_price - b.plan_price)[0]; // cheapest fallback
    };

    const handleSubscribe = async (plan) => {
        const confirm = await Swal.fire({
            title: `Subscribe to <b>${plan.plan_name}</b>?`,
            html:  `<p style="color:#64748b">₹${plan.plan_price.toLocaleString()} · ${plan.plan_duration} month${plan.plan_duration > 1 ? "s" : ""}</p>`,
            icon:  "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor:  "#6b7280",
            confirmButtonText:  "Proceed to Payment"
        });
        if (!confirm.isConfirmed) return;

        try {
            setSubscribing(plan._id);
            const { data: order } = await axios.post(
                "http://localhost:5000/paymentapi/create-order",
                { amount: plan.plan_price },
                { headers }
            );

            const options = {
                key:         "rzp_test_Sa4glOTbrZLR7Z",
                amount:      order.amount,
                currency:    "INR",
                order_id:    order.id,
                name:        "Carexa Hospital",
                description: plan.plan_name,
                handler: async (response) => {
                    try {
                        const verifyRes = await axios.post(
                            "http://localhost:5000/paymentapi/verify-payment",
                            {
                                razorpay_order_id:   response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature:  response.razorpay_signature,
                                plan_id:             plan._id,
                                amount:              plan.plan_price
                            },
                            { headers }
                        );
                        if (verifyRes.data.success) {
                            await fetchData(true);
                            Swal.fire({
                                icon:  "success",
                                title: "Plan Activated! 🎉",
                                html:  `
                                    <p style="color:#059669;font-weight:700;font-size:17px;margin-bottom:6px">${plan.plan_name}</p>
                                    <p style="color:#64748b;font-size:13px">Active for ${plan.plan_duration} month${plan.plan_duration > 1 ? "s" : ""}</p>
                                    <p style="color:#94a3b8;font-size:11px;margin-top:8px">Payment ID: ${response.razorpay_payment_id}</p>
                                `,
                                confirmButtonColor: "#059669",
                                confirmButtonText:  "Awesome!"
                            });
                        } else {
                            Swal.fire("Error", "Payment verification failed", "error");
                        }
                    } catch (err) {
                        Swal.fire("Error", err?.response?.data?.message || "Verification failed", "error");
                    }
                },
                modal:  { ondismiss: () => setSubscribing(null) },
                prefill: {
                    name:    localStorage.getItem("HospitalName") || "Hospital",
                    email:   "hospital@email.com",
                    contact: "9999999999"
                },
                theme: { color: "#2563eb" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            Swal.fire("Error", "Failed to initiate payment", "error");
        } finally {
            setSubscribing(null);
        }
    };

    const handleCancelPlan = async () => {
        const confirm = await Swal.fire({
            title: "Cancel Plan?",
            text:  "Your subscription will be deactivated immediately.",
            icon:  "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor:  "#6b7280",
            confirmButtonText:  "Yes, Cancel"
        });
        if (!confirm.isConfirmed) return;
        try {
            await axios.put("http://localhost:5000/hospitalapi/cancel-plan", {}, { headers });
            setCurrentPlan(null);
            Swal.fire({ icon: "success", title: "Plan Cancelled", timer: 1500, showConfirmButton: false });
            fetchData(true);
        } catch (err) {
            Swal.fire("Error", err?.response?.data?.message || "Failed to cancel", "error");
        }
    };

    const ACCENTS = [
        { grad: "from-blue-600 to-indigo-600",   light: "bg-blue-50",    text: "text-blue-600",   border: "border-blue-200",   hex: "#2563eb" },
        { grad: "from-violet-600 to-purple-600",  light: "bg-violet-50",  text: "text-violet-600", border: "border-violet-200", hex: "#7c3aed" },
        { grad: "from-emerald-500 to-teal-600",   light: "bg-emerald-50", text: "text-emerald-600",border: "border-emerald-200",hex: "#059669" },
        { grad: "from-amber-500 to-orange-500",   light: "bg-amber-50",   text: "text-amber-600",  border: "border-amber-200",  hex: "#d97706" },
    ];

    const isActive    = (plan) => currentPlan?.plan_id?._id === plan._id || currentPlan?.plan_id === plan._id;
    const renewPlan   = !currentPlan && lastPlan ? getRenewPlan(plans) : null;
    const isRenewCard = (plan) => renewPlan?._id === plan._id;
    const isFallback  = (plan) => {
        // True only when the renewal suggestion differs from the original plan
        if (!renewPlan || !lastPlan) return false;
        const lastPlanId = lastPlan.plan_id?._id?.toString() || lastPlan.plan_id?.toString();
        return isRenewCard(plan) && plan._id?.toString() !== lastPlanId;
    };

    const days = daysRemaining(currentPlan?.expiry_date);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 text-sm font-medium">Loading plans…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 p-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
                .hp-page * { font-family: 'DM Sans', sans-serif; }
                .plan-card  { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .plan-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.10); }
                .plan-active { transform: translateY(-5px); }
                .plan-renew  { transform: translateY(-3px); }
                .sub-btn { transition: all 0.2s ease; }
                .sub-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.08); }
                .sub-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                @keyframes pulse-soft { 0%,100%{opacity:1} 50%{opacity:.7} }
                .pulse { animation: pulse-soft 2s infinite; }
                @keyframes glow { 0%,100%{box-shadow:0 0 0 0 rgba(234,179,8,0.4)} 50%{box-shadow:0 0 0 8px rgba(234,179,8,0)} }
                .renew-glow { animation: glow 2s infinite; }
            `}</style>

            <div className="hp-page max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-xs font-semibold mb-4">
                        <FaLayerGroup size={11} /> Hospital Subscription Plans
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ letterSpacing: "-0.5px" }}>
                        Choose Your Plan
                    </h1>
                    <p className="text-slate-500 text-sm max-w-xl mx-auto">
                        Unlock full access to hospital management features. Switch or cancel anytime.
                    </p>
                </div>

                {/* ══ BANNER — Case 1: Active plan ══ */}
                {currentPlan && (
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl mb-8 overflow-hidden shadow-lg shadow-emerald-200">
                        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <FaShieldAlt size={22} className="text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-bold text-lg">
                                            {currentPlan.plan_id?.plan_name || "Active Plan"}
                                        </h3>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30">ACTIVE</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <span className="text-white/75 text-xs flex items-center gap-1.5">
                                            <FaRupeeSign size={9}/> ₹{currentPlan.plan_id?.plan_price?.toLocaleString()} · {currentPlan.plan_id?.plan_duration} month{currentPlan.plan_id?.plan_duration > 1 ? "s" : ""}
                                        </span>
                                        {currentPlan.subscribed_date && (
                                            <span className="text-white/75 text-xs flex items-center gap-1.5">
                                                <FaCalendarAlt size={9}/> Subscribed {new Date(currentPlan.subscribed_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                                            </span>
                                        )}
                                        {currentPlan.expiry_date && (
                                            <span className="text-white/75 text-xs flex items-center gap-1.5">
                                                <FaClock size={9}/> Expires {new Date(currentPlan.expiry_date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => fetchData(true)} className="w-9 h-9 rounded-xl bg-white/20 border border-white/25 text-white flex items-center justify-center hover:bg-white/30 transition">
                                    <FaRedo size={12} className={refreshing ? "animate-spin" : ""}/>
                                </button>
                                <button onClick={handleCancelPlan} className="flex items-center gap-2 px-4 py-2.5 bg-white/15 border border-white/25 text-white rounded-xl text-sm font-semibold hover:bg-white/25 transition">
                                    <FaTimesCircle size={12}/> Cancel Plan
                                </button>
                            </div>
                        </div>
                        {days !== null && (
                            <div className="px-6 pb-5 border-t border-white/20 pt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/80 text-xs font-semibold">Validity remaining</span>
                                    <span className={`text-xs font-bold ${days < 7 ? "text-amber-300 pulse" : "text-white"}`}>
                                        {days} day{days !== 1 ? "s" : ""} left
                                    </span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width:`${Math.min(100,Math.max(2,(days/((currentPlan.plan_id?.plan_duration||1)*30))*100))}%`, background: days < 7 ? "#fbbf24" : "#fff" }}/>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ══ BANNER — Case 2: Expired / cancelled (has lastPlan) ══ */}
                {!currentPlan && lastPlan && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl mb-8 overflow-hidden shadow-lg shadow-amber-200">
                        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                                    <FaExclamationTriangle size={22} className="text-white"/>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-white font-bold text-lg">
                                            {lastPlan.plan_id?.plan_name || "Previous Plan"}
                                        </h3>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30">
                                            EXPIRED / CANCELLED
                                        </span>
                                    </div>
                                    <p className="text-white/80 text-xs">
                                        Your subscription has ended. Renew to restore hospital visibility and features.
                                    </p>
                                    {/* Show fallback notice only when original plan is gone */}
                                    {renewPlan && isFallback(renewPlan) && (
                                        <p className="text-white/65 text-[11px] mt-1 flex items-center gap-1.5">
                                            <FaExclamationTriangle size={9}/>
                                            Your previous plan (<strong className="text-white/80">{lastPlan.plan_id?.plan_name || "plan"}</strong>) is no longer available — we suggest <strong className="text-white/90">&nbsp;{renewPlan.plan_name}</strong>&nbsp;as the closest alternative.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Renew CTA — always shows the best available plan */}
                            {renewPlan ? (
                                <button onClick={() => handleSubscribe(renewPlan)} disabled={!!subscribing}
                                    className="renew-glow flex items-center gap-2 px-6 py-3 bg-white rounded-xl text-sm font-bold hover:bg-amber-50 transition shrink-0 disabled:opacity-60"
                                    style={{ color: "#d97706" }}>
                                    <FaRedo size={13}/>
                                    {isFallback(renewPlan) ? `Renew with ${renewPlan.plan_name}` : `Renew ${lastPlan.plan_id?.plan_name || "Plan"}`}
                                </button>
                            ) : (
                                <span className="text-white/70 text-xs font-semibold shrink-0">Choose a plan below ↓</span>
                            )}
                        </div>
                    </div>
                )}

                {/* ══ BANNER — Case 3: Never subscribed ══ */}
                {!currentPlan && !lastPlan && (
                    <div className="flex items-center gap-4 px-5 py-4 bg-amber-50 border border-amber-200 rounded-2xl mb-8">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                            <FaExclamationTriangle className="text-amber-500" size={16}/>
                        </div>
                        <div>
                            <p className="text-amber-800 font-bold text-sm">No Active Plan</p>
                            <p className="text-amber-600 text-xs mt-0.5">Subscribe to a plan below to unlock all hospital management features.</p>
                        </div>
                        <FaBolt className="text-amber-400 ml-auto" size={18}/>
                    </div>
                )}

                {/* ══ PLANS GRID ══ */}
                {plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 text-slate-400 gap-3">
                        <FaLayerGroup size={40} className="opacity-20"/>
                        <p className="font-semibold text-slate-600">No plans available</p>
                        <p className="text-sm">Please check back later or contact admin.</p>
                    </div>
                ) : (
                    <div className={`grid gap-5 ${plans.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : plans.length === 2 ? "grid-cols-2" : plans.length === 3 ? "grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
                        {plans.map((plan, idx) => {
                            const a         = ACCENTS[idx % ACCENTS.length];
                            const active    = isActive(plan);
                            const isRenew   = isRenewCard(plan);
                            const fallback  = isFallback(plan);
                            const isLoading = subscribing === plan._id;

                            return (
                                <div key={plan._id}
                                    className={`plan-card ${active ? "plan-active" : ""} ${isRenew && !active ? "plan-renew" : ""} bg-white rounded-2xl overflow-hidden relative`}
                                    style={{
                                        border:    active  ? `2px solid ${a.hex}` : isRenew ? "2px dashed #f59e0b" : "1.5px solid #f1f5f9",
                                        boxShadow: active  ? `0 0 0 4px ${a.hex}20, 0 12px 32px rgba(0,0,0,0.10)` : isRenew ? "0 0 0 3px rgba(245,158,11,0.18)" : "0 1px 8px rgba(0,0,0,0.06)",
                                    }}>

                                    {active && (
                                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-bold"
                                            style={{ background:`linear-gradient(135deg,${a.hex},${a.hex}cc)`, boxShadow:`0 2px 8px ${a.hex}50` }}>
                                            <FaStar size={8}/> ACTIVE
                                        </div>
                                    )}

                                    {isRenew && !active && (
                                        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-bold"
                                            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                                            {fallback ? <><FaExclamationTriangle size={8}/> SUGGESTED</> : <><FaRedo size={8}/> RENEW</>}
                                        </div>
                                    )}

                                    <div className={`bg-gradient-to-br ${a.grad} p-6 relative overflow-hidden`}>
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle, white 1px, transparent 1px)", backgroundSize:"16px 16px" }}/>
                                        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                                            <FaLayerGroup size={20} className="text-white"/>
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-1">{plan.plan_name}</h3>
                                        <span className="text-white/70 text-xs flex items-center gap-1.5">
                                            <FaClock size={10}/> {plan.plan_duration} month{plan.plan_duration > 1 ? "s" : ""}
                                        </span>
                                    </div>

                                    <div className="p-5">
                                        <div className="mb-1 flex items-end gap-1">
                                            <span className="text-slate-400 text-sm font-semibold mb-1">₹</span>
                                            <span className="text-4xl font-bold text-slate-900 leading-none">{plan.plan_price.toLocaleString()}</span>
                                        </div>
                                        <p className="text-slate-400 text-xs mb-4">≈ ₹{Math.round(plan.plan_price / plan.plan_duration).toLocaleString()} / month</p>

                                        {/* Fallback notice inside card */}
                                        {fallback && (
                                            <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                                                <p className="text-amber-700 text-[11px] font-semibold flex items-start gap-1.5">
                                                    <FaExclamationTriangle size={10} className="mt-0.5 shrink-0 text-amber-500"/>
                                                    Your previous plan is no longer available. This is the closest alternative.
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2 mb-5">
                                            {[
                                                "Unlimited Appointments",
                                                "Doctor Management",
                                                "Patient Records",
                                                "Reschedule Requests",
                                                `${plan.plan_duration} Month${plan.plan_duration > 1 ? "s" : ""} Access`,
                                            ].map(f => (
                                                <div key={f} className="flex items-center gap-2 text-xs text-slate-600">
                                                    <FaCheckCircle size={11} style={{ color: a.hex, flexShrink: 0 }}/> {f}
                                                </div>
                                            ))}
                                        </div>

                                        {active ? (
                                            <div className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold ${a.light} ${a.text} ${a.border} border`}>
                                                <FaCheckCircle size={13}/> Currently Active
                                            </div>
                                        ) : isRenew ? (
                                            <button className="sub-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                                                style={{ background:"linear-gradient(135deg,#f59e0b,#d97706)", boxShadow:"0 4px 14px rgba(245,158,11,0.35)" }}
                                                onClick={() => handleSubscribe(plan)} disabled={!!subscribing}>
                                                {isLoading
                                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Processing…</>
                                                    : <><FaRedo size={12}/> {fallback ? "Subscribe Now" : "Renew Plan"}</>
                                                }
                                            </button>
                                        ) : (
                                            <button className="sub-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                                                style={{ background:`linear-gradient(135deg,${a.hex},${a.hex}cc)`, boxShadow:`0 4px 14px ${a.hex}30` }}
                                                onClick={() => handleSubscribe(plan)} disabled={!!subscribing}>
                                                {isLoading
                                                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Processing…</>
                                                    : currentPlan ? <><FaRedo size={12}/> Switch Plan</> : <><FaBolt size={12}/> Subscribe Now</>
                                                }
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-center text-xs text-slate-400 mt-8 font-medium">
                    All plans include full access to Carexa Hospital Management. Switching plans takes effect immediately.
                </p>
            </div>
        </div>
    );
};

export default HospitalPlans;