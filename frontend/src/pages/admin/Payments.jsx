import { useState, useEffect } from 'react';
import axios from 'axios';
import { Banknote, MessageCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
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
      // On ne garde que les affiliés qui ont des gains validés (à payer) ou déjà payés
      const paymentAffiliates = data.filter(a => a.stats?.totalEarnings > 0 || a.stats?.totalPaid > 0);
      setAffiliates(paymentAffiliates);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Banknote className="w-6 h-6 text-primary-600" />
          Paiements des Affiliés
        </h1>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Affilié</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Infos Bancaires</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Non Payé (À payer)</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Déjà Payé</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">Aucun paiement en attente ou effectué</td>
                </tr>
              ) : (
                affiliates.map(affiliate => (
                  <tr key={affiliate._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">{affiliate.firstName} {affiliate.lastName}</p>
                      <p className="text-xs text-gray-500">{affiliate.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {affiliate.bankInfo?.rib ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            {affiliate.bankInfo.bankName}
                          </p>
                          <p className="text-xs font-mono text-gray-600">{affiliate.bankInfo.rib}</p>
                          <p className="text-xs text-gray-500">{affiliate.bankInfo.accountHolder}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Non renseigné</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {affiliate.stats?.totalEarnings > 0 ? (
                        <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg">
                          💰 {affiliate.stats.totalEarnings} DH
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {affiliate.stats?.totalPaid > 0 ? (
                        <span className="font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                          ✅ {affiliate.stats.totalPaid} DH
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => startChat(affiliate._id)}
                        className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Payer via Chat
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
