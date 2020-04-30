export default function mapCategories<
  C extends { group: boolean; indentation: number; uuid: string },
  R extends any
>(
  categories: C[],
  collapsedCategories: string[],
  callback: (category: C, i: number, groupClosed: boolean) => R,
): (R | null)[] {
  let prevIndent = 0;
  let i = -1;
  let collapsed = -1;

  return categories.map((category) => {
    const { uuid, group, indentation } = category;
    const groupIndentation = group ? indentation + 1 : indentation;
    const groupClosed = prevIndent > groupIndentation;
    if (group) {
      i = -1;
    } else if (groupClosed) {
      i = 0;
    } else {
      i += 1;
    }
    prevIndent = groupIndentation;

    if (collapsed !== -1 && indentation > collapsed) {
      return null;
    }

    if (group && collapsedCategories.includes(uuid)) {
      collapsed = indentation;
    } else if (indentation <= collapsed) {
      collapsed = -1;
    }

    return callback(category, i, groupClosed);
  });
}
