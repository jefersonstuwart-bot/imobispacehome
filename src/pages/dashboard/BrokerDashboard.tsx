import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  FileText, 
  Clock, 
  CheckCircle,
  Wifi,
  WifiOff,
  User,
  Phone,
  Mail,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

export default function BrokerDashboard() {
  const { user, profile, updateStatus } = useAuth();
  const queryClient = useQueryClient();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const isOnline = profile?.status === 'online';

  const { data: proposals } = useQuery({
    queryKey: ['broker-proposals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          property:properties(name, location)
        `)
        .eq('assigned_broker_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleStatusToggle = async () => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = isOnline ? 'offline' : 'online';
      await updateStatus(newStatus);
      toast.success(newStatus === 'online' ? 'Você está online!' : 'Você está offline');
      queryClient.invalidateQueries({ queryKey: ['broker-proposals'] });
    } catch (error) {
      toast.error('Erro ao atualizar status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const stats = {
    total: proposals?.length || 0,
    pending: proposals?.filter(p => p.status === 'pending_acceptance').length || 0,
    inProgress: proposals?.filter(p => p.status === 'in_progress').length || 0,
    completed: proposals?.filter(p => p.status === 'completed').length || 0,
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending_acceptance: { label: 'Aguardando Aceite', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      in_progress: { label: 'Em Atendimento', className: 'bg-primary/20 text-primary border-primary/30' },
      completed: { label: 'Finalizada', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    };
    return config[status] || { label: status, className: 'bg-muted' };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header with Online Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Minhas Propostas
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas propostas e mantenha-se disponível
            </p>
          </div>

          {/* Online/Offline Toggle - PROMINENT */}
          <Card className={`border-2 transition-all duration-300 ${
            isOnline 
              ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
              : 'border-muted-foreground/30 bg-muted'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/50'}`}>
                  {isOnline ? (
                    <Wifi className="w-6 h-6 text-white" />
                  ) : (
                    <WifiOff className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={`text-lg font-bold ${isOnline ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isOnline ? 'Recebendo propostas' : 'Não está recebendo propostas'}
                  </span>
                </div>
                <Switch
                  checked={isOnline}
                  onCheckedChange={handleStatusToggle}
                  disabled={isUpdatingStatus}
                  className="ml-4 data-[state=checked]:bg-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Propostas
              </CardTitle>
              <FileText className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aguardando Aceite
              </CardTitle>
              <Clock className="w-5 h-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Em Atendimento
              </CardTitle>
              <User className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Finalizadas
              </CardTitle>
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Proposals List */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle>Propostas Atribuídas</CardTitle>
          </CardHeader>
          <CardContent>
            {proposals && proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const statusConfig = getStatusBadge(proposal.status || '');
                  return (
                    <div
                      key={proposal.id}
                      className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-secondary" />
                            <span className="font-semibold">
                              {proposal.property?.name}
                            </span>
                            <Badge variant="outline" className={statusConfig.className}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {proposal.client_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {proposal.client_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {proposal.client_email}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {proposal.status === 'pending_acceptance' && (
                            <Button variant="gold" size="sm">
                              Aceitar Proposta
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma proposta atribuída ainda</p>
                <p className="text-sm mt-1">
                  {isOnline 
                    ? 'Aguarde, novas propostas serão distribuídas automaticamente'
                    : 'Fique online para receber propostas'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
