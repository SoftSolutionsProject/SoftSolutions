import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import connectDatabase from './config/database';
import inscricaoRoutes from './routes/inscricaoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import errorHandler from './middlewares/errorHandler';
import { setupSwagger } from './config/swagger';
import emailRoutes from './routes/emailRoutes';
import cursoRoutes from './routes/cursoRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3000;;

setupSwagger(app);

// Middlewares globais
app.use(express.json());
app.use(cors());

// Conexão com o banco de dados
connectDatabase();

// Rotas
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/cursos', cursoRoutes);

// Middleware de erro (mantenha por último)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}. Acesse a API em: http://localhost:${PORT}`);

});

export default app;