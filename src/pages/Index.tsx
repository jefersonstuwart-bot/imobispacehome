import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { HeroSection } from '@/components/home/HeroSection';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { supabase } from '@/integrations/supabase/client';

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

      <section id="properties" className="py-20 px-4">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Empreendimentos Disponíveis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça nossa seleção exclusiva de imóveis com descrições geradas por IA 
              para uma experiência única de descoberta.
            </p>
          </div>

          <PropertyGrid properties={properties || []} loading={isLoading} />
        </div>
      </section>
    </Layout>
  );
}
