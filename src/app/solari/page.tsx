"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, DollarSign, TrendingUp, AlertCircle, ShieldCheck, ShieldX,
  CheckCircle, XCircle, Clock, ZoomIn, ArrowLeft, LayoutDashboard,
  Wallet, BarChart3, CreditCard, Mail, User, Banknote, Calendar,
  Activity, ChevronRight
} from "lucide-react";

type Stats = {
  totalUsers: number;
  totalInvested: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
};
type User = {
  id: string; name: string; email: string;
  walletBalance: number; totalInvested: number;
  totalInterestEarned: number; createdAt: string;
};
type Withdrawal = {
  id: string; userId: string; userName: string; userEmail: string;
  amount: number; status: string; method: string;
  bankName?: string; bankAccountName?: string; bankAccountNumber?: string;
  mobileProvider?: string; mobileNumber?: string; createdAt: string;
};
type Investment = {
  id: string; userId: string; userName: string; userEmail: string;
  planName: string; amount: number; currentInterest: number;
  expectedInterest: number; status: string; maturityDate: string; createdAt: string;
};
type Verification = {
  id: string; userId: string; userName: string; userEmail: string;
  idType: string; idFront: string | null; idBack: string | null;
  status: string; createdAt: string;
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr.replace(" ", "T"));
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString("en-KE", {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const ksh = (n: number) => `Ksh ${n.toLocaleString()}`;

// ─── Shared UI Atoms ─────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    pending:  { icon: <Clock size={10} />,        label: "Pending",  cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    approved: { icon: <CheckCircle size={10} />,  label: "Approved", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected: { icon: <XCircle size={10} />,      label: "Rejected", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    active:   { icon: <Activity size={10} />,     label: "Active",   cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    closed:   { icon: <XCircle size={10} />,      label: "Closed",   cls: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  };
  const cfg = map[status] ?? { icon: null, label: status, cls: "bg-zinc-700 text-zinc-300 border-zinc-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

const Avatar = ({ name }: { name: string }) => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500/30 to-blue-500/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
    <span className="text-[10px] font-bold text-violet-300">{name?.charAt(0)?.toUpperCase()}</span>
  </div>
);

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-5 py-3.5 text-left text-[10px] font-semibold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
    {children}
  </th>
);
const Td = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-5 py-4 text-sm text-zinc-300 whitespace-nowrap ${className}`}>{children}</td>
);

const ActionBtn = ({
  onClick, variant, children,
}: { onClick: () => void; variant: "approve" | "reject"; children: React.ReactNode }) => {
  const cls = variant === "approve"
    ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400"
    : "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 hover:border-rose-500/40 text-rose-400";
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-150 ${cls}`}>
      {children}
    </button>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <tr>
    <td colSpan={99} className="px-5 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
          <BarChart3 size={20} className="text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-500">{label}</p>
      </div>
    </td>
  </tr>
);

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, accent }: { title: string; value: any; icon: React.ReactNode; accent: string }) => (
  <div className={`rounded-xl border border-zinc-800 p-5 flex items-center gap-4`} style={{ background: "#0f1117" }}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-zinc-500 font-medium tracking-wide">{title}</p>
      <p className="text-xl font-bold text-zinc-100 mt-0.5">{value}</p>
    </div>
  </div>
);

// ─── Doc Thumbnail ────────────────────────────────────────────────────────────
const DocThumb = ({ data, label, onClick }: { data: string | null; label: string; onClick: (d: string) => void }) => {
  if (!data) return (
    <div className="w-20 h-14 rounded-lg bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center">
      <span className="text-[10px] text-zinc-600 font-medium">N/A</span>
    </div>
  );
  return (
    <button onClick={() => onClick(data)} className="group relative w-20 h-14 rounded-lg overflow-hidden border border-zinc-700/50 hover:border-zinc-500 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/50">
      <img src={`data:image/jpeg;base64,${data}`} alt={label} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
        <ZoomIn size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
};

// ─── Table Shell ──────────────────────────────────────────────────────────────
const TableShell = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto rounded-xl border border-zinc-800">
    <table className="w-full">{children}</table>
  </div>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",      label: "Overview",      icon: <LayoutDashboard size={14} /> },
  { id: "users",         label: "Users",         icon: <Users size={14} /> },
  { id: "withdrawals",   label: "Withdrawals",   icon: <Wallet size={14} /> },
  { id: "investments",   label: "Investments",   icon: <TrendingUp size={14} /> },
  { id: "verifications", label: "Verifications", icon: <ShieldCheck size={14} /> },
];

// ─── Overview Tab ─────────────────────────────────────────────────────────────
const OverviewTab = ({ users, withdrawals, investments }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div>
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Recent Users</h3>
      <div className="space-y-2">
        {users.slice(0, 5).map((u: User) => (
          <div key={u.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar name={u.name} />
              <div>
                <p className="text-sm font-medium text-zinc-200">{u.name}</p>
                <p className="text-xs text-zinc-500">{u.email}</p>
              </div>
            </div>
            <span className="text-xs text-zinc-500">{formatDateTime(u.createdAt)}</span>
          </div>
        ))}
        {users.length === 0 && <p className="text-sm text-zinc-600 py-4 text-center">No users yet</p>}
      </div>
    </div>

    <div>
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Pending Withdrawals</h3>
      <div className="space-y-2">
        {withdrawals.filter((w: Withdrawal) => w.status === "pending").slice(0, 5).map((w: Withdrawal) => (
          <div key={w.id} className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/20 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar name={w.userName} />
              <div>
                <p className="text-sm font-medium text-zinc-200">{w.userName}</p>
                <p className="text-xs text-amber-400 font-semibold">{ksh(w.amount)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status="pending" />
              <span className="text-xs text-zinc-500">{formatDateTime(w.createdAt)}</span>
            </div>
          </div>
        ))}
        {withdrawals.filter((w: Withdrawal) => w.status === "pending").length === 0 && (
          <p className="text-sm text-zinc-600 py-4 text-center">No pending withdrawals</p>
        )}
      </div>
    </div>
  </div>
);

// ─── Users Tab ────────────────────────────────────────────────────────────────
const UsersTab = ({ users }: { users: User[] }) => (
  <TableShell>
    <thead>
      <tr className="border-b border-zinc-800">
        <Th>Name</Th><Th>Email</Th><Th>Wallet</Th><Th>Invested</Th><Th>Interest</Th><Th>Joined</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-800/50">
      {users.length === 0 ? <EmptyState label="No users found" /> : users.map((u) => (
        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
          <Td>
            <div className="flex items-center gap-2.5">
              <Avatar name={u.name} />
              <span className="font-medium text-zinc-200">{u.name}</span>
            </div>
          </Td>
          <Td><span className="text-zinc-400">{u.email}</span></Td>
          <Td><span className="text-emerald-400 font-medium">{ksh(u.walletBalance)}</span></Td>
          <Td>{ksh(u.totalInvested)}</Td>
          <Td><span className="text-blue-400">{ksh(u.totalInterestEarned)}</span></Td>
          <Td><span className="text-zinc-500">{formatDateTime(u.createdAt)}</span></Td>
        </tr>
      ))}
    </tbody>
  </TableShell>
);

// ─── Withdrawals Tab ──────────────────────────────────────────────────────────
const WithdrawalsTab = ({ withdrawals, onApprove, onReject }: any) => (
  <TableShell>
    <thead>
      <tr className="border-b border-zinc-800">
        <Th>User</Th><Th>Amount</Th><Th>Method</Th><Th>Status</Th><Th>Date</Th><Th>Actions</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-800/50">
      {withdrawals.length === 0 ? <EmptyState label="No withdrawals found" /> : withdrawals.map((w: Withdrawal) => (
        <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
          <Td>
            <div className="flex items-center gap-2.5">
              <Avatar name={w.userName} />
              <div>
                <p className="font-medium text-zinc-200">{w.userName}</p>
                <p className="text-xs text-zinc-500">{w.userEmail}</p>
              </div>
            </div>
          </Td>
          <Td><span className="text-amber-400 font-semibold">{ksh(w.amount)}</span></Td>
          <Td>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/50 text-xs text-zinc-300">
              {w.method === "mobile"
                ? `${w.mobileProvider || "Mobile"} · ${w.mobileNumber || "N/A"}`
                : w.method === "bank"
                ? `${w.bankName || "Bank"} · ${w.bankAccountName || "N/A"}`
                : w.method || "N/A"}
            </span>
          </Td>
          <Td><StatusBadge status={w.status} /></Td>
          <Td><span className="text-zinc-500">{formatDateTime(w.createdAt)}</span></Td>
          <Td>
            {w.status === "pending" ? (
              <div className="flex gap-2">
                <ActionBtn variant="approve" onClick={() => onApprove(w.id)}>
                  <CheckCircle size={12} /> Approve
                </ActionBtn>
                <ActionBtn variant="reject" onClick={() => onReject(w.id)}>
                  <XCircle size={12} /> Reject
                </ActionBtn>
              </div>
            ) : <span className="text-zinc-600 text-xs">—</span>}
          </Td>
        </tr>
      ))}
    </tbody>
  </TableShell>
);

// ─── Investments Tab ──────────────────────────────────────────────────────────
const InvestmentsTab = ({ investments }: { investments: Investment[] }) => (
  <TableShell>
    <thead>
      <tr className="border-b border-zinc-800">
        <Th>User</Th><Th>Plan</Th><Th>Amount</Th><Th>Current Interest</Th><Th>Expected Interest</Th><Th>Status</Th><Th>Maturity</Th>
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-800/50">
      {investments.length === 0 ? <EmptyState label="No investments found" /> : investments.map((inv) => (
        <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
          <Td>
            <div className="flex items-center gap-2.5">
              <Avatar name={inv.userName} />
              <div>
                <p className="font-medium text-zinc-200">{inv.userName}</p>
                <p className="text-xs text-zinc-500">{inv.userEmail}</p>
              </div>
            </div>
          </Td>
          <Td>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/50 text-xs text-zinc-300">
              {inv.planName}
            </span>
          </Td>
          <Td><span className="font-semibold text-zinc-200">{ksh(inv.amount)}</span></Td>
          <Td><span className="text-emerald-400">{ksh(inv.currentInterest)}</span></Td>
          <Td><span className="text-blue-400">{ksh(inv.expectedInterest)}</span></Td>
          <Td><StatusBadge status={inv.status} /></Td>
          <Td><span className="text-zinc-500">{formatDateTime(inv.maturityDate)}</span></Td>
        </tr>
      ))}
    </tbody>
  </TableShell>
);

// ─── Verifications Tab ────────────────────────────────────────────────────────
const VerificationsTab = ({ verifications, onApprove, onReject, onClickImage }: any) => {
  const counts = {
    pending:  verifications.filter((v: Verification) => v.status === "pending").length,
    approved: verifications.filter((v: Verification) => v.status === "approved").length,
    rejected: verifications.filter((v: Verification) => v.status === "rejected").length,
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Clock size={11} /> {counts.pending} pending
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle size={11} /> {counts.approved} approved
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
          <XCircle size={11} /> {counts.rejected} rejected
        </span>
      </div>

      <TableShell>
        <thead>
          <tr className="border-b border-zinc-800">
            <Th>User</Th><Th>ID Type</Th><Th>Front</Th><Th>Back</Th><Th>Status</Th><Th>Date</Th><Th>Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {verifications.length === 0 ? <EmptyState label="No verification submissions yet" /> : verifications.map((v: Verification) => (
            <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
              <Td>
                <div className="flex items-center gap-2.5">
                  <Avatar name={v.userName} />
                  <div>
                    <p className="font-medium text-zinc-200">{v.userName}</p>
                    <p className="text-xs text-zinc-500">{v.userEmail}</p>
                  </div>
                </div>
              </Td>
              <Td>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/50 text-xs text-zinc-300">
                  {v.idType}
                </span>
              </Td>
              <Td><DocThumb data={v.idFront} label="Front" onClick={onClickImage} /></Td>
              <Td><DocThumb data={v.idBack} label="Back" onClick={onClickImage} /></Td>
              <Td><StatusBadge status={v.status} /></Td>
              <Td><span className="text-zinc-500">{formatDateTime(v.createdAt)}</span></Td>
              <Td>
                {v.status === "pending" ? (
                  <div className="flex gap-2">
                    <ActionBtn variant="approve" onClick={() => onApprove(v.id)}>
                      <ShieldCheck size={12} /> Approve
                    </ActionBtn>
                    <ActionBtn variant="reject" onClick={() => onReject(v.id)}>
                      <ShieldX size={12} /> Reject
                    </ActionBtn>
                  </div>
                ) : <span className="text-zinc-600 text-xs">—</span>}
              </Td>
            </tr>
          ))}
        </tbody>
      </TableShell>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { loadAdminData(); }, []);

  const loadAdminData = async () => {
    try {
      const [statsRes, usersRes, withdrawalsRes, investmentsRes, verificationsRes] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/withdrawals").then(r => r.json()),
        fetch("/api/admin/investments").then(r => r.json()),
        fetch("/api/admin/verifications").then(r => r.json()),
      ]);
      if (statsRes.error || usersRes.error) { router.push("/dashboard"); return; }
      setStats(statsRes.stats);
      setUsers(usersRes.users);
      setWithdrawals(withdrawalsRes.withdrawals);
      setInvestments(investmentsRes.investments);
      setVerifications(verificationsRes.verifications);
    } catch { router.push("/dashboard"); }
    finally { setLoading(false); }
  };

  const handleApproveWithdrawal = async (id: string) => {
    const res = await fetch("/api/admin/withdrawals/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalId: id }) });
    res.ok ? (alert("Withdrawal approved!"), loadAdminData()) : alert((await res.json()).error);
  };
  const handleRejectWithdrawal = async (id: string) => {
    const res = await fetch("/api/admin/withdrawals/reject", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalId: id }) });
    res.ok ? (alert("Withdrawal rejected and refunded!"), loadAdminData()) : alert((await res.json()).error);
  };
  const handleApproveVerification = async (id: string) => {
    const res = await fetch("/api/admin/verifications/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationId: id, approve: true }) });
    res.ok ? (alert("User verified!"), loadAdminData()) : alert((await res.json()).error);
  };
  const handleRejectVerification = async (id: string) => {
    const res = await fetch("/api/admin/verifications/approve", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ verificationId: id, approve: false }) });
    res.ok ? (alert("Verification rejected!"), loadAdminData()) : alert((await res.json()).error);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: "#080a0f" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-sm text-zinc-500">Loading admin panel...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#080a0f", fontFamily: "'IBM Plex Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>

      {/* Top bar */}
      <div className="border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30" style={{ background: "#080a0f" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <LayoutDashboard size={16} className="text-violet-400" />
          </div>
          <span className="font-bold text-zinc-100 text-lg">Admin Panel</span>
        </div>
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard title="Total Users"           value={stats.totalUsers}                   icon={<Users size={18} className="text-violet-400" />}  accent="bg-violet-500/10 border border-violet-500/20" />
            <StatCard title="Total Invested"        value={ksh(stats.totalInvested)}           icon={<DollarSign size={18} className="text-emerald-400" />} accent="bg-emerald-500/10 border border-emerald-500/20" />
            <StatCard title="Pending Withdrawals"   value={stats.pendingWithdrawals}           icon={<AlertCircle size={18} className="text-amber-400" />}  accent="bg-amber-500/10 border border-amber-500/20" />
            <StatCard title="Total Withdrawals"     value={ksh(stats.totalWithdrawals)}        icon={<TrendingUp size={18} className="text-blue-400" />}    accent="bg-blue-500/10 border border-blue-500/20" />
            <StatCard title="Pending Verifications" value={verifications.filter(v => v.status === "pending").length} icon={<ShieldCheck size={18} className="text-rose-400" />} accent="bg-rose-500/10 border border-rose-500/20" />
          </div>
        )}

        {/* Tab panel */}
        <div className="rounded-2xl border border-zinc-800 overflow-hidden" style={{ background: "#0f1117" }}>
          {/* Tab bar */}
          <div className="flex items-center gap-1 px-5 pt-4 border-b border-zinc-800 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-400 bg-violet-500/5"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                }`}
              >
                {tab.icon}{tab.label}
                {tab.id === "withdrawals" && withdrawals.filter(w => w.status === "pending").length > 0 && (
                  <span className="ml-1 bg-amber-500 text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {withdrawals.filter(w => w.status === "pending").length}
                  </span>
                )}
                {tab.id === "verifications" && verifications.filter(v => v.status === "pending").length > 0 && (
                  <span className="ml-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {verifications.filter(v => v.status === "pending").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "overview"      && <OverviewTab users={users} withdrawals={withdrawals} investments={investments} />}
            {activeTab === "users"         && <UsersTab users={users} />}
            {activeTab === "withdrawals"   && <WithdrawalsTab withdrawals={withdrawals} onApprove={handleApproveWithdrawal} onReject={handleRejectWithdrawal} />}
            {activeTab === "investments"   && <InvestmentsTab investments={investments} />}
            {activeTab === "verifications" && <VerificationsTab verifications={verifications} onApprove={handleApproveVerification} onReject={handleRejectVerification} onClickImage={(d: string) => setModalImage(`data:image/jpeg;base64,${d}`)} />}
          </div>
        </div>
      </div>

      {/* Image lightbox */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 cursor-zoom-out"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setModalImage(null)}
        >
          <img src={modalImage} className="max-w-3xl max-h-[90vh] w-full object-contain rounded-2xl shadow-2xl border border-zinc-700" />
          <button
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            onClick={() => setModalImage(null)}
          >
            <XCircle size={18} />
          </button>
        </div>
      )}
    </div>
  );
}