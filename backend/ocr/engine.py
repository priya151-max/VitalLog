import cv2
import pytesseract
import numpy as np
import os

# Set tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class OCREngine:
    def __init__(self):
        pass

    def preprocess_image(self, image_path):
        # Load image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image at {image_path}")
            
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding (Otsu's binarization)
        # 1. Grayscale
        # 2. Thresholding (Adaptive or simple)
        # 3. Noise removal
        
        # Simple thresholding
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Noise removal (Median blur)
        denoised = cv2.medianBlur(thresh, 3)
        
        return denoised

    def extract_text(self, image_path):
        try:
            # Preprocess
            processed_img = self.preprocess_image(image_path)
            
            # Use Tesseract to extract text
            # --psm 6: Assume a single uniform block of text.
            text = pytesseract.image_to_string(processed_img, config='--psm 6')
            
            return text.strip()
        except Exception as e:
            print(f"OCR Error: {e}")
            # Fallback to simple OCR if preprocessing fails
            try:
                text = pytesseract.image_to_string(image_path)
                return text.strip()
            except:
                return f"Error extracting text: {str(e)}"

if __name__ == "__main__":
    # Test OCR
    engine = OCREngine()
    # Assuming there's a test image... if not, this will fail but serves as a template.
    # print(engine.extract_text("sample_report.jpg"))
