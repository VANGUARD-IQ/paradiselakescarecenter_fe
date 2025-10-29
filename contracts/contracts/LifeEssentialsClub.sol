// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC5805.sol";
import "@openzeppelin/contracts/utils/Nonces.sol";

contract LifeEssentialsClub is ERC20, ERC20Permit, ERC20Votes, Ownable {
    constructor(string memory name_, string memory symbol_) 
        ERC20(name_, symbol_)
        ERC20Permit(name_)
        Ownable(msg.sender) {
        // No initial supply minted
    }
    
    /**
     * Creates `amount` tokens and assigns them to `account`
     */
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }
    
    // The functions below are overrides required by Solidity

    function _update(address from, address to, uint256 amount)
        internal
        override(ERC20, ERC20Votes)
    {
        super._update(from, to, amount);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
} 