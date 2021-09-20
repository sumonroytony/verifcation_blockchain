pragma solidity ^0.4.26;

contract Verify{
    mapping (int256 => bytes32) ipfs;

    
    function addPdfLink(int256 id, bytes32 link) public{
     
        ipfs[id] = link;
    }
     function getPdfLink(int256 id) public view returns (bytes32) {
       return ipfs[id];
   }
   
   function sendViaCall(address  _to) public payable {
       _to.transfer(msg.value);
   }

    
  }
     
   