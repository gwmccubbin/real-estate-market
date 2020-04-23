import React, { Component } from 'react';

class Main extends Component {

  render() {
    return (
      <div id="content">
        <h1>Add Property</h1>
        <form onSubmit={(event) => {
          event.preventDefault()
          const name = this.propertyAddress.value
          const price = window.web3.utils.toWei(this.propertyPrice.value.toString(), 'Ether')
          this.props.createProperty(name, price)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="propertyAddress"
              type="text"
              ref={(input) => { this.propertyAddress = input }}
              className="form-control"
              placeholder="Street Address"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="propertyPrice"
              type="text"
              ref={(input) => { this.propertyPrice = input }}
              className="form-control"
              placeholder="Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Property</button>
        </form>
        <p>&nbsp;</p>
        <h2>Buy Property</h2>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Address</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="propertyList">
            { this.props.properties.map((property, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{property.id.toString()}</th>
                  <td>{property.streetAddress}</td>
                  <td>{window.web3.utils.fromWei(property.price.toString(), 'Ether')} Eth</td>
                  <td>{property.owner}</td>
                  <td>
                    { !property.purchased
                      ? <button
                          name={property.id}
                          value={property.price}
                          onClick={(event) => {
                            this.props.purchaseProperty(event.target.name, event.target.value)
                          }}
                        >
                          Buy
                        </button>
                      : null
                    }
                    </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Main;
