import { Router } from "express"
import JsonResponse from "../common/jsonResponse.js"
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


const gunsController = Router()

gunsController.get('/owner', async (req, res) => {
  try {
    const { serialNum } = req.query;
    const owner = await contract.methods.getOwner(serialNum).call()
    return JsonResponse.success({ "owner": owner }).send(res)
  } catch (e) {
    console.log(e.message)
    return JsonResponse.fail(500 ,{ error: e.message }).send(res)
  }
})

// Fetch all guns given an owner address
gunsController.get('/guns', async (req, res) => {
  try {
    const { ownerAddress } = req.query;
    const registeredGuns = await contract.methods.getGunsByOwner(ownerAddress).call()
    console.log(registeredGuns)
    return JsonResponse.success({ "registeredGuns": registeredGuns }).send(res)
  } catch (e) {
    console.log(e)
    return JsonResponse.fail(500 ,{ error: e.message }).send(res)
  }
})



gunsController.post('/register-gun', async (req, res) => {
  try {
    const { serialNum, address } = req.body;
    // get the amount of gas needed
    const gasEstimate = await contract.methods.registerGun(serialNum).estimateGas({
      from: address
    })
    const gasPrice = await web3.eth.getGasPrice(); //get the gas price in wei
    // Calculate the total gas cost
    const totalGasCostWei = gasEstimate * gasPrice;
    const totalGasCostEther = web3.utils.fromWei(totalGasCostWei.toString(), 'ether');
    const transaction = await contract.methods.registerGun(serialNum).send({
      from: address,
      gas: gasEstimate,
      gasPrice: gasPrice
    })
    return JsonResponse.success({ "ethCost": totalGasCostEther, "transactionHash": transaction.transactionHash }).send(res)
  } catch (e) {
    console.log(e)
    return JsonResponse.fail(500 ,{ error: e.message }).send(res)
  }
})

gunsController.put('/transfer-ownership', async (req, res) => {
  try {
    console.log(req.body)
    const { serialNumber, oldAddress, newAddress } = req.body;
    // get the amount of gas needed
    const gasEstimate = await contract.methods.transferOwnership(serialNumber, newAddress).estimateGas({
      from: oldAddress
    })
    const gasPrice = await web3.eth.getGasPrice(); //get the gas price in wei
    // Calculate the total gas cost
    console.log(gasEstimate)
    const totalGasCostWei = gasEstimate * gasPrice;
    const totalGasCostEther = web3.utils.fromWei(totalGasCostWei.toString(), 'ether');
    const transaction = await contract.methods.transferOwnership(serialNumber, newAddress).send({
      from: oldAddress,
      gas: gasEstimate,
      gasPrice: gasPrice
    })

    return JsonResponse.success({ "ethCost": totalGasCostEther, "transactionHash": transaction.transactionHash }).send(res)
  } catch (e) {
    console.log(e)
    return JsonResponse.fail(500 ,{ error: e.message }).send(res)
  }
})


//fetches all registered guns, if an owner address is provided, it fetches all guns registered by that address
gunsController.get('/registered-guns', async (req, res) => {
  try {
    const { ownerAddress } = req.body;

    const registeredEvents = !ownerAddress 
    ? await contract.getPastEvents('GunRegistered', { fromBlock:0, toBlock:'latest' })
    : await contract.getPastEvents('GunRegistered', { filter: {owner:[ownerAddress]}, fromBlock:0, toBlock:'latest' })

    const registeredGuns = registeredEvents.map(event => {
      const serialNum = event.returnValues.serialNumber
      const owner = event.returnValues.owner
       return { serialNum, owner } 
      })
    return JsonResponse.success({ "registeredGuns": registeredGuns }).send(res)
  } catch (e) {
    console.log(e)
    return JsonResponse.fail(500 ,{ error: e.message }).send(res)
  }
})

gunsController.get('/history', async (req, res) => {
  try {
    const { serialNum } = req.query
    var hashedGunSerial = await contract.methods.getHashedSerialNum(serialNum).call()
    const eventList = await contract.getPastEvents("OwnershipTransferred", {
      filter: {
          hashedSerial: [hashedGunSerial]
      },
      fromBlock: 0,
      toBlock: 'latest'
    });

  var historyList = []
  for (var history of eventList) {
    historyList.push(
      {
        "old": history.returnValues.oldOwner,
        "new": history.returnValues.newOwner
      }
    ) 
  }
    return JsonResponse.success({ "ownership history": historyList }).send(res)
  } catch (e) {
    console.log(e.message)
    return JsonResponse.fail(500 ,{ error: e.message }).send(res)
  }
})



export default gunsController