import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Package, Search, Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductsList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Erreur', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateLink = (productId) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/produit/${productId}?ref=${user.affiliateCode}`;
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produits Promouvables</h1>
          <p className="mt-2 text-gray-600">Générez vos liens d'affiliation pour ces produits et touchez des commissions.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Rechercher par nom ou catégorie..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className={`card p-0 overflow-hidden flex flex-col sm:flex-row ${!product.isActive ? 'opacity-75' : ''}`}>
              <div className="relative sm:w-1/3 bg-gray-100 flex-shrink-0">
                {!product.isActive && (
                  <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Inactif
                  </div>
                )}
                <img
                  src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                  alt={product.name}
                  className="w-full h-48 sm:h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                  }}
                />
              </div>
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-primary-50 rounded-lg p-3">
                      <p className="text-xs text-primary-600 mb-1">Commission</p>
                      <p className="text-lg font-bold text-primary-700">
                        {product.commissionType === 'percentage' 
                          ? `${product.commissionValue}%` 
                          : `${product.commissionValue} DH`}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Prix de gros</p>
                      <p className="text-lg font-bold text-gray-900">{product.wholesalePrice} DH</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => product.isActive && copyAffiliateLink(product._id)}
                    disabled={!product.isActive}
                    className={`flex-1 flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                      product.isActive
                        ? 'border-primary-600 text-primary-600 bg-white hover:bg-primary-50'
                        : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                    }`}
                  >
                    {copiedId === product._id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" /> Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" /> Copier mon lien
                      </>
                    )}
                  </button>
                  <Link
                    to={`/produit/${product._id}`}
                    className="flex-none flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsList;
