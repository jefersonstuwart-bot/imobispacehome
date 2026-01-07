import { Button } from '@/components/ui/button';
import { ArrowDown, Sparkles, Crown, Award } from 'lucide-react';

export function HeroSection() {
  const scrollToProperties = () => {
    document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Padrão de fundo elegante */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Elementos flutuantes dourados */}
      <div className="absolute top-32 left-20 w-2 h-2 rounded-full bg-primary animate-float opacity-60" />
      <div className="absolute top-40 right-32 w-3 h-3 rounded-full bg-primary animate-float opacity-40" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/4 w-2 h-2 rounded-full bg-primary animate-float opacity-50" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-20 w-1.5 h-1.5 rounded-full bg-primary animate-float opacity-70" style={{ animationDelay: '0.5s' }} />

      {/* Linhas decorativas */}
      <div className="absolute top-0 left-1/2 w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-1/2 w-px h-32 bg-gradient-to-t from-transparent via-primary/30 to-transparent" />

      <div className="container relative z-10 text-center px-4">
        {/* Badge de luxo */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8 animate-fade-in">
          <Crown className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium tracking-widest uppercase text-primary">
            Experiência Premium
          </span>
          <Award className="w-4 h-4 text-primary" />
        </div>

        {/* Título principal */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 animate-slide-up leading-tight">
          Descubra a Arte de
          <span className="block text-gradient mt-2">Viver com Exclusividade</span>
        </h1>

        {/* Linha decorativa */}
        <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-12 animate-slide-up font-light tracking-wide" style={{ animationDelay: '0.2s' }}>
          Empreendimentos selecionados com curadoria exclusiva. 
          Cada detalhe pensado para quem valoriza o extraordinário.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button 
            variant="hero" 
            size="xl" 
            onClick={scrollToProperties}
            className="group"
          >
            <span className="tracking-wider">Explorar Empreendimentos</span>
            <ArrowDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform" />
          </Button>
        </div>

        {/* Indicadores de credibilidade */}
        <div className="flex items-center justify-center gap-12 mt-20 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">50+</p>
            <p className="text-sm uppercase tracking-widest text-white font-medium mt-2 drop-shadow-md">Empreendimentos</p>
          </div>
          <div className="w-px h-16 bg-primary/40" />
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">R$2B+</p>
            <p className="text-sm uppercase tracking-widest text-white font-medium mt-2 drop-shadow-md">Em Negociações</p>
          </div>
          <div className="w-px h-16 bg-primary/40" />
          <div className="text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-primary drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">500+</p>
            <p className="text-sm uppercase tracking-widest text-white font-medium mt-2 drop-shadow-md">Clientes Premium</p>
          </div>
        </div>
      </div>

      {/* Gradiente de transição para seção abaixo */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
