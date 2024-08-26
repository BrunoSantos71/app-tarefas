import styles from "./styles.module.css";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function Header() {
    const { data: session, status } = useSession();

    return (
        <header className={styles.header}>
            <section className={styles.section}>
                <nav className={styles.nav}>
                    <Link href="/">
                        <h1 className={styles.logo}>
                            Tasks<span>7</span>
                        </h1>
                    </Link>

                    {session?.user && (
                        <Link href="/dashboard" className={styles.link}>
                            Meu Painel
                        </Link>
                    )}
                </nav>
                {status === "loading" ? (
                    <></>
                ) : session ? (
                    <button className={styles.LoginButton}
                        onClick={() => signOut()}>
                        Bem vindo {session.user?.name}
                    </button>
                ) : (
                    <button className={styles.LoginButton}
                        onClick={() => signIn("google")}>
                        Acessar
                    </button>
                )}
            </section>
        </header>
    )
}