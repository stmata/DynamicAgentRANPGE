"""
Azure OpenAI client utility

This module provides factory functions to create Azure OpenAI clients for use with LlamaIndex.
"""

import os
from dotenv import load_dotenv
from llama_index.llms.azure_openai import AzureOpenAI


load_dotenv()   # loads OPENAI_API_KEY & OPENAI_MODEL from .env

AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o = os.getenv("AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_KEY")
AZURE_OPENAI_API_VERSION = os.getenv("AZURE_OPENAI_API_VERSION")
AZURE_OPENAI_MODEL = os.getenv("AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4omini")


def get_azure_openai_client_with_llama_index(
    temperature: float = 0.3,
    engine: str = AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o,
    model: str = AZURE_OPENAI_MODEL_AND_DEPLOYMENT_4o,
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
            azure_endpoint=AZURE_OPENAI_ENDPOINT,
            api_key=AZURE_OPENAI_KEY,
            api_version=AZURE_OPENAI_API_VERSION,
            **kwargs
        )
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Azure OpenAI client: {e}") 