import { preProcessImage,callOcr,systemPromptOcr,generateJSONFromPrompt, callTesseract } from "../helper/upload.helper.js";


export const uploadController = async (req, reply) => {

    const questionPaper = await req.file();
    if (!questionPaper) {
           return reply.code(400).send({
             success: false,
             error: 'No questionPaper uploaded'
           });
         }

    try {
        const buffer = await questionPaper.toBuffer();
        const filename = questionPaper.filename;
        const processedImageBuffer = await preProcessImage(buffer);
        const ocrResult = await callTesseract(processedImageBuffer);
        // const ocrResult = await callOcr(processedImageBuffer,filename);
        const systemPrompt = systemPromptOcr(ocrResult);
        const response = await generateJSONFromPrompt(systemPrompt);

        return reply.send({ message: response});
    } catch (error) {
        return reply.send({ error:error, "msg":"failed"});
    }
}