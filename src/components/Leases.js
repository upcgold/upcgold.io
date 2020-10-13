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
        scannables: '0'
       }


    this.getScannables = this.getScannables.bind(this);
    this.buildCard = this.buildCard.bind(this);
  }



  componentDidMount = async () => {
    var sc = this.getScannables();
    var localScannables = Array();
    var self = this;
    sc.then(function(result){
	  var numLeases = result.length;
	  var scannable;
          for(var i=0; i<numLeases; i++)
          {
            var resultStr = String(result[i]);
            scannable = self.buildCard(resultStr.substring(0,10));
            localScannables.push(scannable);
          }
	  self.setState({scannables:localScannables});
    });
  }

  getScannables = async () => {
    const { accounts, contract } = this.state;
    let scannables = await this.props.getMyScannables();
    return scannables;
  };

  buildCard = (data) => {
     return (
[
  'Info',
].map((variant, idx) => (	     
      <Card
	bg={variant.toLowerCase()}
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
             <Nav.Link href="#disabled" disabled>
               Disabled
             </Nav.Link>
           </Nav.Item>
         </Nav>
       </Card.Header>
       <Card.Body>
         <Card.Title>{data}</Card.Title>
         <Card.Text>
           With supporting text below as a natural lead-in to additional content.
         </Card.Text>
         <Button variant="primary">Go somewhere</Button>
       </Card.Body>
     </Card>)));
  }

  render() {
    return (
      <div id="content" className="mt-3">

        <div className="card mb-4" >

          <div className="card-body">




            <form className="mb-3" onSubmit={(event) => {
                event.preventDefault()
                let amount
                amount = this.input.value.toString()
                amount = window.web3.utils.toWei(amount, 'Ether')
                let upc
		upc = this.input2.value.toString()
		this.props.stakeTokens(amount,upc)
              }}>
	    {this.state.scannables}
            </form>
          </div>
        </div>

      </div>
    );
  }
}

export default Main;
