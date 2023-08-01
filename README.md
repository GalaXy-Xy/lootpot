# LootPot - Decentralized Prize Pool System

A decentralized prize pool system built on Ethereum with Chainlink VRF for fair randomness. Users can stake Sepolia ETH to participate in existing prize pools or create new ones, with transparent and fair prize distribution.

## 🚀 Features

- **Decentralized Prize Pools**: Create and participate in prize pools with customizable parameters
- **Fair Randomness**: Uses Chainlink VRF for verifiable random number generation
- **Transparent System**: All pool data and transactions are publicly verifiable on the blockchain
- **User-Friendly Interface**: Modern React-based frontend with wallet integration
- **Multi-Network Support**: Currently supports Sepolia testnet and local development
- **Comprehensive Testing**: Full test coverage for smart contracts and frontend components

## 🏗️ Architecture

### Smart Contracts

- **PrizePool.sol**: Core contract managing individual prize pools
- **PoolFactory.sol**: Factory contract for creating new prize pools
- **OpenZeppelin**: Uses battle-tested libraries for security and functionality

### Frontend

- **Next.js 13**: Modern React framework with App Router
- **Wagmi**: React hooks for Ethereum
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for testing

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GalaXy-Xy/lootpot.git
   cd lootpot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your configuration:
   ```env
   SEPOLIA_RPC_URL=your_sepolia_rpc_url
   PRIVATE_KEY=your_private_key_for_deployment
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

4. **Compile smart contracts**
   ```bash
   npm run compile
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Creating a Prize Pool

1. Connect your wallet to the application
2. Navigate to the "Create Pool" tab
3. Fill in the pool parameters:
   - **Pool Name**: A descriptive name for your pool
   - **Minimum Participation**: Minimum ETH amount required to participate
   - **Win Probability**: 1 in X chance to win (e.g., 10 means 1 in 10)
   - **Platform Fee**: Percentage of total pool that goes to platform (0-50%)
   - **Duration**: How long the pool will be active (in days)
4. Pay the creation fee (0.01 ETH) and submit

### Participating in a Pool

1. Browse available prize pools on the main page
2. Select a pool you want to participate in
3. Enter your participation amount (must meet minimum requirement)
4. Confirm the transaction in your wallet
5. Wait for the random selection process
6. If you win, prizes are automatically distributed to your wallet

### Managing Your Pool

- **End Pool**: Manually end a pool after the duration expires
- **Withdraw Fees**: Collect platform fees (pool creator only)
- **Emergency Withdraw**: Recover funds from ended pools

## 🧪 Testing

### Smart Contract Tests
```bash
npm run test
```

### Frontend Tests
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test -- --coverage
```

## 📚 Smart Contract Details

### PrizePool Contract

**Key Functions:**
- `joinPool()`: Participate in the prize pool
- `endPool()`: End the pool (owner only)
- `withdrawPlatformFees()`: Withdraw collected fees (owner only)
- `emergencyWithdraw()`: Emergency fund recovery (owner only)

**Events:**
- `PoolCreated`: Emitted when a new pool is created
- `ParticipantJoined`: Emitted when someone joins a pool
- `WinnerSelected`: Emitted when a winner is selected
- `PoolEnded`: Emitted when a pool ends

### PoolFactory Contract

**Key Functions:**
- `createPool()`: Create a new prize pool
- `getAllPools()`: Get all created pools
- `withdrawFees()`: Withdraw creation fees (owner only)

## 🔒 Security Features

- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Only pool creators can manage their pools
- **Input Validation**: Comprehensive parameter validation
- **Emergency Functions**: Safe withdrawal mechanisms
- **OpenZeppelin**: Uses audited and tested libraries

## 🌐 Network Support

- **Sepolia Testnet**: Main testing environment
- **Local Hardhat**: Development and testing
- **Ethereum Mainnet**: Future deployment (requires additional security audits)

## 📱 Frontend Features

- **Responsive Design**: Works on desktop and mobile devices
- **Wallet Integration**: MetaMask and other Web3 wallets
- **Real-time Updates**: Live pool data and participant information
- **User History**: Track your participation and winnings
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## 🚧 Development Roadmap

### Phase 1: Core Functionality ✅
- [x] Smart contract development
- [x] Basic frontend interface
- [x] Wallet integration
- [x] Pool creation and participation

### Phase 2: Enhanced Features 🚧
- [ ] Chainlink VRF integration for true randomness
- [ ] Advanced pool types (time-based, skill-based)
- [ ] Social features and sharing
- [ ] Mobile app development

### Phase 3: Scaling and Optimization 📋
- [ ] Layer 2 integration for gas optimization
- [ ] Multi-chain support
- [ ] Advanced analytics and insights
- [ ] Governance token implementation

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is for educational and testing purposes. Use at your own risk. The developers are not responsible for any financial losses incurred through the use of this application.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/GalaXy-Xy/lootpot/wiki)
- **Issues**: [GitHub Issues](https://github.com/GalaXy-Xy/lootpot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/GalaXy-Xy/lootpot/discussions)

## 🙏 Acknowledgments

- [OpenZeppelin](https://openzeppelin.com/) for secure smart contract libraries
- [Chainlink](https://chain.link/) for decentralized oracle services
- [Hardhat](https://hardhat.org/) for development framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [Wagmi](https://wagmi.sh/) for Ethereum React hooks

---

**Built with ❤️ by the LootPot team**