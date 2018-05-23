import React from 'react';

class Potato extends React.Component {
  constructor(props) {
    super(props);
	this.web3 = props.web3;
	this.state = {
		output: "not ready"
	};
	this.refresh();

  }

  refresh() {
  	this.web3.eth.getBlock("latest", (error, result) => {
		//this.setState({output: JSON.stringify(result)});
	});

	// on main net!
	var address = '0xc50ba8ee9fc19912216731b9170d5bdfc28067f6';

	this.web3.eth.getStorageAt(address, 0, (error, result) => {
		this.setState({
  			output: this.web3.utils.hexToAscii(result)
		});
	});
  }

  render() {
    return (
      <p>{this.state.output}</p>
      );
  }
}


export default Potato;
