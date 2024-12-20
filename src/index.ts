const express = require('express')
import { Request, Response, NextFunction } from 'express';
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors');
import dotenv from 'dotenv';
dotenv.config();
const port = process.env.PORT || 5000
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';

app.use(cors({
  origin: 'http://localhost:5173', // Front-end URL
  credentials: true,               // Allow sending cookies
}));
app.use(express.json());
app.use(cookieParser());

app.use((err: SyntaxError, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid Request Body', message: err.message });
  }
  next(err); // Pass other errors to the default error handler
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import createUserRouter from './routes/createUserRoute'
import loginRouter from './routes/auth/loginRoute';
import userRouter from './routes/user/user';
import departmentRouter from './routes/department/department';
import attendanceRouter from './routes/attendanceRoutes/attendanceRoutes'
import leaveRouter from './routes/leaveManRoutes';
import dashboardRouter from './routes/DashBoardAPIRoutes';
import forgotPasswordRouter from './routes/forgotPasswordRoutes';


app.use('/api', createUserRouter)
app.use('/api', loginRouter)
app.use('/api', userRouter)
app.use('/api', departmentRouter)
app.use('/api', attendanceRouter)
app.use('/api', leaveRouter)
app.use('/api', dashboardRouter)
app.use('/api', forgotPasswordRouter)


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log("The app is running on : http://localhost:" + port)
  console.log(`API Docs available at http://localhost:${port}/api-docs`);
})