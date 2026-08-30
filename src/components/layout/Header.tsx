import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, LayoutDashboard, User, Crown, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import logo from '@/assets/logo-imobispace.png';

export function Header() {
  const { user, profile, signOut, isAdmin, isBroker } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <img src={logo} alt="ImobiSpace Home" className="h-11 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-primary">Lançamentos</Link>
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-primary">Empreendimentos</Link>
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-primary">Sobre nós</Link>
          <Link to="/" className="text-xs uppercase tracking-[0.18em] text-white/75 transition hover:text-primary">Contato</Link>
          {user && (isAdmin || isBroker) && (
            <Link to="/dashboard" className="text-xs uppercase tracking-[0.18em] text-primary">Painel</Link>
          )}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <a href="https://wa.me/5541999999999" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="border-white/20 bg-transparent text-white hover:bg-white/10">WhatsApp</Button>
          </a>
          {user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/70 hover:text-white"><LogOut className="w-4 h-4" /></Button>
          ) : (
            <Link to="/auth"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><LogIn className="w-4 h-4 mr-2" />Área do Corretor</Button></Link>
          )}
        </div>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-black/95 px-6 py-6">
          <nav className="flex flex-col gap-5">
            <Link onClick={() => setOpen(false)} to="/" className="text-sm uppercase tracking-[0.18em] text-white/80">Lançamentos</Link>
            <Link onClick={() => setOpen(false)} to="/" className="text-sm uppercase tracking-[0.18em] text-white/80">Empreendimentos</Link>
            <Link onClick={() => setOpen(false)} to="/" className="text-sm uppercase tracking-[0.18em] text-white/80">Sobre nós</Link>
            <Link onClick={() => setOpen(false)} to="/" className="text-sm uppercase tracking-[0.18em] text-white/80">Contato</Link>
            <a href="https://wa.me/5541999999999" target="_blank" rel="noreferrer"><Button className="w-full bg-primary text-primary-foreground">Falar pelo WhatsApp</Button></a>
          </nav>
        </div>
      )}
    </header>
  );
}
