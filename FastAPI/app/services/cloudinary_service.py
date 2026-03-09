import cloudinary
import cloudinary.uploader
from ..config import settings

cloudinary.config(
    cloud_name=settings.CLOUD_NAME,
    api_key=settings.API_KEY,
    api_secret=settings.API_SECRET,
    secure=True
)

def upload_file(file, folder="documents"):
    """
    Uploads a file to Cloudinary.
    'file' can be a path, a file-like object, or a URL.
    """
    response = cloudinary.uploader.upload(file, folder=f"health_assistant/{folder}", resource_type="auto")
    return response.get("secure_url")

def delete_file(public_id, resource_type="image"):
    """
    Deletes a file from Cloudinary.
    """
    return cloudinary.uploader.destroy(public_id, resource_type=resource_type)

def get_public_id_from_url(url):
    """
    Extracts the public_id from a Cloudinary URL.
    Example URL: https://res.cloudinary.com/cloud_name/image/upload/v12345/health_assistant/documents/abc.jpg
    Returns: health_assistant/documents/abc
    """
    # Simple extraction for now
    parts = url.split("/")
    # Everything after 'upload/' (except the version part 'v12345') and before the extension
    try:
        upload_index = parts.index("upload")
        # Check if next part is a version (starts with 'v' and followed by digits)
        path_parts = parts[upload_index + 1:]
        if path_parts[0].startswith('v') and path_parts[0][1:].isdigit():
            path_parts = path_parts[1:]
        
        full_path = "/".join(path_parts)
        public_id = full_path.rsplit(".", 1)[0]
        return public_id
    except (ValueError, IndexError):
        return None
