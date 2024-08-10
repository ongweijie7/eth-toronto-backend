import express from "express"
import gunsController from "./guns/guns.controller.js"
import config from "./config.js"

const app = express()
const port = config.port

app.use(express.json())

app.use("/weapons", gunsController)

app.get("/", (req, res) => {
  res.send("Hello World")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})