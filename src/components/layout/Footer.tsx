import { Home, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display text-xl font-bold">ImobiSpace</span>
                <span className="block text-xs text-white/70">Home</span>
              </div>
            </div>
            <p className="text-sm text-white/80 max-w-xs">
              Conectando você ao imóvel dos seus sonhos com tecnologia e atendimento personalizado.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Contato</h4>
            <div className="space-y-2 text-sm text-white/80">
              <a href="mailto:contato@imobispace.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                contato@imobispace.com
              </a>
              <a href="tel:+5511999999999" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                São Paulo, SP
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-lg font-semibold">Horário de Atendimento</h4>
            <div className="space-y-1 text-sm text-white/80">
              <p>Segunda a Sexta: 9h às 18h</p>
              <p>Sábado: 9h às 13h</p>
              <p>Domingo: Fechado</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/60">
          <p>© {new Date().getFullYear()} ImobiSpace Home. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
