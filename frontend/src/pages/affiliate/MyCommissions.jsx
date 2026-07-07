import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Clock, XCircle, CheckCircle, Banknote } from 'lucide-react';

const MyCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
    fetchStats();
  }, []);

  const fetchCommissions = async () => {
    try {
      const { data } = await axios.get('/api/commissions');
      setCommissions(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('/api/commissions/stats');
      setStats(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine the effective status based on lead status when commission is pending
  const getEffectiveStatus = (commission) => {
    if (commission.status === 'pending') {
      const leadStatus = commission.lead?.status;
      if (leadStatus === 'new') return 'unverified';
      if (leadStatus === 'in_progress') return 'in_progress';
    }
    return commission.status;
  };

  const getStatusIcon = (effectiveStatus) => {
    switch (effectiveStatus) {
      case 'validated': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'unverified': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'paid': return <Banknote className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const getStatusColor = (effectiveStatus) => {
    switch (effectiveStatus) {
      case 'validated': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700';
      case 'unverified': return 'bg-gray-100 text-gray-500';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (effectiveStatus) => {
    switch (effectiveStatus) {
      case 'validated': return 'Validée - à payer';
      case 'pending': return 'En attente';
      case 'in_progress': return '⏳ En cours';
      case 'unverified': return 'Non vérifié';
      case 'rejected': return 'Refusée';
      case 'paid': return '✅ Payée';
      default: return effectiveStatus;
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes Commissions</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-amber-50 border-amber-100">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-amber-600">En attente</p>
              <p className="text-2xl font-bold text-amber-700">{(stats?.pending?.amount || 0).toLocaleString()} DH</p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Validées (à recevoir)</p>
              <p className="text-2xl font-bold text-green-700">{(stats?.validated?.amount || 0).toLocaleString()} DH</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Déjà payées</p>
              <p className="text-2xl font-bold text-blue-700">{(stats?.paid?.amount || 0).toLocaleString()} DH</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commissions List */}
      <div className="card overflow-hidden">
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map(commission => (
                  <tr key={commission._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {commission.product?.image && (
                          <img src={commission.product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <span className="font-medium text-gray-900">{commission.product?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{commission.lead?.clientName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{commission.amount.toLocaleString()} DH</span>
                    </td>
                    <td className="py-3 px-4">
                      {(() => {
                        const effectiveStatus = getEffectiveStatus(commission);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(effectiveStatus)}`}>
                            {getStatusIcon(effectiveStatus)}
                            {getStatusLabel(effectiveStatus)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(commission.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune commission pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">Commencez a promouvoir nos produits !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCommissions;
