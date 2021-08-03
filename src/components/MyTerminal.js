import React, { Component } from 'react'
import Terminal from 'react-console-emulator'

const commands = {
  echo: {
    description: 'Echo a passed string.',
    usage: 'echo <string>',
    fn: function () {
      return `${Array.from(arguments).join(' ')}`
    }
  }
}

export default class MyTerminal extends Component {

  constructor(props) {
    super(props)
    this.progressTerminal = React.createRef()
    this.state = {
       account: props.account,
       progress: 0,
       progressBal: ''
    }
  }

  render () {
    var promptlabel = this.state.account + '@upc_shell>';
    return (
      <Terminal
        ref={this.progressTerminal}
        commands={{
            bal: {
              description: 'Displays a progress counter.',
              fn: () => {
                this.setState({ isProgressing: true }, () => {
                  const terminal = this.progressTerminal.current
                  var theBal;
                  let bal = this.props.getMyBalance();
                      bal.then((value) => {
                         theBal = value;
                         // expected output: "Success!"
                      });


                  const interval = setInterval(() => {
                    if (this.state.progressBal != '') { // Stop at 100%
                      clearInterval(interval)
                      this.setState({ isProgressing: false, progress: 0 })
                    } else {
                      this.setState({progressBal: bal});
                      var self = this;
                      this.setState({ progress: this.state.progress + 10 }, () => terminal.pushToStdout(`Balance: ${theBal}` + " xUPC"))
                    }
                  }, 1500)
                })

                return ''
              }
            }
          }}
        welcomeMessage={'Welcome to UPC Shell! Type `tutorial` for help'}
        promptLabel={promptlabel}
      />
    )
  }
}
