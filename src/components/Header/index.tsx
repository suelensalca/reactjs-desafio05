import styles from './header.module.scss';
import Link from 'next/link';

export default function Header(): JSX.Element {
  return (
    <header className={styles.headerContainer}>
      <Link href="/">
        <a>
          <img src="/images/logo.png" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
