# VitalLog: Premium Medical AI Assistant 🏥

VitalLog is a state-of-the-art medical report analyzer and health assistant designed to simplify complex clinical data into actionable, easy-to-understand insights. Built with a focus on premium aesthetics and user-centric design, VitalLog bridges the gap between technical medical reports and patient understanding.

---

## ✨ Key Features

### 🔍 Advanced Medical Analysis
- **NLP-Powered Interpretation**: Analyzes symptoms and reports using a custom NLP pipeline.
- **Clinical Intelligence**: Extracts key medical values (Hemoglobin, Glucose, BP, etc.) and provides instant interpretation.
- **Urgency Detection**: Automatically categorizes queries based on clinical severity (Low, Medium, High).
- **Medication Extraction**: Identifies drug names and dosages from text or reports.

### 🖼️ Intelligent OCR
- **Report Scanning**: Upload medical reports (images/PDFs) for instant text extraction and analysis.
- **Visual Trends**: Automatically generates charts and graphs for extracted medical data points.

### 🌍 Multi-Language Support (English & Tamil)
- **Native Translation**: Full support for Tamil language text responses.
- **HD Voice Synthesis**: High-quality Text-to-Speech (TTS) in both English and Tamil.
- **Cultural Nuance**: Context-aware health tips and quotes in regional languages.

### 💎 Premium User Experience
- **Glassmorphism UI**: A stunning, modern interface with vibrant gradients and smooth animations.
- **Neural Trace**: Visualize the backend NLP pipeline's logic in real-time.
- **Integrated Dashboard**: Track your health metrics, daily tips, and medical history in one place.

---

## 🛠️ Technology Stack

### Backend (Python)
- **FastAPI**: High-performance API framework.
- **NLTK/Scikit-learn**: Core NLP processing and medical classification.
- **SQLite**: Local database for conversation history and user metadata.
- **OpenRouter/LLM**: GPT-powered enrichment for empathetic medical advice.
- **Tesseract OCR**: Robust text extraction from documents.

### Frontend (React/TypeScript)
- **Vite**: Ultra-fast build tool and dev server.
- **Tailwind CSS**: Custom utility-first styling for a premium look.
- **Framer Motion**: Fluid, high-end animations and transitions.
- **Lucide React**: Beautiful, consistent iconography.
- **Supabase**: Secure authentication and session management.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Tesseract OCR installed on your system.

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on `.env.example` and add your `OPENROUTER_API_KEY`.
4. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## ⚠️ Disclaimer

VitalLog is an educational tool designed to help patients understand medical terminology and general health concepts. **It is NOT a replacement for professional medical advice, diagnosis, or treatment.** Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
