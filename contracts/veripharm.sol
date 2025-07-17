// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Veripharm {

    enum Role { Unassigned, Manufacturer, Distributor, Pharmacist }

    struct DrugBatch {
        string batchId;
        string drugName;
        string manufacturer;
        uint256 manufactureDate;
        uint256 expiryDate;
        address currentHolder;
        bool isRegistered;
        bool isRevoked;
    }

    mapping(string => DrugBatch) public drugBatches;
    mapping(string => address[]) public custodyTrail;
    mapping(address => Role) public roles;

    event DrugRegistered(string batchId, string drugName, address indexed manufacturer);
    event CustodyTransferred(string batchId, address indexed from, address indexed to);
    event Alert(string message, string batchId);
    event DrugRevoked(string batchId, string reason);

    modifier onlyRole(Role _role) {
        require(roles[msg.sender] == _role, "Access denied for this role");
        _;
    }

    modifier onlyRegistered(string memory _batchId) {
        require(drugBatches[_batchId].isRegistered, "Drug not registered");
        _;
    }

    modifier notRevoked(string memory _batchId) {
        require(!drugBatches[_batchId].isRevoked, "Drug batch has been revoked");
        _;
    }

    function assignRole(address _user, Role _role) public {
        roles[_user] = _role;
    }

    function registerDrug(
        string memory _batchId,
        string memory _drugName,
        string memory _manufacturer,
        uint256 _manufactureDate,
        uint256 _expiryDate
    ) public onlyRole(Role.Manufacturer) {
        require(!drugBatches[_batchId].isRegistered, "Batch already registered");

        drugBatches[_batchId] = DrugBatch({
            batchId: _batchId,
            drugName: _drugName,
            manufacturer: _manufacturer,
            manufactureDate: _manufactureDate,
            expiryDate: _expiryDate,
            currentHolder: msg.sender,
            isRegistered: true,
            isRevoked: false
        });

        custodyTrail[_batchId].push(msg.sender);

        emit DrugRegistered(_batchId, _drugName, msg.sender);
    }

    function transferCustody(string memory _batchId, address _to)
        public
        onlyRegistered(_batchId)
        notRevoked(_batchId)
    {
        require(drugBatches[_batchId].currentHolder == msg.sender, "Not current holder");
        require(_to != address(0), "Invalid recipient address");
        require(block.timestamp < drugBatches[_batchId].expiryDate, "Drug has expired");

        address previousHolder = msg.sender;
        drugBatches[_batchId].currentHolder = _to;
        custodyTrail[_batchId].push(_to);

        emit CustodyTransferred(_batchId, previousHolder, _to);
    }

    function revokeDrug(string memory _batchId, string memory _reason)
        public
        onlyRole(Role.Manufacturer)
        onlyRegistered(_batchId)
    {
        drugBatches[_batchId].isRevoked = true;
        emit DrugRevoked(_batchId, _reason);
    }

    function getCustodyTrail(string memory _batchId)
        public
        view
        onlyRegistered(_batchId)
        returns (address[] memory)
    {
        return custodyTrail[_batchId];
    }

    function verifyAuthenticity(string memory _batchId)
        public
        view
        returns (bool isValid, string memory status)
    {
        if (!drugBatches[_batchId].isRegistered) {
            return (false, "Not registered");
        }
        if (drugBatches[_batchId].isRevoked) {
            return (false, "Revoked");
        }
        if (block.timestamp >= drugBatches[_batchId].expiryDate) {
            return (false, "Expired");
        }
        return (true, "Valid and authentic");
    }
}
