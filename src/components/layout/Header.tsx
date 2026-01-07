import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, LayoutDashboard, User, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import logo from '@/assets/logo-imobispace.png';

export function Header() {
  const { user, profile, signOut, isAdmin, isBroker } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container flex h-20 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src={logo} 
            alt="ImobiSpace Home" 
            className="h-14 w-auto group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-sm font-medium tracking-wide">
              Empreendimentos
            </Button>
          </Link>

          {user ? (
            <>
              {(isAdmin || isBroker) && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="text-sm font-medium tracking-wide">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Painel
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {isAdmin ? (
                    <Crown className="w-4 h-4 text-primary" />
                  ) : (
                    <User className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium leading-none">{profile?.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {isAdmin ? 'Gestor' : 'Corretor'}
                  </p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button variant="gold" size="sm" className="tracking-wide">
                <LogIn className="w-4 h-4 mr-2" />
                Área do Corretor
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
