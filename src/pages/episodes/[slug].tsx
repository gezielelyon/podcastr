import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import {useRouter} from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';

import {UsePlayer} from '../../contexts/PlayerContext';
import api from '../../services/api';

import styles from './episode.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

type IEpisodeProps = {
  id: string,
  title: string,
  members: string,
  published_at: string,
  thumbnail: string,
  description: string,
  url: string;
  file: {
    url: string,
    type: string,
    duration: number,
  },
  publishedAt: string,
  duration: number,
  durationAsString: string
}

type IHomeProps = {
  episode: IEpisodeProps,
}

export default function Episode({ episode }: IHomeProps) {
  const router = useRouter();
  const {handlePlay} = UsePlayer();

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  return (
    <div className={styles.episode}>

      <Head>
        <title>{episode.title} | podcastr</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href='/'>
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => handlePlay(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />

    </div>
  )
}

/* 
  Fallback False: Se o usuário tentar acessar uma página que não foi gerada
  de forma estática na build do projeto através dos paths irá retornar 404

  Falback True: Se o usuário tentar acessar uma página que não foi gerada
  de forma estática na build do projeto através dos paths, ele irá rodar o 
  getStaticProps no lado do cliente em busca da página

  Falback 'blocking': Quando a pessoa clicar num link, elá so vai pra página
  quando ela estiver carregada

*/
export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('/episodes', {
    params:{
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const paths = data.map((episode: IEpisodeProps) => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const { slug } = context.params;
  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    description: data.description,
    url: data.file.url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}