import React from 'react';
import Web3 from 'web3';
import Potato from './Potato.js'
import LiterallyMinecraft from './LiterallyMinecraft.js'

import './App.css';



class App extends React.Component {
  constructor(props) {
    super(props);
    this.web3 = new Web3();
    //this.web3.setProvider(new Web3.providers.HttpProvider('https://api.myetherapi.com/eth'));
		this.web3.setProvider(new Web3.providers.HttpProvider('https://ropsten.infura.io/'));
    /*web3.eth.getBlock("latest", (error, result) => {
      console.log('error:', error);
      console.log('results', result);
    });*/
  }
  render() {

    return (
      <div className="App">
        <Potato web3={this.web3} />
				<LiterallyMinecraft web3={this.web3} />
      </div>
    );
  }
}

export default App;
