# agent.py
import os
from dotenv import load_dotenv    
from langchain_groq import ChatGroq
from langchain.schema import HumanMessage
from langchain.memory import ConversationBufferMemory
import datetime
# Dictionary to store memory per client_id
memory_store = {}
# Dictionary to store chat history per client_id
chat_logs = {}
load_dotenv()
print("KEY:", os.getenv("GROQ_API_KEY"))

# Initialize model with Groq Mixtral
llm = ChatGroq(
    temperature=0,
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-70b-8192"  # or another supported model
)

def get_memory(client_id):
    if client_id not in memory_store:
        memory_store[client_id] = ConversationBufferMemory(return_messages=True)
    return memory_store[client_id]

def now():
    return datetime.datetime.now().isoformat()

def run_agent(client_id: str, message: str, client_context: dict = None) -> str:
    """
    Generate a context-aware follow-up message using client_context,
    save chat history in chat_logs, and return the agent reply.
    """
    if client_context is None:
        client_context = {}
    # Compose prompt
    prompt = f"""
You are NAARAD, an AI follow-up agent. Follow up professionally.
Client: {client_context.get('name', 'N/A')} from {client_context.get('company', 'N/A')}
Email: {client_context.get('email', 'N/A')}
Status: {client_context.get('status', 'N/A')}
Urgency: {client_context.get('urgency', 'N/A')}
Last Interaction: {client_context.get('lastInteraction', 'N/A')}
Due Date: {client_context.get('dueDate', 'N/A')}

Write a helpful, context-aware follow-up message for this situation.
User message: {message}
"""
    # Store user message
    chat_logs.setdefault(client_id, []).append({
        "role": "user",
        "message": message,
        "timestamp": now()
    })
    # Get the response
    response = llm.invoke(prompt)
    reply = response.content if hasattr(response, 'content') else str(response)
    # Store agent message
    chat_logs.setdefault(client_id, []).append({
        "role": "agent",
        "message": reply,
        "timestamp": now()
    })
    return reply