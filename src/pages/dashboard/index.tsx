import { GetServerSideProps } from "next"
import styles from "./dashboard.module.css"
import Head from "next/head"
import { getSession } from "next-auth/react"
import { Textarea } from "@/components/textarea"
import { FiShare2 } from 'react-icons/fi'
import { FaTrash } from 'react-icons/fa'
import { ChangeEvent, FormEvent, useState, useEffect } from "react"

import { db } from '@/services/firebase'

import {
    addDoc, collection, query,
    orderBy,
    where,
    onSnapshot,
    doc,
    deleteDoc
} from "firebase/firestore"

import Link from "next/link"

interface DashboardProps {
    user: {
        email: string
    }
}

interface TasksProps {
    id: string,
    created: Date,
    public: boolean,
    tarefa: string,
    user: string
}

export default function Dashboard({ user }: DashboardProps) {

    const [input, setInput] = useState<string>("")
    const [publicTask, setPublicTask] = useState<boolean>(false)
    const [tasks, setTasks] = useState<TasksProps[]>([])

    useEffect(() => {
        async function loadTasks() {
            const tasks = collection(db, "tasks");
            const q = query(
                tasks,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            );

            onSnapshot(q, (snapshot) => {
                let lista = [] as TasksProps[]

                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                });

                setTasks(lista);
            });
        };

        loadTasks()
    }, [user?.email]);

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleRegisterTasks(event: FormEvent) {
        event.preventDefault();

        if (input == '')
            return;

        try {
            await addDoc(collection(db, "tasks"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            });

            setInput("");
            setPublicTask(false);
        }
        catch (err) {
            console.log(err)
        }
    }

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(
            `${process.env.NEXT_PUBLIC_URL}/task/${id}`
        )
        alert("Link da tarefa copiada com sucesso")
    }

    async function handleDeleteTask(id: string) {
        const docRef = doc(db, "tasks", id)

        await deleteDoc(docRef)
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Dashboard Tasks</title>
            </Head>
            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>Qual a sua tarefa?</h1>

                        <form onSubmit={handleRegisterTasks}>
                            <Textarea
                                placeholder="Digite qual a sua task"
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)}
                            />
                            <div className={styles.checkboxArea}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic} />
                                <label>"Deixar tarefa publica?"</label>
                            </div>

                            <button className={styles.button} type="submit">
                                Registrar
                            </button>
                        </form>
                    </div>
                </section>
                <section className={styles.taskContainer}>
                    <h1>Minhas Tasks</h1>

                    {tasks.map((item) => (
                        <article key={item.id} className={styles.tasks}>

                            {item.public && (
                                <div className={styles.tagContainer}>
                                    <label className={styles.tag}>Público</label>
                                    <button className={styles.shareButton}
                                        onClick={() => handleShare(item.id)}>
                                        <FiShare2 size={22} color="#3183ff" />
                                    </button>
                                </div>
                            )}

                            <div className={styles.taskContent}>
                                {item.public ? (
                                    <Link href={`/task/${item.id}`}>
                                        <p>{item.tarefa}</p>
                                    </Link>
                                ) : (
                                    <p>{item.tarefa}</p>
                                )}
                                <button className={styles.trashButton}
                                    onClick={() => handleDeleteTask(item.id)}>
                                    <FaTrash size={24} color="#ea3140" />
                                </button>
                            </div>
                        </article>
                    ))}


                </section>
            </main>
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }

    }

    return {
        props: {
            user: {
                email: session?.user.email
            }
        }
    };
}