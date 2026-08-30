import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, LayoutDashboard, Menu, X, Search, Heart, GitCompareArrows } from 'lucide-react';
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

  const close = () => setOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between px-4">
        <Link to="/" className="flex items-center" onClick={close}>
          <img src={logo} alt="ImobiSpace Home" className="h-10 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-[12px] uppercase tracking-[0.16em] text-white/80 hover:text-primary transition">Lançamentos</Link>
          <Link to="/" className="text-[12px] uppercase tracking-[0.16em] text-white/80 hover:text-primary transition">Incorporadoras</Link>
          <Link to="/" className="text-[12px] uppercase tracking-[0.16em] text-white/80 hover:text-primary transition">Sobre nós</Link>
          <Link to="/" className="text-[12px] uppercase tracking-[0.16em] text-white/80 hover:text-primary transition">Blog</Link>
          <Link to="/" className="text-[12px] uppercase tracking-[0.16em] text-white/80 hover:text-primary transition">Contato</Link>
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })} className="text-white/80 hover:text-primary hover:bg-white/5" title="Buscar imóveis"><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-primary hover:bg-white/5" title="Meus favoritos"><Heart className="h-4 w-4" /></Button>
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-primary hover:bg-white/5" title="Comparar imóveis"><GitCompareArrows className="h-4 w-4" /></Button>
          {user && (isAdmin || isBroker) ? (
            <Link to="/dashboard"><Button variant="ghost" size="sm" className="text-white/80"><LayoutDashboard className="h-4 w-4" /></Button></Link>
          ) : !user ? (
            <Link to="/auth"><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><LogIn className="h-4 w-4 mr-2" />Área do Corretor</Button></Link>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-white/70"><LogOut className="h-4 w-4" /></Button>
          )}
        </div>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Abrir menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-black/95 px-6 py-6">
          <nav className="flex flex-col gap-5">
            <Link onClick={close} to="/" className="text-sm uppercase tracking-[0.16em] text-white/85">Lançamentos</Link>
            <Link onClick={close} to="/" className="text-sm uppercase tracking-[0.16em] text-white/85">Incorporadoras</Link>
            <Link onClick={close} to="/" className="text-sm uppercase tracking-[0.16em] text-white/85">Sobre nós</Link>
            <Link onClick={close} to="/" className="text-sm uppercase tracking-[0.16em] text-white/85">Blog</Link>
            <Link onClick={close} to="/" className="text-sm uppercase tracking-[0.16em] text-white/85">Contato</Link>
            <Button onClick={() => { close(); document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-primary text-primary-foreground"><Search className="mr-2 h-4 w-4" />Buscar imóveis</Button>
          </nav>
        </div>
      )}
    </header>
  );
}
