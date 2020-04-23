pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public propertyCount = 0;
    mapping(uint => Property) public properties;

    struct Property {
        uint id;
        string streetAddress;
        uint price;
        address payable owner;
        bool purchased;
    }

    event PropertyCreated(
        uint id,
        string streetAddress,
        uint price,
        address payable owner,
        bool purchased
    );

    event PropertyPurchased(
        uint id,
        string streetAddress,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Real Estate Marketplace";
    }

    function createProperty(string memory _streetAddress, uint _price) public {
        // Require a valid address
        require(bytes(_streetAddress).length > 0);
        // Require a valid price
        require(_price > 0);
        // Increment property count
        propertyCount ++;
        // Create the property
        properties[propertyCount] = Property(propertyCount, _streetAddress, _price, msg.sender, false);
        // Trigger an event
        emit PropertyCreated(propertyCount, _streetAddress, _price, msg.sender, false);
    }

    function purchaseProperty(uint _id) public payable {
        // Fetch the property
        Property memory _property = properties[_id];
        // Fetch the owner
        address payable _seller = _property.owner;
        // Make sure the property has a valid id
        require(_property.id > 0 && _property.id <= propertyCount);
        // Require that there is enough Ether in the transaction
        require(msg.value >= _property.price);
        // Require that the property has not been purchased already
        require(!_property.purchased);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to the buyer
        _property.owner = msg.sender;
        // Mark as purchased
        _property.purchased = true;
        // Update the property
        properties[_id] = _property;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit PropertyPurchased(propertyCount, _property.streetAddress, _property.price, msg.sender, true);
    }
}
