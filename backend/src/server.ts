import { app } from "./app.js";
import "./database/client.js";

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`MeowPay API listening on port ${port}`);
});
