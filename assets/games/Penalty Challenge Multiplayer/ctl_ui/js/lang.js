var TEXT_ORIGINAL_LANGUAGE = ["English","Español","Français","Deutsch","Português","Italiano","Русский","Türkçe","العربية","हिंदी","bahasa Indonesia","日本語","简体中文"];
var TEXT_CREDITS_URL = "https://www.codethislab.com";
var TEXT_MY_PROFILE = "My Profile";
var TEXT_EDIT_PROFILE = "Edit Profile";
var TEXT_LOGIN = "Login";
var TEXT_SETTINGS = "Settings";
var TEXT_LANGUAGE = "Language";
var TEXT_FULLSCREEN_OFF = "Full Screen Mode Off";
var TEXT_FULLSCREEN_ON = "Full Screen Mode On";
var TEXT_AUDIO_OFF = "Audio Off";
var TEXT_AUDIO_ON = "Audio On";
var TEXT_GAME_OPTION = "Game Option";
var TEXT_MAIN_MENU = "Main Menu";
var TEXT_LEADERBOARD = "Leaderboard";
var TEXT_ONLINE_ROOMS = "Online Rooms";
var TEXT_REPORT_BUG = "Report a bug";
var TEXT_STATS = "Stats";
var TEXT_MORE_GAMES = "More Games";
var TEXT_MORE_GAMES_EXP = "DO YOU WANNA PLAY MORE GAMES?\n\nCLICK OK TO WATCH OUR CATALOG";
var TEXT_CREDITS = "Credits";
var TEXT_LOGOUT = "Sign Out";
var TEXT_REGISTER = "Register";
var TEXT_CLOSE = "Close";
var TEXT_EMAIL = "Email address";
var TEXT_PWD = "Password";
var TEXT_SUBMIT = "Submit";
var TEXT_NO_LEADERBOARD = "NO LEADERBOARD AVAILABLE";
var TEXT_PLS_LOGIN = "PLEASE LOGIN TO ACCESS THIS FEATURE";
var TEXT_FEATURED_GAMES = "Featured Games";
var TEXT_OTHER_GAMES = "Other Games";
var TEXT_SEND_EMAIL = "Please write us at";
var TEXT_RANKING = "RANKING";
var TEXT_WINS = "WINS";
var TEXT_DEUCES = "DEUCES";
var TEXT_LOSSES = "DEFEATS";
var TEXT_WIN_PERC = "WIN%";

/*********LEADERBOARD TEXTS******************/
var TEXT_LEADERBOARD = "Leaderboard";
var TEXT_POSITION = "#";
var TEXT_RANK = "Rank";
var TEXT_NICKNAME = "Nickname";
var TEXT_POINTS = "Score";
var TEXT_GENERAL_LEADERBOARD = "General";
var TEXT_MONTHLY_LEADERBOARD = "Monthly";
var TEXT_DAILY_LEADERBOARD = "Daily";
/***************************/
var TEXT_TERMS_OF_USE = "Terms of Use (EULA)";
var TEXT_PRIVACY = "Privacy Policy";
var TEXT_TERMS_OF_USE_URL = "";
var TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
var TEXT_REMOVE_ADS = "Remove Ads";

function refreshLanguageGUIController(){
	
	switch(s_iCurLang){
		case LANG_EN:{
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_MY_PROFILE = "My Profile";
			TEXT_EDIT_PROFILE = "Edit Profile";
			TEXT_LOGIN = "Login";
			TEXT_SETTINGS = "Settings";
			TEXT_LANGUAGE = "Language";
			TEXT_FULLSCREEN_OFF = "Full Screen Mode Off";
			TEXT_FULLSCREEN_ON =  "Full Screen Mode On";
			TEXT_AUDIO_OFF = "Audio Off";
			TEXT_AUDIO_ON = "Audio On";
			TEXT_GAME_OPTION = "Game Option";
			TEXT_MAIN_MENU = "Main Menu";
			TEXT_LEADERBOARD = "Leaderboard";
			TEXT_ONLINE_ROOMS = "Online Rooms";
			TEXT_REPORT_BUG = "Report a Bug";
			TEXT_STATS = "Stats";
			TEXT_MORE_GAMES = "More Games";
			TEXT_MORE_GAMES_EXP = "DO YOU WANNA PLAY MORE GAMES?\n\nCLICK OK TO WATCH OUR CATALOG";
			TEXT_CREDITS = "Credits";
			TEXT_LOGOUT = "Sign Out";
			TEXT_REGISTER = "Register";
			TEXT_CLOSE = "Close";
			TEXT_EMAIL = "Email address";
			TEXT_PWD = "Password";
			TEXT_SUBMIT = "Submit";
			TEXT_NO_LEADERBOARD = "NO LEADERBOARD AVAILABLE";
			TEXT_PLS_LOGIN = "PLEASE LOGIN TO ACCESS THIS FEATURE";
			TEXT_FEATURED_GAMES = "Featured Games";
			TEXT_OTHER_GAMES = "Other Games";
			TEXT_SEND_EMAIL = "Please write us at";
			TEXT_RANKING = "RANKING";
			TEXT_WINS = "WINS";
			TEXT_DEUCES = "DEUCES";
			TEXT_LOSSES = "DEFEATS";
			TEXT_WIN_PERC = "WIN%";
			
			TEXT_LEADERBOARD = "Leaderboard";
			TEXT_POSITION = "#";
			TEXT_RANK = "Rank";
			TEXT_NICKNAME = "Nickname";
			TEXT_POINTS = "Score";
			TEXT_GENERAL_LEADERBOARD = "General";
			TEXT_MONTHLY_LEADERBOARD = "Monthly";
			TEXT_DAILY_LEADERBOARD = "Daily";
			
			TEXT_TERMS_OF_USE = "Terms of Use (EULA)";
			TEXT_PRIVACY = "Privacy Policy";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Remove Ads";
			break;
		}
		case LANG_RU:{
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_MY_PROFILE = "Мой профиль ";
			TEXT_EDIT_PROFILE = "Редактировать профиль";
			TEXT_LOGOUT = "Выйти";
			TEXT_LOGIN = "Войти";
			TEXT_SETTINGS = "Настройки";
			TEXT_LANGUAGE = "Язык";
			TEXT_FULLSCREEN_OFF = "Режим полного экрана выкл";
			TEXT_FULLSCREEN_ON = "Режим полного экрана вкл";
			TEXT_AUDIO_OFF = "Звук выкл";
			TEXT_AUDIO_ON = "Звук вкл";
			TEXT_GAME_OPTION = "Опции игры";
			TEXT_MAIN_MENU = "Главное меню";
			TEXT_LEADERBOARD = "Таблица лидеров";
			TEXT_ONLINE_ROOMS = "Онлайн-комнаты";
			TEXT_REPORT_BUG = "Сообщить о баге";
			TEXT_STATS = "Статистика";
			TEXT_MORE_GAMES = "Больше игр";
			TEXT_MORE_GAMES_EXP = "ВЫ ХОТИТЕ ИГРАТЬ БОЛЬШЕ ИГРЫ?\n\nНАЖМИТЕ OK, ЧТОБЫ ПОСМОТРЕТЬ НАШ КАТАЛОГ";
			TEXT_CREDITS = "Кредиты";
			
			TEXT_REGISTER = "Регистрация";
			TEXT_CLOSE = "Закрыть";
			TEXT_EMAIL = "Адрес электронной почты";
			TEXT_PWD = "Пароль";
			TEXT_SUBMIT = "Отправить";
			TEXT_NO_LEADERBOARD = "ТАБЛИЦА ЛИДЕРОВ НЕДОСТУПНА";
			TEXT_PLS_LOGIN = "ПОЖАЛУЙСТА, ВОЙДИТЕ, ЧТОБЫ ПОЛЬЗОВАТЬСЯ ЭТОЙ ФУНКЦИЕЙ";
			TEXT_FEATURED_GAMES = "Рекомендуемые игры";
			TEXT_OTHER_GAMES = " Другие игры";
			TEXT_SEND_EMAIL = "Пожалуйста, напишите нам на";
			TEXT_RANKING = "Рейтинг";
			TEXT_WINS = "ПОБЕДЫ";
			TEXT_DEUCES = "НИЧЬИ";
			TEXT_LOSSES = "ПОРАЖЕНИЯ";
			TEXT_WIN_PERC = "% ПОБЕД";
			
			TEXT_LEADERBOARD = "Таблица лидеров";
			TEXT_POSITION = "#";
			TEXT_RANK = "Ранг";
			TEXT_NICKNAME = "Никнейм";
			TEXT_POINTS = "Счет";
			TEXT_GENERAL_LEADERBOARD = "Общий";
			TEXT_MONTHLY_LEADERBOARD = "Ежемесячный";
			TEXT_DAILY_LEADERBOARD = "Ежедневный";
			
			TEXT_TERMS_OF_USE = "Условия использования (EULA)";
			TEXT_PRIVACY = "Политика конфиденциальности";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Убрать рекламу";
			break;
		}
		case LANG_ES:{
			TEXT_MY_PROFILE = "Mi Perfil";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "Editar Perfil";
			TEXT_LOGOUT = "Cerrar Sesión";
			TEXT_LOGIN = "Iniciar Sesión";
			TEXT_SETTINGS = "Configuración";
			TEXT_LANGUAGE = "Idioma";
			TEXT_FULLSCREEN_OFF = "Modo Pantalla Completa Desactivado";
			TEXT_FULLSCREEN_ON = "Modo Pantalla Completa Activado";
			TEXT_AUDIO_OFF = "Audio Desactivado";
			TEXT_AUDIO_ON = "Audio Activado";
			TEXT_GAME_OPTION = "Opción de Juego";
			TEXT_MAIN_MENU = "Menú Principal";
			TEXT_LEADERBOARD = "Tabla de Clasificación";
			TEXT_ONLINE_ROOMS = "Salas en Línea";
			TEXT_REPORT_BUG = "Reportar un Error";
			TEXT_STATS = "Estadísticas";
			TEXT_MORE_GAMES = "Más Juegos";
			TEXT_MORE_GAMES_EXP = "¿QUIERES JUGAR MÁS JUEGOS?\n\nHAGA CLIC EN ACEPTAR PARA VER NUESTRO CATÁLOGO";
			TEXT_CREDITS = "Créditos";
			TEXT_REGISTER = "Registrarse";
			TEXT_CLOSE = "Cerrar";
			TEXT_EMAIL = "Dirección de Correo Electrónico";
			TEXT_PWD = "Contraseña";
			TEXT_SUBMIT = "Enviar";
			TEXT_NO_LEADERBOARD = "NO HAY TABLA DE CLASIFICACIÓN DISPONIBLE";
			TEXT_PLS_LOGIN = "POR FAVOR INICIA SESIÓN PARA ACCEDER A ESTA FUNCIÓN";
			TEXT_FEATURED_GAMES = "Uegos Destacados";
			TEXT_OTHER_GAMES = "Otros Juegos";
			TEXT_SEND_EMAIL = "Por favor escríbanos a";
			TEXT_RANKING = "CLASIFICACIÓN";
			TEXT_WINS = "VICTORIAS";
			TEXT_DEUCES = "EMPATES";
			TEXT_LOSSES = "DERROTAS";
			TEXT_WIN_PERC = "% VICTORIAS";

			TEXT_LEADERBOARD = "Tabla de Clasificación";
			TEXT_POSITION = "#";
			TEXT_RANK = "Rango";
			TEXT_NICKNAME = "Apodo";
			TEXT_POINTS = "Puntuación";
			TEXT_GENERAL_LEADERBOARD = "General";
			TEXT_MONTHLY_LEADERBOARD = "Mensual";
			TEXT_DAILY_LEADERBOARD = "Diario";
			
			TEXT_TERMS_OF_USE = "Términos de uso (EULA)";
			TEXT_PRIVACY = "Política de Privacidad";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Eliminar anuncios";
			break;
		}
		case LANG_FR:{
			TEXT_MY_PROFILE = "Mon Profil";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "Modifier le Profil";
			TEXT_LOGOUT = "Déconnexion";
			TEXT_LOGIN = "Connexion";
			TEXT_SETTINGS = "Paramètres";
			TEXT_LANGUAGE = "Langue";
			TEXT_FULLSCREEN_OFF = "Mode Plein Écran Désactivé";
			TEXT_FULLSCREEN_ON = "Mode Plein Écran Activé";
			TEXT_AUDIO_OFF = "Audio Désactivé";
			TEXT_AUDIO_ON = "Audio Activé";
			TEXT_GAME_OPTION = "Option de Jeu";
			TEXT_MAIN_MENU = "Menu Principal";
			TEXT_LEADERBOARD = "Classement";
			TEXT_ONLINE_ROOMS = "Salles en Ligne";
			TEXT_REPORT_BUG = "Signaler un Bug";
	
			TEXT_STATS = "Statistiques";
			TEXT_MORE_GAMES = "Plus de Jeux";
			TEXT_MORE_GAMES_EXP = "VOUS VOULEZ JOUER PLUS DE JEUX ?\n\nCLIQUEZ SUR OK POUR CONSULTER NOTRE CATALOGUE";
			TEXT_CREDITS = "Crédits";
			TEXT_REGISTER = "S'Inscrire";
			TEXT_CLOSE = "Fermer";
			TEXT_EMAIL = "Adresse Email";
			TEXT_PWD = "Mot de Passe";
			TEXT_SUBMIT = "Soumettre";
			TEXT_NO_LEADERBOARD = "UCUN CLASSEMENT DISPONIBLE";
			TEXT_PLS_LOGIN = "VEUILLEZ VOUS CONNECTER POUR ACCÉDER À CETTE FONCTION";
			TEXT_FEATURED_GAMES = "Jeux Mis en Avant";
			TEXT_OTHER_GAMES = "Autres Jeux";
			TEXT_SEND_EMAIL = "Veuillez nous écrire à";
			TEXT_RANKING = "CLASSEMENT";
			TEXT_WINS = "VICTOIRES";
			TEXT_DEUCES = "MATCHS NULS";
			TEXT_LOSSES = "DÉFAITES";
			TEXT_WIN_PERC = "% DE VICTOIRES";
			
			TEXT_LEADERBOARD = "Classement";
			TEXT_POSITION = "#";
			TEXT_RANK = "Rang";
			TEXT_NICKNAME = "Pseudo";
			TEXT_POINTS = "Score";
			TEXT_GENERAL_LEADERBOARD = "Général";
			TEXT_MONTHLY_LEADERBOARD = "Mensuel";
			TEXT_DAILY_LEADERBOARD = "Quotidien";
			
			TEXT_TERMS_OF_USE = "Conditions d'utilisation (EULA)";
			TEXT_PRIVACY = "Politique de Confidentialité";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Supprimer les publicités";
			break;
		}
		case LANG_DE:{
			TEXT_MY_PROFILE = "Mein Profil";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "Profil Bearbeiten";
			TEXT_LOGOUT = "Abmelden";
			TEXT_LOGIN = "Anmelden";
			TEXT_SETTINGS = "Einstellungen";
			TEXT_LANGUAGE = "Sprache";
			TEXT_FULLSCREEN_OFF = "Vollbildmodus Aus";
			TEXT_FULLSCREEN_ON = "Vollbildmodus An";
			TEXT_AUDIO_OFF = "Audio Aus";
			TEXT_AUDIO_ON = "Audio An";
			TEXT_GAME_OPTION = "Spieleinstellung";
			TEXT_MAIN_MENU = "Hauptmenü";
			TEXT_LEADERBOARD = "Bestenliste";
			TEXT_ONLINE_ROOMS = "Online-Räume";
			TEXT_REPORT_BUG = "Fehler Melden";

			TEXT_STATS = "Statistiken";
			TEXT_MORE_GAMES = "Mehr Spiele";
			TEXT_MORE_GAMES_EXP = "MÖCHTEN SIE MEHR SPIELE SPIELEN?\n\nKLICKEN SIE AUF OK, UM UNSEREN KATALOG ZU SEHEN";
			TEXT_CREDITS = "Credits";
			
			TEXT_REGISTER = "Registrieren";
			TEXT_CLOSE = "Schließen";
			TEXT_EMAIL = "E-Mail-Adresse";
			TEXT_PWD = "Passwort";

			TEXT_SUBMIT = "Absenden";
			TEXT_NO_LEADERBOARD = "KEINE BESTENLISTE VERFÜGBAR";
			TEXT_PLS_LOGIN = "BITTE ANMELDEN, UM AUF DIESE FUNKTION ZUZUGREIFEN";
			TEXT_FEATURED_GAMES = "Ausgewählte Spiele";
			TEXT_OTHER_GAMES = "Andere Spiele";
			TEXT_SEND_EMAIL = "Bitte schreiben Sie uns unter";
			TEXT_RANKING = "RANG";
			TEXT_WINS = "SIEGE";
			TEXT_DEUCES = "UNENTSCHIEDEN";
			TEXT_LOSSES = "NIEDERLAGEN";
			TEXT_WIN_PERC = "SIEG-%";
			
			TEXT_LEADERBOARD = "Bestenliste";
			TEXT_POSITION = "#";
			TEXT_RANK = "Rang";
			TEXT_NICKNAME = "Spitzname";
			TEXT_POINTS = "Punktzahl";
			TEXT_GENERAL_LEADERBOARD = "Allgemein";
			TEXT_MONTHLY_LEADERBOARD = "Monatlich";
			TEXT_DAILY_LEADERBOARD = "Täglich";
			
			TEXT_TERMS_OF_USE = "Nutzungsbedingungen (EULA)";
			TEXT_PRIVACY = "Datenschutzerklärung";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Werbung entfernen";
			break;
		}
		case LANG_PT:{
			TEXT_MY_PROFILE = "Meu Perfil";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "Editar Perfil";
			TEXT_LOGOUT = "Sair";
			TEXT_LOGIN = "Entrar";
			TEXT_SETTINGS = "Configurações";
			TEXT_LANGUAGE = "Idioma";
			TEXT_FULLSCREEN_OFF = "Modo Tela Cheia Desativado";
			TEXT_FULLSCREEN_ON = "Modo Tela Cheia Ativado";
			TEXT_AUDIO_OFF = "Áudio Desativado";
			TEXT_AUDIO_ON = "Áudio Ativado";
			TEXT_GAME_OPTION = "Opção de Jogo";
			TEXT_MAIN_MENU = "Menu Principal";
			TEXT_LEADERBOARD = "Tabela de Classificação";
			TEXT_ONLINE_ROOMS = "Salas Online";
			TEXT_REPORT_BUG = "Relatar um Bug";
		
			TEXT_STATS = "Estatísticas";
			TEXT_MORE_GAMES = "Mais Jogos";
			TEXT_MORE_GAMES_EXP = "VOCÊ QUER JOGAR MAIS JOGOS?\n\nCLIQUE EM OK PARA VER NOSSO CATÁLOGO";
			TEXT_CREDITS = "Créditos";
			
			TEXT_REGISTER = "Registrar-se";
			TEXT_CLOSE = "Fechar";
			TEXT_EMAIL = "Endereço de Email";
			TEXT_PWD = "Senha";

			TEXT_SUBMIT = "Enviar";
			TEXT_NO_LEADERBOARD = "NÃO HÁ TABELA DE CLASSIFICAÇÃO DISPONÍVEL";
			TEXT_PLS_LOGIN = "POR FAVOR, FAÇA LOGIN PARA ACESSAR ESTA FUNÇÃO";
			TEXT_FEATURED_GAMES = "Jogos em Destaque";
			TEXT_OTHER_GAMES = "Outros Jogos";
			TEXT_SEND_EMAIL = "Por favor, escreva-nos em";
			TEXT_RANKING = "CLASSIFICAÇÃO";
			TEXT_WINS = "VITÓRIAS";
			TEXT_DEUCES = "EMPATES";
			TEXT_LOSSES = "DERROTAS";
			TEXT_WIN_PERC = "% de VITÓRIAS";
			
			TEXT_LEADERBOARD = "Tabela de Classificação";
			TEXT_POSITION = "#";
			TEXT_RANK = "Classificação";
			TEXT_NICKNAME = "Apelido";
			TEXT_POINTS = "Pontuação";
			TEXT_GENERAL_LEADERBOARD = "Geral";
			TEXT_MONTHLY_LEADERBOARD = "Mensal";
			TEXT_DAILY_LEADERBOARD = "Diário";
			
			TEXT_TERMS_OF_USE = "Termos de Uso (EULA)";
			TEXT_PRIVACY = "Política de Privacidade";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Remover anúncios";
			break;
		}
		case LANG_IT:{
			TEXT_MY_PROFILE = "Il Mio Profilo";
			TEXT_CREDITS_URL = "https://www.codethislab.it";
			TEXT_EDIT_PROFILE = "Modifica Profilo";
			TEXT_LOGOUT = "Esci";
			TEXT_LOGIN = "Accedi";
			TEXT_SETTINGS = "Impostazioni";
			TEXT_LANGUAGE = "Lingua";
			TEXT_FULLSCREEN_OFF = "Modalità Schermo Intero Disattivata";
			TEXT_FULLSCREEN_ON = "Modalità Schermo Intero Attivata";
			TEXT_AUDIO_OFF = "Audio Disattivato";
			TEXT_AUDIO_ON = "Audio Attivato";
			TEXT_GAME_OPTION = "Opzioni di Gioco";
			TEXT_MAIN_MENU = "Menu Principale";
			TEXT_LEADERBOARD = "Classifica";
			TEXT_ONLINE_ROOMS = "Stanze Online";
			TEXT_REPORT_BUG = "Segnala un Bug";

			TEXT_STATS = "Statistiche";
			TEXT_MORE_GAMES = "Altri Giochi";
			TEXT_MORE_GAMES_EXP = "VUOI GIOCARE A PIÙ GIOCHI?\n\nCLICCA OK PER GUARDARE IL NOSTRO CATALOGO";
			TEXT_CREDITS = "Crediti";
			
			TEXT_REGISTER = "Registrati";
			TEXT_CLOSE = "Chiudi";
			TEXT_EMAIL = "Indirizzo Email";
			TEXT_PWD = "Password";
	
			TEXT_SUBMIT = "Invia";
			TEXT_NO_LEADERBOARD = "Nessuna Classifica Disponibile";
			TEXT_PLS_LOGIN = "Effettua il Login per accedere a questa funzione";
			TEXT_FEATURED_GAMES = "Giochi in Primo Piano";
			TEXT_OTHER_GAMES = "Altri Giochi";
			TEXT_SEND_EMAIL = "Per favore scrivici a";
			TEXT_RANKING = "RANKING";
			TEXT_WINS = "VITTORIE";
			TEXT_DEUCES = "PAREGGI";
			TEXT_LOSSES = "SCONFITTE";
			TEXT_WIN_PERC = "PERCENTUALE DI VITTORIE %";

			TEXT_LEADERBOARD = "Classifica";
			TEXT_POSITION = "#";
			TEXT_RANK = "Grado";
			TEXT_NICKNAME = "Nickname";
			TEXT_POINTS = "Punti";
			TEXT_GENERAL_LEADERBOARD = "Generale";
			TEXT_MONTHLY_LEADERBOARD = "Mensile";
			TEXT_DAILY_LEADERBOARD = "Giornaliero";
			
			TEXT_TERMS_OF_USE = "Termini e Condizioni (EULA)";
			TEXT_PRIVACY = "Informativa sulla Privacy";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Rimuovi pubblicità";
			break;
		}
		case LANG_TR:{
			TEXT_MY_PROFILE = "Profilim";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "Profili Düzenle";
			TEXT_LOGOUT = "Çıkış Yap";
			TEXT_LOGIN = "Giriş Yap";
			TEXT_SETTINGS = "Ayarlar";
			TEXT_LANGUAGE = "Dil";
			TEXT_FULLSCREEN_OFF = "Tam Ekran Modu Kapali";
			TEXT_FULLSCREEN_ON = "am Ekran Modu Açik";
			TEXT_AUDIO_OFF = "Ses Kapali";
			TEXT_AUDIO_ON = "Ses Açik";
			TEXT_GAME_OPTION = "Oyun Seçenekleri";
			TEXT_MAIN_MENU = "Ana Menü";
			TEXT_LEADERBOARD = "Liderlik Tablosu";
			TEXT_ONLINE_ROOMS = "Çevrimiçi Odalar";
			TEXT_REPORT_BUG = "Hata Bildir";

			TEXT_STATS = "İstatistikler";
			TEXT_MORE_GAMES = "Daha Fazla Oyun";
			TEXT_MORE_GAMES_EXP = "DAHA FAZLA OYUN OYNAMAK İSTER MİSİNİZ?\n\nKATALOĞUMUZU İZLEMEK İÇİN TAMAM'I TIKLAYIN";
			TEXT_CREDITS = "Krediler";
			
			TEXT_REGISTER = "Kayıt Ol";
			TEXT_CLOSE = "Kapat";
			TEXT_EMAIL = "E-posta Adresi";
			TEXT_PWD = "Şifre";
	
			TEXT_SUBMIT = "Gönder";
			TEXT_NO_LEADERBOARD = "LİDER TABLOSU YOK";
			TEXT_PLS_LOGIN = "LÜTFEN BU ÖZELLİĞE ERİŞMEK İÇİN GİRİŞ YAPIN";
			TEXT_FEATURED_GAMES = "Öne Çıkan Oyunlar";
			TEXT_OTHER_GAMES = "Diğer Oyunlar";
			TEXT_SEND_EMAIL = "Lütfen bize şuradan yazın";
			TEXT_RANKING = "SIRALAMA";
			TEXT_WINS = "GALİBİYET";
			TEXT_DEUCES = "BERABERLİKLER";
			TEXT_LOSSES = "KAYBETMELER";
			TEXT_WIN_PERC = "KAZANMA%";
			
			TEXT_LEADERBOARD = "Liderlik Tablosu";
			TEXT_POSITION = "#";
			TEXT_RANK = "Sıra";
			TEXT_NICKNAME = "Takma ad";
			TEXT_POINTS = "Skor";
			TEXT_GENERAL_LEADERBOARD = "Genel";
			TEXT_MONTHLY_LEADERBOARD = "Aylık";
			TEXT_DAILY_LEADERBOARD = "Günlük";
			
			TEXT_TERMS_OF_USE = "Kullanım Koşulları (EULA)";
			TEXT_PRIVACY = "Gizlilik Politikası";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Reklamları kaldır";
			break;
		}
		case LANG_AR:{
			TEXT_MY_PROFILE = "ملفّي";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "تحرير الملف الشخصي ";
			TEXT_LOGOUT = "تسجيل الخروج";
			TEXT_LOGIN = "تسجيل الدخول";
			TEXT_SETTINGS = "الإعدادات";
			TEXT_LANGUAGE = "اللغة";
			TEXT_FULLSCREEN_OFF = "وضع الشاشة الكاملة معطل";
			TEXT_FULLSCREEN_ON = "وضع الشاشة الكاملة مفعل";
			TEXT_AUDIO_OFF = "الصوت معطل";
			TEXT_AUDIO_ON = "الصوت مفعل";
			TEXT_GAME_OPTION = "خيار اللعبة";
			TEXT_MAIN_MENU = "القائمة الرئيسية";
			TEXT_LEADERBOARD = "لائحة الرتب";
			TEXT_ONLINE_ROOMS = "غرف الإنترنت";
			TEXT_REPORT_BUG = "الإبلاغ عن خطأ";

			TEXT_STATS = "إحصائيات";
			TEXT_MORE_GAMES = "المزيد من الألعاب";
			TEXT_MORE_GAMES_EXP = "هل تريد تشغيل المزيد من الألعاب؟ \n \n انقر فوق موافق لمشاهدة كتالوجنا";
			TEXT_CREDITS = "اعتمادات";
			
			TEXT_REGISTER = "تسجيل";
			TEXT_CLOSE = "إغلاق";
			TEXT_EMAIL = "عنوان البريد الإلكتروني";
			TEXT_PWD = "كلمة المرور";
		
			TEXT_SUBMIT = "إرسال";
			TEXT_NO_LEADERBOARD = "لا يوجد لائحة رتب متاحة";
			TEXT_PLS_LOGIN = "يرجى تسجيل الدخول للوصول إلى هذه الميزة";
			TEXT_FEATURED_GAMES = "ألعاب مميزة";
			TEXT_OTHER_GAMES = "ألعاب أخرى";
			TEXT_SEND_EMAIL = "يرجى الكتابة إلينا على";
			TEXT_RANKING = "الترتيب";
			TEXT_WINS = "فوز";
			TEXT_DEUCES = "التعادلات";
			TEXT_LOSSES = "الهزائم";
			TEXT_WIN_PERC = "الانتصار%";
			
			TEXT_LEADERBOARD = " لوحة المتصدرين";
			TEXT_POSITION = "#";
			TEXT_RANK = "ترتيب";
			TEXT_NICKNAME = "اسم مستعار";
			TEXT_POINTS = "النتيجة";
			TEXT_GENERAL_LEADERBOARD = "عام";
			TEXT_MONTHLY_LEADERBOARD = "شهرياً";
			TEXT_DAILY_LEADERBOARD = "يومي";
			
			TEXT_TERMS_OF_USE = "شروط الاستخدام (EULA)";
			TEXT_PRIVACY = "سياسة الخصوصية" ;
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "إزالة الإعلانات";
			break;
		}
		case LANG_HI:{
			TEXT_MY_PROFILE = "मेरी प्रोफ़ाइल";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "प्रोफ़ाइल संपादित करें";
			TEXT_LOGOUT = "लॉग आउट करें";
			TEXT_LOGIN = "लॉगिन करें ";
			TEXT_SETTINGS = "सेटिंग्स";
			TEXT_LANGUAGE = "भाषा";
			TEXT_FULLSCREEN_OFF = "पूर्ण स्क्रीन मोड बंद";
			TEXT_FULLSCREEN_ON = "पूर्ण स्क्रीन मोड चालू";
			TEXT_AUDIO_OFF = "ऑडियो बंद";
			TEXT_AUDIO_ON = "ऑडियो चालू";
			TEXT_GAME_OPTION = "खेल विकल्प";
			TEXT_MAIN_MENU = "मुख्य मेनू ";
			TEXT_LEADERBOARD = "लीडरबोर्ड ";
			TEXT_ONLINE_ROOMS = "ऑनलाइन कमरे";
			TEXT_REPORT_BUG = "बग की रिपोर्ट करें";

			TEXT_STATS = "सांख्यिकी";
			TEXT_MORE_GAMES = "अधिक खेल";
			TEXT_MORE_GAMES_EXP = "क्या आप और गेम खेलना चाहते हैं?\n\nहमारी सूची देखने के लिए ठीक क्लिक करें";
			TEXT_CREDITS = "क्रेडिट्स";
			
			TEXT_REGISTER = "रजिस्टर ";
			TEXT_CLOSE = "बंद करें";
			TEXT_EMAIL = "ईमेल पता";
			TEXT_PWD = "पासवर्ड ";
		
			TEXT_SUBMIT = "प्रस्तुत";
			TEXT_NO_LEADERBOARD = "कोई लीडरबोर्ड उपलब्ध नहीं है";
			TEXT_PLS_LOGIN = "कृपया इस सुविधा का उपयोग करने के लिए लॉगिन करें";
			TEXT_FEATURED_GAMES = "विशेष खेल";
			TEXT_OTHER_GAMES = "अन्य खेल";
			TEXT_SEND_EMAIL = "कृपया हमें इस पते पर लिखें";
			TEXT_RANKING = "रैंकिंग";
			TEXT_WINS = "जीत";
			TEXT_DEUCES = "ड्यूस";
			TEXT_LOSSES = "हार";
			TEXT_WIN_PERC = "जीत%";
			
			TEXT_LEADERBOARD = "लीडरबोर्ड";
			TEXT_POSITION ="#";
			TEXT_RANK = "रैंक";
			TEXT_NICKNAME = "उपनाम";
			TEXT_POINTS = "स्कोर";
			TEXT_GENERAL_LEADERBOARD = "सामान्य";
			TEXT_MONTHLY_LEADERBOARD = "मासिक";
			TEXT_DAILY_LEADERBOARD = "दैनिक ";
			
			TEXT_TERMS_OF_USE = "उपयोग की शर्तें (EULA)";
			TEXT_PRIVACY = "गोपनीयता नीति";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "विज्ञापन हटाएँ";
			break;
		}
		case LANG_ID:{
			TEXT_MY_PROFILE = "Profil Saya";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "Edit Profil";
			TEXT_LOGOUT = "Keluar";
			TEXT_LOGIN = "Masuk";
			TEXT_SETTINGS = "Pengaturan";
			TEXT_LANGUAGE = "Bahasa";
			TEXT_FULLSCREEN_OFF = "Mode Layar Penuh Mati";
			TEXT_FULLSCREEN_ON = "Mode Layar Penuh Hidup";
			TEXT_AUDIO_OFF = "Audio Mati";
			TEXT_AUDIO_ON = "Audio Hidup";
			TEXT_GAME_OPTION = "Opsi Permainan";
			TEXT_MAIN_MENU = "Menu Utama";
			TEXT_LEADERBOARD = "Papan Pemimpin";
			TEXT_ONLINE_ROOMS = "Ruang Online";
			TEXT_REPORT_BUG = "Laporkan Bug";

			TEXT_STATS = "Statistik";
			TEXT_MORE_GAMES = "Lebih Banyak Permainan";
			TEXT_MORE_GAMES_EXP = "APAKAH ANDA INGIN BERMAIN GAME LAINNYA?\n\nKLIK Oke UNTUK MENONTON KATALOG KAMI";
			TEXT_CREDITS = "Kredit";
		
			TEXT_REGISTER = "Daftar";
			TEXT_CLOSE = "Tutup";
			TEXT_EMAIL = "Alamat Email";
			TEXT_PWD = "Kata Sandi";
			
			TEXT_SUBMIT = "Kirim";
			TEXT_NO_LEADERBOARD = "TIDAK ADA PAPAN PEMIMPIN TERSEDIA";
			TEXT_PLS_LOGIN = "SILAKAN MASUK UNTUK MENGAKSES FITUR INI";
			TEXT_FEATURED_GAMES = "Permainan Unggulan";
			TEXT_OTHER_GAMES = "Permainan Lainnya";
			TEXT_SEND_EMAIL = "Silakan tulis kami di";
			TEXT_RANKING = "PERINGKAT";
			TEXT_WINS = "KEMENANGAN";
			TEXT_DEUCES = "SERI";
			TEXT_LOSSES = "KALAH";
			TEXT_WIN_PERC = "MENANG%";
			
			TEXT_LEADERBOARD = "Papan Peringkat";
			TEXT_POSITION = "#";
			TEXT_RANK = "Peringkat";
			TEXT_NICKNAME = "Nama Panggilan";
			TEXT_POINTS = "Skor";
			TEXT_GENERAL_LEADERBOARD = "Umum";
			TEXT_MONTHLY_LEADERBOARD = "Bulanan";
			TEXT_DAILY_LEADERBOARD = "Harian";
			
			TEXT_TERMS_OF_USE = "Ketentuan Penggunaan (EULA)";
			TEXT_PRIVACY = "Kebijakan Privasi";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "Hapus iklan";
			break;
		}
		case LANG_JA:{
			TEXT_MY_PROFILE = "プロフィール";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "プロフィールを編集する";
			TEXT_LOGOUT = "ログアウト";
			TEXT_LOGIN = "ログイン";
			TEXT_SETTINGS = "設定";
			TEXT_LANGUAGE = "言語 ";
			TEXT_FULLSCREEN_OFF = "フルスクリーンモードオフ";
			TEXT_FULLSCREEN_ON = "フルスクリーンモードオン";
			TEXT_AUDIO_OFF = "オーディオオフ";
			TEXT_AUDIO_ON = "オーディオオン";
			TEXT_GAME_OPTION = "ゲームオプション";
			TEXT_MAIN_MENU = "メインメニュー";
			TEXT_LEADERBOARD = "リーダーボード";
			TEXT_ONLINE_ROOMS = "オンラインルーム";
			TEXT_REPORT_BUG = "バグを報告する";

			TEXT_STATS = "統計";
			TEXT_MORE_GAMES = "他のゲーム";
			TEXT_MORE_GAMES_EXP = "もっと ゲーム を プレイしましょうか ？ \n\n[OK]  を クリックして カタログ を ご覧ください。";
			TEXT_CREDITS = "クレジット";
		
			TEXT_REGISTER = "登録";
			TEXT_CLOSE = "閉じる";
			TEXT_EMAIL = "電子メールアドレス";
			TEXT_PWD = "パスワード";
		
			TEXT_SUBMIT = "送信";
			TEXT_NO_LEADERBOARD = "利用可能なリーダーボードはありません";
			TEXT_PLS_LOGIN = "この機能にアクセスするにはログインしてください";
			TEXT_FEATURED_GAMES = "注目のゲーム";
			TEXT_OTHER_GAMES = "他のゲーム";
			TEXT_SEND_EMAIL = "下記までご連絡ください";
			TEXT_RANKING = "ランキング";
			TEXT_WINS = "勝";
			TEXT_DEUCES = "ジュース";
			TEXT_LOSSES = "敗北";
			TEXT_WIN_PERC = "勝利%";
			
			TEXT_LEADERBOARD = "リーダーボード";
			TEXT_POSITION ="#";
			TEXT_RANK = "ランク";
			TEXT_NICKNAME = "ニックネーム";
			TEXT_POINTS = "スコア";
			TEXT_GENERAL_LEADERBOARD = " 一般";
			TEXT_MONTHLY_LEADERBOARD = "月次";
			TEXT_DAILY_LEADERBOARD = "日々の";
			
			TEXT_TERMS_OF_USE = "利用規約 (EULA)";
			TEXT_PRIVACY = "プライバシー ポリシー";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "広告を削除する";
			break;
		}
		case LANG_ZH:{
			TEXT_MY_PROFILE = "我的档案";
			TEXT_CREDITS_URL = "https://www.codethislab.com";
			TEXT_EDIT_PROFILE = "编辑档案";
			TEXT_LOGOUT = "登出";
			TEXT_LOGIN = "登录";
			TEXT_SETTINGS = "设置";
			TEXT_LANGUAGE = "语言";
			TEXT_FULLSCREEN_OFF = "关闭全屏模式";
			TEXT_FULLSCREEN_ON = "打开全屏模式";
			TEXT_AUDIO_OFF = "关闭音频";
			TEXT_AUDIO_ON = "打开音频";
			TEXT_GAME_OPTION = "游戏选项";
			TEXT_MAIN_MENU = "主菜单";
			TEXT_LEADERBOARD = "排行榜";
			TEXT_ONLINE_ROOMS = "在线房间";
			TEXT_REPORT_BUG = "报告错误";

			TEXT_STATS = "统计数据";
			TEXT_MORE_GAMES = "更多游戏";
			TEXT_MORE_GAMES_EXP = "你 想 玩 更 多 的 游戏 吗 ？\n\n点击 [OK] 查看 目录。";
			TEXT_CREDITS = " 制作人员";
			
			TEXT_REGISTER = "注册";
			TEXT_CLOSE = "关闭";
			TEXT_EMAIL = "电子邮件地址";
			TEXT_PWD = "密码";
		
			TEXT_SUBMIT = "提交";
			TEXT_NO_LEADERBOARD = "暂无排行榜";
			TEXT_PLS_LOGIN = "请登录以使用此功能";
			TEXT_FEATURED_GAMES = "推荐游戏";
			TEXT_OTHER_GAMES = "其他游戏";
			TEXT_SEND_EMAIL = "请写信给我们";
			TEXT_RANKING = "排名";
			TEXT_WINS = "胜利";
			TEXT_DEUCES = "平局";
			TEXT_LOSSES = "失败";
			TEXT_WIN_PERC = "胜率";
			
			TEXT_LEADERBOARD = "排行榜";
			TEXT_POSITION = "#";
			TEXT_RANK = "等级";
			TEXT_NICKNAME = "昵称";
			TEXT_POINTS = "分数";
			TEXT_GENERAL_LEADERBOARD = "总体";
			TEXT_MONTHLY_LEADERBOARD = "月度";
			TEXT_DAILY_LEADERBOARD = "日常";
			
			TEXT_TERMS_OF_USE = "使用条款（最终用户许可协议）";
			TEXT_PRIVACY = "隐私政策";
			TEXT_TERMS_OF_USE_URL = "";
			TEXT_PRIVACY_URL = "https://codethislab.com/code-this-lab-srl-apps-privacy-policy-en/";
			TEXT_REMOVE_ADS = "移除广告";
			break;
		}
	}
}