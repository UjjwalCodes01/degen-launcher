// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import {Test} from "forge-std/Test.sol";
import {Token} from "../src/Token.sol";
import {console} from "forge-std/console.sol";

contract TokenTest is Test {
    Token public token;
    address public creator;
    address public user1;
    address public user2;
    
    uint256 constant TOTAL_SUPPLY = 1_000_000 ether;
    
    function setUp() public {
        creator = makeAddr("creator");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy token (msg.sender will be the owner)
        token = new Token(creator, "TestToken", "TEST", TOTAL_SUPPLY);
    }
    
    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_TokenDeployment() public view {
        assertEq(token.name(), "TestToken");
        assertEq(token.symbol(), "TEST");
        assertEq(token.totalSupply(), TOTAL_SUPPLY);
        assertEq(token.creator(), creator);
        assertEq(token.owner(), address(this));
        assertEq(token.balanceOf(address(this)), TOTAL_SUPPLY);
    }
    
    function test_InitialBalance() public view {
        assertEq(token.balanceOf(address(this)), TOTAL_SUPPLY);
        assertEq(token.balanceOf(creator), 0);
        assertEq(token.balanceOf(user1), 0);
    }
    
    /*//////////////////////////////////////////////////////////////
                            TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_Transfer() public {
        uint256 amount = 1000 ether;
        
        token.transfer(user1, amount);
        
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(address(this)), TOTAL_SUPPLY - amount);
    }
    
    function test_TransferFrom() public {
        uint256 amount = 1000 ether;
        
        // Approve user1 to spend tokens
        token.approve(user1, amount);
        
        // Transfer from this contract to user2 via user1
        vm.prank(user1);
        token.transferFrom(address(this), user2, amount);
        
        assertEq(token.balanceOf(user2), amount);
        assertEq(token.balanceOf(address(this)), TOTAL_SUPPLY - amount);
    }
    
    function test_Revert_TransferInsufficientBalance() public {
        vm.prank(user1);
        vm.expectRevert();
        token.transfer(user2, 1000 ether); // user1 has 0 balance
    }
    
    /*//////////////////////////////////////////////////////////////
                            APPROVAL TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_Approve() public {
        uint256 amount = 1000 ether;
        
        token.approve(user1, amount);
        
        assertEq(token.allowance(address(this), user1), amount);
    }
    
    function test_ApproveMultipleTimes() public {
        uint256 amount1 = 1000 ether;
        uint256 amount2 = 1500 ether;
        
        token.approve(user1, amount1);
        assertEq(token.allowance(address(this), user1), amount1);
        
        // Approve again with different amount
        token.approve(user1, amount2);
        assertEq(token.allowance(address(this), user1), amount2);
    }
    
    /*//////////////////////////////////////////////////////////////
                            ERC20 STANDARD TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_Decimals() public view {
        assertEq(token.decimals(), 18);
    }
    
    function test_Name() public view {
        assertEq(token.name(), "TestToken");
    }
    
    function test_Symbol() public view {
        assertEq(token.symbol(), "TEST");
    }
}
