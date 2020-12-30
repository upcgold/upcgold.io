import React, { Component } from 'react'
import ReactCardFlip from 'react-card-flip';
import Iframe from 'react-iframe'
import Web3 from 'web3'
import UPCGoldBank from '../abis/UPCGoldBank.json'
import RewardGranter from '../abis/RewardGranter.json'
import Navbar from './Navbar'
import Leases from './Leases'
import Evictions from './Evictions'
import Withdraw from './Withdraw'
import Deposit from './Deposit'
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



    // Load RewardGranter
    const rewardGranterData = RewardGranter.networks[networkId]
    if(rewardGranterData) {
      const rewardGranter = new web3.eth.Contract(RewardGranter.abi, rewardGranterData.address)
      this.setState({ rewardGranter })
//      var testPayout = web3.utils.asciiToHex("0xf8ece5499a70cb0f7a2c8adae5cb5c32abd9a6978f245f29d67331998712632");
	    //0xf8ece5499a70cb0f7a2c8adae5cb5c32abd9a6978f245f29d67331998712632c
//      var testPayout = "0xf8ece5499a70cb0f7a2c8adae5cb5c32abd9a6978f245f29d67331998712632c";
      //let payout = await rewardGranter.methods.getRewardableScannables().call();
//      let payout = await rewardGranter.methods.payouts(testPayout).call();
//      console.log("PAYOUT");
//      console.log(payout);
    } else {
      window.alert('RewardGranter contract not deployed to detected network.')
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


  getTVL= async () => {
    const web3 = window.web3
    const { accounts, contract } = this.state;
    //console.log(this.state.sendCryptoValue);
    // Stores a given value, 5 by default.
    let tvl = await this.state.upcGoldBank.methods.getBalance().call();
    var tvlNum = tvl.toString();
    var tvlEth = web3.utils.fromWei(tvlNum, 'Ether')
    this.setState({contractBalance: tvlEth})
  };


  updateUpc(e) {
     var upc = e.target.value;
     this.setState({ upc: upc });
  };

  componentDidMount(){
    var self = this;
    setInterval(function() {
        return self.getTVL();
     }, 2000);
  }

 
  handleFlip(e) {
    e.preventDefault();
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
  }
 

  handleChange(e) {
     const web3 = window.web3
     var sendEth = web3.utils.toWei(e.target.value, "ether")
     this.setState({ sendCryptoValue: sendEth });
  };

  unstakeTokens = (word) => {
    var wordToUnstake = word.target.value;
    this.setState({ loading: true })
    this.state.upcGoldBank.methods.withdraw(wordToUnstake).send({ from: this.state.account });
    this.setState({ loading: false})
  }

  getMyBalance = async () => {
    const { accounts, contract } = this.state;

    let stakingBalance = await this.state.upcGoldBank.methods.getAddressBalance().call({from: this.state.account });
    this.setState({daiTokenBalance: stakingBalance.toString() });
    return stakingBalance.toString();
  };

  getRewardInfo= async (upcHash) => {
    const { accounts, contract } = this.state;
    let payout = await this.state.rewardGranter.methods.payouts(upcHash).call({from: this.state.account });
    return payout;
  };

  getContractBalance = async () => {
    const { accounts, contract } = this.state;

    let contractBalance = await this.state.upcGoldBank.methods.getContractBalance().call();
    return contractBalance;
  };

  getMyScannables = async () => {
    const { accounts, contract } = this.state;
    let scannables = await this.state.upcGoldBank.methods.getMyScannables().call({ from: this.state.account });
    let returnable = scannables;
    return returnable;
  };

  getScannable = async (upcHash) => {
    const { accounts, contract } = this.state;
    let scannable = await this.state.upcGoldBank.methods.getScannable(upcHash).call({ from: this.state.account });
    let returnable = scannable;
    return returnable;
  };

  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      upcGoldBank: {},
      daiTokenBalance: '0',
      stakingBalance: '0',
      loading: true,
      upc: '',
      isFlipped: false
    }
    this.handleChange = this.handleChange.bind(this);
    this.updateUpc= this.updateUpc.bind(this);
    this.getContractBalance= this.getContractBalance.bind(this);
    this.getMyScannables = this.getMyScannables.bind(this);
    this.getScannable = this.getScannable.bind(this);
    this.getMyBalance = this.getMyBalance.bind(this);
    this.getTVL = this.getTVL.bind(this);
    this.handleFlip = this.handleFlip.bind(this);
  }

  render() {
    const web3 = window.web3

    
    var contractBalance = this.state.stakingBalance;

    let deposit
    let withdraw 
    let leases
    let evictions
    if(this.state.loading) {
      deposit = <p id="loader" className="text-center">Loading...</p>
      withdraw= <p id="loader" className="text-center">Loading...</p>
      leases= <p id="loader" className="text-center">Loading...</p>
      evictions= <p id="loader" className="text-center">Loading...</p>
    } else {
      deposit = <Deposit
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        contractBalance={this.state.contractBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
	getMyBalance={this.getMyBalance}
      />

      leases= <Leases
        daiTokenBalance={this.state.daiTokenBalance}
        stakingBalance={this.state.stakingBalance}
        contractBalance={this.state.contractBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        handleChange={this.handleChange}
        updateUpc={this.updateUpc}
	getMyScannables={this.getMyScannables}
	getScannable={this.getScannable}
	myAccount={this.state.account}
	getRewardInfo={this.getRewardInfo}
      />
 
      evictions= <Evictions
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
      <div style={{height: '100vh', width: '100vw', border:'none'}} >
                  <Tabs style={{paddingTop:'10px'}}>
                    <TabList>
                      <Tab>Coinbox Casino</Tab>
                      <Tab>Store</Tab>
                      <Tab>Level Up</Tab>
                    </TabList>


                    <TabPanel>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                  <Tabs>
                    <TabList>
                      <Tab>Chips</Tab>
                    </TabList>
                
                    <TabPanel>
                                {leases}
                    </TabPanel>
                  </Tabs>
              </div>
            </main>
          </div>
        </div>
                    </TabPanel>
                     <TabPanel>
                        <iframe style={{top: '0', minHeight: '100vh', width: '100vw', border:'none'}} src="https://upcgold.github.io/react-store-compose">
                        </iframe >
                    </TabPanel>
                    <TabPanel>
                        <iframe style={{top: '0', minHeight: '100vh', width: '100vw', border:'none'}} src="https://hello.upcgold.io/home">
                        </iframe >
                    </TabPanel>
                 </Tabs>
      </div>
    );
  }
}

export default App;
