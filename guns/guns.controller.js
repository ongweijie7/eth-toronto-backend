import { Router } from "express"
import config from "../config.js"
import Web3 from "web3"
import fs from 'fs'
import path from 'path'


const web3 = new Web3(new Web3.providers.HttpProvider(config.ganacheUrl))


const contractJson = JSON.parse(
  fs.readFileSync(path.resolve('./guns/Ownership.json'), 'utf-8')
)
const contractABI = contractJson.abi
const contractAddress = config.contractAddress

const contract = new web3.eth.Contract(contractABI, contractAddress)


const gunsController= Router()

gunsController.get('/owner', async (req, res) => {
  try {
    const { serialNum } = req.query;
    const owner = await contract.methods.getOwner(serialNum).call()
    console.log(owner)
    return res.json( { 'owner': owner } )
  } catch (e) {
    console.log(e.message)
    return res.status(500).json({ error: e.message })
  }

})

export default gunsController