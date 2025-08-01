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
        backToK2: "Retourner sur K2",
        count: 'Vu',
        txtFloatiActionBtn: "Pensez à retourner au cours K2 pour poursuivre votre progression"
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
        welcomeDescription: "Saisissez votre email SKEMA pour recevoir un code de vérification et commencer votre aventure d'apprentissage.",
        welcomeHeading: "Ouvrez la porte du savoir",
        ssoDescription: "Connectez-vous avec votre compte SKEMA pour commencer votre aventure d'apprentissage.",
        azureLoginButton: "Se connecter",
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
        title: 'Évaluez vos pré-requis et le développement de vos connaissances ',
        descriptionP1: "En lien avec votre espace de Remise à Niveau (RAN) sur K2, nous vous proposons des tests personnalisés basés sur le contenus de vos ran et un accompagnement interactif pour progresser à votre rythme.",
        descriptionP2: "La 1ère étape est de passer le quizz de positionnement que vous permettra de situer votre niveau initial. Si vous obtenez 57% de bonnes réponses ou plus, vous n’êtes pas obligés de travailler ces modules de ran. Dans le cas contraire, il est fortement recommandé de le faire pour commencer sereinement votre année académique.",
        descriptionP3: "Comme il vous l’est précisé dans votre espace K2, chaque module comportera ensuite des quizz de formation pour lequel vous aurez du feedback. Vous passerez à la fin du module complet un test final de validation de vos connaissances.",
        notice: "Vous pouvez accéder directement aux modules, mais il est fortement recommandé de commencer par le test de positionnement. Il permet d'évaluer votre niveau : un score d'au moins 57 % est nécessaire pour le valider. Les modules sont ensuite là pour vous entraîner librement et renforcer vos compétences.",
        scrollHover: "Accéder aux cours"
      },
      courses: {
        title: 'Testez vos fondamentaux'
      },
      course: {
        modules: 'modules',
        start: 'Commencer',
        comingSoon: 'Bientôt disponible',
        placementTestRequired: 'Test de positionnement requis',
        placementTestRequiredShort: 'Test de positionnement requis'
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
        french: '🇫🇷 Français',
        english: '🇬🇧 Anglais',
        portuguese: '🇧🇷 Portugais'
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
        evaluation: 'QUIZ',
        notFound: 'Le cours demandé n\'a pas été trouvé',
        genericDescription: 'Ce cours complet vous offre une formation adaptée à vos besoins. Testez vos connaissances avec des évaluations variées : quiz interactifs, questions ouvertes et cas pratiques professionnels. Développez vos compétences à travers des méthodes d\'évaluation diversifiées et personnalisées.',
        lockedMessage: 'Complétez le module précédent ou faites le test de positionnement'
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
        aboveThresholdPositionnement: "📚 Bien joué pour quiz de positionnement !<br/>Vous avez obtenu <strong>{{score}}%</strong>.<br/><br/>Vous pouvez maintenant retourner sur K2 pour débuter le Module.<br/>👉 Et souvenez-vous, je suis là pour vous aider si besoin !",
        aboveThresholdModule: "✅ Activité terminée, bravo !<br/>Vous avez obtenu <strong>{{score}}%</strong>.<br/><br/>Vous pouvez maintenant retourner sur K2 et passer à la suite du cours.<br/>👉 Je vous retrouve très vite dans le prochain module !",
        aboveThresholdFinal: "🎉 Félicitations, vous êtes arrivé(e) au bout du parcours ! Vous venez de finaliser le quiz final, bravo pour votre engagement tout au long de ce cours 👏<br/>Vous avez obtenu <strong>{{score}}%</strong>.<br/><br/>🔁 Et bien sûr, je reste disponible si vous avez envie de continuer à explorer certains sujets ou si vous avez des questions à posteriori.",
        moduleNotFound: "Module non trouvé",
        positioning: {
          title: "Test de positionnement",
          finalValidationTitle: "Test de validation finale",
          titleWithCourse: "Test de positionnement - {{course}}",
          description: "Cette évaluation permet de déterminer votre niveau actuel pour un apprentage personnalisé.",
          descriptionWithCourse: "Test de positionnement pour le cours {{course}}. Cette évaluation couvre tous les modules du cours pour déterminer votre niveau actuel dans ce domaine.",
          descriptionWithCourseFinale: "Quiz de validation finale pour le cours {{course}}. Cette évaluation couvre tous les modules et permet de valider vos connaissances acquises dans ce domaine.",
          moduleTraining: "<p><strong>Je vous propose à présent un quiz d'entraînement pour faire le point sur ce que vous venez d'apprendre. Ces quiz ont été conçus pour :</strong></p><ul><li>renforcer votre compréhension des notions clés,</li><li>vous aider à vérifier que tout est bien assimilé,</li><li>vous préparer sereinement au quiz final.</li></ul><p>📝 <em>Ces quiz sont là pour vous entraîner, à votre rythme. Et si une question vous bloque, je suis là pour vous aider à y voir plus clair via le chat !</em></p>",
          positioningFirstTime: "<p><strong>Bienvenue dans votre test de positionnement ! Cette évaluation permet de  </strong></p><ul><li>évaluer votre niveau actuel dans ce domaine,</li><li>identifier vos points forts et axes d'amélioration,</li><li>personnaliser votre parcours d'apprentissage.</li></ul><p>📝 <em>Prenez votre temps, il n'y a pas de piège. Un score de 57% ou plus confirme votre niveau et vous dispense du cours !</em></p>",
          positioningRetry: "<p><strong>Vous refaites le test de positionnement - c'est une excellente initiative ! Cette nouvelle tentative vous permettra de :</strong></p><ul><li>mesurer vos progrès depuis la dernière fois,</li><li>améliorer votre score précédent,</li><li>consolider vos connaissances.</li></ul><p>📝 <em>Vous connaissez déjà le principe : 57% ou plus confirme votre niveau et vous dispense du cours !</em></p>",
          finalValidation: "<p><strong>Félicitations, vous voici arrivé(e) au test de validation finale ! Cette évaluation permet de :</strong></p><ul><li>valider l'ensemble des connaissances acquises,</li><li>confirmer votre maîtrise des concepts fondamentaux,</li><li>finaliser officiellement votre parcours d'apprentissage.</li></ul><p>📝 <em>Vous avez travaillé dur pour arriver jusqu'ici. Ce test marque l'aboutissement de votre formation - donnez le meilleur de vous-même !</em></p>"
        },
        moduleEvaluation: {
          description: "Testez votre niveau sur les thèmes de ce module. Cette évaluation comprend des quiz interactifs et des questions ouvertes pour valider vos connaissances et identifier les points à approfondir."
        },
        case: {
          welcome: {
            title: "Préparez-vous pour votre cas pratique d'entraînement",
            startButton: "Commencer",
            introBlock: "<p><strong>Maintenant que vous avez bien avancé dans le cours, je vous propose de mettre vos connaissances en pratique à travers un mini cas. Cette activité vous permettra de :</strong></p><ul><li>appliquer les notions clés abordées dans les modules,</li><li>mobiliser vos acquis dans une situation concrète,</li><li>vous entraîner à résoudre un cas comme en contexte professionnel.</li></ul><p>📝 <em>Cette activité est avant tout un exercice d'entraînement : prenez le temps de réfléchir, de mobiliser ce que vous avez appris… et n’hésitez pas à me solliciter si besoin via le chat !</em></p>"
          },
          loading: {
            generating: "Génération de votre cas pratique d'entraînement...",
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
          subtitle: 'Je suis votre assistant virtuel. Je suis là pour vous aider à répondre aux questions liées aux contenus de RANPGE disponibles dans votre espace K2.',
          subtitleK2: 'Cliquez sur la bulle 🔁 K2 pour continuer votre progression.'
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
        platform: "Plateforme RAN-PGE",
        lastLogin: "Dernière connexion",
        positioningTests: "Quiz de positionnement", 
        totalEvaluations: "Nombre d'évaluations réalisées",
        activeCourses: "Cours actifs",
        daysActivity: "Jours d'activité",
        positioningTest: "Quiz de positionnement",
        moduleProgress: "Progression des modules",
        courseEvaluations: "Évaluations du cours",
        unlockedModules: "Modules débloqués",
        completed: "Terminés",
        score: "Score",
        attempts: "Tentatives",
        evaluation: "Évaluation",
        evaluationDistribution: "Répartition des évaluations",
        scoreEvolution: "Évolution des scores",
        startLearning: "Commencez votre parcours d'apprentissage !",
        startDescription: "Démarrez par passer vos tests de positionnement pour évaluer votre niveau initial.",
        startNow: "Commencer maintenant",
        course: "Cours",
        type: "Type",
        status: {
          passed: "Réussi",
          failed: "Échoué", 
          notAttempted: "Non tenté"
        },
        evaluationType: {
          positionnement: "Quiz de positionnement",
          module_mixed: "Quiz d'entrainement",
          module_case: "Cas pratiques (optionnels)",
          finale: "Quiz de validation finale"
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
        backToK2: "Return to K2",
        count: 'Count',
        txtFloatiActionBtn:"Remember to return to the K2 course to continue your progress"
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
        welcomeDescription: "Enter your SKEMA email to receive a verification code and begin your learning journey.",
        welcomeHeading: "Open the door to knowledge",
        ssoDescription: "Connect with your SKEMA account to begin your learning adventure.",
        azureLoginButton: "Login",
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
        title: 'Assess your prerequisites and the development of your knowledge',
        descriptionP1: "In connection with your Refresher Course (RAN) space on K2, we are offering personalized tests based on the content of your RAN modules, along with interactive support to help you progress at your own pace.",
        descriptionP2: "The first step is to take the placement quiz, which will allow you to identify your initial level. If you score 57% or more correct answers, you are not required to work on these RAN modules. Otherwise, it is strongly recommended to do so in order to start your academic year with peace of mind.",
        descriptionP3: "As specified in your K2 space, each module will then include training quizzes for which you will receive feedback. At the end of the full module, you will take a final test to validate your knowledge.",
        notice: "You can access the modules directly, but we strongly recommend starting with the positioning test. It helps assess your level: you need a score of at least 57% to pass it. The modules are then available for self-paced practice and to reinforce your skills.",
        scrollHover: "Continue to courses"
      },      
      courses: {
        title: 'Test your fundamentals'
      },
      course: {
        modules: 'modules',
        topics: 'topics',
        start: 'Start',
        comingSoon: 'Coming Soon',
        placementTestRequired: 'Placement test required',
        placementTestRequiredShort: 'Placement test required'
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
        french: '🇫🇷 French',
        english: '🇬🇧 English',
        portuguese: '🇧🇷 Portuguese'
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
        evaluation: 'Quiz',
        notFound: 'The requested course was not found',
        genericDescription: 'This comprehensive course offers training tailored to your needs. Test your knowledge with diverse evaluations: interactive quizzes, open-ended questions, and professional case studies. Develop your skills through varied and personalized assessment methods.',
        lockedMessage: 'Complete previous module or take placement test'
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
        aboveThresholdPositionnement: "📚 Well done on completing your positioning quiz!<br/>You scored <strong>{{score}}%</strong>.<br/><br/>You can now return to K2 to begin the Module.<br/>👉 And remember, I'm here to help you if you need anything!",
        aboveThresholdModule: "✅ Activity completed, well done!<br/>You scored <strong>{{score}}%</strong>.<br/><br/>You can now return to K2 and move on with the course.<br/>👉 I'll see you very soon in the next module!",
        aboveThresholdFinal: "🎉 Congratulations, you’ve reached the end of the course! You just completed the final quiz—great job on your commitment throughout this course 👏<br/>You scored <strong>{{score}}%</strong>.<br/><br/>🔁 And of course, I’m here if you want to keep exploring certain topics or if you have any questions afterwards.",
        moduleNotFound: "Module not found",
        positioning: {
          title: "Placement test",
          finalValidationTitle: "Final Validation Test",
          titleWithCourse: "Placement test - {{course}}",
          description: "This evaluation allows you to determine your current level for personalized learning.",
          descriptionWithCourse: "Placement test for the course {{course}}. This evaluation covers all course modules to determine your current level in this field.",
          descriptionWithCourseFinale: "Final validation quiz for the {{course}} course. This assessment covers all modules and is designed to validate your knowledge in this subject area.",
          moduleTraining: "<p><strong>I now offer you a training quiz to review what you've just learned. These quizzes have been designed to:</strong></p><ul><li>strengthen your understanding of key concepts,</li><li>help you verify that everything is well understood,</li><li>prepare you confidently for the final quiz.</li></ul><p>📝 <em>These quizzes are here for you to practice at your own pace. And if a question stumps you, I'm here to help clarify things via chat!</em></p>",
          positioningFirstTime: "<p><strong>Welcome to your placement test! This evaluation allows to:</strong></p><ul><li>assess your current level in this field,</li><li>identify your strengths and areas for improvement,</li><li>personalize your learning path.</li></ul><p>📝 <em>Take your time, there are no tricks. A score of 57% or more confirms your level and exempts you from the course!</em></p>",
          positioningRetry: "<p><strong>You're retaking the placement test - that's an excellent initiative! This new attempt will allow you to:</strong></p><ul><li>measure your progress since last time,</li><li>improve your previous score,</li><li>consolidate your knowledge.</li></ul><p>📝 <em>You already know the principle: 57% or more confirms your level and exempts you from the course!</em></p>",
          finalValidation: "<p><strong>Congratulations, you have reached the final validation test! This assessment allows you to:</strong></p><ul><li>validate all the knowledge you have acquired,</li><li>confirm your mastery of fundamental concepts,</li><li>officially complete your learning journey.</li></ul><p>📝 <em>You have worked hard to get here. This test marks the culmination of your training - give it your best!</em></p>"
        },
        moduleEvaluation: {
          description: "Test your level on the themes of this module. This evaluation includes interactive quizzes and open-ended questions to validate your knowledge and identify areas for improvement."
        },
        case: {
          welcome: {
            title: "Prepare for your evaluation – Practice case study",
            startButton: "Start",
            introBlock: "<p><strong>Now that you’ve made good progress in the course, I invite you to apply your knowledge through a short case study. This activity will allow you to:</strong></p><ul><li>apply the key concepts covered in the modules,</li><li>use your knowledge in a real-world scenario,</li><li>practice solving a case as you would in a professional context.</li></ul><p>📝 <em>This activity is primarily a training exercise: take your time, reflect, apply what you’ve learned… and don’t hesitate to reach out via the chat if needed!</em></p>"
          },
          loading: {
            generating: "Generating your practice case study...",
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
          subtitle: "I am your virtual assistant. I/'m here to help you with any questions related to the RANPGE content available in your K2 space.",
          subtitleK2: "Click on the 🔁  K2 bubble to continue your progress."
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
        platform: "RAN-PGE Platform",
        lastLogin: "Last login",
        positioningTests: "Placement quiz", 
        totalEvaluations: "Number of evaluations completed",
        activeCourses: "Active courses",
        daysActivity: "Days of activity",
        positioningTest: "Placement quiz",
        moduleProgress: "Module progress",
        courseEvaluations: "Course evaluations",
        unlockedModules: "Unlocked modules",
        completed: "Completed",
        score: "Score",
        attempts: "Attempts",
        evaluation: "Evaluation",
        evaluationDistribution: "Evaluation distribution",
        scoreEvolution: "Score evolution",
        startLearning: "Start your learning journey!",
        startDescription: "Begin by taking your positioning tests to assess your initial level.",
        startNow: "Start now",
        course: "Course",
        type: "Type",
        status: {
          passed: "Passed",
          failed: "Failed", 
          notAttempted: "Not attempted"
        },
        evaluationType: {
          positionnement: "Placement quiz",
          module_mixed: "Practice quiz",
          module_case: "Practice case studies (optional)",
          finale: "Final validation quiz"
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
  },
  "pt-BR": {
  translation: {
    auth: {
      verifyingSession: "Verificando sessão...",
      authenticationError: "Erro de autenticação",
      sessionVerificationError: "Ocorreu um erro ao verificar sua sessão."
    },
    common: {
      loading: "Carregando...",
      error: "Erro",
      cancel: "Cancelar",
      confirm: "Confirmar",
      ok: "OK",
      close: "Fechar",
      modules: "módulos",
      home: "Início",
      pages: "Páginas",
      date: "Data",
      download: "Baixar",
      download_pdf: "Baixar em PDF",
      backToModules: "Voltar aos módulos",
      backToK2: "Voltar ao K2",
      count: "Visualizado",
      txtFloatiActionBtn: "Não se esqueça de voltar ao curso K2 para continuar seu progresso"
    },
    navbar: {
      chat: "Chat",
      settings: "Configurações",
      logout: "Sair",
      dashboard: "Painel"
    },
    login: {
      title: "RAN‑PGE",
      subtitle: "Sua plataforma de aprendizagem personalizada",
      welcomeDescription: "Digite seu e-mail SKEMA para receber um código de verificação e iniciar sua jornada de aprendizado.",
      welcomeHeading: "Abra a porta do conhecimento",
      ssoDescription: "Conecte‑se com sua conta SKEMA para começar sua jornada de aprendizagem.",
      azureLoginButton: "Entrar",
      emailLabel: "Endereço de email",
      emailPlaceholder: "exemplo@email.com",
      requestCodeButton: "Receber código",
      verificationHeading: "Verificação",
      verificationDescription: "Um código de verificação foi enviado para",
      codeLabel: "Código de verificação",
      codePlaceholder: "Digite o código de 6 dígitos",
      expiresIn: "Expira em:",
      seconds: "segundos",
      resendButton: "Reenviar código",
      verifyButton: "Verificar",
      backButton: "Voltar",
      featureChat: "Chats interativos",
      featureEvaluation: "Avaliação",
      featureProgress: "Acompanhamento de progresso",
      errorInvalidEmail: "Por favor, insira um email válido",
      errorInvalidCode: "O código de verificação deve ter 6 dígitos",
      errorSkemaDomain: "Somente endereços de email @skema.edu são aceitos",
      errorInvalidResponse: "Dados de usuário inválidos recebidos do servidor",
      errorSendingCode: "Falha ao enviar o código de verificação. Por favor, tente novamente."
    },
    home: {
      title: "Avalie seus pré‑requisitos e o desenvolvimento do seu conhecimento",
      descriptionP1: "Em conexão com o seu espaço de Remise à Niveau (RAN) no K2, oferecemos testes personalizados baseados nos conteúdos dos seus RAN e um acompanhamento interativo para você progredir no seu ritmo.",
      descriptionP2: "A primeira etapa é fazer o quiz de posicionamento que permitirá situar seu nível inicial. Se você obtiver 57% de acertos ou mais, não será necessário trabalhar nesses módulos de RAN. Caso contrário, é altamente recomendável fazê‑los para começar o ano acadêmico com tranquilidade.",
      descriptionP3: "Como indicado no seu espaço K2, cada módulo incluirá quizzes de formação com feedback. Ao final do módulo completo, você passará um teste final para validação dos seus conhecimentos.",
      notice: "Você pode acessar diretamente os módulos, mas é altamente recomendável começar pelo teste de posicionamento. Ele avalia seu nível: uma pontuação de pelo menos 57% é necessária para validá‑lo. Os módulos estão disponíveis depois para treinar livremente e reforçar suas habilidades.",
      scrollHover: "Acessar os cursos"
    },
    courses: {
      title: "Teste seus fundamentos"
    },
    course: {
      modules: "módulos",
      start: "Começar",
      comingSoon: "Em breve disponível",
      placementTestRequired: "Teste de posicionamento necessário",
      placementTestRequiredShort: "Teste de posicionamento necessário"
    },
    positioning: {
      selectCourse: "Escolha seu curso de posicionamento",
      selectCourseDescription: "Selecione o curso que você deseja ser avaliado para determinar seu nível.",
      noCoursesAvailable: "Nenhum curso disponível para posicionamento"
    },
    settings: {
      title: "Configurações",
      language: "Idioma",
      theme: "Tema",
      darkMode: "Modo escuro",
      voice: "Voz Text‑to‑Speech",
      testVoice: "Testar voz",
      testing: "Testando...",
      voiceTestText: "Skema School Business dá‑lhe as boas‑vindas",
      french: "🇫🇷 Francês",
      english: "🇬🇧 Inglês",
      portuguese: "🇧🇷 Português"
    },
    courseModules: {
      aboutCourse: "Sobre o curso",
      modules: "módulos",
      topics: "tópicos",
      all: "Todos",
      averageRating: "Avaliação média",
      description: "Este curso completo irá guiá‑lo através dos conceitos fundamentais de programação. Você aprenderá os fundamentos essenciais, estruturas de dados, algoritmos e boas práticas de programação. O curso é projetado para iniciantes que desejam começar no desenvolvimento de software.",
      generalModule: "Módulo Geral",
      generalModuleDescription: "Este módulo geral permite interagir com todo o curso. Faça perguntas gerais ou teste seu conhecimento global.",
      resources: "Recursos",
      evaluation_case: "Caso prático",
      evaluation: "QUIZ",
      notFound: "O curso solicitado não foi encontrado",
      genericDescription: "Este curso completo oferece treinamento adaptado às suas necessidades. Teste seus conhecimentos com avaliações variadas: quizzes interativos, questões abertas e casos práticos profissionais. Desenvolva suas competências por meio de métodos de avaliação diversificados e personalizados.",
      lockedMessage: "Complete o módulo anterior ou faça o teste de posicionamento"
    },
    evaluation: {
      questions: "Perguntas",
      summary: "Resumo",
      attempted: "Tentadas",
      flagged: "Marcadas",
      unattempted: "Não tentadas",
      timeRemaining: "Tempo restante",
      submit: "Enviar",
      submitted: "Enviado",
      multipleChoice: "Múltipla escolha",
      openEnded: "Resposta aberta",
      enterYourAnswer: "Digite sua resposta aqui...",
      previousQuestion: "Pergunta anterior",
      nextQuestion: "Próxima pergunta",
      flag: "Marcar",
      unflag: "Desmarcar",
      confirmSubmit: "Você respondeu {{attempted}} de {{total}} perguntas. Tem certeza que deseja enviar?",
      confirmSubmitTitle: "Confirmar envio",
      submitSuccess: "Avaliação enviada com sucesso!",
      submissionSuccessTitle: "Envio bem‑sucedido",
      timeUp: "Tempo esgotado! Sua avaliação será enviada automaticamente. Clique OK para continuar.",
      modelAnswer: "Resposta sugerida",
      feedback: "Comentários",
      references: "Referências",
      grade: "Nota",
      viewGuide: "Ver plano de estudo",
      guideTitle: "Plano de estudo",
      guideUnavailable: "Plano de estudo não está disponível para esta avaliação.",
      aboveThresholdPositionnement: "📚 Parabéns pelo quiz de posicionamento!<br/>Você obteve <strong>{{score}}%</strong>.<br/><br/>Agora você pode voltar ao K2 para iniciar o Módulo.<br/>👉 E lembre‑se: estou aqui para ajudar se precisar!",
      aboveThresholdModule: "✅ Atividade concluída, bravo!<br/>Você obteve <strong>{{score}}%</strong>.<br/><br/>Agora você pode voltar ao K2 e seguir para o próximo módulo.<br/>👉 Nos vemos em breve no próximo módulo!",
      aboveThresholdFinal: "🎉 Parabéns, você chegou ao final do percurso! Você concluiu o quiz final com ótimo engajamento 👏<br/>Você obteve <strong>{{score}}%</strong>.<br/><br/>🔁 E claro, continuo disponível se quiser explorar mais temas ou tiver dúvidas depois.",
      moduleNotFound: "Módulo não encontrado",
      positioning: {
        title: "Teste de posicionamento",
        finalValidationTitle: "Teste de validação final",
        titleWithCourse: "Teste de posicionamento – {{course}}",
        description: "Esta avaliação permite determinar seu nível atual para um aprendizado personalizado.",
        descriptionWithCourse: "Teste de posicionamento para o curso {{course}}. Esta avaliação cobre todos os módulos do curso para determinar seu nível atual nessa área.",
        descriptionWithCourseFinale: "Quiz de validação final para o curso {{course}}. Esta avaliação cobre todos os módulos e permite validar os conhecimentos adquiridos nessa área.",
        moduleTraining: "<p><strong>Agora proponho um quiz de treino para revisar o que você acabou de aprender. Esses quizzes foram elaborados para:</strong></p><ul><li>reforçar sua compreensão dos conceitos-chave,</li><li>ajudar a verificar que tudo foi assimilado,</li><li>prepará-lo com tranquilidade para o quiz final.</li></ul><p>📝 <em>Esses quizzes são para treinar no seu ritmo. E se alguma pergunta for difícil, estou aqui via chat para ajudar!</em></p>",
        positioningFirstTime: "<p><strong>Bem‑vindo ao seu teste de posicionamento! Esta avaliação permite:</strong></p><ul><li>avaliar seu nível atual na área,</li><li>identificar seus pontos fortes e de melhoria,</li><li>personalizar seu percurso de aprendizagem.</li></ul><p>📝 <em>Tome seu tempo, não há pegadinhas. Uma pontuação de 57% ou mais confirma seu nível e dispensa o curso!</em></p>",
        positioningRetry: "<p><strong>Você está refazendo o teste de posicionamento – ótima iniciativa! Esta nova tentativa permitirá:</strong></p><ul><li>medir seu progresso desde a última vez,</li><li>melhorar sua pontuação anterior,</li><li>consolidar seus conhecimentos.</li></ul><p>📝 <em>Você já conhece o princípio: 57% ou mais confirma seu nível e dispensa o curso!</em></p>",
        finalValidation: "<p><strong>Parabéns, você chegou ao teste de validação final! Esta avaliação permite:</strong></p><ul><li>validar todos os conhecimentos adquiridos,</li><li>confirmar sua compreensão dos conceitos fundamentais,</li><li>finalizar oficialmente seu percurso de aprendizagem.</li></ul><p>📝 <em>Você se esforçou muito para chegar até aqui. Este teste marca o fim da sua formação – dê o seu melhor!</em></p>"
      },
      moduleEvaluation: {
        description: "Teste seu nível nos temas deste módulo. Esta avaliação inclui quizzes interativos e questões abertas para validar seus conhecimentos e identificar pontos a aprofundar."
      },
      case: {
        welcome: {
          title: "Prepare-se para seu caso prático de treino",
          startButton: "Começar",
          introBlock: "<p><strong>Agora que você avançou bem no curso, proponho aplicar seus conhecimentos em um mini caso prático. Esta atividade permitirá:</strong></p><ul><li>aplicar noções-chave abordadas nos módulos,</li><li>mobilizar o que você aprendeu em uma situação concreta,</li><li>treinar para resolver um caso em contexto profissional.</li></ul><p>📝 <em>Esta atividade é principalmente um exercício de treino: reflita, mobilize o que aprendeu… e não hesite em me chamar via chat se precisar!</em></p>"
        },
        loading: {
          generating: "Gerando seu caso prático de treino...",
          correcting: "Corrigindo em andamento..."
        },
        labels: {
          title: "Título",
          context: "Contexto",
          description: "Descrição",
          instructions: "Instruções",
          pedagogicalObjectives: "Objetivos pedagógicos"
        },
        placeholders: {
          responseInput: "Redija sua resposta à avaliação..."
        },
        correction: {
          title: "Resultados da avaliação",
          score: "Pontuação obtida",
          feedback: "Comentários detalhados",
          submitted: "Sua avaliação foi enviada e corrigida com sucesso."
        }
      }
    },
    error: {
      title: "Erro 404",
      description: "Ops! Esta página não existe. A página que você procura pode ter sido movida, excluída ou você digitou um URL incorreto.",
      goHomeButton: "Voltar ao início",
      networkError: "Erro de conexão de rede",
      authenticationFailed: "Falha na autenticação",
      sessionExpired: "Sessão expirada",
      invalidEmail: "Endereço de email inválido (domínio @skema.edu exigido)",
      invalidCode: "Código de verificação inválido",
      serverError: "Erro do servidor",
      unknownError: "Ocorreu um erro desconhecido",
      coursesLoadFailed: "Falha ao carregar cursos",
      evaluationFailed: "Falha na geração da avaliação",
      chatError: "Erro ao enviar mensagem",
      topicsRequired: "Tópicos são obrigatórios",
      levelRequired: "Nível é obrigatório para avaliações de caso",
      weightsInvalid: "Os pesos devem estar entre 0 e 1",
      weightsSumInvalid: "Os pesos MCQ e Aberto devem totalizar 1.0"
    },
    success: {
      loginSuccess: "Login bem‑sucedido",
      logoutSuccess: "Logout bem‑sucedido",
      codeSent: "Código de verificação enviado",
      evaluationGenerated: "Avaliação gerada com sucesso",
      messageSent: "Mensagem enviada",
      conversationUpdated: "Conversa atualizada",
      coursesLoaded: "Cursos carregados com sucesso"
    },
    chat: {
      references: "Referências",
      viewReferences: "Ver referências",
      sendMessage: "Enviar mensagem...",
      greeting: {
        title: "Bem‑vindo ao ChatAI!",
        subtitle: "Sou seu assistente virtual. Estou aqui para ajudá‑lo a responder perguntas relacionadas aos conteúdos do RANPGE disponíveis no seu espaço K2.",
        subtitleK2: "Clique na bolha 🔁 K2 para continuar seu progresso."
      },
      sidebar: {
        newChat: "Novo chat",
        pinned: "Fixadas",
        recent: "Recentes"
      }
    },
    deleteConversation: {
      title: "Excluir conversa",
      message: "Tem certeza de que deseja excluir esta conversa? Esta ação é irreversível.",
      cancel: "Cancelar",
      confirm: "Excluir"
    },
    dashboard: {
      platform: "Plataforma RAN‑PGE",
      lastLogin: "Último login",
      positioningTests: "Quizzes de posicionamento",
      totalEvaluations: "Número de avaliações realizadas",
      activeCourses: "Cursos ativos",
      daysActivity: "Dias de atividade",
      positioningTest: "Quiz de posicionamento",
      moduleProgress: "Progresso dos módulos",
      courseEvaluations: "Avaliações do curso",
      unlockedModules: "Módulos desbloqueados",
      completed: "Concluídos",
      score: "Pontuação",
      attempts: "Tentativas",
      evaluation: "Avaliação",
      evaluationDistribution: "Distribuição das avaliações",
      scoreEvolution: "Evolução das pontuações",
      startLearning: "Comece seu percurso de aprendizagem!",
      startDescription: "Inicie fazendo os testes de posicionamento para avaliar seu nível inicial.",
      startNow: "Começar agora",
      course: "Curso",
      type: "Tipo",
      status: {
        passed: "Aprovado",
        failed: "Reprovado",
        notAttempted: "Não tentado"
      },
      evaluationType: {
        positionnement: "Quiz de posicionamento",
        module_mixed: "Quiz de treino",
        module_case: "Casos práticos (opcionais)",
        finale: "Quiz de validação final"
      }
    },
    pdf: {
      generatedOn: "Gerado em",
      at: "às",
      studyGuide: {
        title: "Guia de estudo"
      },
      evaluation: {
        title: "Avaliação de Caso Prático",
        module: "Módulo",
        score: "Pontuação",
        strengths: "Pontos fortes",
        improvements: "Pontos a melhorar",
        comments: "Comentários detalhados"
      },
      conversation: {
        you: "Você",
        assistant: "Assistente"
      }
    }
  }
}
,
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;