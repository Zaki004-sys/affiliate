import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Eye, ToggleLeft, ToggleRight, MessageCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const { data } = await axios.get('/api/affiliates');
      setAffiliates(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`/api/affiliates/${id}/toggle`);
      fetchAffiliates();
    } catch (error) {
      alert('Erreur lors de la mise a jour');
    }
  };

  const deleteAffiliate = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        await axios.delete(`/api/affiliates/${id}`);
        fetchAffiliates();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const viewDetails = async (id) => {
    try {
      const { data } = await axios.get(`/api/affiliates/${id}`);
      setSelectedAffiliate(data);
      setShowDetail(true);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const startChat = async (id) => {
    try {
      const { data } = await axios.post('/api/chat/conversations', { affiliateId: id });
      navigate('/admin/chat', { state: { activeConversation: data._id } });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la conversation');
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Affilies</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nom</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Telephone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ville</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Code</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Gains à Payer</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.map(affiliate => (
                <tr key={affiliate._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{affiliate.firstName} {affiliate.lastName}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{affiliate.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{affiliate.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{affiliate.city}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{affiliate.affiliateCode}</span>
                  </td>
                  <td className="py-3 px-4">
                    {affiliate.stats?.totalEarnings > 0 ? (
                      <span className="font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-sm">
                        💰 {affiliate.stats.totalEarnings} DH
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                    {affiliate.stats?.totalPaid > 0 && (
                      <p className="text-xs text-blue-500 mt-1">✅ Payé: {affiliate.stats.totalPaid} DH</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      affiliate.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {affiliate.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startChat(affiliate._id)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Envoyer un message"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => viewDetails(affiliate._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(affiliate._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          affiliate.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={affiliate.isActive ? 'Desactiver' : 'Activer'}
                      >
                        {affiliate.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAffiliate(affiliate._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Details de l'affilie</h2>
                <button onClick={() => setShowDetail(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{selectedAffiliate.firstName} {selectedAffiliate.lastName}</p>
                    <p className="text-sm text-gray-500">{selectedAffiliate.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Clics totaux</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAffiliate.stats?.totalClicks || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Leads</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAffiliate.stats?.totalLeads || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Taux conversion</p>
                    <p className="text-xl font-bold text-gray-900">{selectedAffiliate.stats?.conversionRate || 0}%</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-xs text-green-600">Gains totaux</p>
                    <p className="text-xl font-bold text-green-700">{selectedAffiliate.stats?.totalEarnings?.toLocaleString() || 0} DH</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Code affiliate</p>
                  <p className="font-mono text-lg font-medium text-primary-600">{selectedAffiliate.affiliateCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Affiliates;
