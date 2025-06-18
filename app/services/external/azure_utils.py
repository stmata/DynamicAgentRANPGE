"""
app/services/azure_utils.py
──────────────────────────────────────────────
Helpers for uploading files and zipped indexes
to Azure Blob Storage.  Uses a ThreadPool so
async code never blocks on network I/O.
"""

import os, zipfile, tempfile, asyncio, concurrent.futures
from azure.storage.blob import BlobServiceClient, ContentSettings
from typing import Final
from dotenv import load_dotenv
load_dotenv()

# Read from .env / process env
_CONN_STR: Final[str]    = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
_CONTAINER: Final[str]   = os.getenv("AZURE_CONTAINER_NAME")

# Singleton BlobServiceClient
_blob_service = BlobServiceClient.from_connection_string(_CONN_STR)
_container_client = _blob_service.get_container_client(_CONTAINER)

# ThreadPool for CPU + network tasks
_pool = concurrent.futures.ThreadPoolExecutor(max_workers=8)

async def upload_file(local_path: str, blob_path: str) -> str:
    """
    Uploads a local file to Azure Blob Storage under blob_path.
    Returns the blob URL.
    """
    def _upload():
        with open(local_path, "rb") as data:
            _container_client.upload_blob(
                name=blob_path,
                data=data,
                overwrite=True,
                content_settings=ContentSettings(content_type="application/octet-stream")
            )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_pool, _upload)

    # Construct the URL
    account_url = _blob_service.url
    return f"{account_url}/{_CONTAINER}/{blob_path}"

async def upload_index_folder(folder_path: str, blob_prefix: str) -> str:
    """
    Zips the entire index folder, uploads as blob_prefix.zip,
    and returns the blob URL.
    """
    # 1) Create a temporary ZIP
    tmp_zip = tempfile.NamedTemporaryFile(suffix=".zip", delete=False).name

    def _zip():
        with zipfile.ZipFile(tmp_zip, "w", zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(folder_path):
                for fname in files:
                    abs_path = os.path.join(root, fname)
                    rel_path = os.path.relpath(abs_path, folder_path)
                    zf.write(abs_path, arcname=rel_path)
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_pool, _zip)

    # 2) Upload ZIP
    zip_blob = f"{blob_prefix}.zip"
    url = await upload_file(tmp_zip, zip_blob)

    # 3) Clean up
    os.remove(tmp_zip)
    return url
