# app/services/indexing_service.py
import os
from llama_index.core import VectorStoreIndex, StorageContext, load_index_from_storage
from icecream import ic
from app.utils import prompt_helpers
from app.config import get_azure_openai_client_with_llama_index

'''
Purpose:
    summarize_text: calls a GPT-4 model for generating a short summary.
    get_or_create_index: either builds a new vector store or loads an existing one from the disk path.
'''
def summarize_text(text: str) -> str:
    """
    Summarize text using LLM (via LlamaIndex's OpenAI).
    Return plain string (not a custom object).
    Trim text if needed to avoid token issues.
    """
    text = text[:127999]
    prompt = prompt_helpers.summary_gen_prompt(text)
    llm = get_azure_openai_client_with_llama_index()
    response_obj = llm.complete(prompt=prompt)
    result = str(response_obj)
    ic(text[ : 100], prompt[: 20], result[: 30])
    if len(result) > 128000:
        result = result[:127998]
    return result

def get_or_create_index(docs, index_dir: str):
    if not os.path.exists(index_dir):
        os.makedirs(index_dir, exist_ok=True)
        index = VectorStoreIndex.from_documents(docs)
        index.storage_context.persist(persist_dir=index_dir)
    else:
        storage_context = StorageContext.from_defaults(persist_dir=index_dir)
        index = load_index_from_storage(storage_context)
    return index
