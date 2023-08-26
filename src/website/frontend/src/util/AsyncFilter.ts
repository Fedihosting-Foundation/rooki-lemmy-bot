export const asyncFilter = async<T>(arr: T[], predicate: (value: T, index: number, array: T[]) => any) => {
	const results = await Promise.all(arr.map(predicate));

	return arr.filter((_v, index) => results[index]);
}
