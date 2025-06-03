import express from 'express';
import connectToDB from './connect.js';
import requestLogger from './middlewares/requestLogger.js';
import routes from './routes/main.js';
import getUserFromAuthToken from './middlewares/jwtFromUser.js';
import path from 'path';
import cors from 'cors';

const startServer = async () => {
  try {
    const connectMessage = await connectToDB();
    console.log(connectMessage);

    const app = express();

    // Enable CORS for frontend access (customize origin if needed)
    app.use(cors({
      origin: 'http://localhost:3000', // or '*' for public access
      credentials: true,
    }));

    // Serve static files from "public" folder
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Middleware to parse incoming JSON
    app.use(express.json());

    // Optional: extract user from auth token
    app.use(getUserFromAuthToken);

    // API routes
    app.use('/api', routes);

    // Log requests after routing
    app.use(requestLogger);

    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Server running on PORT ${port}`);
    });

  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

startServer();
