import Head from "next/head"
import styles from './task.module.css'
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import { db } from '@/services/firebase'
import { doc, collection, query, where, getDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore'
import { Textarea } from '@/components/textarea'
import { ChangeEvent, FormEvent, useState } from "react"
import { useSession } from "next-auth/react"
import { create } from "domain"
import { get } from "http"
import { FaTrash } from 'react-icons/fa'

interface TaskProps {
    item: {
        tarefa: string,
        public: boolean,
        created: string,
        user: string,
        taskId: string
    }
    sec: any
    allComents: CommentsProps[]
}

interface CommentsProps {
    id: string,
    comment: string,
    name: string,
    user: string
    taskId: string
}

export default function Task(props: TaskProps) {
    const { data: session } = useSession();
    const [comentario, setComentario] = useState("");
    const [comentarios, setComentarios] = useState<CommentsProps[]>(props.allComents || []);

    async function handleRegisterComent(event: FormEvent) {
        event.preventDefault()

        if (comentario == '')
            return;

        if (!session?.user)
            return;

        try {
            const docRef = await addDoc(collection(db, "comments"), {
                comment: comentario,
                user: session?.user.email,
                name: session.user.name,
                taskId: props.item.taskId
            });

            const data: CommentsProps = {
                id: docRef.id,
                comment: comentario,
                name: session?.user?.name || '',
                user: session?.user?.email || '',
                taskId: props.item.taskId
            }
            setComentarios((old) => [...old, data])

            setComentario("");
        }
        catch (err) {
            console.log(err)
        }
    }

    async function handleDeleteComment(commentId: string) {
        try {
            const docRef = doc(db, "comments", commentId)
            await deleteDoc(docRef);
            const delComentario = comentarios.filter((a) => a.id !== commentId);

            setComentarios(delComentario);
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>
                    Detalhes da tarefa
                </title>
            </Head>



            <main className={styles.main}>
                <h1>Tasks</h1>
                <article className={styles.task}>
                    <p>
                        {props.item.tarefa}
                    </p>
                </article>


                <section className={styles.comentsContainer}>
                    <h2>Deixar comentário</h2>
                    <form onSubmit={handleRegisterComent}>
                        <Textarea value={comentario} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setComentario(event.target.value)} placeholder="Digite seu comentário..." />
                        <button disabled={!props.sec} className={styles.button}>Comentar</button>
                    </form>
                </section>

                <section className={styles.comentsContainer}>
                    <h2>Todos comentários</h2>
                    {comentarios.length == 0 && (
                        <span>Nenum comentário encontrato...</span>
                    )}

                    {comentarios.map((item) => (
                        <article key={item.id} className={styles.comment}>
                            <div className={styles.headComment}>
                                <label className={styles.commentsLabel}> {item.name}</label>

                                {item.user === session?.user?.email &&
                                    (
                                        <button className={styles.buttonTrash} onClick={() => handleDeleteComment(item.id)}>
                                            <FaTrash size={18} color="#EA3140" />
                                        </button>
                                    )
                                }

                            </div>
                            <p>{item.comment}</p>
                        </article>
                    ))}

                </section>
            </main>
        </div >
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({ req });

    const id = params?.id as string
    const docRef = doc(db, "tasks", id)

    const q = query(collection(db, "comments"), where("taskId", "==", id))

    const snapshotComments = await getDocs(q)
    let allComments: CommentsProps[] = []

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId
        })
    })

    const snapshot = await getDoc(docRef)

    if (snapshot.data() === undefined) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    if (!snapshot.data()?.public) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const data = snapshot.data()?.created.seconds * 1000;

    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(data).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id
    }

    return {
        props: {
            item: task,
            sec: session,
            allComents: allComments
        }
    };
}