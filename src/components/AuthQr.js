import React, { Component } from 'react'
import QrReader from 'react-qr-reader'
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from 'uuid';

export default class AuthScanner extends Component {
  state = {
    result: 'No result'
  }

  constructor(props) {
     super(props)
     let loc = window.location;
     let params = new URLSearchParams(loc.search);
     let qrVal = params.get('qr')
     this.state = {
	     result: qrVal
     };
     console.log();
     console.log(params);
    //const query = new URLSearchParams(this.props.location.search);
  }

  handleScan = data => {
    if (data) {
      this.setState({
        result: data
      })
    }
  }
  handleError = err => {
    console.error(err)
  }
  render() {
    var guid = uuidv4();
    var intent = "getAuthQr";
    var nonce = Math.floor(Math.random() * 101);

    var json = {
       guid: guid,
       intent: intent,
       nonce: nonce,
    };
    var b = new Buffer(JSON.stringify(json));
    var qrBase64 = b.toString('base64');
    var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + qrBase64;
    return (
      <div>
        <p>{qrUrl}</p>
	<iframe style={{top: '0', minHeight: '100vh', width: '100vw', border:'none'}} src={qrUrl}>
	</iframe >
        
      </div>
    )
  }
}
