import { useParams, useNavigate } from "react-router-dom";
import ClientDetails from "../components/ClientDetails";
import { Client } from "../types/client";

interface Props {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
}

const ClientDetailsPage: React.FC<Props> = ({ clients, onUpdate }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const client = clients.find((c) => c.id === id);

  if (!client) return <div className="p-8 text-center text-gray-600">Client not found</div>;

  return (
    <ClientDetails
      client={client}
      onBack={() => navigate("/")}
      onUpdate={(updated) =>
        onUpdate(clients.map((c) => (c.id === updated.id ? updated : c)))
      }
    />
  );
};

export default ClientDetailsPage;
