import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './config/database.js';
import routes from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';
import path from "path";


// Load environment variables
dotenv.config({ path: './.env' });


// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;
const _dirname = path.resolve();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.use(express.static(path.join(_dirname,"/frontend/dist")))
app.get('*',(req,res) =>{
  res.sendFile(path.resolve(_dirname,"frontend","dist","index.html")); 
})

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

export default app;