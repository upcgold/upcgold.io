import React, { Component } from 'react'
import dai from '../dai.png'

class Main extends Component {

  render() {
    return (
      <div id="content" className="mt-3">

        <div className="card mb-4" >

          <div className="card-body">

            <form className="mb-3" onSubmit={(event) => {
                event.preventDefault()
                let word
                word = this.input.value.toString()
		this.props.unstakeTokens(word)
              }}>
              <div>
                <label className="float-left"><b>Stake Tokens</b></label>
                <span className="float-right text-muted">
                  Your Balance: {window.web3.utils.fromWei(this.props.daiTokenBalance, 'Ether')}
                </span>
              </div>
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
          </div>
        </div>

      </div>
    );
  }
}

export default Main;
