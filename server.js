import app from "./src/index.js";

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log("server is listening at port " + PORT));
