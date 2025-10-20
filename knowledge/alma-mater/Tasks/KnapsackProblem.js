function knapsack(weights, values, W) {
    const n = weights.length;
    const dp = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= W; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    return dp[n][W];
}

// An example
const weights = [10, 20, 30];
const values = [60, 100, 120];
const W = 50;

console.log(knapsack(weights, values, W));  // Result: 220

/*
Explanation:
A table Number of items \ Allowed weight is created
In the table, an item is added to each row (their order is not important) and a unit of weight is added to the capacity in each column
This is done to calculate which items will fit into a larger backpack (from zero to the desired capacity)
And describing the table - what will be the capacity for each new unit of capacity (columns) taking into account the new item (rows)
At the beginning, everything is initiated by zeros - 0 items for each unit of weight
Then for each cell it is checked - can the new (current i) item fit into an empty backpack of the current capacity (current column) - (weights[i - 1] <= w)?

If no - take the previous value - column one row above
If yes - which is greater -
- previous value (column one row above)
- or the value of the previous optimal cost (minus the weight of the added item) + the cost of the new item

dp[i - 1][w - weights[i - 1]] - previous optimal assembly, minus the new weight
dp[i - 1][w - weights[i - 1]] + values[i - 1] - how much will it be if we add a new item to the previous optimal assembly*/
