import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const LifeEssentialsClubTokenModule = buildModule("LifeEssentialsClubTokenModule", (m) => {
  const token = m.contract("LifeEssentialsClub", [
    "Life Essentials Club",  // name
    "LEC"                   // symbol
  ]);
  return { token };
});

export default LifeEssentialsClubTokenModule;   