module.exports = {
    locales: ['fr', 'en'],
    output: 'public/locales/$LOCALE/translation.json',
  
    defaultNamespace: 'translation',
    namespaceSeparator: false,
    keySeparator: false,
  
    useKeysAsDefaultValue: true,
    createOldCatalogs: false,
    sort: true,
  
    lexers: {
      js: ['JavascriptLexer'],
      jsx: ['JavascriptLexer'],
      ts: ['JavascriptLexer'],
      tsx: ['JavascriptLexer'],
    },
  
    verbose: true
  }
  