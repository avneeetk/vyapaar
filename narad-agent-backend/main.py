from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Body  # <-- add this import
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from agent import run_agent
from email_utils import send_email

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <-- you can restrict this later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ---------------- Models ---------------- #

class Client(BaseModel):
    id: str
    name: str
    company: str
    email: str
    status: str
    urgency: str
    lastInteraction: str
    type: str  # renewal, birthday, query, proposal
    dueDate: Optional[str] = None
    details: Optional[str] = None
    auto: bool = True  # auto follow-up toggle

class Interaction(BaseModel):
    client_id: str
    message: str
    client_context: dict = {}

class ToggleRequest(BaseModel):
    auto: bool

class ReplyRequest(BaseModel):
    reply: str

# ---------------- In-Memory Database ---------------- #
clients_db: List[Client] = []
client_logs = {}

# ---------------- Routes ---------------- #

@app.get("/api/clients")
def get_clients():
    return clients_db

@app.post("/api/clients/upload")
def upload_clients(clients: List[Client] = Body(...)):
    global clients_db
    clients_db = clients
    # Trigger agent follow-up only for auto-enabled clients
    for client in clients:
        if not client.auto:
            continue
        # Generate a personalized initial follow-up message
        message = f"Hi {client.name}, following up on our conversation about your {client.type} at {client.company}. Have you had a chance to review?"
        agent_response = run_agent(client.id, message)
        # Send the agent's message via email
        try:
            send_email(
                to_email=client.email,
                subject="Renewal Follow-up from NAARAD",
                body=agent_response
            )
            email_status = "email_sent"
        except Exception as e:
            email_status = "email_failed"
            agent_response += f"\n(Email sending failed: {e})"
        # Log the agent's message in client_logs
        log = client_logs.setdefault(client.id, [])
        log.append({
            "type": "naarad",
            "content": agent_response,
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "rationale": "Automated initial follow-up after upload",
            "status": email_status
        })
    return {"status": "ok", "count": len(clients)}

@app.get("/api/clients/{client_id}/history")
def get_history(client_id: str):
    return client_logs.get(client_id, [])

@app.get("/history/{client_id}")
def get_chat_history(client_id: str):
    from agent import chat_logs
    return chat_logs.get(client_id, [])

@app.post("/api/clients/{client_id}/reply")
def send_reply(client_id: str, data: ReplyRequest):
    log = client_logs.setdefault(client_id, [])
    log.append({
        "type": "reply",
        "content": data.reply,
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "rationale": "Manual reply from UI"
    })
    return {"status": "Reply recorded"}

from fastapi import BackgroundTasks

@app.patch("/api/clients/{client_id}/auto-toggle")
def toggle_automation(client_id: str, data: ToggleRequest, background_tasks: BackgroundTasks):
    print(f"[Toggle] Requested auto-toggle for client_id: {client_id}")
    for client in clients_db:
        if str(client.id) == str(client_id):
            client.auto = data.auto
            if data.auto:
                # Immediately send a follow-up when toggled ON
                background_tasks.add_task(send_auto_followup, client)
            return {"status": "updated", "auto": data.auto}
    print("Client not found for id:", client_id)
    raise HTTPException(status_code=404, detail="Client not found")


def send_auto_followup(client):
    # Compose follow-up message
    print(f"[AutoFollowup] Triggered for {client.name} (ID: {client.id})")  
    print(f"[Agent] Generating reply for {client.email}")
    message = f"Hi {client.name}, following up on your {client.type} at {client.company}. Have you had a chance to review?"
    agent_response = run_agent(client.id, message)
    try:
        send_email(
            to_email=client.email,
            subject="Renewal Follow-up from NAARAD",
            body=agent_response
        )
        email_status = "email_sent"
    except Exception as e:
        email_status = "email_failed"
        agent_response += f"\n(Email sending failed: {e})"
    log = client_logs.setdefault(client.id, [])
    log.append({
        "type": "naarad",
        "content": agent_response,
        "timestamp": __import__('datetime').datetime.now().isoformat(),
        "rationale": "Automated follow-up (auto mode ON)",
        "status": email_status
    })

@app.post("/api/clients/{client_id}/log")
def log_interaction(client_id: str, data: dict):
    log = client_logs.setdefault(client_id, [])
    log.append(data)
    return {"status": "logged"}

@app.post("/process_interaction")
def process_interaction(interaction: Interaction):
    response = run_agent(
        interaction.client_id,
        interaction.message,
        interaction.client_context
    )
    # Try to send the response via email
    client = next((c for c in clients_db if c.id == interaction.client_id), None)
    email_status = "no_client"
    if client:
        try:
            send_email(
                to_email=client.email,
                subject="Renewal Follow-up from NAARAD",
                body=response
            )
            email_status = "email_sent"
        except Exception as e:
            email_status = f"email_failed: {e}"
    return {"response": response, "email_status": email_status}