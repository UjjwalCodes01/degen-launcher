// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import {Token} from "./Token.sol";

contract Factory{
    uint256 public immutable fee;
    address public owner;    
    address[] public tokens;
    uint256 public totalTokens;
    
    constructor(uint256 _fee){
        fee = _fee;
        owner = msg.sender;
    }

    function create(string memory _name , string memory _symbol) external payable {
        Token token = new Token(msg.sender,_name , _symbol , 1_000_000 ether);

        tokens.push(token);
        totalTokens++;
    }
}
