import styles from './header.module.scss';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <img src="/images/logo.png" alt="spacetraveling" />
    </header>
  )
}
