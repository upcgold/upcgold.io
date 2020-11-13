import React, { Component } from 'react'
import dai from '../dai.png'
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
//import loader from './infinity-loader.gif';
import loader from './infinity-loader2.gif';

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
          for(var i=0; i<numLeases; i++)
          {
            var upcHash = String(result[i]);
            let scannable;
            let rewardInfo;
	    let currentStaker;
	    let amountStaked;
	    let word;


            (async () => {
                rewardInfo = await await self.props.getRewardInfo(upcHash);
        	//console.log("REWARD INFO: " + JSON.stringify(rewardInfo));
            })();


	    var tempSc = self.getScannable(upcHash);
            tempSc.then(values => {
                currentStaker=values[0];
                amountStaked=values[1];
                word=values[6];
                var arr = [];
                arr.push(values[0]);
                arr.push(values[1]);
                arr.push(word);
                self.setState({[upcHash]: arr});
                self.setState({cardsLoading: false});
            }); 

            console.log("REWARD INFO: " + tempSc);
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

  buildCard = (data) => {
    var promiseStats   = this.state.scannableStats[data];
    var promiseRewards = this.state.scannableRewards[data];

    var currentStaker;
    var amountStaked = this.state.loadingGif;
    var isOwned;
    var word;
    var self = this;

    var bgCol = "#" + data.substring(32,38);
    var altCol = "#" + data.substring(21,27);
    var stateProp = data;
    currentStaker = this.state.[stateProp];
    var currentStakerAr;
    var currentStakerRaw = "0x0";
    var upcOwnerTruncated; 

    //complicated flow... this is where the individual card's scan stats are calculated and set. currentStaker is not set on page load.  it is set 5 seconds after when the load.... function is called.  this is why this check must be done before setting values
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
                 <Nav.Item>
                   <Nav.Link href="#link">Rewards</Nav.Link>
                 </Nav.Item>
                 <Nav.Item>
                   <Nav.Link href="#games">Games</Nav.Link>
                 </Nav.Item>
               </Nav>
             </Card.Header>
             <Card.Body>
               <Card.Title>My name is: {data.substring(0,10)}</Card.Title>
               <Card.Text>
                  <div style={{backgroundColor: "#fff", padding: '4px', marginBottom: '10px'}}>
                  <p>Owner: {upcOwnerTruncated}</p>
                  <p>Balance: {amountStaked} (xDAI)</p>
                  <p>UPC: {word}</p>
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
