# app/config.py
import os
from openai import AzureOpenAI as Azure_
from llama_index.llms.azure_openai import AzureOpenAI
from dotenv import load_dotenv
import random
from functools import lru_cache

load_dotenv()

AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

# MongoDB configuration
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB_CHAT")

# Grader service configuration
GRADER_API_URL = os.getenv("GRADER_API_URL")


# Azure OpenAI configuration
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT") 
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")  
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4=os.getenv("AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4", "gpt-4")
AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o=os.getenv("AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o", "gpt-4o")
AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini=os.getenv("AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini", "gpt-4o-mini")

# Evaluation configuration
EVALUATION_BATCH_SIZE = 5  
MAX_CONCURRENT_EVALUATIONS = 10 
AVAILABLE_MODELS = [
    AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4,
    AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o, 
    AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini
]  # Available Azure OpenAI models for random selection during evaluation

@lru_cache()
def get_random_model() -> str:
    """
    Returns a random model from the available models list.
    Used for random model selection during evaluation.
    """
    return random.choice(AVAILABLE_MODELS)

@lru_cache()
def get_azure_openai_client(**kwargs) -> AzureOpenAI:
    """
    Factory function to create Azure OpenAI client.
    Better for testing and dependency injection.
    """
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY or not AZURE_OPENAI_API_VERSION:
        raise ValueError("Environment variables AZURE_OPENAI_KEY, AZURE_OPENAI_API_VERSION, and AZURE_OPENAI_ENDPOINT must be set.")
    
    try:
        return Azure_(
            api_key=AZURE_OPENAI_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            **kwargs
        )
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Azure OpenAI client: {e}")

#def get_azure_openai_client_with_llama_index(temperature: float = 0.1, max_tokens: int = 1024,**kwargs) -> AzureOpenAI:
@lru_cache()
def get_azure_openai_client_with_llama_index(
    temperature: float = 0.1,
    engine: str = AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini,
    model: str = AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini,
    **kwargs
) -> AzureOpenAI:    
    """
        Factory function to create an Azure OpenAI client for use with LlamaIndex.

        Args:
            temperature (float): Sampling temperature for the model.
            engine (str): The deployment name to use in Azure OpenAI.
            model (str): The model name to use (usually the same as engine).
            **kwargs: Additional arguments passed to the AzureOpenAI client.

        Returns:
            AzureOpenAI: Configured Azure OpenAI client instance.

        Raises:
            ValueError: If required environment variables are missing.
            RuntimeError: If the client fails to initialize.
    """
    if not AZURE_OPENAI_ENDPOINT or not AZURE_OPENAI_KEY or not AZURE_OPENAI_API_VERSION:
        raise ValueError("Environment variables AZURE_OPENAI_KEY, AZURE_OPENAI_API_VERSION, and AZURE_OPENAI_ENDPOINT must be set.")
    
    try:
        return AzureOpenAI(
            engine=engine,
            model=model,
            temperature=temperature,
            #max_tokens=max_tokens
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
            **kwargs
        )
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Azure OpenAI client: {e}")

@lru_cache()
def get_random_llm_client_with_llama_index(**kwargs) -> AzureOpenAI:
    """
    Creates an Azure OpenAI client with a randomly selected model.
    Combines random model selection with client instantiation.
    """
    random_model = get_random_model()
    return get_azure_openai_client_with_llama_index(
        engine=random_model,
        model=random_model,
        **kwargs
    )