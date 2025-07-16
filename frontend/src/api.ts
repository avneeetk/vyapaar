// src/api.ts

export const fetchClients = async () => {
    const res = await fetch("https://narad-agent-backend-production.up.railway.app//api/clients");
    if (!res.ok) throw new Error("Failed to fetch clients");
    return res.json();
  };
  
  export const uploadMockClients = async (clients: any[]) => {
    const res = await fetch("https://narad-agent-backend-production.up.railway.app//api/clients/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clients),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend error:", errorText);
      throw new Error("Upload failed");
    }
    return res.json();
  };
  
  export const sendReply = async (clientId: string, reply: string) => {
    const res = await fetch(`https://narad-agent-backend-production.up.railway.app//api/clients/${clientId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });
    return res.json();
  };
  
  export const toggleAuto = async (clientId: string, auto: boolean) => {
    const res = await fetch(`https://narad-agent-backend-production.up.railway.app//api/clients/${clientId}/auto-toggle`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auto }),
    });
    return res.json();
  };
  export const getClientHistory = async (clientId: string) => {
    const res = await fetch(`https://narad-agent-backend-production.up.railway.app//api/clients/${clientId}/history`);
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
  };