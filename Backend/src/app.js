import express from 'express';
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.routes.js';
import interviewRoutes from './routes/interview.routes.js';
import cors from 'cors';





const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: `${process.env.FRONTEND_URL}`,
  credentials: true,
}));





/*   authRoutes  */
app.use('/api/auth',authRoutes);


app.use("/api/interview", interviewRoutes);

export default app;