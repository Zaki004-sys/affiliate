import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Phone, MapPin, CheckCircle, XCircle, MessageSquare, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await axios.get('/api/leads');
      setLeads(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/leads/${id}/status`, { status, notes });
      setShowModal(false);
      setNotes('');
      fetchLeads();
    } catch (error) {
      alert('Erreur lors de la mise a jour');
    }
  };

  const startChat = async (affiliateId) => {
    try {
      const { data } = await axios.post('/api/chat/conversations', { affiliateId });
      navigate('/admin/chat', { state: { activeConversation: data._id } });
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la conversation');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      converted: 'bg-green-100 text-green-700',
      cancelled: 'bg-orange-100 text-orange-700',
      in_progress: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    const labels = {
      new: 'Nouveau',
      converted: 'Converti',
      cancelled: 'Annulé',
      in_progress: 'En cours'
    };
    return labels[status] || status;
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des Clients</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'new', 'in_progress', 'converted', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
          >
            {status === 'all' ? 'Tous' : getStatusLabel(status)}
            {status !== 'all' && (
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                {leads.filter(l => l.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Affilie</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Produit</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Qté</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => (
                  <tr key={lead._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{lead.affiliate?.firstName} {lead.affiliate?.lastName}</p>
                      <p className="text-xs text-gray-400">{lead.affiliate?.affiliateCode}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {lead.product?.image && (
                          <img src={lead.product.image} alt="" className="w-8 h-8 rounded object-cover" />
                        )}
                        <span className="text-sm text-gray-700">{lead.product?.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 text-sm">{lead.clientName}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {lead.clientCity}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {lead.clientPhone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{lead.quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedLead(lead); setShowModal(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Gérer le lead"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startChat(lead.affiliate?._id)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Envoyer un message à l'affilié"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Status Modal */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Mettre à jour le client</h2>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600"><strong>Client:</strong> {selectedLead.clientName}</p>
                <p className="text-sm text-gray-600"><strong>Produit:</strong> {selectedLead.product?.name}</p>
                <p className="text-sm text-gray-600"><strong>Quantite:</strong> {selectedLead.quantity}</p>
                <p className="text-sm text-gray-600"><strong>Affilie:</strong> {selectedLead.affiliate?.firstName} {selectedLead.affiliate?.lastName}</p>
              </div>

              <div className="mb-4">
                <label className="label">Notes</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Ajouter des notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => updateStatus(selectedLead._id, 'in_progress')}
                  className="py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
                >
                  ⏳ En cours
                </button>
                <button
                  onClick={() => updateStatus(selectedLead._id, 'converted')}
                  className="py-2 px-4 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-4 h-4" />
                  Converti
                </button>
              </div>

              {/* Cancelled by client */}
              <div className="mt-3 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-400 mb-2">Annulation par le client</p>
                <button
                  onClick={() => {
                    if (window.confirm(`Confirmer l'annulation de la commande de ${selectedLead.clientName} ?`)) {
                      updateStatus(selectedLead._id, 'cancelled');
                    }
                  }}
                  className="w-full py-2 px-4 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Client a annulé la commande
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
