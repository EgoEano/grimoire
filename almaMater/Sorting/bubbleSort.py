# Principle: Elements are compared sequentially in pairs and swapped if they are in the wrong order. At each step, the largest element "buoys" to the end of the array.
# Execution time: O(n²) — inefficient for large data sets.
# Pros: Easy to implement.
# Cons: Very slow.

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
