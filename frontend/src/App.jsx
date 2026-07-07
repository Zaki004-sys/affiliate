import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Affiliates from './pages/admin/Affiliates';
import Leads from './pages/admin/Leads';
import Commissions from './pages/admin/Commissions';
import AdminPayments from './pages/admin/Payments';
import AffiliateDashboard from './pages/affiliate/Dashboard';
import ProductsList from './pages/affiliate/ProductsList';
import MyLeads from './pages/affiliate/MyLeads';
import MyCommissions from './pages/affiliate/MyCommissions';
import Profile from './pages/affiliate/Profile';
import PublicProducts from './pages/PublicProducts';
import ProductDetail from './pages/ProductDetail';
import AdminChat from './pages/admin/Chat';
import AffiliateChat from './pages/affiliate/Chat';

const ProtectedRoute = ({ children, adminOnly = false, affiliateOnly = false }) => {
  const { user, loading, isAdmin, isAffiliate } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  if (affiliateOnly && !isAffiliate) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<PublicProducts />} />
        <Route path="produit/:id" element={<ProductDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        {/* Routes Admin */}
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/products" element={<ProtectedRoute adminOnly><Products /></ProtectedRoute>} />
        <Route path="admin/affiliates" element={<ProtectedRoute adminOnly><Affiliates /></ProtectedRoute>} />
        <Route path="admin/leads" element={<ProtectedRoute adminOnly><Leads /></ProtectedRoute>} />
        <Route path="admin/commissions" element={<ProtectedRoute adminOnly><Commissions /></ProtectedRoute>} />
        <Route path="admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
        <Route path="admin/chat" element={<ProtectedRoute adminOnly><AdminChat /></ProtectedRoute>} />

        {/* Routes Affiliate - uniquement pour les affiliés */}
        <Route path="dashboard" element={<ProtectedRoute affiliateOnly><AffiliateDashboard /></ProtectedRoute>} />
        <Route path="products" element={<ProtectedRoute affiliateOnly><ProductsList /></ProtectedRoute>} />
        <Route path="my-leads" element={<ProtectedRoute affiliateOnly><MyLeads /></ProtectedRoute>} />
        <Route path="my-commissions" element={<ProtectedRoute affiliateOnly><MyCommissions /></ProtectedRoute>} />
        <Route path="chat" element={<ProtectedRoute affiliateOnly><AffiliateChat /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute affiliateOnly><Profile /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}

export default App;
