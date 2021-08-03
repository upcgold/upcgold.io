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
    this.state = {
       account: props.account
    }
  }

  render () {
    var promptlabel = this.state.account + '@upc_shell:~$';
    return (
      <Terminal
        commands={commands}
        welcomeMessage={'Welcome to the React terminal!'}
        promptLabel={promptlabel}
      />
    )
  }
}
