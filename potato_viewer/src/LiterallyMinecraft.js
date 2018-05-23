import React from 'react';
import './block.css';

class LiterallyMinecraft extends React.Component {
  constructor(props) {
    super(props);
	this.web3 = props.web3;
	this.state = {
		output: "not ready"
	};
	this.address = '0xc50ba8ee9fc19912216731b9170d5bdfc28067f6';
	this.refresh();

  }

  refresh() {
	this.web3.eth.getStorageAt(this.address, 0, (error, result) => {
		this.setState({
  			output: this.web3.utils.hexToAscii(result)
		});
	});
  }

  render() {
    return (
      <div class="grid-container">
	  	<div class="grid-item">1</div>
		<div class="grid-item">1</div>
		<div class="grid-item">1</div>
		<div class="grid-item">1</div>
		<div class="grid-item">1</div>
	  </div>
      );
  }
}
export default LiterallyMinecraft;
