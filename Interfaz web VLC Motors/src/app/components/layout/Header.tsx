import { Bell, User, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router';

interface HeaderProps {
  title?: string;
}

export const Header = ({ title }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <header className="h-16 bg-card border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 transition-colors duration-300">
      <div className="flex-1 min-w-0">
        {title && <h1 className="text-card-foreground truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />

        <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell size={20} className="text-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
        </button>

        <div className="hidden sm:flex items-center gap-3 px-3 py-2 bg-muted rounded-lg">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <User size={16} className="text-accent-foreground" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-foreground">{user?.nombre || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.rol || 'Rol'}</p>
          </div>
        </div>

        <div className="sm:hidden w-8 h-8 bg-accent rounded-full flex items-center justify-center">
          <User size={16} className="text-accent-foreground" />
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut size={16} />
        </Button>
      </div>
    </header>
  );
};
