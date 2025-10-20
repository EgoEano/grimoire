# Principle: Choose a pivot, split the array into two subarrays: smaller and larger elements relative to the pivot, then recursively sort these parts.
# Runtime: O(n log n) on average, O(n²) in the worst case (if a bad pivot is always chosen).
# Pros: Very fast in practice.
# Cons: Requires careful choice of the pivot.

def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    else:
        pivot = arr[len(arr) // 2]
        left = [x for x in arr if x < pivot]
        middle = [x for x in arr if x == pivot]
        right = [x for x in arr if x > pivot]
        return quick_sort(left) + middle + quick_sort(right)
