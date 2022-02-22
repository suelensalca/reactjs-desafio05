import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

import { getPrismicClient } from '../services/prismic';

import { useState } from 'react';
import styles from './home.module.scss';
// import commonStyles from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ 
  postsPagination
}: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results);

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.postlist}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`}>
              <a key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <time><FiCalendar size={20}/>{post.first_publication_date}</time>
                <span><FiUser size={20} />{post.data.author}</span>
              </a>
            </Link>
          ))}

          {postsPagination.next_page && (
            <button
              type="button"
              onClick={async () => {
                const response = await fetch(postsPagination.next_page);

                const { results } = await response.json();

                const newPostArray = [...posts, results].flat();

                setPosts(newPostArray);
              }}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
    pageSize: 4,
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: new Date(post.first_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
      }
    }
  }
};
