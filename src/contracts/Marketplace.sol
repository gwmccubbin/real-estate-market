pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    uint public propertyCount = 0;
    mapping(uint => Property) public propertys;

    struct Property {
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    event PropertyCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event PropertyPurchased(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    function createProperty(string memory _name, uint _price) public {
        // Require a valid name
        require(bytes(_name).length > 0);
        // Require a valid price
        require(_price > 0);
        // Increment property count
        propertyCount ++;
        // Create the property
        propertys[propertyCount] = Property(propertyCount, _name, _price, msg.sender, false);
        // Trigger an event
        emit PropertyCreated(propertyCount, _name, _price, msg.sender, false);
    }

    function purchaseProperty(uint _id) public payable {
        // Fetch the property
        Property memory _property = propertys[_id];
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
        propertys[_id] = _property;
        // Pay the seller by sending them Ether
        address(_seller).transfer(msg.value);
        // Trigger an event
        emit PropertyPurchased(propertyCount, _property.name, _property.price, msg.sender, true);
    }
}
