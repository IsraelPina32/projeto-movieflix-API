import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Instanciação segura após o carregamento explícito do dotenv acima
const prisma = new PrismaClient();

app.use(express.json());

// ROTA 1: BUSCAR FILMES (GET)
app.get('/movies', async (_: Request, res: Response): Promise<void> => {
    try {
        const movies = await prisma.movie.findMany({
            orderBy: {
                title: "asc"
            },
            include: {
                genre: true,  
                language: true 
            }
        });
        res.status(200).json(movies);
    } catch (error) {
        console.error('[DATABASE_ERROR]:', error);
        res.status(500).json({ error: 'Erro no banco de dados ao buscar' });
    }
});

app.post('/movies', async (req: Request, res: Response): Promise<void> => {
    try {
       const { title,  releaseDate, oscar_count, genre_id, language_id } = req.body;

        const newMovie = await prisma.movie.create({
            data: {
                title: title,
                release_data: releaseDate ? new Date(releaseDate) : null,
                oscar_count: oscar_count ? Number(oscar_count) : null,
                genre_id: genre_id || null,
                language_id: language_id || null
            }
        });

        res.status(201).json({ message: 'Filme adicionado com sucesso!', movie: newMovie });
    } catch (error) {
        console.error('[DATABASE_ERROR]:', error);
        res.status(500).json({ error: 'Erro no banco de dados ao adicionar' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em alta performance na porta ${PORT}`);
    console.log(`DATABASE_URL validada: ${process.env.DATABASE_URL ? '✅ Injetada com Sucesso' : '❌ Vazia'}`);
});