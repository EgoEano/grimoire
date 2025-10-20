# Principle: Each element is inserted into its place in the already sorted part of the array.
# Execution time: O(n²).
# Pros: Efficient for small arrays or almost sorted data.
# Cons: Slow for large arrays.

def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and key < arr[j]:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr
