import type {AppProps, AppContext, AppInitialProps} from 'next/app'
import './globals.scss';
import '../common/i18n';
import Head from 'next/head';


export default function LockerApp({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>KEYVOX | LOCKER</title>
            </Head>
            <Component {...pageProps} />
        </>
    )
}
