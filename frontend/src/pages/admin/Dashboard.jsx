import { useState, useEffect } from 'react';
import axios from 'axios';
import StatsCard from '../../components/StatsCard';
import ChartCard from '../../components/ChartCard';
import { 
  Users, 
  Package, 
  ClipboardList, 
  DollarSign,
  MousePointer,
  TrendingUp,
  Award,
  Banknote
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/api/dashboard/admin');
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  const commissionData = stats?.commissions || [];
  const pendingCommissions = commissionData.find(c => c._id === 'pending') || { count: 0, amount: 0 };
  const validatedCommissions = commissionData.find(c => c._id === 'validated') || { count: 0, amount: 0 };
  const paidCommissions = commissionData.find(c => c._id === 'paid') || { count: 0, amount: 0 };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord Administrateur</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Affilies"
          value={`${stats?.affiliates?.active || 0}/${stats?.affiliates?.total || 0}`}
          subtitle="actifs"
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Produits"
          value={`${stats?.products?.active || 0}/${stats?.products?.total || 0}`}
          subtitle="actifs"
          icon={Package}
          color="secondary"
        />
        <StatsCard
          title="Clients"
          value={stats?.leads?.total || 0}
          subtitle={`${stats?.leads?.new || 0} nouveaux`}
          icon={ClipboardList}
          color="amber"
        />
        <StatsCard
          title="Clics"
          value={stats?.clicks || 0}
          icon={MousePointer}
          color="purple"
        />
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-green-700">{(stats?.revenue || 0).toLocaleString()} DH</p>
              <p className="text-xs text-green-500">Gains totaux</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Commissions payées</p>
              <p className="text-2xl font-bold text-blue-700">{paidCommissions.amount.toLocaleString()} DH</p>
              <p className="text-xs text-blue-500">{paidCommissions.count} payées</p>
            </div>
          </div>
        </div>
        <div className="card bg-amber-50 border-amber-100">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-amber-600">Commissions en attente</p>
              <p className="text-2xl font-bold text-amber-700">{(pendingCommissions.amount + validatedCommissions.amount).toLocaleString()} DH</p>
              <p className="text-xs text-amber-500">{pendingCommissions.count + validatedCommissions.count} à traiter</p>
            </div>
          </div>
        </div>
        <div className="card bg-primary-50 border-primary-100">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-primary-600" />
            <div>
              <p className="text-sm text-primary-600">Taux de conversion</p>
              <p className="text-2xl font-bold text-primary-700">
                {stats?.leads?.total > 0 
                  ? ((stats.leads.converted / stats.leads.total) * 100).toFixed(1) 
                  : 0}%
              </p>
              <p className="text-xs text-primary-500">{stats?.leads?.converted || 0} sur {stats?.leads?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard
          title="Clients mensuels"
          data={stats?.monthlyLeads?.map(m => {
            const [year, month] = m._id.split('-');
            const date = new Date(year, month - 1);
            return {
              name: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
              value: m.count
            };
          }) || []}
          type="bar"
          color="#3b82f6"
        />
        <ChartCard
          title="Clients convertis mensuels"
          data={stats?.monthlyLeads?.map(m => {
            const [year, month] = m._id.split('-');
            const date = new Date(year, month - 1);
            return {
              name: date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
              value: m.converted
            };
          }) || []}
          type="line"
          color="#22c55e"
        />
      </div>

      {/* Top Affiliates */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Affilies</h3>
        {stats?.topAffiliates?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rang</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Affilie</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Commissions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Montant total</th>
                </tr>
              </thead>
              <tbody>
                {stats.topAffiliates.map((affiliate, index) => (
                  <tr key={affiliate._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{affiliate.firstName} {affiliate.lastName}</p>
                      <p className="text-xs text-gray-400">{affiliate.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{affiliate.count}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-green-600">{affiliate.totalEarnings.toLocaleString()} DH</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucune donnee disponible</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
