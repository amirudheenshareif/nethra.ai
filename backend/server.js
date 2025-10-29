import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { uploadRoute } from './routes/upload.route.js';


dotenv.config();

const app = Fastify({ logger: true });

app.get('/health', async (request, reply) => {
  return { message: 'Route working'};
});

await app.register(multipart,{
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  }
});

app.register(uploadRoute, { prefix: '/api/question-paper' });


app.listen({ port: process.env.PORT || 5000 }, async (err, address) => {
  if (err) throw err;
  console.log(`🚀 Server running at ${address}`);
});