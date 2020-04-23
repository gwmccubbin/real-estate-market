const Marketplace = artifacts.require('./Marketplace.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Marketplace', ([deployer, seller, buyer]) => {
  let marketplace

  before(async () => {
    marketplace = await Marketplace.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await marketplace.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await marketplace.name()
      assert.equal(name, 'Real Estate Marketplace')
    })
  })

  describe('properties', async () => {
    let result, propertyCount

    before(async () => {
      result = await marketplace.createProperty('112 Main St', web3.utils.toWei('1', 'Ether'), { from: seller })
      propertyCount = await marketplace.propertyCount()
    })

    it('creates properties', async () => {
      // SUCCESS
      assert.equal(propertyCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), propertyCount.toNumber(), 'id is correct')
      assert.equal(event.streetAddress, '112 Main St', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.purchased, false, 'purchased is correct')

      // FAILURE: Product must have a name
      await await marketplace.createProperty('', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Product must have a price
      await await marketplace.createProperty('112 Main St', 0, { from: seller }).should.be.rejected;
    })

    it('lists properties', async () => {
      const property = await marketplace.properties(propertyCount)
      assert.equal(property.id.toNumber(), propertyCount.toNumber(), 'id is correct')
      assert.equal(property.streetAddress, '112 Main St', 'name is correct')
      assert.equal(property.price, '1000000000000000000', 'price is correct')
      assert.equal(property.owner, seller, 'owner is correct')
      assert.equal(property.purchased, false, 'purchased is correct')
    })

    it('sells properties', async () => {
      // Track the seller balance before purchase
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // SUCCESS: Buyer makes purchase
      result = await marketplace.purchaseProperty(propertyCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), propertyCount.toNumber(), 'id is correct')
      assert.equal(event.streetAddress, '112 Main St', 'name is correct')
      assert.equal(event.price, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.purchased, true, 'purchased is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      const exepectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

      // FAILURE: Tries to buy a product that does not exist, i.e., product must have valid id
      await marketplace.purchaseProperty(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;      // FAILURE: Buyer tries to buy without enough ether
      // FAILURE: Buyer tries to buy without enough ether
      await marketplace.purchaseProperty(propertyCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      // FAILURE: Deployer tries to buy the product, i.e., product can't be purchased twice
      await marketplace.purchaseProperty(propertyCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
      await marketplace.purchaseProperty(propertyCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })

  })
})
