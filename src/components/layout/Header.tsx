import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, profile, signOut, isAdmin, isBroker } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-foreground">
              ImobiSpace
            </span>
            <span className="text-xs text-muted-foreground -mt-1">Home</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="sm">
              Empreendimentos
            </Button>
          </Link>

          {user ? (
            <>
              {(isAdmin || isBroker) && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Painel
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile?.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {isAdmin ? 'Gestor' : 'Corretor'}
                </span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="gold" size="sm">
                <LogIn className="w-4 h-4 mr-1" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
