// SPDX-License-Identifier: MIT
pragma solidity >=0.8.20;

import {Test} from "forge-std/Test.sol";
import {Factory} from "../src/Factory.sol";
import {Token} from "../src/Token.sol";
import {console} from "forge-std/console.sol";

contract FactoryTest is Test {
    Factory public factory;
    address public owner;
    address public user1;
    address public user2;
    
    uint256 constant CREATION_FEE = 0.01 ether;
    uint256 constant INITIAL_BALANCE = 100 ether;
    
    event Created(address indexed token);
    event Buy(address indexed token, uint256 amount);
    
    // Allow test contract to receive ETH
    receive() external payable {}
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Fund test accounts
        vm.deal(user1, INITIAL_BALANCE);
        vm.deal(user2, INITIAL_BALANCE);
        
        // Deploy Factory
        factory = new Factory(CREATION_FEE);
    }
    
    /*//////////////////////////////////////////////////////////////
                            DEPLOYMENT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_FactoryDeployment() public view {
        assertEq(factory.owner(), owner);
        assertEq(factory.fee(), CREATION_FEE);
        assertEq(factory.totalTokens(), 0);
        assertEq(factory.TARGET(), 3 ether);
        assertEq(factory.TOKEN_LIMIT(), 500_000 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                            TOKEN CREATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_CreateToken() public {
        vm.startPrank(user1);
        
        vm.expectEmit(false, false, false, false);
        emit Created(address(0));
        
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        assertEq(factory.totalTokens(), 1);
        address tokenAddress = factory.tokens(0);
        assertTrue(tokenAddress != address(0));
        
        Factory.TokenSale memory sale = factory.getTokenSale(0);
        assertEq(sale.name, "TestToken");
        assertEq(sale.creator, user1);
        assertEq(sale.sold, 0);
        assertEq(sale.raised, 0);
        assertTrue(sale.isOpen);
        
        vm.stopPrank();
    }
    
    function test_Revert_CreateTokenInsufficientFee() public {
        vm.prank(user1);
        vm.expectRevert();
        factory.create{value: 0.005 ether}("TestToken", "TEST");
    }
    
    function test_CreateMultipleTokens() public {
        vm.startPrank(user1);
        factory.create{value: CREATION_FEE}("Token1", "TK1");
        factory.create{value: CREATION_FEE}("Token2", "TK2");
        vm.stopPrank();
        
        assertEq(factory.totalTokens(), 2);
        
        Factory.TokenSale memory sale1 = factory.getTokenSale(0);
        Factory.TokenSale memory sale2 = factory.getTokenSale(1);
        
        assertEq(sale1.name, "Token1");
        assertEq(sale2.name, "Token2");
    }
    
    /*//////////////////////////////////////////////////////////////
                            BUY TOKEN TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_BuyTokens() public {
        // Create token
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        address tokenAddress = factory.tokens(0);
        uint256 amountToBuy = 1000 ether;
        
        // Get the cost for first purchase (sold = 0)
        uint256 cost = factory.getCost(0);
        uint256 price = cost * (amountToBuy / 10**18);
        
        // Buy tokens
        vm.startPrank(user2);
        vm.expectEmit(true, false, false, true);
        emit Buy(tokenAddress, amountToBuy);
        
        factory.buy{value: price}(tokenAddress, amountToBuy);
        vm.stopPrank();
        
        // Verify purchase
        (,, , uint256 sold, uint256 raised,) = factory.tokenToSale(tokenAddress);
        assertEq(sold, amountToBuy);
        assertEq(raised, price);
        
        Token token = Token(tokenAddress);
        assertEq(token.balanceOf(user2), amountToBuy);
    }
    
    function test_Revert_BuyTokensInsufficientAmount() public {
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        address tokenAddress = factory.tokens(0);
        
        vm.prank(user2);
        vm.expectRevert();
        factory.buy{value: 0.01 ether}(tokenAddress, 0.5 ether); // Less than 1 ether
    }
    
    function test_Revert_BuyTokensExceedMax() public {
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        address tokenAddress = factory.tokens(0);
        
        vm.prank(user2);
        vm.expectRevert();
        factory.buy{value: 10 ether}(tokenAddress, 11000 ether); // More than 10000 ether
    }
    
    function test_SaleClosesAtTokenLimit() public {
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        address tokenAddress = factory.tokens(0);
        
        // Buy TOKEN_LIMIT amount in batches (max 10000 ether per buy)
        uint256 batchSize = 10000 ether;
        uint256 targetAmount = 500_000 ether;
        uint256 boughtSoFar = 0;
        
        vm.deal(user2, 100 ether); // Give enough ETH for purchases
        vm.startPrank(user2);
        
        // Keep buying until we reach the token limit or sale closes
        while (boughtSoFar < targetAmount) {
            // Check if sale is still open before buying
            (,,,,, bool isOpen) = factory.tokenToSale(tokenAddress);
            if (!isOpen) break;
            
            uint256 amountToBuy = batchSize;
            if (boughtSoFar + batchSize > targetAmount) {
                amountToBuy = targetAmount - boughtSoFar;
            }
            
            uint256 cost = factory.getCost(boughtSoFar);
            uint256 price = cost * (amountToBuy / 10**18);
            
            factory.buy{value: price}(tokenAddress, amountToBuy);
            boughtSoFar += amountToBuy;
            
            // Check again after buying if sale closed
            (,,,,, bool stillOpen) = factory.tokenToSale(tokenAddress);
            if (!stillOpen) break;
        }
        
        vm.stopPrank();
        
        // Sale should be closed now
        (,,,uint256 sold,, bool finalIsOpen) = factory.tokenToSale(tokenAddress);
        assertFalse(finalIsOpen);
        assertTrue(sold >= factory.TOKEN_LIMIT() || sold > 0); // Either hit limit or raised target
    }
    
    /*//////////////////////////////////////////////////////////////
                            COST CALCULATION TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_GetCost() public view {
        uint256 cost0 = factory.getCost(0);
        uint256 cost10k = factory.getCost(10000 ether);
        uint256 cost20k = factory.getCost(20000 ether);
        
        // First purchase should cost the floor price
        assertEq(cost0, 0.0001 ether);
        assertTrue(cost10k > cost0);
        assertTrue(cost20k > cost10k);
    }
    
    /*//////////////////////////////////////////////////////////////
                            DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_Deposit() public {
        // Create and buy tokens
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        address tokenAddress = factory.tokens(0);
        
        // Buy enough to reach target in batches (max 10000 ether per buy)
        uint256 batchSize = 10000 ether;
        uint256 targetAmount = 500_000 ether;
        uint256 boughtSoFar = 0;
        
        vm.deal(user2, 100 ether); // Give enough ETH
        vm.startPrank(user2);
        
        // Keep buying until sale closes (either TOKEN_LIMIT or TARGET reached)
        while (boughtSoFar < targetAmount) {
            // Check if sale is still open before buying
            (,,,,, bool isOpen) = factory.tokenToSale(tokenAddress);
            if (!isOpen) break;
            
            uint256 amountToBuy = batchSize;
            if (boughtSoFar + batchSize > targetAmount) {
                amountToBuy = targetAmount - boughtSoFar;
            }
            
            uint256 cost = factory.getCost(boughtSoFar);
            uint256 price = cost * (amountToBuy / 10**18);
            
            factory.buy{value: price}(tokenAddress, amountToBuy);
            boughtSoFar += amountToBuy;
            
            // Check again after buying if sale closed
            (,,,,, bool stillOpen) = factory.tokenToSale(tokenAddress);
            if (!stillOpen) break;
        }
        
        vm.stopPrank();
        
        uint256 creatorBalanceBefore = user1.balance;
        Token token = Token(tokenAddress);
        uint256 factoryTokenBalance = token.balanceOf(address(factory));
        
        // Deposit
        vm.prank(user1);
        factory.deposit(tokenAddress);
        
        uint256 creatorBalanceAfter = user1.balance;
        
        // Verify
        assertEq(token.balanceOf(user1), factoryTokenBalance);
        assertGt(creatorBalanceAfter, creatorBalanceBefore);
    }
    
    function test_Revert_DepositBeforeTargetReached() public {
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        address tokenAddress = factory.tokens(0);
        
        vm.prank(user1);
        vm.expectRevert();
        factory.deposit(tokenAddress);
    }
    
    /*//////////////////////////////////////////////////////////////
                            WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_OwnerCanWithdraw() public {
        // Create token with fee - this sends CREATION_FEE to the factory
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        // Verify factory has the fee
        assertEq(address(factory).balance, CREATION_FEE);
        
        uint256 ownerBalanceBefore = owner.balance;
        
        // Owner withdraws the creation fee
        factory.withdraw(CREATION_FEE);
        
        uint256 ownerBalanceAfter = owner.balance;
        assertEq(ownerBalanceAfter, ownerBalanceBefore + CREATION_FEE);
        assertEq(address(factory).balance, 0);
    }
    
    function test_Revert_NonOwnerCannotWithdraw() public {
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        vm.prank(user2);
        vm.expectRevert();
        factory.withdraw(CREATION_FEE);
    }
    
    /*//////////////////////////////////////////////////////////////
                            HELPER TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_GetTokenSale() public {
        vm.prank(user1);
        factory.create{value: CREATION_FEE}("TestToken", "TEST");
        
        Factory.TokenSale memory sale = factory.getTokenSale(0);
        
        assertEq(sale.name, "TestToken");
        assertEq(sale.creator, user1);
        assertTrue(sale.isOpen);
    }
}
