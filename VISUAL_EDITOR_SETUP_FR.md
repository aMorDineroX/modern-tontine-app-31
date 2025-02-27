# Configuration de l'Éditeur Visuel Stackbit

## Étapes de Configuration

### 1. Préparation de la Branche

Si vous n'avez pas de branche "preview", créez-la à partir de "main" :

```bash
# Assurez-vous d'être sur la branche main
git checkout main

# Créer la branche preview
git checkout -b preview

# Pousser la nouvelle branche sur GitHub
git push -u origin preview
```

### 2. Configuration Netlify

Dans les paramètres de votre site Netlify :
- Allez dans "Site settings" > "Build & deploy"
- Configurez les paramètres de déploiement
- Sélectionnez "main" comme branche principale

### 3. Configuration Stackbit

Vérifiez les points suivants dans votre `stackbit.config.ts` :
- Définissez les branches supportées
- Configurez correctement les modèles de contenu
- Assurez-vous que les chemins de fichiers sont corrects

### 4. Résolution des Problèmes Courants

#### Branche de Prévisualisation
- Si Netlify ne propose pas de branche "preview", utilisez "main"
- Configurez `preview_branch = "main"` dans `netlify.toml`

#### Erreurs de Configuration
- Vérifiez que tous les chemins de fichiers sont corrects
- Assurez-vous que les dépendances Stackbit sont installées
- Validez la structure de vos fichiers de contenu

### 5. Installation des Dépendances

```bash
npm install @stackbit/types @stackbit/cms-git @stackbit/cli
```

### 6. Scripts NPM

Ajoutez à votre `package.json` :
```json
"scripts": {
  "stackbit-dev": "stackbit dev"
}
```

### Checklist Finale

- [ x] Branche "preview" créée (ou "main" utilisée)
- [x ] Dépendances Stackbit installées
- [ ] Configuration Netlify mise à jour
- [ ] `stackbit.config.ts` configuré
- [ ] Fichiers de contenu en place

### Commandes Utiles

```bash
# Tester la configuration Stackbit localement
npm run stackbit-dev

# Pousser les modifications
git add .
git commit -m "Configuration de l'éditeur visuel"
git push
```

## Assistance

Si vous rencontrez des problèmes :
- Consultez les logs Netlify
- Vérifiez la documentation Stackbit
- Contactez le support Netlify ou Stackbit