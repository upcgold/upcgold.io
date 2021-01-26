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
//    var guid = uuidv4();
//    var intent = "getAuthQr";
//    var nonce = Math.floor(Math.random() * 101);
//
//    var json = {
//       guid: guid,
//       intent: intent,
//       nonce: nonce,
//    };

     let loc = window.location.href;
     let encodedParam = new URL(loc).searchParams.get('data');
     let params = new URLSearchParams(loc);
     let decodedBuffer  = new Buffer.from(encodedParam, "base64");
     let decodedString = decodedBuffer.toString("utf8");
	
     let decodedObj = JSON.parse(decodedString);
     this.state.qrBase64 = decodedObj;
     console.log(decodedObj.guid);
     console.log(decodedObj.nonce);
     //console.log(encodedParam);
     //console.log(loc);
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
    //var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + qrBase64;
    var qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + this.state.qrBase64.guid + "&nonce=" + this.state.qrBase64.nonce;
    return (
      <div>
        <p>{qrUrl}</p>
	<iframe style={{top: '0', minHeight: '100vh', width: '100vw', border:'none'}} src={qrUrl}>
	</iframe >
        
      </div>
    )
  }
}
