import React, { Component } from 'react'
import dai from '../dai.png'

class Main extends Component {

  constructor(props) {
    super(props)
    let scannables;
      this.state = {
        scannables: '0'
       }


    this.getScannables = this.getScannables.bind(this);
  }

  getScannables = async () => {
    const { accounts, contract } = this.state;


    let scannables = await this.props.getMyScannables();
    return scannables;

  };


  render() {
    var sc = this.getScannables();
    var self = this;
    sc.then(function(result){
	  self.setState({scannables:result});
    });
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
