# ----------------------------------------------------------
#   Global, *shared* objects — visible to every module:
#   • `tools`     : list[QueryEngineTool]  -> one per indexed doc
#   • `agent`     : the ReActAgent built from those tools
#   • `history`   : per‑session rolling chat memory (simple in‑RAM)
#   • `_lock`     : asyncio.Lock to prevent two admin uploads racing
#
#   reload_agent_from_json() is the *only* writer; routes call it
#   when admin uploads a new doc OR when the server first boots.
# ----------------------------------------------------------
from __future__ import annotations
from typing import List, Tuple, Dict
import asyncio
from llama_index.core.tools import QueryEngineTool
from llama_index.core import PromptTemplate
from app.utils import prompt_helpers

conversation_history: Dict[str, list] = {}

react_system_header_str = prompt_helpers.reset_system_prompt_for_agent() 
react_system_prompt = PromptTemplate(react_system_header_str)
# ─────────────────────────────────────────────
# read‑mostly globals
# ─────────────────────────────────────────────
tools:  List[QueryEngineTool] = []           # 1 per indexed doc
agent                               = None   # type: ignore
history: Dict[str, List[Tuple[str, str]]] = {}  # chat memory

# single writer lock for reload
_lock = asyncio.Lock()

# ── NEW: Chat Service Integration ──
# Lazy initialization to avoid import cycles
_chat_service = None

def get_chat_service():
    """
    Get chat service instance (lazy initialization).
    """
    global _chat_service
    if _chat_service is None:
        from app.services.chat.chat_service import get_chat_service
        _chat_service = get_chat_service()
    return _chat_service

# ── Chat‑utilities ───────────────────────────
def get_hist(sid: str) -> List[Tuple[str, str]]:
    """Return conversation list for session_id; create if new."""
    return history.setdefault(sid, [])

def append_hist(sid: str, role: str, msg: str) -> None:
    """Append message to session history."""
    get_hist(sid).append((role, msg))

async def process_chat_with_persistence(
    user_id: str, 
    message: str, 
    conversation_id: str = None
) -> Dict:
    """
    Process chat with MongoDB persistence using reactAgent.
    Returns enhanced response with conversation_id and references.
    """
    chat_service = get_chat_service()
    return await chat_service.process_chat_message(
        user_id=user_id,
        message=message,
        conversation_id=conversation_id
    )

# ── Agent rebuild (PRESERVE EXISTING) ──
async def reload_agent_from_json(course_filter: str = None) -> None:
    """
    1.  GET /tools  from json‑server (optionally filtered by course)
    2.  Build QueryEngineTool list
    3.  Instantiate ReActAgent
    Executes inside _lock so only 1 thread/task rebuilds at once.
    """
    global tools, agent
    async with _lock:
        from app.services.external.tools_service import load_tools_from_json_server
        from llama_index.core.agent import ReActAgent
        from app.config import get_azure_openai_client_with_llama_index
        # Refresh tool list
        tools.clear()
        tools.extend(await load_tools_from_json_server(course_filter))

        # Re‑create agent
        agent = ReActAgent.from_tools(
            tools,
            llm=get_azure_openai_client_with_llama_index(),
            verbose=False                    # stop step‑by‑step logs
        )
        agent.update_prompts({"agent_worker:system_prompt": react_system_prompt})
        agent.reset()
        
        if course_filter:
            print(f"[state] reload complete for course '{course_filter}' – {len(tools)} tools")
        else:
            print(f"[state] reload complete – {len(tools)} tools")