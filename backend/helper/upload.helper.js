import sharp from "sharp";
import dotenv from "dotenv";
import axios from "axios";
import FormData from "form-data";
import Tesseract from "tesseract.js";
import { createWorker } from "tesseract.js";

// Funtions present:
// preProcessImage()
// callOcr()
// systemPromptOcr()

dotenv.config();

export const preProcessImage = async(buffer) => {
      try {
        const processedImage = await sharp(buffer)
        .grayscale() // removes color
        .normalize() // increase contrast
        .threshold(180) // make characters crisp
        .sharpen() // make edges crisp
        .resize({ width: 2500 }) // enlarging for better ocr
        .toBuffer();

         return processedImage;

      } catch (error) {
        console.log('Image preprocessing failed:', error);
        throw new Error('Failed to preprocess image');
        }
     }

 export const callOcr = async (imageBuffer, filename) => {
      try {
        const formData = new FormData();
        formData.append("apikey", process.env.OCR_MODEL_API_KEY);
        formData.append("language", "eng");
        formData.append("isOverlayRequired", "false");
        formData.append("file", imageBuffer, {
        filename: filename,
        contentType: 'image/png'
       });

       const res = await axios.post("https://api.ocr.space/parse/image", formData, {
       headers: formData.getHeaders(),
      });
       const ocrText = res.data.ParsedResults[0].ParsedText

       return ocrText;

  } catch (err) {
    console.error(err.response?.data || err.message);
    throw new Error('OCR processing failed');
  }
}

export const systemPromptOcr = (ocrContext) => {
    return `You are an exam-paper parsing assistant.  
Your job is to take raw OCR text from a scanned question paper and convert it into a clean, structured JSON format.

### Input:
The below OCR text will be messy, may contain line breaks, symbols, and broken words.
${ocrContext}

### What you must do:
1. Clean up obvious OCR noise (e.g., “3x1=y”, “p.T.O.”, “•”, etc.).  
2. Detect different SECTIONS (e.g., “SECTION A”, “SECTION B”, “SECTION C”, “SECTION D”) — each becomes a JSON object with a title.  
3. Within each section, detect question numbers like “1.”, “2.”, etc.  
4. Group question text with its number.  
5. If a question has sub-questions (a), (b), etc., include them inside "subQuestions".  
6. Keep numbering in order and preserve question meaning as much as possible.  
7. Output valid JSON only, with this structure:

{
  "sections": [
    {
      "title": "SECTION NAME",
      "questions": [
        {
          "number": 1,
          "text": "Question text",
          "subQuestions": [
            {"label": "a", "text": "Sub question text"},
            ...
          ]
        }
      ]
    }
  ]
}`
}

export const generateJSONFromPrompt = async (systemPrompt) => {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

      const body = {
           contents: [
             {
               parts: [
                 {
                   text: systemPrompt,
                 },
               ],
             },
           ],
         };

       try {
         const res = await axios.post(url, body, {
           headers: {
             "Content-Type": "application/json",
             "X-Goog-Api-Key": process.env.GEMINI_API_KEY,
           },
         });

       console.log("Gemini response:");
       let response = res.data.candidates?.[0]?.content?.parts?.[0]?.text || res.data;

       // Removes Markdown fences like ```json ... ```
       response = response.replace(/```json|```/g, '').trim();

       // Removes white space
       response = response.replace(/^[\s\n]+|[\s\n]+$/g, '');


       try {
         const jsonResponse = JSON.parse(response);
         console.log("Parsed JSON:", jsonResponse);
         return jsonResponse;
       } catch (err) {
         console.error("Failed to parse Gemini response:", err.message);
         return { error: "Invalid JSON format returned by model" };
       }
       } catch (err) {
         console.error("Gemini API error:", err.response?.data || err.message);
       }
     }

let worker = null;

async function initializeWorker() { // This lets us run OCR tasks in background
  if (worker) return worker;
  
  worker = await createWorker('eng', 1, {
    logger: m => console.log(m)
  });
  
  return worker;
}

export const callTesseract = async (imageBuffer) => {
  try {
    const worker = await initializeWorker();
    const { data: { text } } = await worker.recognize(imageBuffer);
    return text;
  } catch (error) {
    console.error('Tesseract error:', error);
    throw new Error('OCR processing failed');
  }
};

export async function terminateWorker() { // Once OCR tasks are done, use this to free up memory
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}

