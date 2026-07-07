import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StatsCard from '../../components/StatsCard';
import ChartCard from '../../components/ChartCard';
import { MousePointerClick, Users, CheckCircle, DollarSign, Clock, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await axios.get('/api/dashboard/affiliate');
      setStats(data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bonjour, {user?.firstName} 👋</h1>
        <p className="mt-2 text-gray-600">Voici un résumé de vos performances d'affiliation.</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          title="Clics Générés" 
          value={stats.clicks.total} 
          icon={MousePointerClick} 
          color="primary" 
        />
        <StatsCard 
          title="Clients" 
          value={stats.leads.total} 
          icon={Users} 
          color="secondary" 
        />
        <StatsCard 
          title="Conversions" 
          value={stats.leads.converted} 
          subtitle={`Taux: ${stats.conversionRate}%`}
          icon={Target} 
          color="purple" 
        />
        <StatsCard 
          title="À Recevoir" 
          value={`${stats.commissions.validated.amount.toFixed(2)} DH`} 
          subtitle="Commission validée non payée"
          icon={CheckCircle} 
          color="amber" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard 
          title="Évolution des clics (30 jours)" 
          data={stats.clicks.monthly.map(item => {
            const [year, month] = item._id.split('-');
            const date = new Date(year, month - 1);
            return {
              name: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
              value: item.count
            };
          })} 
          type="line" 
          color="#0ea5e9"
        />
        <ChartCard 
          title="Commissions mensuelles" 
          data={stats.monthlyCommissions.map(item => {
            const [year, month] = item._id.split('-');
            const date = new Date(year, month - 1);
            return {
              name: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
              value: item.amount
            };
          })} 
          type="bar" 
          color="#10b981"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section Commissions en attente */}
        <div className="card lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-amber-500" />
            En attente
          </h3>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
            <p className="text-sm text-amber-600 mb-1">Commissions en validation</p>
            <p className="text-3xl font-bold text-amber-700">{stats.commissions.pending.amount.toFixed(2)} DH</p>
            <p className="text-xs text-amber-500 mt-2">Pour {stats.commissions.pending.count} ventes</p>
          </div>
          <div className="mt-3 bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-sm text-green-600 mb-1">✅ Validée — à recevoir</p>
            <p className="text-2xl font-bold text-green-700">{stats.commissions.validated.amount.toFixed(2)} DH</p>
          </div>
          <div className="mt-4 text-center">
            <Link to="/my-commissions" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Voir le détail &rarr;
            </Link>
          </div>
        </div>

        {/* Section Derniers leads */}
        <div className="card lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Derniers prospects (Leads)</h3>
            <Link to="/my-leads" className="text-sm font-medium text-primary-600 hover:text-primary-500">
              Voir tout
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {stats.leads.recent && stats.leads.recent.length > 0 ? (
                  stats.leads.recent.map((lead) => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{lead.clientName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lead.product?.name || 'Inconnu'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          lead.status === 'new' ? 'bg-blue-50 text-blue-700' :
                          lead.status === 'converted' ? 'bg-green-50 text-green-700' :
                          'bg-orange-50 text-orange-700'
                        }`}>
                          {lead.status === 'new' ? 'Nouveau' :
                           lead.status === 'converted' ? 'Converti' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                      Aucun prospect pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
