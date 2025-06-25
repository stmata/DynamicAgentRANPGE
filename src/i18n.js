import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      auth: {
        verifyingSession: "Vérification de la session...",
        authenticationError: "Erreur d'authentification", 
        sessionVerificationError: "Une erreur s'est produite lors de la vérification de votre session."
      },
      common: {
        loading: 'Chargement en cours...',
        error: 'Erreur',
        cancel: 'Annuler',
        confirm: 'Confirmer',
        ok: 'OK',
        close: 'Fermer',
        modules: 'modules',
        home: 'Accueil',
        pages: 'Pages',
        date: 'Date',
        download: 'Télécharger',
        download_pdf: 'Télécharger en PDF',
        backToModules: "Retour aux modules",
        count: 'Vu'
      },
      navbar: {
        chat: 'Chat',
        settings: 'Paramètres',
        logout: 'Déconnexion',
        dashboard: 'Tableau de bord'
      },
      login: {
        title: "RAN-PGE",
        subtitle: "Votre plateforme d'apprentissage personnalisée",
        welcomeHeading: "Ouvrez la porte du savoir",
        welcomeDescription: "Saisissez votre email SKEMA pour recevoir un code de vérification et commencer votre aventure d'apprentissage.",
        emailLabel: "Adresse Email",
        emailPlaceholder: "exemple@email.com",
        requestCodeButton: "Recevoir un code",
        verificationHeading: "Vérification",
        verificationDescription: "Un code de vérification a été envoyé à",
        codeLabel: "Code de vérification",
        codePlaceholder: "Entrez le code à 6 chiffres",
        expiresIn: "Expire dans:",
        seconds: "secondes",
        resendButton: "Renvoyer le code",
        verifyButton: "Vérifier",
        backButton: "Retour",
        featureChat: "Chat interactifs",
        featureEvaluation: "Évaluation",
        featureProgress: "Suivi de progression",
        errorInvalidEmail: "Veuillez entrer une adresse email valide",
        errorInvalidCode: "Le code de vérification doit contenir 6 chiffres",
        errorSkemaDomain: "Seules les adresses email @skema.edu sont acceptées",
        errorInvalidResponse: "Données utilisateur invalides reçues du serveur",
        errorSendingCode: 'Échec de l\'envoi du code de vérification. Veuillez réessayer.',
      },
      home: {
        title: 'Suivez ce parcours de prérequis pour préparer votre année académique à SKEMA',
        description: 'Une plateforme de remise à niveau conçue pour vous. Tests personnalisés, contenus adaptés et accompagnement interactif : tout est réuni pour vous aider à progresser à votre rythme. Commencez dès aujourd\'hui votre parcours de réussite.',
        notice: "Vous pouvez accéder directement aux modules, mais il est fortement recommandé de commencer par le test de positionnement. Il permet d'évaluer votre niveau : un score d'au moins 57 % est nécessaire pour le valider. Les modules sont ensuite là pour vous entraîner librement et renforcer vos compétences.",
        scrollHover: "Accéder aux cours"
      },
      courses: {
        title: 'Des fondamentaux solides, ça commence ici'
      },
      course: {
        modules: 'modules',
        start: 'Commencer',
        comingSoon: 'Bientôt disponible'
      },
      positioning: {
        selectCourse: 'Choisissez votre cours de positionnement',
        selectCourseDescription: 'Sélectionnez le cours sur lequel vous souhaitez être évalué pour déterminer votre niveau.',
        noCoursesAvailable: 'Aucun cours disponible pour le positionnement'
      },
      settings: {
        title: 'Paramètres',
        language: 'Langue',
        theme: 'Thème',
        darkMode: 'Mode sombre',
        voice: 'Voix Text-to-Speech',
        testVoice: 'Tester la voix',
        testing: 'Test en cours...',
        voiceTestText: 'Skema School Business vous souhaite la bienvenue',
        french: 'Français',
        english: 'Anglais'
      },
      courseModules: {
        aboutCourse: 'À propos du cours',
        modules: 'modules',
        topics: 'topics',
        all: "Tous les",
        averageRating: 'Note moyenne',
        description: 'Ce cours complet vous guidera à travers les concepts fondamentaux de la programmation. Vous apprendrez les bases essentielles, les structures de données, les algorithmes et les bonnes pratiques de programmation. Le cours est conçu pour les débutants qui souhaitent se lancer dans le développement logiciel.',
        generalModule: 'Module Général',
        generalModuleDescription: 'Ce module général vous permet d\'interagir avec l\'ensemble du cours. Posez vos questions générales ou testez vos connaissances globales.',
        resources: 'Ressources',
        evaluation_case: 'Cas pratique',
        evaluation: 'QCM/OVERTE',
        notFound: 'Le cours demandé n\'a pas été trouvé',
        genericDescription: 'Ce cours complet vous offre une formation adaptée à vos besoins. Testez vos connaissances avec des évaluations variées : quiz interactifs, questions ouvertes et cas pratiques professionnels. Développez vos compétences à travers des méthodes d\'évaluation diversifiées et personnalisées.'
      },
      evaluation: {
        questions: "Questions",
        summary: "Résumé",
        attempted: "Tentées",
        flagged: "Marquées",
        unattempted: "Non tentées",
        timeRemaining: "Temps restant",
        submit: "Soumettre",
        submitted: "Soumis",
        multipleChoice: "Choix multiple",
        openEnded: "Réponse ouverte",
        enterYourAnswer: "Entrez votre réponse ici...",
        previousQuestion: "Question précédente",
        nextQuestion: "Question suivante",
        flag: "Marquer",
        unflag: "Retirer le marquage",
        confirmSubmit: "Vous avez répondu à {{attempted}} sur {{total}} questions. Êtes-vous sûr de vouloir soumettre?",
        confirmSubmitTitle: "Confirmer la soumission",
        submitSuccess: "Évaluation soumise avec succès!",
        submissionSuccessTitle: "Soumission réussie",
        timeUp: "Temps écoulé! Votre évaluation sera soumise automatiquement. Cliquez sur OK pour continuer.",
        modelAnswer: "Réponse suggérée",
        feedback: "Commentaires",
        references: "References",
        grade: "Note",
        viewGuide: "Voir le plan d'étude",
        guideTitle: "Plan d'étude",
        guideUnavailable: "Le guide d'étude n'est pas disponible pour cette évaluation.",
        scoreLabel: "Votre score :",
        scoreValue: "{{score}}%",
        positioningPassed: "🎉 Félicitations ! Vous avez validé le test de positionnement ! Vous possédez déjà de solides bases dans ce domaine. Vous pouvez poursuivre avec des contenus plus avancés ou approfondir certains aspects spécifiques.",
        positioningFailed: "📚 Continuez vos efforts ! Ce test de positionnement indique qu'il serait bénéfique de revoir les fondamentaux avant d'aborder des sujets plus complexes. Prenez le temps d'explorer les ressources du cours pour renforcer vos bases.",
        moduleGood: "✨ Excellent travail ! Vous maîtrisez bien les concepts de ce module. Cette évaluation d'entraînement confirme votre bonne compréhension du sujet. Continuez ainsi !",
        moduleNeedsWork: "💪 Bon effort ! Cette évaluation d'entraînement montre qu'il y a encore quelques notions à consolider. N'hésitez pas à revoir les ressources du module et à vous entraîner davantage.",
        moduleNotFound: "Module non trouvé",
        positioning: {
          title: "Test de positionnement",
          titleWithCourse: "Test de positionnement - {{course}}",
          description: "Cette évaluation permet de déterminer votre niveau actuel pour un apprentage personnalisé.",
          descriptionWithCourse: "Test de positionnement pour le cours {{course}}. Cette évaluation couvre tous les modules du cours pour déterminer votre niveau actuel dans ce domaine."
        },
        moduleEvaluation: {
          description: "Testez votre niveau sur les thèmes de ce module. Cette évaluation comprend des quiz interactifs et des questions ouvertes pour valider vos connaissances et identifier les points à approfondir."
        },
        case: {
          welcome: {
            title: "Préparez-vous pour votre évaluation",
            startButton: "Commencer l'évaluation"
          },
          loading: {
            generating: "Génération de votre cas d'évaluation...",
            correcting: "Correction en cours..."
          },
          labels: {
            title: "Titre",
            context: "Contexte",
            description: "Description", 
            instructions: "Instructions",
            pedagogicalObjectives: "Objectifs pédagogiques"
          },
          placeholders: {
            responseInput: "Rédigez votre réponse à l'évaluation..."
          },
          correction: {
            title: "Résultats de l'évaluation",
            score: "Score obtenu",
            feedback: "Commentaires détaillés",
            submitted: "Votre évaluation a été soumise et corrigée avec succès."
          }
        }
      },
      error: {
       title: "Erreur 404",
        description: "Oups ! Cette page n'existe pas. La page que vous cherchez a peut-être été déplacée, supprimée, ou vous avez entré une mauvaise URL.",
        goHomeButton: "Retour à l'accueil",
        networkError: 'Erreur de connexion réseau',
        authenticationFailed: 'Échec de l\'authentification',
        sessionExpired: 'Session expirée',
        invalidEmail: 'Adresse email invalide (domaine @skema.edu requis)',
        invalidCode: 'Code de vérification invalide',
        serverError: 'Erreur serveur',
        unknownError: 'Une erreur inconnue s\'est produite',
        coursesLoadFailed: 'Échec du chargement des cours',
        evaluationFailed: 'Échec de la génération d\'évaluation',
        chatError: 'Erreur lors de l\'envoi du message',
        topicsRequired: 'Les sujets sont requis',
        levelRequired: 'Le niveau est requis pour les évaluations de cas',
        weightsInvalid: 'Les poids doivent être entre 0 et 1',
        weightsSumInvalid: 'Les poids MCQ et Ouvert doivent totaliser 1.0'
      },
      success: {
        loginSuccess: 'Connexion réussie',
        logoutSuccess: 'Déconnexion réussie',
        codeSent: 'Code de vérification envoyé',
        evaluationGenerated: 'Évaluation générée avec succès',
        messageSent: 'Message envoyé',
        conversationUpdated: 'Conversation mise à jour',
        coursesLoaded: 'Cours chargés avec succès'
      },
      chat: {
        references: 'Références',
        viewReferences: 'Voir les références',
        sendMessage: 'Envoyer un message...',
        greeting: {
          title: 'Bienvenue sur ChatAI!',
          subtitle: 'Je suis votre assistant virtuel. Je suis là pour vous aider à répondre aux questions liées aux contenus de RANPGE disponibles dans votre espace K2.'
        },
        sidebar: {
          newChat: 'Nouveau chat',
          pinned: 'Épinglées',
          recent: 'Récentes'
        }
      },
      deleteConversation: {
        title: 'Supprimer la conversation',
        message: 'Êtes-vous sûr de vouloir supprimer cette conversation ? Cette action est irréversible.',
        cancel: 'Annuler',
        confirm: 'Supprimer'
      },
      dashboard: {
        title: 'Mon Évolution Académique',
        subtitle: 'Dernière connexion: Aujourd\'hui',
        globalScore: 'Score Moyen Global',
        bestScore: 'Meilleur',
        latestScore: 'Dernier',
        evaluationsCount: 'évaluations',
        progressPositive: 'Progression positive - Continue!',
        progressNegative: 'Progression à améliorer - Focus sur les fondamentaux',
        progressStable: 'Progression stable - Besoin de variété',
        modulesHistory: 'Historique',
        topicsStudied: 'Topics Étudiés',
        topLimit: 'Top 10',
        mostStudiedTopic: '{{topic}} est votre topic le plus étudié ({{count}} fois)',
        emptyState: {
          title: 'Commencez votre parcours !',
          description: 'Vous n\'avez pas encore d\'évaluations. Commencez votre première évaluation pour voir votre progression.',
          startButton: 'Commencer maintenant',
          firstCourseTitle: 'Votre premier cours vous attend',
          firstCourseDescription: 'Découvrez les fondamentaux du Marketing et commencez à construire vos compétences.',
          readyToStart: 'Prêt à commencer',
          tipsTitle: 'Conseils pour bien commencer',
          tip1: '💡 Prenez votre temps pour comprendre',
          tip2: '📝 Prenez des notes pendant les cours',
          tip3: '🤝 N\'hésitez pas à poser des questions',
          tip4: '🔄 Révisez régulièrement'
        },
        evaluationTypes: {
          case: 'cas',
          mixed: 'mixte',
          project: 'projet',
          exam: 'examen',
          mcq: 'qcm'
        }
      },
      pdf: {
        generatedOn: "Généré le",
        at: "à",
        studyGuide: {
          title: "Guide d'étude"
        },
        evaluation: {
          title: "Évaluation Cas Pratique",
          module: "Module",
          score: "Score",
          strengths: "Points forts",
          improvements: "Points d'amélioration",
          comments: "Commentaires détaillés"
        },
        conversation: {
          you: "Vous",
          assistant: "Assistant"
        }
      }
    }
  },
  en: {
    translation: {
      auth: {
        verifyingSession: "Verifying session...",
        authenticationError: "Authentication Error", 
        sessionVerificationError: "An error occurred while verifying your session."
      },
      common: {
        loading: 'Loading...',
        error: 'Error',
        cancel: 'Cancel',
        confirm: 'Confirm',
        ok: 'OK',
        close: 'Close',
        modules: 'modules',
        home: 'Home',
        pages: 'Pages',
        date: 'Date',
        download: 'Download',
        download_pdf: 'Download as PDF',
        backToModules: "Back to modules",
        count: 'Count'
      },
      navbar: {
        chat: 'Chat',
        settings: 'Settings',
        logout: 'Logout',
        dashboard: 'Dashboard'
      },
      login: {
        title: "RANPGE",
        subtitle: "Your personalized learning platform",
        welcomeHeading: "Open the door to knowledge",
        welcomeDescription: "Enter your SKEMA email to receive a verification code and begin your learning adventure.",
        emailLabel: "Email Address",
        emailPlaceholder: "example@email.com",
        requestCodeButton: "Receive a code",
        verificationHeading: "Verification",
        verificationDescription: "A verification code has been sent to",
        codeLabel: "Verification code",
        codePlaceholder: "Enter the 6-digit code",
        expiresIn: "Expires in:",
        seconds: "seconds",
        resendButton: "Resend code",
        verifyButton: "Verify",
        backButton: "Back",
        featureChat: "Interactive chats",
        featureEvaluation: "Evaluation",
        featureProgress: "Progress tracking",
        errorInvalidEmail: "Please enter a valid email address",
        errorInvalidCode: "The verification code must contain 6 digits",
        errorSkemaDomain: "Only @skema.edu email addresses are accepted",
        errorInvalidResponse: "Invalid user data received from server",
        errorSendingCode: 'Failed to send verification code. Please try again.',
      },
      home: {
        title: 'Follow this prerequisites path to prepare your academic year at SKEMA.',
        description: 'A tailored learning platform made just for you. Personalized assessments, adaptive content, and interactive support—all designed to help you progress at your own pace. Start your success journey today.',
        notice: "You can access the modules directly, but we strongly recommend starting with the positioning test. It helps assess your level: you need a score of at least 57% to pass it. The modules are then available for self-paced practice and to reinforce your skills.",
        scrollHover: "Continue to courses"
      },      
      courses: {
        title: 'Strong foundations start here'
      },
      course: {
        modules: 'modules',
        topics: 'topics',
        start: 'Start',
        comingSoon: 'Coming Soon'
      },
      positioning: {
        selectCourse: 'Choose your placement course',
        selectCourseDescription: 'Select the course on which you want to be evaluated to determine your level.',
        noCoursesAvailable: 'No courses available for placement'
      },
      settings: {
        title: 'Settings',
        language: 'Language',
        theme: 'Theme',
        darkMode: 'Dark mode',
        voice: 'Text-to-Speech Voice',
        testVoice: 'Test voice',
        testing: 'Testing...',
        voiceTestText: 'Skema School Business welcomes you',
        french: 'French',
        english: 'English'
      },
      courseModules: {
        aboutCourse: 'About the course',
        modules: 'modules',
        topics: 'topics',
        all: "All",
        averageRating: 'Average rating',
        description: 'This comprehensive course will guide you through the fundamental concepts of programming. You will learn essential basics, data structures, algorithms, and programming best practices. The course is designed for beginners who want to start in software development.',
        generalModule: 'General Module',
        generalModuleDescription: 'This general module allows you to interact with the entire course. Ask your general questions or test your global knowledge.',
        resources: 'Resources',
        evaluation_case: 'Case Study',
        evaluation: 'MCQ/OPEN',
        notFound: 'The requested course was not found',
        genericDescription: 'This comprehensive course offers training tailored to your needs. Test your knowledge with diverse evaluations: interactive quizzes, open-ended questions, and professional case studies. Develop your skills through varied and personalized assessment methods.'
      },
      evaluation: {
        questions: "Questions",
        summary: "Summary",
        attempted: "Attempted",
        flagged: "Flagged",
        unattempted: "Unattempted",
        timeRemaining: "Time remaining",
        submit: "Submit",
        submitted: "Submitted",
        multipleChoice: "Multiple choice",
        openEnded: "Open-ended",
        enterYourAnswer: "Enter your answer here...",
        previousQuestion: "Previous question",
        nextQuestion: "Next question",
        flag: "Flag",
        unflag: "Unflag",
        confirmSubmit: "You have answered {{attempted}} out of {{total}} questions. Are you sure you want to submit?",
        confirmSubmitTitle: "Confirm Submission",
        submitSuccess: "Evaluation submitted successfully!",
        submissionSuccessTitle: "Submission Successful",
        timeUp: "Time's up! Your evaluation will be submitted automatically. Click OK to continue.",
        modelAnswer: "Suggested answer",
        feedback: "Feedback",
        references: "References",
        grade: "Grade",
        viewGuide: "View study plan",
        guideTitle: "Study Plan",
        guideUnavailable: "Study guide is not available for this evaluation.",
        aboveThresholdPositionnement: "Well done! You scored {{score}}%. You likely have some prior knowledge (or maybe just a bit of luck 😉). Be sure to go through the full course and resources to strengthen your understanding.",
        aboveThresholdModule: "Well done! You scored {{score}}%. You already have a good grasp of the topics in this module. Feel free to explore the additional resources to deepen your understanding even further.",
        scoreLabel: "Your score:",
        scoreValue: "{{score}}%",
        positioningPassed: "🎉 Congratulations! You passed the placement test! You already have a solid foundation in this area. You can move on to more advanced content or deepen specific aspects.",
        positioningFailed: "📚 Keep going! This placement test suggests it would be beneficial to review the basics before tackling more complex topics. Take the time to explore the course resources to strengthen your foundation.",
        moduleGood: "✨ Excellent work! You have a good grasp of the concepts in this module. This practice assessment confirms your solid understanding of the topic. Keep it up!",
        moduleNeedsWork: "💪 Good effort! This practice assessment shows that there are still a few concepts to solidify. Don't hesitate to review the module resources and practice further.",
        moduleNotFound: "Module not found",
        positioning: {
          title: "Placement test",
          titleWithCourse: "Placement test - {{course}}",
          description: "This evaluation allows you to determine your current level for personalized learning.",
          descriptionWithCourse: "Placement test for the course {{course}}. This evaluation covers all course modules to determine your current level in this field."
        },
        moduleEvaluation: {
          description: "Test your level on the themes of this module. This evaluation includes interactive quizzes and open-ended questions to validate your knowledge and identify areas for improvement."
        },
        case: {
          welcome: {
            title: "Prepare for your evaluation",
            startButton: "Start evaluation",
          },
          loading: {
            generating: "Generating your case evaluation...",
            correcting: "Correction in progress..."
          },
          labels: {
            title: "Title",
            context: "Context",
            description: "Description",
            instructions: "Instructions", 
            pedagogicalObjectives: "Pedagogical objectives"
          },
          placeholders: {
            responseInput: "Write your response to the evaluation..."
          },
          correction: {
            title: "Evaluation results",
            score: "Score obtained",
            feedback: "Detailed feedback",
            submitted: "Your evaluation has been successfully submitted and corrected."
          }
        }
      },
      error: {
        title: "404 Error",
        description: "Oops! This page doesn't exist. The page you're looking for might have been moved, deleted, or you entered the wrong URL.",
        goHomeButton: "Go Back Home",
        etworkError: 'Network connection error',
        authenticationFailed: 'Authentication failed',
        sessionExpired: 'Session expired',
        invalidEmail: 'Invalid email address (@skema.edu domain required)',
        invalidCode: 'Invalid verification code',
        serverError: 'Server error',
        unknownError: 'An unknown error occurred',
        coursesLoadFailed: 'Failed to load courses',
        evaluationFailed: 'Failed to generate evaluation',
        chatError: 'Error sending message',
        topicsRequired: 'Topics are required',
        levelRequired: 'Level is required for case evaluations',
        weightsInvalid: 'Weights must be between 0 and 1',
        weightsSumInvalid: 'MCQ and Open weights must sum to 1.0'
      },
      success: {
        loginSuccess: 'Login successful',
        logoutSuccess: 'Logout successful',
        codeSent: 'Verification code sent',
        evaluationGenerated: 'Evaluation generated successfully',
        messageSent: 'Message sent',
        conversationUpdated: 'Conversation updated',
        coursesLoaded: 'Courses loaded successfully'
      },
      chat: {
        references: 'References',
        viewReferences: 'View references',
        sendMessage: 'Send a message...',
        greeting: {
          title: 'Welcome to ChatAI!',
          subtitle: "I am your virtual assistant. I/'m here to help you with any questions related to the RANPGE content available in your K2 space."
        },
        sidebar: {
          newChat: 'New chat',
          pinned: 'Pinned',
          recent: 'Recent'
        }
      },
      deleteConversation: {
        title: 'Delete Conversation',
        message: 'Are you sure you want to delete this conversation? This action is irreversible.',
        cancel: 'Cancel',
        confirm: 'Delete'
      },
      dashboard: {
        title: 'My Academic Evolution',
        subtitle: 'Last login: Today',
        globalScore: 'Global Average Score',
        bestScore: 'Best',
        latestScore: 'Latest',
        evaluationsCount: 'evaluations',
        progressPositive: 'Positive progression - Keep going!',
        progressNegative: 'Progression needs improvement - Focus on fundamentals',
        progressStable: 'Stable progression - Need for variety',
        modulesHistory: 'History',
        topicsStudied: 'Studied Topics',
        topLimit: 'Top 10',
        mostStudiedTopic: '{{topic}} is your most studied topic ({{count}} times)',
        emptyState: {
          title: 'Start your journey!',
          description: 'You don\'t have any evaluations yet. Start your first evaluation to see your progress.',
          startButton: 'Start now',
          firstCourseTitle: 'Your first course awaits',
          firstCourseDescription: 'Discover the fundamentals of Marketing and start building your skills.',
          readyToStart: 'Ready to start',
          tipsTitle: 'Tips to get started',
          tip1: '💡 Take your time to understand',
          tip2: '📝 Take notes during courses',
          tip3: '🤝 Don\'t hesitate to ask questions',
          tip4: '🔄 Review regularly'
        },
        evaluationTypes: {
          case: 'case',
          mixed: 'mixed',
          project: 'project',
          exam: 'exam',
          mcq: 'mcq'
        }
      },
      pdf: {
        generatedOn: "Generated on",
        at: "at",
        studyGuide: {
          title: "Study Guide"
        },
        evaluation: {
          title: "Practical Case Evaluation",
          module: "Module",
          score: "Score",
          strengths: "Strengths",
          improvements: "Areas for improvement",
          comments: "Detailed comments"
        },
        conversation: {
          you: "You",
          assistant: "Assistant"
        }
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;