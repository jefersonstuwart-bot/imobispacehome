import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { RecentProposals } from '@/components/home/RecentProposals';
import { PartnersSection } from '@/components/home/PartnersSection';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles } from 'lucide-react';

export default function Index() {
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <HeroSection />

      <section id="properties" className="py-24 px-4 bg-background">
        <div className="container">
          {/* Título da seção com estilo luxuoso */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
              <Sparkles className="w-5 h-5 text-primary" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
            
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground mb-4">
              Coleção <span className="text-gradient">Exclusiva</span>
            </h2>
            
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light tracking-wide">
              Empreendimentos criteriosamente selecionados para clientes que 
              buscam excelência e sofisticação em cada detalhe.
            </p>
          </div>

          <PropertyGrid properties={properties || []} loading={isLoading} />
        </div>
      </section>

      {/* Seção de Marketing - Propostas Recentes */}
      <RecentProposals />

      {/* Seção de destaque adicional */}
      <section className="py-20 bg-secondary text-white">
        <div className="container text-center">
          <h3 className="font-display text-3xl md:text-4xl font-semibold mb-6">
            Atendimento <span className="text-primary">Personalizado</span>
          </h3>
          <p className="text-white/70 max-w-xl mx-auto mb-8 font-light">
            Nossa equipe de especialistas está pronta para guiá-lo em cada etapa 
            da sua jornada imobiliária com dedicação exclusiva.
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-primary font-display text-2xl font-semibold">24h</p>
              <p className="text-xs uppercase tracking-widest text-white/50">Resposta</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-primary font-display text-2xl font-semibold">VIP</p>
              <p className="text-xs uppercase tracking-widest text-white/50">Atendimento</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <p className="text-primary font-display text-2xl font-semibold">100%</p>
              <p className="text-xs uppercase tracking-widest text-white/50">Dedicação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Parceiros */}
      <PartnersSection />
    </Layout>
  );
}
