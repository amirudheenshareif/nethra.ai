import axios from "axios";
import FormData from "form-data";
import fs from "fs";


export async function ocrFromFile() {
  try {
    const formData = new FormData();
    formData.append("apikey", "K87825104288957");
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("file", fs.createReadStream("./uploads/demo-q-paper.jpeg"));

    const res = await axios.post("https://api.ocr.space/parse/image", formData, {
      headers: formData.getHeaders(),
    });

    return res.data.ParsedResults[0].ParsedText
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

