import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express, { type Request, type Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });


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
            }
        });
        res.status(200).json(movies);
    } catch (error) {
        console.error('[DATABASE_ERROR]:', error);
        res.status(500).json({ error: 'Erro no banco de dados ao buscar' });
    }
});

// ROTA 2: ADICIONAR FILME (POST)
app.post('/movies', async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, releaseDate, oscar_count, genre_id, language_id } = req.body;

        if (!title || !genre_id || !language_id) {
            res.status(400).json({ error: 'Campos obrigatórios ausentes: title, genre_id ou language_id' });
            return;
        }


        const sanitizedTitle = title.trim();

        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: { equals: sanitizedTitle, mode: 'insensitive' }
            },
            include: {
                genre: true,
                language: true
            }
        });

        if (movieWithSameTitle) {
            res.status(409).json({ error: 'Já existe um filme com esse título' });
            return;
        }

        const newMovie = await prisma.movie.create({
            data: {
                title: sanitizedTitle,
                release_data: releaseDate ? new Date(releaseDate) : null,
                oscar_count: oscar_count !== undefined ? Number(oscar_count) : null,
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

app.put('/movies/:id', async (req: Request, res: Response): Promise<void> => {
    try {

        const id = req.params.id as string;
        const title = req.body.title as string;
        const genre_id = req.body.genre_id as string;
        const language_id = req.body.language_id as string;
        const oscar_count = req.body.oscar_count;
        const release_data = req.body.release_data;

        const movieExists = await prisma.movie.findUnique({ where: { id } });

        if (!movieExists) {
            res.status(404).json({ error: 'Filme não encontrado' });
            return;
        }

        const updateData: Prisma.MovieUpdateInput = {};


        if (title) updateData.title = title.trim();
        if (release_data) updateData.release_data = new Date(release_data);
        if (genre_id) updateData.genre = { connect: { id: genre_id } };
        if (language_id) updateData.language = { connect: { id: language_id } };
        if (oscar_count !== undefined && oscar_count !== null) {
            updateData.oscar_count = Number(oscar_count);
        }

        const movie = await prisma.movie.update({
            where: { id },
            data: updateData
        })
        res.status(200).send(movie);
    } catch (error) {
        console.error('[DATABASE_ERROR]:', error);
        res.status(500).json({ error: 'Erro interno ao atualizar o filme' });
    }


});

app.delete('/movies/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;

        const movieExist = await prisma.movie.findUnique({ where: { id } });

        if (!movieExist) {
            res.status(404).send({ message: 'Filme não encontrado para deleção' });
            return;
        };

        await prisma.movie.delete({ where: { id } });

        res.status(200).send({ message: 'Filme deletado com sucesso!' });
    } catch (error) {
        console.error('[DATABASE_ERROR]:', error);
        res.status(500).json({ error: 'Erro interno ao deletar o filme' });
    }
});

app.get("/movies/genre/:genreName", async (req: Request, res: Response) => {
    try {
        const genreName = req.params.genreName as string;
        const moviesFiltered = await prisma.movie.findMany({
            where: {
                genre: {
                    is: {
                        name: {
                            equals: genreName,
                            mode: 'insensitive'
                        }
                    }
                }
            },
            include: {
                genre: true,
                language: true
            }
        });

        res.status(200).json(moviesFiltered);
    } catch (error) {
        console.error('[DATABASE_ERROR]:', error);
        res.status(500).json({ error: 'Erro interno ao buscar filmes por gênero' });
    }

});
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em alta performance na porta ${PORT}`);
    console.log(`DATABASE_URL validada: ${process.env.DATABASE_URL ? '✅ Injetada com Sucesso' : '❌ Vazia'}`);
});