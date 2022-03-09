import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";

export function sortResult(orderKey: string, resultArray: InsightResult[]) {
	sort(orderKey, resultArray);
}

function sort(orderKey: string, arr: InsightResult[]) {
	let n = arr.length;

	// Build heap (rearrange array)
	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
		heapify(arr, n, i, orderKey);
	}

	// One by one extract an element from heap
	for (let i = n - 1; i > 0; i--) {
		// Move current root to end
		let temp = arr[0];
		arr[0] = arr[i];
		arr[i] = temp;

		// call max heapify on the reduced heap
		heapify(arr, i, 0, orderKey);
	}
}

// To heapify a subtree rooted with node i which is
// an index in arr[]. n is size of heap
function heapify(arr: InsightResult[], n: number, i: number, orderKey: string) {
	let largest = i; // Initialize largest as root
	let l = 2 * i + 1; // left = 2*i + 1
	let r = 2 * i + 2; // right = 2*i + 2

	// If left child is larger than root
	if (l < n && arr[l][orderKey] > arr[largest][orderKey]) {
		largest = l;
	}

	// If right child is larger than largest so far
	if (r < n && arr[r][orderKey] > arr[largest][orderKey]) {
		largest = r;
	}

	// If largest is not root
	if (largest !== i) {
		let swap = arr[i];
		arr[i] = arr[largest];
		arr[largest] = swap;

		// Recursively heapify the affected sub-tree
		heapify(arr, n, largest, orderKey);
	}
}

