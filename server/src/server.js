import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import app from './app.js';

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Cannot start server:', error.message);
    process.exit(1);
  }
};

startServer();
