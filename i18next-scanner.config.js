module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    'src/components/**/*.{js,jsx,ts,tsx}',
    'src/pages/**/*.{js,jsx,ts,tsx}',
    'src/contexts/**/*.{js,jsx,ts,tsx}',
    'src/hooks/**/*.{js,jsx,ts,tsx}',
    // Ajoute d'autres chemins si besoin
  ],
  output: './public/locales/{{lng}}/{{ns}}.json',
  options: {
    debug: true,
    removeUnusedKeys: true,
    sort: true,
    lngs: ['fr', 'en', 'nl'],
    defaultLng: 'fr',
    defaultNs: 'translation',
    resource: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json',
      savePath: './public/locales/{{lng}}/{{ns}}.json',
    },
    ns: ['translation'],
    defaultValue: '',
    keySeparator: false, // Permet d'utiliser des clés avec des points
    nsSeparator: false,  // Permet d'utiliser des namespaces avec des points
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
};
