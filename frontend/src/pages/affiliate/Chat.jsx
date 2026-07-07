import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AffiliateChat = () => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversation();
  }, []);

  useEffect(() => {
    if (conversation) {
      fetchMessages(conversation._id);
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const { data } = await axios.get('/api/chat/conversations');
      if (data && data.length > 0) {
        setConversation(data[0]); // L'affilié a max 1 conversation avec l'admin
      } else {
        // Créer la conversation si elle n'existe pas encore
        const { data: newConv } = await axios.post('/api/chat/conversations', {});
        setConversation(newConv);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const { data } = await axios.get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation) return;

    try {
      const { data } = await axios.post(`/api/chat/conversations/${conversation._id}/messages`, {
        content: newMessage
      });
      setMessages([...messages, data]);
      setNewMessage('');
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;


  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary-600" />
        Discussion avec l'Administrateur
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-10">Envoyez un message pour commencer la discussion</div>
          ) : (
            messages.map(msg => {
              const isMine = msg.senderRole === 'affiliate';
              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    isMine ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
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
          <form onSubmit={sendMessage} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={(user?.validatedCommissionsAmount || 0) < 200 ? "Minimum 200 DH requis pour contacter l'admin" : "Écrivez votre message à l'administrateur..."}
                disabled={(user?.validatedCommissionsAmount || 0) < 200}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || (user?.validatedCommissionsAmount || 0) < 200}
                className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            {(user?.validatedCommissionsAmount || 0) < 200 && (
              <p className="text-xs text-red-500 font-medium px-1">
                ⚠️ Vous devez avoir au moins 200 DH de gains (À Payer) pour pouvoir contacter l'administrateur.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AffiliateChat;
