import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Search, ExternalLink } from 'lucide-react';

const PublicProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Erreur de chargement des produits', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="w-8 h-8 mr-3 text-primary-600" />
            Catalogue des Produits
          </h1>
          <p className="mt-2 text-gray-600">Découvrez nos produits en gros disponibles avec des prix dégressifs.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun produit trouvé</h3>
          <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos termes de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Link 
              key={product._id} 
              to={`/produit/${product._id}${window.location.search}`}
              className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full transform hover:-translate-y-1 ${!product.isActive ? 'opacity-75 grayscale-[0.2]' : ''}`}
            >
              <div className="relative aspect-w-16 aspect-h-9 w-full overflow-hidden bg-gray-200">
                {!product.isActive && (
                  <div className="absolute top-4 right-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Inactif / Rupture
                  </div>
                )}
                <img
                  src={product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
                  }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {product.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">
                  {product.description}
                </p>
                <div className="border-t border-gray-100 pt-4 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Prix de gros</p>
                    <p className="text-xl font-bold text-gray-900">{product.wholesalePrice.toFixed(2)} DH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Qte min.</p>
                    <p className="text-sm font-semibold text-gray-700">{product.minQuantity} unités</p>
                  </div>
                </div>
                <div className="mt-4 w-full flex justify-center items-center py-2 bg-gray-50 group-hover:bg-primary-50 rounded-lg text-primary-600 font-medium text-sm transition-colors">
                  Voir les détails <ExternalLink className="w-4 h-4 ml-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicProducts;
