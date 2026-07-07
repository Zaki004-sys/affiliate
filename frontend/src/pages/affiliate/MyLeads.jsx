import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Filter, Calendar, MapPin, Phone, Package } from 'lucide-react';

const MyLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, new, contacted, converted, lost

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data } = await axios.get('/api/leads');
      setLeads(data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-8 h-8 mr-3 text-primary-600" />
            Mes Clients
          </h1>
          <p className="mt-2 text-gray-600">Suivez l'état d'avancement des clients que vous avez apportés.</p>
        </div>

        <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <select
            className="border-none bg-transparent focus:ring-0 text-sm font-medium text-gray-700 py-2 pr-8 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="new">Nouveaux</option>
            <option value="in_progress">⏳ En cours</option>
            <option value="converted">Convertis ✅</option>
            <option value="cancelled">Annulés ❌</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun prospect trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? "Vous n'avez pas encore de clients. Partagez vos liens d'affiliation !"
              : "Aucun client ne correspond à ce statut."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.map((lead) => (
            <div key={lead._id} className="card relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                lead.status === 'new' ? 'bg-blue-500' :
                lead.status === 'in_progress' ? 'bg-yellow-500' :
                lead.status === 'converted' ? 'bg-green-500' :
                'bg-orange-500'
              }`}></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{lead.clientName}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full border ${
                  lead.status === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  lead.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  lead.status === 'converted' ? 'bg-green-50 text-green-700 border-green-200' :
                  'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  {lead.status === 'new' ? 'Nouveau' :
                   lead.status === 'in_progress' ? '⏳ En cours' :
                   lead.status === 'converted' ? '✅ Converti' :
                   '❌ Annulé'}
                </span>
              </div>

              <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                  <span className="truncate">{lead.clientCity}</span>
                </div>
                {/* Phone est masque partiellement pour l'affilie par souci de confidentialite generalement, 
                    mais ici on l'affiche s'il l'a genere */}
                <div className="flex items-center text-sm text-gray-700">
                  <Phone className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                  {lead.clientPhone}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-center">
                {lead.product?.image && (
                  <img
                    src={lead.product.image.startsWith('http') ? lead.product.image : `http://localhost:5000${lead.product.image}`}
                    className="w-10 h-10 rounded object-cover mr-3 border border-gray-200"
                    alt={lead.product.name}
                  />
                )}
                <div className="flex-grow min-w-0">
                  <p className="text-xs text-gray-500 mb-0.5 flex items-center">
                    <Package className="w-3 h-3 mr-1" /> Produit souhaité
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {lead.product?.name || 'Produit inconnu'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-500 mb-0.5">Quantité</p>
                  <p className="text-sm font-bold text-gray-900">{lead.quantity}</p>
                </div>
              </div>

              {lead.status === 'in_progress' && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-xs text-yellow-700 font-medium">⏳ Commande en cours de traitement par l'administrateur.</p>
                </div>
              )}

              {/* Message annulation */}
              {lead.status === 'cancelled' && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                  <p className="text-xs text-orange-700 font-medium">⚠️ Ce client a annulé sa commande. Aucune commission ne sera générée.</p>
                </div>
              )}

              {/* Message converti */}
              {lead.status === 'converted' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                  <p className="text-xs text-green-700 font-medium">🎉 Commande validée ! Votre commission a été enregistrée.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLeads;
