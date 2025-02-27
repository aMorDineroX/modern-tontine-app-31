#!/bin/bash

# Script pour déployer manuellement sur GitHub Pages

# Construction du projet
echo "Construction du projet..."
npm run build

# Création d'une branche temporaire pour le déploiement
echo "Préparation du déploiement..."
git checkout --orphan gh-pages-temp
git reset --hard
git add dist/* -f
git commit -m "Déploiement manuel sur GitHub Pages"

# Déploiement sur la branche gh-pages
echo "Déploiement sur GitHub Pages..."
git push origin gh-pages-temp:gh-pages -f

# Retour à la branche principale
echo "Nettoyage..."
git checkout main
git branch -D gh-pages-temp

echo "Déploiement terminé! Votre site sera bientôt disponible à l'adresse:"
echo "https://amorDineroX.github.io/modern-tontine-app-31/"