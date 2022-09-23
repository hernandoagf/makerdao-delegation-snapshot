import { writeFileSync } from "fs";
import fetch from "node-fetch";

const main = async () => {
  // Fetch API and parse data
  const apiRes = await fetch("https://vote.makerdao.com/api/delegates");
  const rawDelegatesData = (await apiRes.json()).delegates;

  // Write delegates to file
  const delegates = [
    ["delegate", "mkr_delegated"],
    ...Array.from(
      new Map(
        rawDelegatesData
          .map((del) => [del.address, +del.mkrDelegated])
          .sort((a, b) => a[1] - b[1])
      )
    ).sort((a, b) => b[1] - a[1]),
  ];

  writeFileSync("./delegates.csv", delegates.join("\n"));

  // Process delegators
  const rawDelegators = rawDelegatesData
    .map((del) => del.mkrLockedDelegate)
    .flat()
    .map((delegator) => ({
      address: delegator.immediateCaller,
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

  const delegators = [
    ["delegator", "mkr_delegated"],
    ...Array.from(delegatorsMap).sort((a, b) => b[1] - a[1]),
  ];

  // write delegators  to file
  writeFileSync("./delegators.csv", delegators.join("\n"));
};

main();
