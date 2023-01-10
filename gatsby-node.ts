import { CreatePageArgs } from 'gatsby';
import path from 'path';

export const createPages = async ({
  graphql,
  actions,
  reporter,
}: {
  graphql: any;
  actions: CreatePageArgs['actions'];
  reporter: CreatePageArgs['reporter'];
}) => {
  const { createPage } = actions;
  const result = await graphql(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              slug
            }
          }
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.');
    return;
  }

  const posts = result.data.allMarkdownRemark.edges;
  const blogList = path.resolve(`src/templates/post-list.tsx`);
  const postsPerPage = 10;
  const numPages = Math.ceil(posts.length / postsPerPage);
  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      // path: i === 0 ? `/` : `/=${i}`,
      path: i === 0 ? `/` : `/page/${i + 1}`,
      component: blogList,
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
      },
    });
  });

  const categoryList = await graphql(`
    query {
      allMarkdownRemark {
        group(field: frontmatter___category) {
          fieldValue
          count: totalCount
        }
      }
    }
  `);

  if (categoryList.errors) {
    reporter.panicOnBuild('Error while running GraphQL query.');
    return;
  }

  const categories = categoryList.data.allMarkdownRemark.group;
  const categoryTemplate = path.resolve(`src/templates/category.tsx`);
  const categoryPostsPerPage = 10;
  const categoryNumPages = Math.ceil(posts.length / categoryPostsPerPage);
  categories.forEach((category: any) => {
    Array.from({ length: categoryNumPages }).forEach((_, i) => {
      createPage({
        path:
          i === 0
            ? `/category/${category.fieldValue}`
            : `/category/${category.fieldValue}/page/${i + 1}`,
        component: categoryTemplate,
        context: {
          category: category.fieldValue,
          limit: categoryPostsPerPage,
          skip: i * categoryPostsPerPage,
          numPages: categoryNumPages,
          currentPage: i + 1,
          count: category.count,
        },
      });
    });
  });
};
