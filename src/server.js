import app from "./app.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";

const startServer = async () => {
  await connectDB();
  const port = config.port || 5001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

// Only start the server if not running on Vercel (serverless)
if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
