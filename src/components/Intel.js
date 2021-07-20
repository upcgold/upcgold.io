import React, { Component } from 'react'
import dai from '../dai.png'
import ReactCardFlip from 'react-card-flip';


class Intel extends Component {

  constructor(props) {
    super(props)
    this.state = {
      code: "",
      isFlipped: false,
      humanReadableName: "",
    }
    this.handleNameChange = this.handleNameChange.bind(this);

  }

  componentWillMount(){
    var self = this;
    var scan;
    var tmpCode;
    try {
          tmpCode = this.props.intel;
          tmpCode = tmpCode.substring(7);
          scan = JSON.parse(atob(tmpCode));
          this.state.code = scan.code;
       }   
       catch(e){
          scan = ""; 
       }   
      
  }

  flipCard = (data) => {
    this.setState({isFlipped: !this.state.isFlipped});
  }

  handleNameChange(e) {
     this.setState({ humanReadableName: e.target.value });
  };



  render() {
    return (

            <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">
             <div>
	        <b>code is {this.state.code} </b>
                <button onClick={() => this.flipCard('spin')}
                   className="btn btn-success btn-block btn-lg"
                >
                        Read Intel
                </button>
                <button onClick={() => this.flipCard('cm')}
                   className="btn btn-dark btn-block btn-lg"
                >
                  *crypto mode*
                </button>
             </div>
             <div>
                  <form className="mb-3" onSubmit={(event) => {
                      event.preventDefault()
                      let amount
                      amount = this.input.value.toString()
                      amount = window.web3.utils.toWei(amount, 'Ether')
		      let humanReadableName = this.input3.value.toString();
                      let upc=this.state.code
			  console.log("buying " + humanReadableName);
      		      this.props.stakeTokens(upc,humanReadableName)
                    }}>
                    <div>
                      <label className="float-left"><b>Stake Tokens</b></label>
                      <span className="float-right text-muted">
                      </span>
                    </div>
                    <div className="input-group mb-4">
                      <input
                        type="text"
                        ref={(input) => { this.input = input }}
                        className="form-control form-control-lg last"
      	          onChange={this.props.handleChange}
                        placeholder="xDAI"
                        required />
	    <br/>
                      <input
                        type="text"
                        ref={(input3) => { this.input3 = input3 }}
                        className="form-control form-control-lg last"
      	          onChange={this.handleNameChange}
                        placeholder=".upc domain name"
                        required />
	    <br/>
                      <input
                        type="text"
                        ref={(input2) => { this.input2 = input2 }}
                        className="form-control form-control-lg"
      	          onChange={this.props.updateUpc}
                        placeholder="UPC"
	                value={this.state.code}
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
      		  STAKE!
      	      </button>
                  </form>

                <button onClick={() => this.flipCard('front')}
                   className="btn btn-primary btn-block btn-lg"
                >
                        Back
                </button>
             </div>
           </ReactCardFlip>);
  }
}

export default Intel;
