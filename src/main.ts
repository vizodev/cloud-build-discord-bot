import { setupApp } from "./app";

const port = process.env["PORT"] || 3000;

setupApp().then((app) =>
  app.listen(port, () =>
    console.log(`Vizo Google Cloud Platform Bot running at ${port}`)
  )
);
