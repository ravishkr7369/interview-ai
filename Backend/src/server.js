import "dotenv/config";

import app from "./app.js";
import { dbConnect } from "./config/dbConnect.js";

const PORT = process.env.PORT||3000;

dbConnect();

app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
