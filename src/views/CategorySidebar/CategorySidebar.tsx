import React, { Fragment } from 'react';
import { Sidebar, Row } from '../../components';
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
            <Row indent={indent} leaf={isCategory(tree)} className={styles.row}>
              {tree.name}
            </Row>
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
      <Header></Header>
      <SidebarCategories categories={categories} />
    </Sidebar>
  );
}
