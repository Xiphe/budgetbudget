import React, { Fragment } from 'react';
import classNames from 'classnames';
import { Sidebar } from '../../components';
import Header from '../Month/Header';
import { CategoryTree, isCategory } from '../../moneymoney';
import styles from './CategorySidebar.module.scss';

type Props = {
  categories: CategoryTree[];
  indent?: number;
};

function SidebarCategories({ categories, indent = 0 }: Props) {
  return (
    <>
      {categories.map((tree) => {
        return (
          <Fragment key={isCategory(tree) ? tree.id : tree.name}>
            <div
              style={{ '--indent': indent } as any}
              className={classNames(
                styles.row,
                isCategory(tree) && styles.categoryRow,
              )}
            >
              {tree.name}
            </div>
            {!isCategory(tree) && (
              <SidebarCategories
                categories={tree.children}
                indent={indent + 1}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
}

export default function CategorySidebar({ categories }: Props) {
  return (
    <Sidebar>
      <Header>SidebarHeader</Header>
      <SidebarCategories categories={categories} />
    </Sidebar>
  );
}
