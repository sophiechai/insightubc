import {InsightError, InsightResult, ResultTooLargeError} from "./IInsightFacade";
import {Dataset} from "./Dataset";

export function sortResult(orderValue: any, resultArray: InsightResult[]) {
	let dir = "UP";
	let orderKeys: string[] = [];
	if (typeof orderValue === "string") {
		orderKeys.push(orderValue);
	} else {
		dir = orderValue.dir;
		orderKeys = orderValue.keys;
	}
	sort(orderKeys, resultArray, dir);
}

function sort(orderKeys: string[], arr: InsightResult[], dir: string) {
	let n = arr.length;

	// Build heap (rearrange array)
	for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
		if (dir === "UP") {
			maxHeapify(arr, n, i, orderKeys);
		} else {
			minHeapify(arr, n, i, orderKeys);
		}
	}

	// One by one extract an element from heap
	for (let i = n - 1; i > 0; i--) {
		// Move current root to end
		let temp = arr[0];
		arr[0] = arr[i];
		arr[i] = temp;

		// call heapify on the reduced heap
		if (dir === "UP") {
			maxHeapify(arr, i, 0, orderKeys);
		} else {
			minHeapify(arr, i, 0, orderKeys);
		}
	}
}

function maxHeapify(arr: InsightResult[], n: number, i: number, orderKeys: string[]) {
	let largest = i; // Initialize largest as root
	let l = 2 * i + 1; // left = 2*i + 1
	let r = 2 * i + 2; // right = 2*i + 2

	// If left child is larger than root
	if (l < n && isLarger(arr, l, largest, orderKeys)) {
		largest = l;
	}

	// If right child is larger than largest so far
	if (r < n && isLarger(arr, r, largest, orderKeys)) {
		largest = r;
	}

	// If largest is not root
	if (largest !== i) {
		let swap = arr[i];
		arr[i] = arr[largest];
		arr[largest] = swap;

		// Recursively heapify the affected sub-tree
		maxHeapify(arr, n, largest, orderKeys);
	}
}

function minHeapify(arr: InsightResult[], n: number, i: number, orderKeys: string[]) {
	let smallest = i; // Initialize smallest as root
	let l = 2 * i + 1; // left = 2*i + 1
	let r = 2 * i + 2; // right = 2*i + 2

	// If left child is smaller than root
	if (l < n && isLarger(arr, smallest, l, orderKeys)) {
		smallest = l;
	}

	// If right child is smaller than smallest so far
	if (r < n && isLarger(arr, smallest, r, orderKeys)) {
		smallest = r;
	}

	// If smallest is not root
	if (smallest !== i) {
		let swap = arr[i];
		arr[i] = arr[smallest];
		arr[smallest] = swap;

		// Recursively heapify the affected sub-tree
		minHeapify(arr, n, smallest, orderKeys);
	}
}

// Checks if arr[idx] is larger than arr[largest] and returns true if so, false otherwise
function isLarger(arr: InsightResult[], idx: number, largest: number, orderKeys: string[]): boolean {
	for (const key of orderKeys) {
		if (arr[idx][key] > arr[largest][key]) {
			return true;
		}
		if (arr[idx][key] < arr[largest][key]) {
			return false;
		}
	}
	return false;
}
