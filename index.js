import express from "express"
import gunsController from "./guns/guns.controller.js"
import config from "./config.js"
import cors from "cors"

const app = express()
const port = config.port

app.use(express.json())
app.use(cors(
  {
    origin: 'http://localhost:7000'
  }
))

app.use("/weapons", gunsController)

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})