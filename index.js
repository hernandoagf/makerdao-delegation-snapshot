import { writeFileSync } from "fs";
import fetch from "node-fetch";

const main = async () => {
  // Fetch API and parse data
  const apiRes = await fetch("https://vote.makerdao.com/api/delegates");
  const rawDelegatesData = (await apiRes.json()).delegates;

  // Write delegates to file
  const delegates = Array.from(
    new Set(rawDelegatesData.map((del) => del.address))
  );
  writeFileSync("./delegates.txt", delegates.join("\n"));

  // Process delegators
  const rawDelegators = rawDelegatesData
    .map((del) => del.mkrLockedDelegate)
    .flat()
    .map((delegator) => ({
      address: delegator.fromAddress,
      amount: +delegator.lockAmount,
    }));

  const delegatorsMap = new Map();

  for (const delegator of rawDelegators) {
    if (delegatorsMap.has(delegator.address))
      delegatorsMap.set(
        delegator.address,
        delegatorsMap.get(delegator.address) + delegator.amount
      );
    else delegatorsMap.set(delegator.address, delegator.amount);
  }

  const delegators = [];
  delegatorsMap.forEach((amount, address) => {
    if (amount >= 0.002) delegators.push(address);
  });

  // write delegators  to file
  writeFileSync("./delegators.txt", delegators.join("\n"));
};

main();
