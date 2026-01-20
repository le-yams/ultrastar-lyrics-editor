# Tests Unitaires - UltraStar Lyrics Editor

## 🎯 Résumé

- **89 tests** unitaires
- **5 suites** de tests
- **97.36%** de couverture globale
- **100%** de réussite

## 📁 Contenu de ce dossier

### Tests par module

| Fichier                        | Tests | Module testé        | Coverage |
|--------------------------------|-------|---------------------|----------|
| `ultraStarParser.test.js`      | 24    | Parser UltraStar    | 100%     |
| `timeConverter.test.js`        | 30    | Conversion temps    | 100%     |
| `lyricsProcessor.test.js`      | 21    | Traitement paroles  | 98.24%   |
| `lyricsSynchronizer.test.js`   | 11    | Synchronisation     | 95.45%   |
| `fileManager.test.js`          | 13    | Gestion fichiers    | 100%     |

## 🚀 Exécution rapide

```bash
# Exécuter tous les tests
npm test

# Mode watch (re-exécute à chaque modification)
npm run test:watch

# Avec rapport de couverture
npm run test:coverage

# Exécuter un seul fichier
npm test ultraStarParser.test.js

# Mode verbose
npm test -- --verbose
```

## 📝 Structure d'un test

```javascript
describe('Module - Fonction', () => {
    test('should do something specific', () => {
        // Arrange - Préparer les données
        const input = 'test data';
        
        // Act - Exécuter l'action
        const result = myFunction(input);
        
        // Assert - Vérifier le résultat
        expect(result).toBe(expected);
    });
});
```

## 🔍 Ce qui est testé

### UltraStarParser (24 tests)
- ✅ Recherche de positions d'espaces
- ✅ Parsing de lignes de notes
- ✅ Construction de lignes de notes
- ✅ Détection de types de lignes

### TimeConverter (30 tests)
- ✅ Conversion millisecondes → composants
- ✅ Conversion composants → millisecondes
- ✅ Réversibilité des conversions
- ✅ Validation des composants

### LyricsProcessor (21 tests)
- ✅ Extraction de syllabes
- ✅ Regroupement de blocs de notes
- ✅ Extraction du texte original
- ✅ Construction de phrases

### LyricsSynchronizer (11 tests)
- ✅ Validation de la synchronisation
- ✅ Synchronisation des paroles
- ✅ Gestion des warnings
- ✅ Préservation des métadonnées

### FileManager (13 tests)
- ✅ Parsing de fichiers UltraStar
- ✅ Génération de fichiers
- ✅ Extraction de métadonnées
- ✅ Gestion des formats de lignes

## 📊 Métriques de qualité

```
---------------------------------------------------------------------------
File                    % Stmts  % Branch  % Funcs  % Lines  Uncovered
---------------------------------------------------------------------------
All files                 97.36     85.00    97.29    97.93
 constants.js               80%       50%      50%      80%  Line 24
 fileManager.js            100%    93.33%     100%     100%  Line 13
 lyricsProcessor.js      98.24%       80%     100%  98.14%  Line 71
 lyricsSynchronizer.js   95.45%    81.81%     100%  97.56%  Line 75
 timeConverter.js          100%      100%     100%     100%
 ultraStarParser.js        100%      100%     100%     100%
---------------------------------------------------------------------------
```

## 🎓 Pour aller plus loin

- **Documentation complète** : Voir `../TESTING_GUIDE.md`
- **Spécifications** : Voir `../TEST_SPECIFICATIONS.md`
- **Résumé d'implémentation** : Voir `../TEST_IMPLEMENTATION_SUMMARY.md`

## ✨ Bonnes pratiques appliquées

- ✅ Tests unitaires purs (sans dépendances externes)
- ✅ Tests indépendants les uns des autres
- ✅ Nommage descriptif et clair
- ✅ Couverture exhaustive des cas d'usage
- ✅ Tests des cas limites et erreurs
- ✅ Documentation intégrée

## 🐛 Débogage

Si un test échoue :

1. Lire le message d'erreur attentivement
2. Identifier la ligne qui échoue
3. Vérifier les valeurs attendues vs reçues
4. Utiliser `console.log()` pour inspecter les valeurs
5. Utiliser `.only` pour isoler le test :
   ```javascript
   test.only('my failing test', () => { ... });
   ```

## 📦 Dépendances

- **Jest** v30.2.0 - Framework de test
- **Babel** - Transpilation ES6
- **Node.js** - Environnement d'exécution

---

**Dernière mise à jour** : 2026-01-20  
**Statut** : ✅ Tous les tests passent
