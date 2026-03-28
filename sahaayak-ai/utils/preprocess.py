import re

def clean_text(text):
    """
    Cleans the input text by converting to lowercase,
    removing extra spaces and basic special characters.
    """
    if not text:
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text
