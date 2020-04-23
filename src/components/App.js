import React, { Component } from 'react';
import Web3 from 'web3'
import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if(networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
      this.setState({ marketplace })
      const propertyCount = await marketplace.methods.propertyCount().call()
      this.setState({ propertyCount })
      // Load properties
      for (var i = 1; i <= propertyCount; i++) {
        const property = await marketplace.methods.properties(i).call()
        this.setState({
          properties: [...this.state.properties, property]
        })
      }
      this.setState({ loading: false})
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      propertyCount: 0,
      properties: [],
      loading: true
    }

    this.createProperty = this.createProperty.bind(this)
    this.purchaseProperty = this.purchaseProperty.bind(this)
  }

  createProperty(name, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.createProperty(name, price).send({ from: this.state.account })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchaseProperty(id, price) {
    this.setState({ loading: true })
    this.state.marketplace.methods.purchaseProperty(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading
                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                : <Main
                  properties={this.state.properties}
                  createProperty={this.createProperty}
                  purchaseProperty={this.purchaseProperty} />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
