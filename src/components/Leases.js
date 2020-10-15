import React, { Component } from 'react'
import dai from '../dai.png'
import Card from 'react-bootstrap/Card';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

class Main extends Component {

  constructor(props) {
    super(props)
    let scannables;
      this.state = {
        scannables: '0',
	scannableStats: [],
	scannableRewards: []
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
	    var tempSc = self.getScannable(upcHash);
            tempSc.then(function(result){
		  var newAr = JSON.stringify(result);
		  newAr = JSON.parse(newAr);
                  self.setState({scannableStats: currentScannableStats});
            });

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
    console.log(this.state);

    var promise = this.state.scannableStats[data];
    var currentStaker;
    var amountStaked;
    var isOwned;
    var word;
    var self = this;
    promise.then(values => {
        console.log(values);
        currentStaker=values[0];
        amountStaked=values[1];
        word=values[6];
        var arr = [];
        arr.push(values[0]);
        arr.push(values[1]);
        arr.push(word);
        self.setState({[data]: arr});
    }); 
    var bgCol = "#" + data.substring(34,40);
    var altCol = "#" + data.substring(11,17);
    var stateProp = data;
    currentStaker = this.state.[stateProp];
    var currentStakerAr;

    //complicated flow... this is where the individual card's scan stats are calculated and set. currentStaker is not set on page load.  it is set 5 seconds after when the load.... function is called.  this is why this check must be done before setting values
    if(currentStaker) {
       currentStakerAr = Object.values(currentStaker);
       amountStaked = window.web3.utils.fromWei(currentStakerAr[1], 'Ether');
       word = currentStakerAr[2];
    }
    
     return (
      [
        'Info',
      ].map((variant, idx) => (	     
            <Card
              style={{backgroundColor: bgCol}}
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
               <Card.Title>{data.substring(0,10)}</Card.Title>
               <Card.Text>
	      <p>UPC Master: {currentStaker}</p>
	      <p>Staked: {amountStaked} (xDAI)</p>
	      <p>UPC: {word}</p>
             
            <form className="mb-3" onSubmit={(event) => {
                event.preventDefault()
                let word1
                word1 = this.input.value.toString()
		this.props.unstakeTokens(word1)
              }}>
              <div className="input-group mb-4">
                <input
                  type="text"
                  ref={(input) => { this.input = input }}
                  className="form-control form-control-lg"
	          onChange={this.props.updateUpc}
                  placeholder="String"
                  required />

                <div className="input-group-append">
                  <div className="input-group-text">
                    <img src={dai} height='32' alt=""/>
                    &nbsp;&nbsp;&nbsp; xDAI
                  </div>
                </div>
              </div>
              <button 
	           type="submit" 
	           className="btn btn-primary btn-block btn-lg"
		  >
		  UNSTAKE!
	      </button>
            </form>
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
