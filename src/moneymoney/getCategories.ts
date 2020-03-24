import { Transaction, CategoryTree, CategoryGroup } from './Types';

function isCategoryGroup(cat: CategoryTree): cat is CategoryGroup {
  return Array.isArray((cat as CategoryGroup).children);
}

export default function getCategories(transactions: Transaction[]) {
  let knownIds: number[] = [];
  return transactions.reduce((memo, { categoryId, category }) => {
    if (!category || !categoryId || knownIds.includes(categoryId)) {
      return memo;
    }

    knownIds.push(categoryId);

    return category.split('\\').reduce((group, name, i, all) => {
      if (i + 1 === all.length) {
        group.push({ id: categoryId, name });
        return memo;
      }

      const existing = group
        .filter(isCategoryGroup)
        .find((entry) => entry.name === name);

      if (existing) {
        return existing.children;
      }

      const newGroup = { name, children: [] };
      group.push(newGroup);

      return newGroup.children;
    }, memo);
  }, [] as CategoryTree[]);
}
