import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ClipboardList, 
  DollarSign, 
  LogOut, 
  Menu, 
  X,
  Store,
  UserCircle,
  MessageCircle,
  Banknote
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout, isAdmin, isAffiliate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const hasRef = searchParams.has('ref');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Produits', icon: Package },
    { to: '/admin/affiliates', label: 'Affilies', icon: Users },
    { to: '/admin/leads', label: 'Clients', icon: ClipboardList },
    { to: '/admin/commissions', label: 'Commissions', icon: DollarSign },
    { to: '/admin/payments', label: 'Paiements', icon: Banknote },
    { to: '/admin/chat', label: 'Messages', icon: MessageCircle },
  ];

  const affiliateLinks = [
    { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { to: '/products', label: 'Produits', icon: Package },
    { to: '/my-leads', label: 'Mes Clients', icon: ClipboardList },
    { to: '/my-commissions', label: 'Mes Commissions', icon: DollarSign },
    // L'onglet Messages s'affiche uniquement si les commissions validées >= 200 DH
    ...((user?.validatedCommissionsAmount || 0) >= 200
      ? [{ to: '/chat', label: 'Messages', icon: MessageCircle }]
      : []),
    { to: '/profile', label: 'Profil', icon: UserCircle },
  ];

  // Masquer les liens affilié sur les pages publiques
  const isPublicPage = location.pathname === '/' || location.pathname.startsWith('/produit');
  
  // Vue restreinte : si la page est visitée via un lien d'affiliation (avec ?ref=)
  const isRestrictedView = isPublicPage && hasRef;

  // Un client (non affilié, non admin) ne voit AUCUN lien d'interface
  // Sur les pages publiques, même l'affilié ne voit pas ses menus
  const links = isAdmin ? adminLinks : (isAffiliate && !isPublicPage) ? affiliateLinks : [];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          {isRestrictedView ? (
            <div className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Grossiste<span className="text-primary-600">Pro</span></span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Store className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">Grossiste<span className="text-primary-600">Pro</span></span>
            </Link>
          )}

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right Side : masqué si vue restreinte */}
          <div className="flex items-center gap-3">
            {!isRestrictedView && (
              user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                    <UserCircle className="w-4 h-4" />
                    <span>{user.firstName} {user.lastName}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Deconnexion</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-outline text-sm">Connexion</Link>
                  <Link to="/register" className="btn-primary text-sm">S'inscrire</Link>
                </div>
              )
            )}
            
            {/* Mobile Menu Button */}
            {user && !isRestrictedView && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && user && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
