import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { Send, User, MessageCircle, Banknote, Building, CreditCard, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminChat = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [pendingCommissions, setPendingCommissions] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (location.state?.activeConversation) {
      const conv = conversations.find(c => c._id === location.state.activeConversation);
      if (conv) {
        setActiveConversation(conv);
      } else {
        // Fetch specific conversation if not in list yet
        fetchConversations().then(convs => {
          const c = convs.find(c => c._id === location.state.activeConversation);
          if (c) setActiveConversation(c);
        });
      }
    }
  }, [location.state, conversations.length]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      fetchPendingCommissions(activeConversation.affiliate._id);
    }
  }, [activeConversation]);

  const fetchPendingCommissions = async (affiliateId) => {
    try {
      const { data } = await axios.get(`/api/commissions?affiliate=${affiliateId}&status=validated`);
      setPendingCommissions(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const markAllAsPaid = async () => {
    if (!window.confirm('Confirmer le paiement de toutes ces commissions ?')) return;
    try {
      await Promise.all(
        pendingCommissions.map(c => axios.put(`/api/commissions/${c._id}/pay`))
      );
      
      const totalAmount = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
      await axios.post(`/api/chat/conversations/${activeConversation._id}/messages`, {
        content: `✅ Paiement de ${totalAmount} DH effectué pour vos commissions validées.`
      });
      
      fetchPendingCommissions(activeConversation.affiliate._id);
      fetchMessages(activeConversation._id);
    } catch (error) {
      alert('Erreur lors du paiement');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/api/chat/conversations');
      setConversations(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
      return [];
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(data);
      // Update unread count locally
      setConversations(conversations.map(c => 
        c._id === conversationId ? { ...c, unreadByAdmin: 0 } : c
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !imageFile) || !activeConversation) return;

    try {
      const formData = new FormData();
      if (newMessage.trim()) formData.append('content', newMessage);
      if (imageFile) formData.append('image', imageFile);

      const { data } = await axios.post(`/api/chat/conversations/${activeConversation._id}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setMessages([...messages, data]);
      setNewMessage('');
      removeImage();
      
      // Update last message in conversation list
      setConversations(conversations.map(c => 
        c._id === activeConversation._id ? { ...c, lastMessage: imageFile ? '📷 Image' : data.content, lastMessageAt: new Date() } : c
      ));
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Sidebar - Liste des conversations */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary-600" />
            Discussions
          </h2>
        </div>
        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center p-6">Aucune conversation</p>
          ) : (
            conversations.map(conv => (
              <div
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  activeConversation?._id === conv._id ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-gray-900">
                    {conv.affiliate?.firstName} {conv.affiliate?.lastName}
                  </span>
                  {conv.unreadByAdmin > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {conv.unreadByAdmin}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Nouvelle conversation'}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Zone de Chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {activeConversation.affiliate?.firstName} {activeConversation.affiliate?.lastName}
                  </h3>
                  <p className="text-xs text-gray-500">Affilié: {activeConversation.affiliate?.affiliateCode}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {activeConversation.affiliate?.bankInfo?.rib && (
                  <div className="text-right text-xs">
                    <p className="text-gray-500 font-medium">{activeConversation.affiliate.bankInfo.bankName}</p>
                    <p className="text-gray-900 font-mono">{activeConversation.affiliate.bankInfo.rib}</p>
                    <p className="text-gray-500">{activeConversation.affiliate.bankInfo.accountHolder}</p>
                  </div>
                )}
                
                {pendingCommissions.length > 0 && (
                  <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
                    <div className="text-right">
                      <p className="text-xs text-orange-600 font-medium">À payer</p>
                      <p className="font-bold text-orange-700">
                        {pendingCommissions.reduce((sum, c) => sum + c.amount, 0)} DH
                      </p>
                    </div>
                    <button
                      onClick={markAllAsPaid}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Banknote className="w-4 h-4" />
                      Marquer Payé
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-10">Envoyez un message pour commencer la discussion</div>
              ) : (
                messages.map(msg => {
                  const isMine = msg.senderRole === 'admin';
                  return (
                    <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-sm'
                      }`}>
                        {msg.imageUrl && (
                          <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img src={msg.imageUrl} alt="Pièce jointe" className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90" style={{ maxHeight: '200px' }} />
                          </a>
                        )}
                        {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-100' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover border border-gray-200" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <form onSubmit={sendMessage} className="flex gap-2">
                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-500 p-2.5 rounded-xl border border-gray-200 transition-colors flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message (ou ajoutez une preuve de paiement)..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !imageFile}
                  className="bg-primary-600 hover:bg-primary-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg">Sélectionnez une conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
