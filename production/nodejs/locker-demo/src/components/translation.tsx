import type {AppProps} from 'next/app'
import React, {useState} from 'react';
import {appWithTranslation} from 'next-i18next'

import en from '../locales/en/translationEN.json';
import zh from '../locales/en/translationEN.json';;

export const AppContext = React.createContext<any>({})
const TranslationWrap = ({Component, pageProps}: AppProps) => {
    const [locale, setLocal] = useState(zh);

    return <AppContext.Provider value={{locale, setLocal}}>
        <Component {...pageProps} />
    </AppContext.Provider>
}
export default appWithTranslation(TranslationWrap)
