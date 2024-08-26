import { HTMLProps } from 'react';
import styles from './textarea.module.css'
import { useSession } from 'next-auth/react';

export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
    const { data: session, status } = useSession();

    return (
        <>
            <textarea className={styles.textarea} {...rest}>

            </textarea>
        </>
    )
}