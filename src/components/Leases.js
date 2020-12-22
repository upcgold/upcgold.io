import React, { Component } from 'react'
import dai from '../dai.png'
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
//import loader from './infinity-loader.gif';
import loader from './infinity-loader2.gif';
import QRCode from "qrcode-react";


class Main extends Component {

  constructor(props) {
    super(props)
    let scannables;
      this.state = {
        scannables: '0',
	scannableStats: [],
	scannableRewards: [],
	cardsLoading: true,
	loadingGif: <img src={loader} alt="loading..." />
       }
    this.loadLeasePage = this.loadLeasePage.bind(this);
    this.getScannables = this.getScannables.bind(this);
    this.getScannable = this.getScannable.bind(this);
    this.buildCard = this.buildCard.bind(this);
  }

 
  componentDidMount = async () => {
    var self = this;
    setInterval(function() {
        return self.loadLeasePage();
     }, 5000);
 
    return this.loadLeasePage();
  }


  loadLeasePage = async () => {
    var sc = this.getScannables();
    var localScannables = Array();
    var self = this;
    sc.then(function(result){
	  var numLeases = result.length;
	  var scannable;
	  var currentScannableStats = self.state.scannableStats;
    //populate the content on each card
          for(var i=0; i<numLeases; i++)
          {
            var upcHash = String(result[i]);
            let scannable;
            let currentStaker;
            let amountStaked;
            let word;
            var tempSc = self.getScannable(upcHash);
            currentScannableStats[upcHash] = tempSc;
            scannable = self.buildCard(upcHash.substring(0,upcHash.length));
            localScannables.push(scannable);
          }
	  self.setState({scannables:localScannables});
    });
  }

  getScannable = async (upcHash) => {
    const { accounts, contract } = this.state;
    let scannable = await this.props.getScannable(upcHash);
    return scannable;
  };

  getScannables = async () => {
    const { accounts, contract } = this.state;
    let scannables = await this.props.getMyScannables();
    return scannables;
  };

  /**
   * the goal of this function is to output card html for one scannable.  this function resolves
   * a promise from the loadPage function and then does a lookup to get the reward information for
   * each scannable (RewardGranter)
   */
  buildCard = (data) => {
    var promiseStats   = this.state.scannableStats[data];
    var promiseRewards = this.state.scannableRewards[data];
    var rewardKey = data + "-reward";
    var currentStaker;
    var amountStaked = this.state.loadingGif;
    var isOwned;
    var word;
    let rewardInfo;
    //building the card is 2 step process.  first resolve the promise from above (when the load page function above is called) and set state info for this individual
    //scannable.
    var self = this;
    promiseStats.then(values => {
	//example object.  disable the log below to inspect 
	//values {"0":"0x22F23F59A19a5EEd1eE9c546F64CC645B92a4263","1":"98000000000000000","2":false,"3":"0","4":"1605388210","5":"chris","currentStaker":"0x22F23F59A19a5EEd1eE9c546F64CC645B92a4263","amountStaked":"98000000000000000","isOwned":false,"rewards":"0","stakingStartTimestamp":"1605388210","word":"chris"}

	//console.log("values " + JSON.stringify(values));
        currentStaker=values[0];
        amountStaked=values[1];
        word=values[5];
        var arr = [];
        arr.push(values[0]);
        arr.push(values[1]);
        arr.push(word);
        self.setState({[data]: arr});
        self.setState({cardsLoading: false});
    }); 

    (async () => {
        rewardInfo = await self.props.getRewardInfo(data);
	var currentUpcState = self.state[data];
	if(currentUpcState) {
	   currentUpcState.push(rewardInfo.isOwned);
	   currentUpcState.push(rewardInfo.rewards);
	   currentUpcState.push(rewardInfo.lastRewardTimestamp);
           self.setState({[rewardKey]: currentUpcState});
	}
	console.log("CURRENT INFO: " + JSON.stringify(currentUpcState));
//	console.log("REWARD  INFO: " + JSON.stringify(rewardInfo));
//	console.log("OWNED  INFO: " + JSON.stringify(rewardInfo.isOwned));
    })();

    var bgCol = "#FDF9EC";
    var altCol = "#FDF9EC";
    var stateProp = data;
    currentStaker = this.state.[stateProp];
    var currentStakerAr;
    var currentStakerRaw = "0x0";
    var upcOwnerTruncated; 
    var isOwned = "False";
    var rewardsEarned = "To be calculated...";
    var cardRewards = this.state[rewardKey];
    var adminTabs;

    //the 3rd element is ownership info.  this was added in the async block above
    if(cardRewards && cardRewards.length >= 3) {
       //var isOwned = cardRewards[3];
       var isOwned = true;  //this needs to be dynamic
       if(isOwned) {
          isOwned = "True";
          bgCol = "#" + data.substring(32,38);
          altCol = "#" + data.substring(21,27);
          adminTabs = <Nav.Item><Nav.Link href="#link">Admin</Nav.Link></Nav.Item>;
       }
       else {
          isOwned = "False";
       }
    }

    //the 3rd element is rewards info.  this was added in the async block above
    if(cardRewards && cardRewards.length >= 4) {
       var rewardsEarnedTmp = cardRewards[4];
       if(rewardsEarned) {
         rewardsEarned = rewardsEarnedTmp;
	 rewardsEarned = window.web3.utils.fromWei(rewardsEarned, 'Ether');
       }
    }    //complicated flow... this is where the individual card's scan stats are calculated and set. currentStaker is not set on page load.  it is set 5 seconds after when the load.... function is called.  this is why this check must be done before setting values


    if(currentStaker) {

       if(this.state.cardsLoading) {
           currentStakerAr = Object.values(currentStaker);
           word = currentStakerAr[2];
           currentStakerRaw = currentStakerAr[0];
	   upcOwnerTruncated = currentStakerRaw.substring(0,5) + "..." + currentStakerRaw.substring(35);
       }
       else {
           currentStakerAr = Object.values(currentStaker);
           amountStaked = window.web3.utils.fromWei(currentStakerAr[1], 'Ether');
           word = currentStakerAr[2];
           currentStakerRaw = currentStakerAr[0];
	   upcOwnerTruncated = currentStakerRaw.substring(0,5) + "..." + currentStakerRaw.substring(35);
       }
    }

     return (
      [
        'Info',
      ].map((variant, idx) => (
            <Card
	      key={data.substring(0,10)}
              style={{backgroundColor: bgCol, marginBottom: '2em'}}
            >
             <Card.Header
              style={{backgroundColor: altCol, display: 'flex', flexDirection: 'row'}}
        >
               <Nav variant="tabs" defaultActiveKey="#first">
                 <Nav.Item>
                   <Nav.Link href="#first">Overview</Nav.Link>
                 </Nav.Item>
                 {adminTabs}
               </Nav>
             </Card.Header>
             <Card.Body>
               <Card.Title>My name is: {data.substring(0,10)}</Card.Title>
               <Card.Text>
                  <div style={{backgroundColor: "#fff", padding: '4px', marginBottom: '10px'}}>
                  <p>Owner: {upcOwnerTruncated}</p>
                  <p>Balance: {amountStaked} (xDAI)</p>
                  <p>UPC: {word}</p>
                  <p>Owned: {isOwned}</p>
                  <p>Rewards: {rewardsEarned}</p>
                  <p>SCAN ME: <QRCode value={data} /></p>
                  </div>
                            <button
                           value={word}
                           onClick={(word) => {this.props.unstakeTokens(word)} }
                           className="btn btn-primary btn-block btn-lg"
                          >
                          UNSTAKE!
                      </button>
               </Card.Text>
             </Card.Body>
           </Card>)));
    }

  render() {
    return (
      <div id="content" className="mt-3">
        <div className="card mb-4" >
          <div className="card-body">
		{this.state.scannables}
          </div>
        </div>
      </div>
    );
  }
}

export default Main;
