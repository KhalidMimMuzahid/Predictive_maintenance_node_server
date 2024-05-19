type DataObject = {
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const sortByCreatedAtDescending = (
  {
    sort,
    array,
  }: {
    sort: 'asc' | 'desc';
    array: DataObject[];
  } = {
    sort: 'desc',
    array: [],
  },
): DataObject[] => {
  if (sort === 'asc') {
    return array.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  } else {
    if (sort === 'desc') {
      return array.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
  }
};
