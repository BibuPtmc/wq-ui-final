module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/pages/**/*.{js,jsx,ts,tsx}',
    'src/contexts/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    // Ajoute d'autres chemins si besoin
  ],
  output: undefined, // On va gérer chaque langue manuellement
  options: {
    // Ajoute 't' pour détecter les hooks useTranslation()
    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    // Pour détecter les balises <Trans> si tu en utilises
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      fallbackKey: false,
      supportBasicHtmlNodes: true,
      keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      acorn: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    debug: true,
    removeUnusedKeys: true, // Supprime les clés non utilisées automatiquement
    // Conseil : ajoute des valeurs par défaut dans tes appels t('key', 'valeur') pour pré-remplir les fichiers de traduction
    sort: true,
    lngs: ['fr', 'en', 'nl'],
    defaultLng: 'fr',
    defaultNs: 'translation',
    resource: {
      loadPath: 'public/locales/{{lng}}/translation.json',
      savePath: 'public/locales/{{lng}}/translation.json',
    },
    ns: ['translation'],
    defaultValue: '', // Laisse vide, mais privilégie les valeurs par défaut dans le code
    keySeparator: false, // Permet d'utiliser des clés avec des points
    nsSeparator: false,  // Permet d'utiliser des namespaces avec des points
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
};
