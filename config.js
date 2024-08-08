import dotenv from 'dotenv'

dotenv.config()

const config = {
  port: process.env.PORT || 3000,
  contractAddress: process.env.CONTRACT_ADDRESS,
  ganacheUrl: process.env.GANACHE_URL
}

export default config