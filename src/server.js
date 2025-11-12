import app from "./app.js";
import { config } from "./config/config.js";
import { connectDB } from "./config/db.js";

const port = config.port;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  };
  startServer();
}