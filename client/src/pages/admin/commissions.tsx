import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, CheckCircle, Clock, Ban, TrendingUp, Euro, Users, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Commission {
  id: string;
  affiliateUserId: string;
  affiliateEmail: string;
  referredUserId: string;
  referredEmail: string;
  planDisplayName: string;
  plan: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
}

interface AffiliateStats {
  userId: string;
  email: string;
  referralCode: string;
  activeReferrals: number;
  totalCommission: number;
  pendingCommission: number;
  paidCommission: number;
}

export default function AdminCommissionsPage() {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: commissions, isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ["/api/admin/commissions"],
  });

  const { data: affiliateStats, isLoading: statsLoading } = useQuery<AffiliateStats[]>({
    queryKey: ["/api/admin/affiliates"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/commissions/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      toast({
        title: "Status bijgewerkt",
        description: "De commissie status is succesvol bijgewerkt.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon status niet bijwerken. Probeer het opnieuw.",
        variant: "destructive",
      });
    },
  });

  const bulkPayMutation = useMutation({
    mutationFn: async (commissionIds: string[]) => {
      const res = await apiRequest("POST", "/api/admin/commissions/bulk-pay", { commissionIds });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/affiliates"] });
      setSelectedIds(new Set());
      toast({
        title: "Uitbetaling verwerkt",
        description: `${data.successful} commissies zijn gemarkeerd als uitbetaald.`,
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Kon bulk uitbetaling niet verwerken.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Openstaand</Badge>;
      case "approved":
        return <Badge variant="default" className="gap-1 bg-blue-500"><TrendingUp className="h-3 w-3" />Goedgekeurd</Badge>;
      case "paid":
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />Uitbetaald</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" />Geannuleerd</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleSelectAll = () => {
    const payableIds = filteredCommissions
      ?.filter(c => c.status === "pending" || c.status === "approved")
      .map(c => c.id) || [];
    
    if (selectedIds.size === payableIds.length && payableIds.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(payableIds));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkPay = () => {
    if (selectedIds.size === 0) return;
    bulkPayMutation.mutate(Array.from(selectedIds));
  };

  const downloadCSV = (type: "commissions" | "affiliates") => {
    const url = type === "commissions" 
      ? "/api/admin/commissions/csv" 
      : "/api/admin/affiliates/csv";
    window.open(url, "_blank");
  };

  const filteredCommissions = commissions?.filter(c => 
    statusFilter === "all" || c.status === statusFilter
  );

  const totals = {
    pending: commissions?.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0) || 0,
    approved: commissions?.filter(c => c.status === "approved").reduce((sum, c) => sum + c.amount, 0) || 0,
    paid: commissions?.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0) || 0,
    total: commissions?.reduce((sum, c) => sum + c.amount, 0) || 0,
  };

  if (commissionsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-regio-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-admin-commissions">Commissie Beheer</h1>
          <p className="text-muted-foreground">
            Beheer affiliate commissies en uitbetalingen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => downloadCSV("affiliates")} data-testid="button-download-affiliates-csv">
            <Download className="h-4 w-4 mr-2" />
            Affiliates CSV
          </Button>
          <Button variant="outline" onClick={() => downloadCSV("commissions")} data-testid="button-download-commissions-csv">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Commissies CSV
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-pending-total">
                  €{totals.pending.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Openstaand</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-approved-total">
                  €{totals.approved.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Goedgekeurd</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-paid-total">
                  €{totals.paid.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Uitbetaald</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-regio-purple/10">
                <Users className="h-6 w-6 text-regio-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold" data-testid="text-affiliate-count">
                  {affiliateStats?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Actieve affiliates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Commissies</CardTitle>
              <CardDescription>
                {filteredCommissions?.length || 0} commissies gevonden
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter op status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle statussen</SelectItem>
                  <SelectItem value="pending">Openstaand</SelectItem>
                  <SelectItem value="approved">Goedgekeurd</SelectItem>
                  <SelectItem value="paid">Uitbetaald</SelectItem>
                  <SelectItem value="cancelled">Geannuleerd</SelectItem>
                </SelectContent>
              </Select>
              
              {selectedIds.size > 0 && (
                <Button 
                  onClick={handleBulkPay}
                  disabled={bulkPayMutation.isPending}
                  data-testid="button-bulk-pay"
                >
                  {bulkPayMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Euro className="h-4 w-4 mr-2" />
                  )}
                  {selectedIds.size} markeren als uitbetaald
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCommissions && filteredCommissions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={
                        filteredCommissions.filter(c => c.status === "pending" || c.status === "approved").length > 0 &&
                        selectedIds.size === filteredCommissions.filter(c => c.status === "pending" || c.status === "approved").length
                      }
                      onCheckedChange={toggleSelectAll}
                      data-testid="checkbox-select-all"
                    />
                  </TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Aangebracht lid</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Bedrag</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acties</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => (
                  <TableRow key={commission.id} data-testid={`row-commission-${commission.id}`}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.has(commission.id)}
                        onCheckedChange={() => toggleSelect(commission.id)}
                        disabled={commission.status === "paid" || commission.status === "cancelled"}
                        data-testid={`checkbox-${commission.id}`}
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(commission.createdAt).toLocaleDateString('nl-NL')}
                    </TableCell>
                    <TableCell className="font-medium">{commission.affiliateEmail}</TableCell>
                    <TableCell>{commission.referredEmail}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{commission.planDisplayName}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      €{commission.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(commission.status)}</TableCell>
                    <TableCell>
                      {(commission.status === "pending" || commission.status === "approved") && (
                        <div className="flex gap-1">
                          {commission.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatusMutation.mutate({ id: commission.id, status: "approved" })}
                              disabled={updateStatusMutation.isPending}
                              data-testid={`button-approve-${commission.id}`}
                            >
                              <TrendingUp className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600"
                            onClick={() => updateStatusMutation.mutate({ id: commission.id, status: "paid" })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-pay-${commission.id}`}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => updateStatusMutation.mutate({ id: commission.id, status: "cancelled" })}
                            disabled={updateStatusMutation.isPending}
                            data-testid={`button-cancel-${commission.id}`}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {commission.status === "paid" && commission.paidAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(commission.paidAt).toLocaleDateString('nl-NL')}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen commissies gevonden</p>
              <p className="text-sm">Commissies verschijnen hier zodra er referrals betalingen doen.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {affiliateStats && affiliateStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Overzicht</CardTitle>
            <CardDescription>
              Samenvatting per affiliate partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead className="text-right">Actieve Referrals</TableHead>
                  <TableHead className="text-right">Openstaand</TableHead>
                  <TableHead className="text-right">Uitbetaald</TableHead>
                  <TableHead className="text-right">Totaal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliateStats.map((stat) => (
                  <TableRow key={stat.userId} data-testid={`row-affiliate-${stat.userId}`}>
                    <TableCell className="font-medium">{stat.email}</TableCell>
                    <TableCell className="font-mono text-sm">{stat.referralCode}</TableCell>
                    <TableCell className="text-right">{stat.activeReferrals}</TableCell>
                    <TableCell className="text-right">€{stat.pendingCommission.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-600">€{stat.paidCommission.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">€{stat.totalCommission.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
