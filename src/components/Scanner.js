import React, { Component } from 'react'
import QrReader from 'react-qr-reader'
import QRCode from "qrcode-react";
import { v4 as uuidv4 } from 'uuid';

export default class Scanner extends Component {
  state = {
    result: 'No result'
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
    return (
      <div>
        <QRCode value={guid} />
        <p>{this.state.result}</p>
        <QrReader
          delay={300}
          onError={this.handleError}
          onScan={this.handleScan}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        />
      </div>
    )
  }
}
