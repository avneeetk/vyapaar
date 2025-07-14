import React, { useEffect, useState } from 'react';

interface ClientInitialFollowupProps {
  clientId: string;
}

interface FollowupEntry {
  type?: string;
  content?: string;
  message?: string;
  rationale?: string;
  status?: string;
  timestamp?: string;
  role?: string; // for /history/{client_id}
}

const ClientInitialFollowup: React.FC<ClientInitialFollowupProps> = ({ clientId }) => {
  const [followup, setFollowup] = useState<FollowupEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try the richer chat history endpoint first
    fetch(`/api/clients/${clientId}/history`)
      .then(res => res.json())
      .then(history => {
        if (Array.isArray(history) && history.length > 0) {
          // Find the first NAARAD/agent message
          const naaradMsg = history.find(
            (entry: FollowupEntry) => entry.type === 'naarad' || entry.role === 'agent'
          );
          setFollowup(naaradMsg || history[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clientId]);

  if (loading) return <div className="text-xs text-gray-500">Loading follow-up…</div>;
  if (!followup) return <div className="text-xs text-gray-500">No follow-up yet.</div>;

  return (
    <div className="bg-[#F4F4F4] rounded-md p-3 mt-2 border border-[#E0E0E0]">
      <div className="text-xs text-[#0F62FE] font-semibold mb-1">Last NAARAD Follow-up:</div>
      <div className="text-sm text-[#161616] whitespace-pre-line">{followup.content || followup.message}</div>
      {followup.timestamp && (
        <div className="text-xs text-[#6F6F6F] mt-1">{new Date(followup.timestamp).toLocaleString()}</div>
      )}
      {followup.status && (
        <div className="text-xs text-[#24A148] mt-1">Status: {followup.status}</div>
      )}
      {followup.rationale && (
        <div className="text-xs text-[#6F6F6F] mt-1">{followup.rationale}</div>
      )}
    </div>
  );
};

export default ClientInitialFollowup;
