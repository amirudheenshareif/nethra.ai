import { uploadController } from "../controllers/uploadController.js";


export const uploadRoute = async (fastify) => {
    fastify.post('/upload', uploadController);
}