import React, { Component } from 'react'
import Web3 from 'web3'
import UPCGoldBank from '../abis/UPCGoldBank.json'
import Navbar from './Navbar'
import Deposit from './Deposit'
import Withdraw from './Withdraw'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import './App.css'
import 'react-tabs/style/react-tabs.css';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const networkId = await web3.eth.net.getId()

    // Load UPCGoldBank
    const upcGoldBankData = UPCGoldBank.networks[networkId]
    if(upcGoldBankData) {
      const upcGoldBank = new web3.eth.Contract(UPCGoldBank.abi, upcGoldBankData.address)
      this.setState({ upcGoldBank })
      let stakingBalance = await upcGoldBank.methods.getAddressBalance().call({from: this.state.account });
      let contractBalance = await upcGoldBank.methods.getBalance().call();
      this.setState({ contractBalance: contractBalance, daiTokenBalance: stakingBalance.toString(), stakingBalance: stakingBalance.toString() })
    } else {
      window.alert('UPCGoldBank contract not deployed to detected network.')
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  stakeTokens= async () => {
    const { accounts, contract } = this.state;

    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    this.state.upcGoldBank.methods.depositMoney(this.state.upc).send({ from: this.state.account , value: this.state.sendCryptoValue});
  };

  updateUpc(e) {
     var upc = e.target.value;
     this.setState({ upc: upc });
  };



  handleChange(e) {
     const web3 = window.web3
     var sendEth = web3.utils.toWei(e.target.value, "ether")
     this.setState({ sendCryptoValue: sendEth });
  };

  unstakeTokens = (word) => {
    this.setState({ loading: true })
    this.state.upcGoldBank.methods.withdraw(word).send({ from: this.state.account });
    this.setState({ loading: false})
  }


  getContractBalance = async () => {
    const { accounts, contract } = this.state;

    let contractBalance = await this.state.upcGoldBank.methods.getContractBalance().call();
    return contractBalance;
  };


  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      upcGoldBank: {},
      daiTokenBalance: '0',
      stakingBalance: '0',
      loading: true,
      upc: ''
    }
    this.handleChange = this.handleChange.bind(this);
    this.updateUpc= this.updateUpc.bind(this);
    this.getContractBalance= this.getContractBalance.bind(this);
  }

  render() {
    const web3 = window.web3

    
    var contractBalance = this.state.stakingBalance;

    let deposit
    let withdraw 
    if(this.state.loading) {
      deposit = <p id="loader" className="text-center">Loading...</p>
      withdraw= <p id="loader" className="text-center">Loading...</p>
    } else {
      deposit = <Deposit
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        contractBalance={this.state.contractBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
      />

      withdraw= <Withdraw
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        contractBalance={this.state.contractBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
      />

    }

    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
        <table className="table table-borderless text-muted text-center">
          <thead>
            <tr>
              <th scope="col">Total Staked:</th>
              <th scope="col">Reward Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{web3.utils.fromWei(contractBalance, 'Ether')} xDAI</td>
            </tr>
          </tbody>
        </table>

  <Tabs>
    <TabList>
      <Tab>Deposit</Tab>
      <Tab>Withdraw</Tab>
      <Tab>Rewards</Tab>
    </TabList>

    <TabPanel>
                {deposit}
    </TabPanel>
    <TabPanel>
                {withdraw}
    </TabPanel>
    <TabPanel>
      <h2>Any content 2</h2>
    </TabPanel>
  </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
