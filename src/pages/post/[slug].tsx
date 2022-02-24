import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';


interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({
  post,
  // sugestions
}: PostProps): JSX.Element {

  const router = useRouter();

  if (router.isFallback) {
    return <h2>Carregando...</h2>
  }

  const totalWords = post.data.content.reduce((total, contentItem) => {
    let count = 0;
    count += contentItem.heading.split(' ').length;

    const wordsCounter = contentItem.body.map(
      item => item.text.split(' ').length
    );
    wordsCounter.map(words => (count += words));

    total += count;

    return total;
  }, 0);

  const readTime = Math.ceil(totalWords / 200);

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <section className={styles.banner}>
          <img
            src={post.data.banner.url}
            alt="banner"
          />
        </section>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.info}>
            <time><FiCalendar size={20}/> {format(
               parseISO(post.first_publication_date),
               'dd MMM yyyy',
               {locale: ptBR}
               )}
            </time>
            <span><FiUser size={20} /> {post.data.author}</span>
            <span><FiClock size={20} /> {`${readTime} min`}</span>
          </div>
          <div className={styles.postContent}>
            {post.data.content.map(postContent => (
              <div key={post.uid}>
                <h2>{postContent.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(postContent.body),
                  }}
                />
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      }
    }
  })

  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner:  response.data.banner,
      author: response.data.author,
      content: response.data.content,
    }
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, //30 minutes
  }
};
