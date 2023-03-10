import { SEO } from '../components/seo';
import { Badge } from '@mantine/core';
import { graphql, Link, PageProps, HeadFC, navigate } from 'gatsby';
import React, { ComponentType, useMemo } from 'react';
import { useState } from 'react';
import Layout from '../components/Layout';

interface Props extends PageProps {
  data: {
    allContentfulBlogPost: {
      edges: {
        node: {
          id: string;
          title: string;
          date: string;
          description: string;
          category: string[];
          slug: string;
        };
      }[];
    };
    categories: {
      group: {
        category: string;
        count: number;
      }[];
    };
  };
  // gatsby-node.ts에서 받은 값
  pageContext: {
    skip: number;
    limit: number;
    numPages: number;
    currentPage: number;
  };
}

const PostList: ComponentType<Props> = ({ data }) => {
  const posts = useMemo(() => {
    return data.allContentfulBlogPost.edges.map((edge) => {
      return edge.node;
    });
  }, []);

  const categoryList = useMemo(() => {
    return data.categories.group.sort((a, b) => b.count - a.count);
  }, []);

  const [hoverPost, setHoverPost] = useState<string | undefined>(undefined);

  return (
    <Layout>
      <div className="flex flex-col gap-y-8">
        <h1 className="py-1 text-3xl font-bold">게시글 목록</h1>
        <div className="grid gap-x-4 md:grid-cols-[600px,calc(100%-600px-1rem)]">
          <div className="flex flex-col">
            {posts.map((post, index) => (
              <div
                key={`post-${index}`}
                className={`flex cursor-pointer flex-col gap-y-3 rounded py-8 ${
                  index != posts.length - 1 ? 'border-b' : ''
                }`}
                onClick={() => {
                  navigate(`/post/${post.slug}`);
                }}
                onPointerOver={() => {
                  setHoverPost(post.slug);
                }}
                onPointerOut={() => {
                  setHoverPost(undefined);
                }}
              >
                <span
                  className={`text-2xl font-bold transition-all ${
                    post.slug == hoverPost
                      ? 'text-teal-600 dark:text-teal-500'
                      : ''
                  }`}
                >
                  {post.title}
                </span>

                <span className="w-full overflow-hidden text-sm text-slate-600 dark:text-slate-400 text-ellipsis whitespace-nowrap">
                  {post.description}
                </span>

                {post.category?.length > 0 && (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex gap-x-2">
                      {post.category.map((category, index2) => {
                        return (
                          <Link
                            to={`/category/${category}`}
                            key={`post-${index}-category-${index2}`}
                            className="rounded bg-zinc-100 px-2 py-1 text-sm transition-all hover:bg-zinc-200 active:scale-[0.95] dark:bg-zinc-600 dark:hover:bg-zinc-500"
                            onClick={(e) => e.stopPropagation()}
                          >
                            # {category}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <span className={'text-sm text-slate-600 dark:text-slate-400'}>
                  {post.date}
                </span>
              </div>
            ))}
          </div>

          {categoryList.length > 0 && (
            <div className="sticy top-[75px] hidden h-fit w-full flex-col gap-y-3 py-8 md:flex">
              <h3 className="font-bold">태그 리스트</h3>
              <div className="flex flex-col gap-y-1">
                {categoryList.map((category, index) => (
                  <Link
                    to={`/category/${category.category}`}
                    key={`category-${index}`}
                  >
                    <div className="flex justify-between text-slate-600 transition-all active:scale-[0.95] dark:text-slate-400">
                      <span>{category.category}</span>
                      <Badge>{category.count}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const pageQuery = graphql`
  query ($skip: Int!, $limit: Int!) {
    allContentfulBlogPost(
      limit: $limit
      sort: { fields: date, order: DESC }
      skip: $skip
    ) {
      edges {
        node {
          id
          title
          date(formatString: "YYYY-MM-DD")
          description
          category
          slug
        }
      }
    }
    categories: allContentfulBlogPost {
      group(field: category) {
        category: fieldValue
        count: totalCount
      }
    }
  }
`;

export const Head: HeadFC = () => {
  return (
    <SEO
      title={`Sowoon's Space`}
      keywords={['sowoon', '블로그', 'blog', '프론트엔드', '개발자']}
    />
  );
};

export default PostList;
