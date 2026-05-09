import express from 'express';
import { log } from 'node:console';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/movies', (req, res) => {
  res.send('Listagem de Filmes');
});


app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
});