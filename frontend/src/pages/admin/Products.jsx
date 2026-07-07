import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2, X, Package, Image as ImageIcon, ToggleLeft, ToggleRight, Tag, DollarSign, Layers, Upload, Check } from 'lucide-react';

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
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
    processFiles(files);
  };

  const processFiles = (files) => {
    if (files.length > 0) {
      const selectedFiles = files.slice(0, 5);
      setImageFiles(selectedFiles);
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
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
    } finally {
      setSubmitting(false);
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', border: '4px solid #e5e7eb',
          borderTopColor: '#2563eb', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Chargement des produits...</p>
      </div>
    </div>
  );

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .prod-row:hover { background: #f8faff !important; }
        .prod-action-btn:hover { transform: scale(1.1); }
        .drag-zone.dragging { border-color: #2563eb !important; background: #eff6ff !important; }
        .upload-btn:hover { background: #eff6ff !important; }
        .remove-preview:hover { background: rgba(0,0,0,0.7) !important; }
        .form-input:focus { outline: none; border-color: #2563eb !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important; }
        .form-input { transition: border-color 0.2s, box-shadow 0.2s; }
        .submit-btn:hover:not(:disabled) { background: #1d4ed8 !important; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(37,99,235,0.4) !important; }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .submit-btn { transition: all 0.2s; }
        .toggle-switch { transition: background 0.3s; }
        .modal-overlay { animation: fadeIn 0.15s ease; }
        .modal-card { animation: slideUp 0.2s ease; }
        .tab-btn.active { background: white !important; color: #2563eb !important; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Gestion des Produits</h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{products.length} produit{products.length !== 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: 'white', border: 'none', borderRadius: '12px',
            padding: '10px 20px', fontWeight: '600', fontSize: '14px',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={16} />
          Nouveau produit
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Image', 'Produit', 'Prix de gros', 'Qté min.', 'Commission', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <Package size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>Aucun produit. Créez votre premier produit !</p>
                  </td>
                </tr>
              ) : products.map(product => (
                <tr key={product._id} className="prod-row" style={{ borderBottom: '1px solid #f1f5f9', background: 'white', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    {product.image ? (
                      <img src={product.image} alt="" style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon size={18} color="#9ca3af" />
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: '600', color: '#111827', fontSize: '14px', margin: 0 }}>{product.name}</p>
                    <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '20px', marginTop: '4px', display: 'inline-block' }}>{product.category}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1d4ed8', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {product.wholesalePrice?.toLocaleString()} DH
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{product.minQuantity}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: '600',
                      color: product.commissionType === 'percentage' ? '#7c3aed' : '#059669',
                      background: product.commissionType === 'percentage' ? '#f5f3ff' : '#ecfdf5',
                      padding: '3px 10px', borderRadius: '20px'
                    }}>
                      {product.commissionType === 'percentage' ? `${product.commissionValue}%` : `${product.commissionValue} DH`}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                      background: product.isActive ? '#dcfce7' : '#f3f4f6',
                      color: product.isActive ? '#16a34a' : '#6b7280'
                    }}>
                      {product.isActive ? '● Actif' : '○ Inactif'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button onClick={() => openModal(product)} className="prod-action-btn"
                        style={{ padding: '7px', color: '#2563eb', background: '#eff6ff', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.15s', display: 'flex' }}
                        title="Modifier">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => toggleStatus(product._id)} className="prod-action-btn"
                        style={{ padding: '7px', color: product.isActive ? '#16a34a' : '#9ca3af', background: product.isActive ? '#dcfce7' : '#f3f4f6', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.15s', display: 'flex' }}
                        title={product.isActive ? 'Désactiver' : 'Activer'}>
                        {product.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="prod-action-btn"
                        style={{ padding: '7px', color: '#dc2626', background: '#fef2f2', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.15s', display: 'flex' }}
                        title="Supprimer">
                        <Trash2 size={15} />
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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); resetForm(); } }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          <div className="modal-card" style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', padding: '20px 24px', borderRadius: '20px 20px 0 0', position: 'sticky', top: 0, zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '10px', padding: '8px', display: 'flex' }}>
                    <Package size={20} color="white" />
                  </div>
                  <div>
                    <h2 style={{ color: 'white', fontWeight: '700', fontSize: '17px', margin: 0 }}>
                      {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>
                      {editingProduct ? 'Mettez à jour les informations' : 'Remplissez les informations ci-dessous'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'white', display: 'flex', transition: 'background 0.15s' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

              {/* === SECTION : Images === */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ImageIcon size={15} color="#2563eb" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Images du produit</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', background: '#f3f4f6', padding: '2px 8px', borderRadius: '20px' }}>Max 5</span>
                </div>
                <label
                  className={`drag-zone ${isDragging ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  style={{
                    display: 'block', border: '2px dashed #d1d5db', borderRadius: '12px',
                    padding: '20px', textAlign: 'center', cursor: 'pointer',
                    background: '#fafafa', transition: 'all 0.2s'
                  }}>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{ display: 'none' }} />
                  <Upload size={24} color="#9ca3af" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                    <span style={{ color: '#2563eb', fontWeight: '600' }}>Cliquez</span> ou glissez vos images ici
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>PNG, JPG, WEBP — max 5 images</p>
                </label>

                {imagePreviews.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {imagePreviews.map((preview, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img src={preview} alt={`Preview ${index + 1}`}
                          style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                        <button type="button"
                          className="remove-preview"
                          onClick={() => {
                            const newPreviews = imagePreviews.filter((_, i) => i !== index);
                            const newFiles = imageFiles.filter((_, i) => i !== index);
                            setImagePreviews(newPreviews);
                            setImageFiles(newFiles);
                          }}
                          style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', transition: 'background 0.15s' }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 20px' }} />

              {/* === SECTION : Infos générales === */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Tag size={15} color="#2563eb" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informations générales</span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Nom du produit <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input type="text" required className="form-input"
                    placeholder="ex: Huile d'argan bio..."
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#fafafa', boxSizing: 'border-box' }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Description <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea required rows={3} className="form-input"
                    placeholder="Décrivez le produit..."
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#fafafa', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Catégorie
                  </label>
                  <input type="text" className="form-input"
                    placeholder="ex: Cosmétiques, Alimentation..."
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#fafafa', boxSizing: 'border-box' }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 20px' }} />

              {/* === SECTION : Prix & Quantité === */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <DollarSign size={15} color="#2563eb" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix & Quantité</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Prix de gros <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" required min="0" className="form-input"
                        placeholder="0"
                        style={{ width: '100%', padding: '10px 42px 10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#fafafa', boxSizing: 'border-box' }}
                        value={formData.wholesalePrice}
                        onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })} />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>DH</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                      Qté minimum <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input type="number" required min="1" className="form-input"
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#fafafa', boxSizing: 'border-box' }}
                      value={formData.minQuantity}
                      onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })} />
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 20px' }} />

              {/* === SECTION : Commission === */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Layers size={15} color="#2563eb" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commission affilié</span>
                </div>

                {/* Toggle type commission */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '4px', marginBottom: '12px' }}>
                  {['percentage', 'fixed'].map(type => (
                    <button key={type} type="button"
                      className={`tab-btn ${formData.commissionType === type ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, commissionType: type })}
                      style={{
                        flex: 1, padding: '8px', border: 'none', borderRadius: '8px',
                        fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                        background: formData.commissionType === type ? 'white' : 'transparent',
                        color: formData.commissionType === type ? '#2563eb' : '#6b7280',
                        transition: 'all 0.2s'
                      }}>
                      {type === 'percentage' ? '% Pourcentage' : '🪙 Montant fixe (DH)'}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                    Valeur de la commission
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input type="number" required min="0" className="form-input"
                      style={{ width: '100%', padding: '10px 42px 10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', color: '#111827', background: '#fafafa', boxSizing: 'border-box' }}
                      value={formData.commissionValue}
                      onChange={(e) => setFormData({ ...formData, commissionValue: e.target.value })} />
                    <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: '600', color: '#7c3aed' }}>
                      {formData.commissionType === 'percentage' ? '%' : 'DH'}
                    </span>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0 0 20px' }} />

              {/* Toggle Actif */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
                <div>
                  <p style={{ fontWeight: '600', fontSize: '14px', color: '#374151', margin: 0 }}>Produit actif</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0' }}>Visible par les affiliés sur le catalogue</p>
                </div>
                <button type="button"
                  onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                  className="toggle-switch"
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    background: formData.isActive ? '#2563eb' : '#d1d5db',
                    position: 'relative', flexShrink: 0
                  }}>
                  <span style={{
                    position: 'absolute', top: '2px', borderRadius: '50%', width: '20px', height: '20px',
                    background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    transition: 'left 0.2s',
                    left: formData.isActive ? '22px' : '2px'
                  }} />
                </button>
              </div>

              {/* Bouton Submit */}
              <button type="submit" disabled={submitting} className="submit-btn"
                style={{
                  width: '100%', padding: '14px',
                  background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white', border: 'none', borderRadius: '12px',
                  fontWeight: '700', fontSize: '15px', cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}>
                {submitting ? (
                  <>
                    <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {editingProduct ? 'Mettre à jour le produit' : 'Créer le produit'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
