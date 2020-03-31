import React, { Fragment } from 'react';
import { Sidebar } from '../../components';
import Header from '../Month/Header';
import { CategoryTree, isCategory } from '../../moneymoney';
import styles from './CategorySidebar.module.scss';

type Props = {
  categories: CategoryTree[];
};

function SidebarCategories({ categories }: Props) {
  return (
    <>
      {categories.map((tree) => {
        if (isCategory(tree)) {
          return (
            <div className={styles.row} key={tree.id}>
              {tree.name}
            </div>
          );
        } else {
          return (
            <Fragment key={tree.name}>
              <div className={styles.row}>{tree.name}</div>
              <SidebarCategories categories={tree.children} />
            </Fragment>
          );
        }
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
