import React from 'react';
import './block.css';
var width = 4;
var height = 4;
class LiterallyMinecraft extends React.Component {


    constructor(props) {
	super(props);


	this.web3 = props.web3;
	this.state = {
	    output: "not ready",
	    values: []
	};

	// on ropsten test net
	this.address = '0xD6528Ff2983A6d90783eB62E19D37C7b599FCec4';
	this.abi = [{"constant":true,"inputs":[],"name":"height","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"},{"name":"clr","type":"uint8[3]"}],"name":"setColor","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"getColor","outputs":[{"name":"","type":"uint8[3]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"uint8"},{"name":"y","type":"uint8"}],"name":"getIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"width","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}];

	this.contract = new this.web3.eth.Contract(this.abi, this.address);
	console.log(this.contract);


	this.refresh();

    }

    refresh() {
	for(var i = 0; i < width*height; i++)
	{
	    this.contract.methods.getColor(i%width, i/height).call(null, (error,result) => {
		console.log(result);
		this.setState({
		    values: this.state.values.concat([result])
		});
	    });
	}
    }

    render() {
	var contents = [];
	if(this.state.values.length > 0)
	    for(var i = 0; i < this.state.values.length; i++)
		contents.push(<div className="grid-item">{this.state.values[i]}</div>);
	return (
		<div className="grid-container">
		{contents}
	    </div>
	);
    }
}
export default LiterallyMinecraft;
