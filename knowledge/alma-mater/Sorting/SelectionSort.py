# Principle: Every step finds minimal element from unsorted part of array and replace it with first element of unsorted part.
# Lead time: O(n²).
# Pluses: Simple in realization.
# Minuses: Ineffective in dig data.

def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i+1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr
