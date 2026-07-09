import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Clock, CreditCard, XCircle, Loader2, RefreshCw, ShieldAlert, Euro } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/usePageTitle";

type SubscriptionRow = {
  id: string;
  userId: string;
  email: string;
  plan: string;
  status: string;
  molliePaymentId: string | null;
  mollieCustomerId: string | null;
  mollieSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const PLAN_LABEL: Record<string, string> = {
  basic: "Basis",
  pro: "Pro",
  coaching: "Coaching",
  pending: "In afwachting",
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  active: { label: "Actief", icon: CheckCircle, className: "bg-[#f28a1a]/10 text-[#f28a1a] dark:bg-[#f28a1a]/30 dark:text-[#f28a1a]" },
  trialing: { label: "In afwachting", icon: Clock, className: "bg-[#f28a1a]/10 text-[#f28a1a] dark:bg-[#f28a1a]/30 dark:text-[#f28a1a]" },
  cancelled: { label: "Geannuleerd", icon: XCircle, className: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400" },
  past_due: { label: "Achterstallig", icon: AlertTriangle, className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function isStaleTrialing(row: SubscriptionRow): boolean {
  if (row.status !== "trialing") return false;
  const age = Date.now() - new Date(row.createdAt).getTime();
  return age > 24 * 60 * 60 * 1000;
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, icon: CreditCard, className: "bg-muted text-muted-foreground" };
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={`gap-1 ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" });
}

function truncate(s: string | null, n = 18): string {
  if (!s) return "—";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function AdminBetalingenPage() {
  usePageTitle("Betalingen – Admin");
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [forcePlanTarget, setForcePlanTarget] = useState<SubscriptionRow | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("pro");

  const { data: rows, isLoading, refetch, isFetching } = useQuery<SubscriptionRow[]>({
    queryKey: ["/api/admin/subscriptions"],
  });

  const forcePlanMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${id}/force-plan`, { plan });
      return res.json();
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setForcePlanTarget(null);
      toast({ title: "Plan bijgewerkt", description: `Abonnement is handmatig ingesteld op ${PLAN_LABEL[vars.plan] ?? vars.plan}.` });
    },
    onError: () => {
      toast({ title: "Fout", description: "Kon het plan niet bijwerken.", variant: "destructive" });
    },
  });

  const filtered = (rows ?? []).filter(r => statusFilter === "all" || r.status === statusFilter);

  const staleCount = (rows ?? []).filter(isStaleTrialing).length;
  const failedCount = (rows ?? []).filter(r => r.status === "past_due").length;
  const activeCount = (rows ?? []).filter(r => r.status === "active").length;
  const trialingCount = (rows ?? []).filter(r => r.status === "trialing").length;

  return (
    <div style={{ background: "#f4f7fc", minHeight: "100vh", padding: "28px 20px 60px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#eaf6ee", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Euro style={{ width: 24, height: 24, color: "#1a6b3a" }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#0b2240" }} data-testid="heading-admin-betalingen">Betalingen</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>Overzicht van Mollie-subscriptions en betalingsstatus.</p>
          </div>
        </div>
        <Button variant="outline" size="default" onClick={() => refetch()} disabled={isFetching} data-testid="button-refresh">
          {isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Vernieuwen
        </Button>
      </div>

      {/* ── Alert: stale trialing ── */}
      {staleCount > 0 && (
        <div className="flex items-start gap-3 rounded-md border border-[#f28a1a]/30 bg-[#f28a1a]/10 dark:border-[#f28a1a] dark:bg-[#f28a1a]/30 px-4 py-3" data-testid="alert-stale-trialing">
          <ShieldAlert className="h-5 w-5 text-[#f28a1a] dark:text-[#f28a1a] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#f28a1a] dark:text-[#f28a1a]/30">
              {staleCount} subscription{staleCount > 1 ? "s" : ""} in afwachting ouder dan 24 uur
            </p>
            <p className="text-xs text-[#f28a1a] dark:text-[#f28a1a] mt-0.5">
              Mogelijk is een webhook niet aangekomen. Controleer en gebruik de noodhulp-knop indien nodig.
            </p>
          </div>
        </div>
      )}

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-5 pb-5"><Skeleton className="h-14 w-full" /></CardContent></Card>
          ))
        ) : (
          <>
            <Card data-testid="kpi-active">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs text-muted-foreground font-medium mb-1">Actief</p>
                <p className="text-3xl font-bold text-[#f28a1a] dark:text-[#f28a1a]">{activeCount}</p>
              </CardContent>
            </Card>
            <Card data-testid="kpi-trialing">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs text-muted-foreground font-medium mb-1">In afwachting</p>
                <p className={`text-3xl font-bold ${staleCount > 0 ? "text-[#f28a1a] dark:text-[#f28a1a]" : ""}`}>{trialingCount}</p>
              </CardContent>
            </Card>
            <Card data-testid="kpi-failed">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs text-muted-foreground font-medium mb-1">Mislukt / achterstallig</p>
                <p className={`text-3xl font-bold ${failedCount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>{failedCount}</p>
              </CardContent>
            </Card>
            <Card data-testid="kpi-total">
              <CardContent className="pt-5 pb-4 px-5">
                <p className="text-xs text-muted-foreground font-medium mb-1">Totaal</p>
                <p className="text-3xl font-bold">{rows?.length ?? 0}</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Table card ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Subscriptions</CardTitle>
              <CardDescription>{filtered.length} resultaten</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter op status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="trialing">In afwachting</SelectItem>
                <SelectItem value="past_due">Achterstallig</SelectItem>
                <SelectItem value="cancelled">Geannuleerd</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="px-6 space-y-3 py-2">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Geen subscriptions gevonden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Betaaldatum</TableHead>
                  <TableHead>Vervaldatum</TableHead>
                  <TableHead>Mollie Payment ID</TableHead>
                  <TableHead>Actie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const stale = isStaleTrialing(row);
                  return (
                    <TableRow
                      key={row.id}
                      data-testid={`row-subscription-${row.id}`}
                      className={stale ? "bg-[#f28a1a]/60 dark:bg-[#f28a1a]/20" : undefined}
                    >
                      <TableCell className="font-medium max-w-[180px] truncate" title={row.email}>
                        <span className="flex items-center gap-1.5">
                          {stale && <AlertTriangle className="h-3.5 w-3.5 text-[#f28a1a] shrink-0" />}
                          {row.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{PLAN_LABEL[row.plan] ?? row.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(row.updatedAt)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(row.currentPeriodEnd)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground" title={row.molliePaymentId ?? ""}>
                        {truncate(row.molliePaymentId, 20)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setForcePlanTarget(row); setSelectedPlan(row.plan === "basic" ? "pro" : "basic"); }}
                          data-testid={`button-force-plan-${row.id}`}
                        >
                          Plan wijzigen
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Force-plan dialog ── */}
      <Dialog open={!!forcePlanTarget} onOpenChange={(o) => { if (!o) setForcePlanTarget(null); }}>
        <DialogContent data-testid="dialog-force-plan">
          <DialogHeader>
            <DialogTitle>Noodhulp: Plan wijzigen</DialogTitle>
            <DialogDescription>
              Wijzig het plan voor <strong>{forcePlanTarget?.email}</strong> handmatig. Dit werkt ook de subscription-status bij naar "actief".
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium mb-1.5 block">Nieuw plan</label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger data-testid="select-force-plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basis</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setForcePlanTarget(null)}>Annuleren</Button>
            <Button
              onClick={() => forcePlanTarget && forcePlanMutation.mutate({ id: forcePlanTarget.id, plan: selectedPlan })}
              disabled={forcePlanMutation.isPending}
              data-testid="button-confirm-force-plan"
            >
              {forcePlanMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Plan opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
  );
}
