require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 4000;
console.log("JWT_ACCESS_SECRET length:", (process.env.JWT_ACCESS_SECRET || "").length);


app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
