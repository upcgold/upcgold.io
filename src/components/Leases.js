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
	scannableStats: []
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
        	  currentScannableStats[upcHash] = "33333";
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
    var self = this;
    promise.then(values => {
        //console.log(values);
        currentStaker=values[0];
        console.log(values);
        var stakerIndex = values[0]; //store this as the index in the state
        var arr = [];
        arr.push(values[0]);
        self.setState({[data]: arr});
    }); 
    var bgCol = "#" + data.substring(20,26);
    var stateProp = data;
    currentStaker = this.state.[stateProp];
    console.log("STATE " + JSON.stringify(this.state.[stateProp]));
     return (
      [
        'Info',
      ].map((variant, idx) => (	     
            <Card
              style={{backgroundColor: bgCol}}
            >
             <Card.Header>
               <Nav variant="tabs" defaultActiveKey="#first">
                 <Nav.Item>
                   <Nav.Link href="#first">Active</Nav.Link>
                 </Nav.Item>
                 <Nav.Item>
                   <Nav.Link href="#link">Link</Nav.Link>
                 </Nav.Item>
                 <Nav.Item>
                   <Nav.Link href="#disabled">
                     Disabled
                   </Nav.Link>
                 </Nav.Item>
               </Nav>
             </Card.Header>
             <Card.Body>
               <Card.Title>{data.substring(0,10)}</Card.Title>
               <Card.Text>
	      Current Owner: {currentStaker}
            <form className="mb-3" onSubmit={(event) => {
                event.preventDefault()
                let word
                word = this.input.value.toString()
		this.props.unstakeTokens(word)
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
