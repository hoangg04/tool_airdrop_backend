const app = require("./src/app");

const PORT = process.env.DEV_APP || 3001;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
process.on("SIGINT", () => {
    console.log("SIGINT received");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("SIGTERM received");
    process.exit(0);
});

