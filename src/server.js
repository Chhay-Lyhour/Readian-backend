import app from "./app.js";
import { config } from "./config/config.js";

const port = config.port;

// Start the server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}