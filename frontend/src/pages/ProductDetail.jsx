import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Package, CheckCircle, Info, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientCity: '',
    quantity: ''
  });
  
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
    if (ref) {
      trackClick();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      setProduct(data);
      setMainImage(data.image);
      setFormData(prev => ({ ...prev, quantity: data.minQuantity }));
    } catch (error) {
      console.error('Erreur', error);
      setError("Le produit n'a pas pu être chargé.");
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async () => {
    try {
      await axios.post('/api/leads/click', { ref, productId: id });
    } catch (error) {
      // On ignore silencieusement les erreurs de tracking
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.quantity < product.minQuantity) {
      return setError(`La quantité minimale est de ${product.minQuantity} unités.`);
    }

    setFormLoading(true);

    try {
      await axios.post('/api/leads', {
        ref,
        productId: id,
        ...formData
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi de la demande.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Produit introuvable</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!ref && (
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au catalogue
        </Link>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="lg:flex">
          {/* Section Image */}
          <div className="lg:w-1/2 bg-gray-50 p-8 lg:p-12 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-100">
            <img
              src={mainImage.startsWith('http') ? mainImage : `http://localhost:5000${mainImage}`}
              alt={product.name}
              className="max-h-[400px] w-auto object-contain drop-shadow-2xl rounded-lg transform hover:scale-105 transition-transform duration-500 mb-8"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
              }}
            />
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2 px-1">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      mainImage === img ? 'border-primary-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section Infos & Formulaire */}
          <div className="lg:w-1/2 p-8 lg:p-12">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-semibold tracking-wide uppercase">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Prix unitaire (gros)</p>
                <p className="text-3xl font-bold text-gray-900">{product.wholesalePrice.toFixed(2)} DH</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Quantité minimale</p>
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <Package className="w-6 h-6 mr-2 text-primary-500" />
                  {product.minQuantity} unités
                </div>
              </div>
            </div>

            {/* Formulaire de Lead */}
            <div className="bg-white p-6 rounded-xl border-2 border-primary-50 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-50 rounded-full opacity-50"></div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 relative z-10">Êtes-vous intéressé ?</h3>
              <p className="text-sm text-gray-500 mb-6 relative z-10">Laissez vos coordonnées et notre équipe vous contactera pour finaliser la commande au tarif grossiste.</p>

              {success ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center relative z-10">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h4 className="text-lg font-bold mb-2">Demande envoyée !</h4>
                  <p className="text-sm">Nous avons bien reçu votre demande pour {formData.quantity} unités de {product.name}. Un conseiller va vous appeler très prochainement.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                  {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start">
                       <AlertCircle className="w-5 h-5 mr-2 shrink-0" /> {error}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
                      <input
                        type="text"
                        name="clientName"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        value={formData.clientName}
                        onChange={handleChange}
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        name="clientPhone"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        value={formData.clientPhone}
                        onChange={handleChange}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <input
                        type="text"
                        name="clientCity"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        value={formData.clientCity}
                        onChange={handleChange}
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantité souhaitée</label>
                      <input
                        type="number"
                        name="quantity"
                        required
                        min={product.minQuantity}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        value={formData.quantity}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {ref && (
                    <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <Info className="w-4 h-4 mr-1 text-primary-500" />
                      Vous êtes parrainé par l'affilié {ref}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 mt-4"
                  >
                    {formLoading ? 'Envoi en cours...' : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Être recontacté pour commander
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
