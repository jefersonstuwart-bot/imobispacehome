import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  MapPin, 
  Clock, 
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Propostas fictícias de marketing para demonstração
const mockProposals = [
  {
    id: 'mock-1',
    client_name: 'Cleide M.',
    location: 'Santa Cândida',
    property_name: 'Residencial Vista Verde',
    time_ago: '2 minutos',
    status: 'Documentos enviados',
    type: 'Financiado'
  },
  {
    id: 'mock-2',
    client_name: 'Roberto S.',
    location: 'Batel',
    property_name: 'Edifício Premium Tower',
    time_ago: '8 minutos',
    status: 'Em análise',
    type: 'À vista'
  },
  {
    id: 'mock-3',
    client_name: 'Fernanda L.',
    location: 'Ecoville',
    property_name: 'Jardins do Parque',
    time_ago: '15 minutos',
    status: 'Aprovado',
    type: 'Financiado'
  },
  {
    id: 'mock-4',
    client_name: 'Carlos A.',
    location: 'Centro Cívico',
    property_name: 'Metropolitan Business',
    time_ago: '23 minutos',
    status: 'Documentos enviados',
    type: 'À vista'
  },
  {
    id: 'mock-5',
    client_name: 'Juliana P.',
    location: 'Cabral',
    property_name: 'Reserva do Bosque',
    time_ago: '31 minutos',
    status: 'Em atendimento',
    type: 'Financiado'
  }
];

// Stats dinâmicos que mudam a cada rotação
const statsVariants = [
  { proposals: 47, approval: 92, responseTime: 3, negotiated: 12 },
  { proposals: 51, approval: 89, responseTime: 4, negotiated: 14 },
  { proposals: 43, approval: 94, responseTime: 2, negotiated: 11 },
  { proposals: 55, approval: 91, responseTime: 3, negotiated: 15 },
  { proposals: 49, approval: 88, responseTime: 5, negotiated: 13 },
];

export function RecentProposals() {
  const [visibleProposals, setVisibleProposals] = useState(mockProposals.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState(statsVariants[0]);

  // Buscar propriedades reais para mesclar com mock
  const { data: properties } = useQuery({
    queryKey: ['properties-for-marketing'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('name, location')
        .eq('is_active', true)
        .limit(5);
      return data || [];
    },
  });

  // Atualizar propostas mock com propriedades reais
  useEffect(() => {
    if (properties && properties.length > 0) {
      const updatedMock = mockProposals.map((proposal, index) => ({
        ...proposal,
        property_name: properties[index % properties.length]?.name || proposal.property_name,
        location: properties[index % properties.length]?.location || proposal.location,
      }));
      setVisibleProposals(updatedMock.slice(0, 3));
    }
  }, [properties]);

  // Rotacionar propostas a cada 8 segundos (mais lento)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % mockProposals.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Atualizar stats junto com a rotação
  useEffect(() => {
    setStats(statsVariants[currentIndex % statsVariants.length]);
  }, [currentIndex]);

  useEffect(() => {
    const allProposals = properties && properties.length > 0
      ? mockProposals.map((proposal, index) => ({
          ...proposal,
          property_name: properties[index % properties.length]?.name || proposal.property_name,
          location: properties[index % properties.length]?.location || proposal.location,
        }))
      : mockProposals;
    
    const start = currentIndex;
    const end = start + 3;
    const selected = [];
    for (let i = 0; i < 3; i++) {
      selected.push(allProposals[(start + i) % allProposals.length]);
    }
    setVisibleProposals(selected);
  }, [currentIndex, properties]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Em análise':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Documentos enviados':
        return 'bg-primary/20 text-primary border-primary/30';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background via-secondary/20 to-background">
      <div className="container px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <TrendingUp className="w-5 h-5 text-primary" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
          
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Demanda <span className="text-gradient">Em Tempo Real</span>
          </h2>
          
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light tracking-wide">
            Veja como outros clientes estão garantindo seus imóveis. 
            <span className="text-primary font-medium"> Não fique para trás!</span>
          </p>
        </div>

        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-emerald-400 uppercase tracking-wider">
            Atualizações ao vivo
          </span>
        </div>

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {visibleProposals.map((proposal, index) => (
            <Card 
              key={`${proposal.id}-${index}`}
              className="p-6 bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 transition-all duration-500 animate-fade-in group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{proposal.client_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {proposal.location}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(proposal.status)}>
                  {proposal.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enviou proposta para:
                </p>
                <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {proposal.property_name}
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    há {proposal.time_ago}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {proposal.type}
                  </Badge>
                </div>
              </div>

              {proposal.status === 'Documentos enviados' && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs">
                    <CheckCircle className="w-4 h-4" />
                    <span>Todos os documentos verificados</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-12 p-6 rounded-2xl bg-secondary/30 border border-border/50">
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-primary transition-all duration-500">{stats.proposals}</p>
            <p className="text-sm text-muted-foreground">Propostas hoje</p>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-emerald-400 transition-all duration-500">{stats.approval}%</p>
            <p className="text-sm text-muted-foreground">Docs aprovados</p>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-amber-400 transition-all duration-500">{stats.responseTime} min</p>
            <p className="text-sm text-muted-foreground">Tempo médio resposta</p>
          </div>
          <div className="w-px h-10 bg-border/50 hidden md:block" />
          <div className="text-center">
            <p className="font-display text-3xl font-bold text-blue-400 transition-all duration-500">R${stats.negotiated}M</p>
            <p className="text-sm text-muted-foreground">Negociado esta semana</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <Sparkles className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                Garanta seu imóvel antes que acabe!
              </h3>
              <p className="text-muted-foreground mb-4">
                Escolha o empreendimento e envie sua proposta em menos de 5 minutos
              </p>
            </div>
            <Button 
              variant="gold" 
              size="lg" 
              className="group"
              onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <FileText className="w-5 h-5 mr-2" />
              Enviar Minha Proposta
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}