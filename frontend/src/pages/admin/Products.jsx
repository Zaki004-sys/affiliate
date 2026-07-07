import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Package, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    wholesalePrice: '',
    minQuantity: 10,
    commissionType: 'percentage',
    commissionValue: 10,
    category: 'General',
    isActive: true
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products');
      setProducts(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      wholesalePrice: '',
      minQuantity: 10,
      commissionType: 'percentage',
      commissionValue: 10,
      category: 'General',
      isActive: true
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingProduct(null);
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        wholesalePrice: product.wholesalePrice,
        minQuantity: product.minQuantity,
        commissionType: product.commissionType,
        commissionValue: product.commissionValue,
        category: product.category,
        isActive: product.isActive
      });
      if (product.images && product.images.length > 0) {
        setImagePreviews(product.images);
      } else if (product.image) {
        setImagePreviews([product.image]);
      } else {
        setImagePreviews([]);
      }
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limit to 5 images
      const selectedFiles = files.slice(0, 5);
      setImageFiles(selectedFiles);
      
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        data.append('images', file);
      });
    }

    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axios.post('/api/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

    try {
      await axios.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.put(`/api/products/${id}/toggle`);
      fetchProducts();
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter un produit
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Image</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nom</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prix de gros</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Min. Qte</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Commission</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {product.image ? (
                      <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.wholesalePrice.toLocaleString()} DH</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{product.minQuantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {product.commissionType === 'percentage' 
                      ? `${product.commissionValue}%` 
                      : `${product.commissionValue} DH`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatus(product._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          product.isActive 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={product.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {product.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Images du produit (Max 5)</label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="flex-1 text-sm"
                      />
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {imagePreviews.map((preview, index) => (
                          <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-20 h-20 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label">Nom *</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Description *</label>
                  <textarea
                    required
                    rows={3}
                    className="input-field"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Prix de gros (DH) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="input-field"
                      value={formData.wholesalePrice}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="label">Quantite min. *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-field"
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Type de commission</label>
                    <select
                      className="input-field"
                      value={formData.commissionType}
                      onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
                    >
                      <option value="percentage">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (DH)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Valeur</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="input-field"
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Categorie</label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Produit actif</label>
                </div>

                <button type="submit" className="w-full btn-primary py-3">
                  {editingProduct ? 'Mettre a jour' : 'Creer le produit'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
