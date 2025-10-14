// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import {Token} from "./Token.sol";

contract Factory{
    uint256 public constant TARGET = 3 ether;
    uint256 public constant TOKEN_LIMIT = 500_000 ether;
    uint256 public immutable fee;
    address public owner;    
    address[] public tokens;
    uint256 public totalTokens;
    mapping(address => TokenSale) public tokenToSale;

    struct TokenSale {
        string name;
        address token;
        address creator;
        uint256 sold;
        uint256 raised;
        bool isOpen;
    }

    event Created(address indexed token);
    event Buy(address indexed token , uint256 amount);
    
    constructor(uint256 _fee){
        fee = _fee;
        owner = msg.sender;
    }

    function getTokenSale(uint256 _index) public view returns(TokenSale memory) {
        return tokenToSale[tokens[_index]];
    }

    function getCost(uint256 _sold) public pure returns(uint256){
        uint256 floor = 0.0001 ether;
        uint256 step = 0.0001 ether;
        uint256 increment = 10000 ether;
        uint256 cost = floor + (step * (_sold/increment));
        return cost;
    }

    // for creating token and counting the number of to
    function create(string memory _name , string memory _symbol) external payable {
        require(msg.value >= fee , "factory: Creator fee not met");
        Token token = new Token(msg.sender,_name , _symbol , 1_000_000 ether);

        tokens.push(address(token));
        totalTokens++;


        //for listing the token to sale
        TokenSale memory sale = TokenSale(
            _name,
            address(token),
            msg.sender,
            0,
            0,
            true
        );

        tokenToSale[address(token)] = sale;

        emit Created(address(token));
    }

    function buy(address _token , uint256 _amount) external payable {

        TokenSale storage sale = tokenToSale[_token];

        require(sale.isOpen == true , "Factory : buying is closed");
        require(_amount >=1 ether , "Factory : Amount too low");
        require(_amount <= 10000 ether ,"Factory : amount exceed");

        uint256 cost = getCost(sale.sold);

        uint256 price = cost*(_amount/10**18);

        require(msg.value >= price , "Factory : Insufficient amount of eth");

        sale.sold = sale.sold + _amount;
        sale.raised += price;

        if(sale.sold >= TOKEN_LIMIT || sale.raised >= TARGET){
            sale.isOpen = false;
        }

        Token(_token).transfer(msg.sender, _amount);

        emit Buy(_token, _amount);
    }

    function deposit(address _token) external {

        Token token = Token(_token);
        TokenSale memory sale = tokenToSale[_token];

        require(sale.isOpen == false , "Factory : Target not reached");

        token.transfer(sale.creator, token.balanceOf(address(this)));

        (bool success, ) = payable(sale.creator).call{value: sale.raised}("");
        require(success , "factory : eth transfer failed");

    }

    function withdraw(uint256 _amount) external {
        require(msg.sender == owner , "Factory : not owner");

        (bool success, ) = payable(owner).call{value: _amount}("");
        require(success , "factory : eth transfer failed");
    }

}
