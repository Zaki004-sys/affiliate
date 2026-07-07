import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DollarSign, CheckCircle, XCircle, Clock, Banknote, MessageCircle } from 'lucide-react';

const Commissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

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

  const handleContactAffiliate = async (affiliateId) => {
    try {
      const { data } = await axios.post('/api/chat/conversations', { affiliateId });
      navigate('/admin/chat', { state: { activeConversation: data._id } });
    } catch (error) {
      alert('Erreur lors de l\'accès à la conversation');
    }
  };

  const validateCommission = async (commission) => {
    try {
      await axios.put(`/api/commissions/${commission._id}/validate`);
      handleContactAffiliate(commission.affiliate._id);
    } catch (error) {
      alert('Erreur lors de la validation');
    }
  };

  const rejectCommission = async () => {
    if (!selectedCommission) return;
    try {
      await axios.put(`/api/commissions/${selectedCommission._id}/reject`, { reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedCommission(null);
      fetchCommissions();
      fetchStats();
    } catch (error) {
      alert('Erreur lors du refus');
    }
  };

  // markAsPaid a été supprimé car le paiement se fait maintenant via la discussion

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'validated': return 'Validée';
      case 'pending': return 'En attente';
      case 'rejected': return 'Refusée';
      case 'paid': return '✅ Payée';
      default: return status;
    }
  };

  const filteredCommissions = filter === 'all' 
    ? commissions.filter(c => c.status !== 'paid')
    : commissions.filter(c => c.status === filter);

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Commissions</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card bg-amber-50 border-amber-100">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-amber-600">En attente</p>
              <p className="text-2xl font-bold text-amber-700">{(stats?.pending?.amount || 0).toLocaleString()} DH</p>
              <p className="text-xs text-amber-500">{stats?.pending?.count || 0} commissions</p>
            </div>
          </div>
        </div>
        <div className="card bg-green-50 border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600">Validees</p>
              <p className="text-2xl font-bold text-green-700">{(stats?.validated?.amount || 0).toLocaleString()} DH</p>
              <p className="text-xs text-green-500">{stats?.validated?.count || 0} commissions</p>
            </div>
          </div>
        </div>
        <div className="card bg-red-50 border-red-100">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-red-600">Refusées</p>
              <p className="text-2xl font-bold text-red-700">{(stats?.rejected?.amount || 0).toLocaleString()} DH</p>
              <p className="text-xs text-red-500">{stats?.rejected?.count || 0} commissions</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-100">
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600">Payées</p>
              <p className="text-2xl font-bold text-blue-700">{(stats?.paid?.amount || 0).toLocaleString()} DH</p>
              <p className="text-xs text-blue-500">{stats?.paid?.count || 0} commissions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'validated', 'paid', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status 
                ? 'bg-primary-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {status === 'all' ? 'À traiter' : getStatusLabel(status)}
            {status !== 'all' && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {commissions.filter(c => c.status === status).length}
              </span>
            )}
            {status === 'all' && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {commissions.filter(c => c.status !== 'paid').length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filteredCommissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Affilie</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Montant</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCommissions.map(commission => (
                  <tr key={commission._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(commission.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{commission.affiliate?.firstName} {commission.affiliate?.lastName}</p>
                      <p className="text-xs text-gray-400">{commission.affiliate?.affiliateCode}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {commission.product?.image && (
                          <img src={commission.product.image} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="text-sm text-gray-700">{commission.product?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{commission.lead?.clientName}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900">{commission.amount.toLocaleString()} DH</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(commission.status)}`}>
                        {getStatusLabel(commission.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {commission.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => validateCommission(commission)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Valider"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setSelectedCommission(commission); setShowRejectModal(true); }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Refuser"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {commission.status === 'validated' && (
                        <button
                          onClick={() => handleContactAffiliate(commission.affiliate._id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                          title="Aller à la discussion pour payer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Payer via discussion
                        </button>
                      )}
                      {commission.status === 'paid' && commission.paidAt && (
                        <p className="text-xs text-blue-600 font-medium">
                          ✅ Payé le {new Date(commission.paidAt).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      {commission.status === 'rejected' && (
                        <p className="text-xs text-red-500 max-w-[150px] truncate" title={commission.rejectionReason}>
                          {commission.rejectionReason}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune commission trouvee</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Refuser la commission</h2>
              <p className="text-sm text-gray-500 mb-4">
                Commission de {selectedCommission?.amount?.toLocaleString()} DH pour {selectedCommission?.affiliate?.firstName} {selectedCommission?.affiliate?.lastName}
              </p>
              <div className="mb-4">
                <label className="label">Motif du refus</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Precisez la raison du refus..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={rejectCommission}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirmer le refus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commissions;
