# Principle: Works only with sorted arrays. Splits the array in half and compares the middle element with the target value, continuing the search in one of the halves.
# Execution time: O(log n).
# Pros: Very efficient for large sorted arrays.
# Cons: Requires pre-sorting of the array.

def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
