import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles } from 'lucide-react';

export function HeroSection() {
  const scrollToProperties = () => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, white 2px, transparent 0)`,
          backgroundSize: '50px 50px',
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-white/10 blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-secondary/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-white/5 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }} />

      <div className="container relative z-10 text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 animate-fade-in">
          <Sparkles className="w-4 h-4 text-secondary" />
          <span className="text-sm text-white/90">Tecnologia e Inovação Imobiliária</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
          Encontre o Imóvel
          <span className="block text-secondary mt-2">dos Seus Sonhos</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Descubra empreendimentos exclusivos com descrições criadas por Inteligência Artificial 
          para ajudá-lo a encontrar o lar perfeito.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button variant="hero" size="xl" onClick={scrollToProperties}>
            Ver Empreendimentos
            <ArrowDown className="w-5 h-5 animate-bounce" />
          </Button>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
