import { Mail, Phone, MapPin, Crown } from 'lucide-react';
import logo from '@/assets/logo-imobispace.png';

export function Footer() {
  return (
    <footer className="bg-secondary text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-black rounded-xl p-3 shadow-lg border border-white/10">
                <img 
                  src={logo} 
                  alt="ImobiSpace Home" 
                  className="h-10 w-auto"
                />
              </div>
            </div>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed font-light">
              Experiência imobiliária de alto padrão. Conectamos você aos 
              empreendimentos mais exclusivos do mercado.
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Crown className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest font-medium">Premium Experience</span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold text-primary">Contato Exclusivo</h4>
            <div className="space-y-4 text-sm text-white/60">
              <a href="mailto:contato@imobispace.com" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Mail className="w-4 h-4 text-primary/60" />
                contato@imobispace.com
              </a>
              <a href="tel:+5511999999999" className="flex items-center gap-3 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-primary/60" />
                (11) 99999-9999
              </a>
              <p className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary/60" />
                São Paulo, SP
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-display text-lg font-semibold text-primary">Atendimento</h4>
            <div className="space-y-2 text-sm text-white/60 font-light">
              <p>Segunda a Sexta: 9h às 19h</p>
              <p>Sábado: 9h às 14h</p>
              <p className="text-primary/80 font-medium mt-4">Agendamento exclusivo disponível</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40 tracking-wide">
            © {new Date().getFullYear()} ImobiSpace Home. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
            <a href="#" className="hover:text-primary transition-colors">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
