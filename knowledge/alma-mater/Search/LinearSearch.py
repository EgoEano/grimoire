# Principle: Checks each element of the array sequentially.
# Execution time: O(n).
# Pros: Simple and versatile.
# Cons: Inefficient on large arrays.

def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1
