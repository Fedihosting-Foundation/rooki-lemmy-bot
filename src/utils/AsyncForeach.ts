export async function asyncForEach<T>(
    array: T[],
    callback: (value: T, index: number, array: any[]) => unknown
  ) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }