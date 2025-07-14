import React, { useEffect, useState } from 'react';

interface ChatEntry {
  type: string;
  content: string;
  rationale?: string;
  status?: string;
  timestamp?: string;
}

interface ClientChatHistoryProps {
  clientId: string;
}

const ClientChatHistory: React.FC<ClientChatHistoryProps> = ({ clientId }) => {
  const [history, setHistory] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    fetch(`/api/clients/${clientId}/history`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [clientId]);

  if (loading) return <div className="p-4">Loading chat history...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-[#f4f4f4] rounded-lg p-4 h-96 overflow-y-auto">
      {history.length === 0 && <div className="text-gray-500">No messages yet.</div>}
      {history.map((entry, idx) => (
        <div key={idx} className={`mb-4 ${entry.type === 'naarad' ? 'text-white bg-blue-600' : 'bg-white text-gray-900'} rounded-lg p-3 shadow-sm`}> 
          <div className="font-medium">{entry.type === 'naarad' ? 'NAARAD' : 'Client'}</div>
          <div className="whitespace-pre-line">{entry.content}</div>
          {entry.rationale && <div className="italic text-xs mt-1">Rationale: {entry.rationale}</div>}
          {entry.status && <div className="text-xs mt-1">{entry.status}</div>}
          {entry.timestamp && <div className="text-xs text-gray-400 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>}
        </div>
      ))}
    </div>
  );
};

export default ClientChatHistory;
