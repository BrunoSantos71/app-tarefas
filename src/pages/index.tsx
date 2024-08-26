import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/home.module.css";

import heroImg from '../../public/assets/hero.png'
import { collection, getDocs } from 'firebase/firestore'
import { GetStaticProps } from "next";
import { db } from '../services/firebase'

interface homeProps {
  posts: number,
  comments: number
}

export default function Home(props: homeProps) {

  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas+ | Organizador de tarefas</title>
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo Tarefas"
            src={heroImg}
            priority={true}
          />
        </div>
        <h1 className={styles.title}>Sistema para organizar suas tarefas</h1>
        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{props.posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{props.comments} comentários</span>
          </section>

        </div>
      </main>
    </div>
  );
}


export const getStaticProps: GetStaticProps = async () => {
  const commentRef = collection(db, "comments")
  const postsRef = collection(db, "tasks")


  const commentSnapshot = await getDocs(commentRef)
  const postsSnapshot = await getDocs(postsRef)
  return {
    props: {
      posts: postsSnapshot.size || 0,
      comments: commentSnapshot.size || 0
    }, revalidate: 60
  }
}