import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Save, CheckCircle, CreditCard, Building } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bankInfo: {
      bankName: user?.bankInfo?.bankName || '',
      rib: user?.bankInfo?.rib || '',
      accountHolder: user?.bankInfo?.accountHolder || ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // RIB validation
    if (formData.bankInfo.rib && formData.bankInfo.rib.length !== 24) {
      setError('Le RIB doit contenir exactement 24 chiffres.');
      setLoading(false);
      return;
    }

    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise a jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mon Profil</h1>

      <div className="card">
        {/* Info Card */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                {user?.role === 'admin' ? 'Administrateur' : 'Affilie'}
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                Code: {user?.affiliateCode}
              </span>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Profil mis a jour avec succes !
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Prenom
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Nom
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Email
            </label>
            <input
              type="email"
              disabled
              className="input-field bg-gray-50 text-gray-500"
              value={user?.email || ''}
            />
            <p className="text-xs text-gray-400 mt-1">L'email ne peut pas etre modifie</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                Telephone
              </label>
              <input
                type="tel"
                required
                className="input-field"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Ville
              </label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-600" />
              Informations Bancaires (Pour le paiement des commissions)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  Banque (ex: CIH, Attijariwafa...)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nom de votre banque"
                  value={formData.bankInfo.bankName}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    bankInfo: { ...formData.bankInfo, bankName: e.target.value } 
                  })}
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Nom du titulaire du compte
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nom complet"
                  value={formData.bankInfo.accountHolder}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    bankInfo: { ...formData.bankInfo, accountHolder: e.target.value } 
                  })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  RIB (Relevé d'Identité Bancaire - 24 chiffres)
                </label>
                <input
                  type="text"
                  className="input-field font-mono"
                  placeholder="0000 0000 0000 0000 0000 0000"
                  value={formData.bankInfo.rib}
                  maxLength="24"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 24) {
                      setFormData({ 
                        ...formData, 
                        bankInfo: { ...formData.bankInfo, rib: value } 
                      });
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
