// Script pour tester la connexion à Supabase
// Exécutez ce script avec Node.js pour vérifier la connexion à Supabase

// Remplacez ces valeurs par vos propres informations de connexion Supabase
const SUPABASE_URL = 'https://qgpqiehjmkfxfnfrowbc.supabase.co';
const SUPABASE_ANON_KEY = 'votre-clé-anon'; // Remplacez par votre clé anon

// Importation de la bibliothèque Supabase
const { createClient } = require('@supabase/supabase-js');

// Création du client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction pour tester la connexion à Supabase
async function testSupabaseConnection() {
  console.log('Tentative de connexion à Supabase...');
  
  try {
    // Test de base : vérifier si on peut récupérer la session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError);
    } else {
      console.log('Connexion à Supabase Auth réussie!');
    }
    
    // Vérifier si la table profiles existe
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profilesError) {
      console.error('Erreur lors de l\'accès à la table profiles:', profilesError);
      
      if (profilesError.code === '42P01') {
        console.error('La table profiles n\'existe pas. Veuillez exécuter le script SQL pour la créer.');
      } else if (profilesError.code === '42501') {
        console.error('Problème de permissions. Vérifiez les politiques RLS et les permissions de la table.');
      }
    } else {
      console.log('Accès à la table profiles réussi!');
      console.log('Nombre d\'enregistrements récupérés:', profilesData.length);
    }
    
    // Tester l'inscription d'un utilisateur (optionnel - décommentez pour tester)
    /*
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    
    console.log(`Tentative d'inscription avec l'email: ${testEmail}`);
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signupError) {
      console.error('Erreur lors de l\'inscription:', signupError);
    } else {
      console.log('Inscription réussie!', signupData);
      
      // Vérifier si un profil a été créé automatiquement
      if (signupData.user) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signupData.user.id)
          .single();
        
        if (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
        } else {
          console.log('Profil créé avec succès:', newProfile);
        }
      }
    }
    */
    
  } catch (error) {
    console.error('Erreur inattendue lors du test de connexion:', error);
  }
}

// Exécuter le test
testSupabaseConnection()
  .then(() => console.log('Test terminé'))
  .catch(err => console.error('Erreur lors du test:', err));