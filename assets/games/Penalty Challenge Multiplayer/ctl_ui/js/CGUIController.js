function CGUIController(){
    var _aCbCompleted;
    var _aCbOwner;
    
    var REMOVE_ADS_SUBSCRIPTION = "remove_ads_subscription";
    var REMOVE_ADS_DURABLE = "remove_ads_durable";
    var REMOVE_ADS_NULL = ""; 
    var REMOVE_ADS_TYPE = REMOVE_ADS_NULL;
    
    var LEADERBOARD_GROUP_ID;
    var NUM_LEADERBOARD_ROWS;
    var LEADERBOARD_DAY;
    var LEADERBOARD_MONTH;
    var LEADERBOARD_GENERAL;
    
    const DYNAMIC_LOADING = true; //CHECK THIS TRUE IF THERE IS ANY DYNAMIC RESOURCE LOADING
    
    var BADGE_OFFSET = [
                                        0,200,300,400,500, //RANK COPPER
                                        600,700,800,900,1000, //RANK BRONZE
                                        1200,1400,1600,1800,2000, //RANK SILVER
                                        2200,2400,2600,2800,3000, //RANK GOLD
                                        3200,3400,3600,3800,4000, //RANK PLATINUM
                                        4200,4400,4600,4800,5000, //RANK EMERALD
                                        5200,5400,5600,5800,6000, //RANK DIAMOND
                                        6200,6400,6600,6800,7000, //RANK CHAMPION
                                        10000
                        ];
    
    var WIN_POINTS = [25, 25, 25, 25,25,
                            20,20,20,20,20,
                            20, 20,20,20,20,
                            15, 15,15,15,15,
                            10, 10,10,10,10,
                            10,10,10,10,10,
                            10, 10,10,10,10,
                            10, 10,10,10,10,
                            10 ];
                                      
    var _aPlayerPos = [];
    var _aLeaderboard = [];
    var _aTaggedGames = [];
    var _aOtherGames = [];
    var _aFeaturedGames = [];
    
    var _fRequestFullScreen = null;
    var _fCancelFullScreen = null;
    
    var _bJoiningRoom;
    var _szRoomID;
    var _szPass;
    
    var _iCurLeaderboardToShow;
    var _iWins;
    var _iLosses;
    var _iTotMatches;
    var _iPlayerRanking;
    var _iCurBadgeLevel;
    var _iAmountBadges;
    var _oInfoAccessRoom = null;

    this._init = function(){
        _aCbCompleted=new Array();
        _aCbOwner =new Array();
        
        LEADERBOARD_GROUP_ID = "ranking";
        NUM_LEADERBOARD_ROWS = 8;
        LEADERBOARD_DAY = 0;
        LEADERBOARD_MONTH = 1;
        LEADERBOARD_GENERAL = 2;
        _iCurLeaderboardToShow = LEADERBOARD_GENERAL;
        
        _aLeaderboard[LEADERBOARD_DAY] = [];
        _aLeaderboard[LEADERBOARD_MONTH] = [];
        _aLeaderboard[LEADERBOARD_GENERAL] = [];
        
        _iAmountBadges = BADGE_OFFSET.length;

        this.resetPlayerValues();
        
        var doc = window.document;
        var docEl = doc.documentElement;
        _fRequestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        _fCancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        
        refreshLanguageGUIController();
        
        //CREATE MENU DIV
        var div = document.createElement('div');
        div.className = 'sidebar-menu-container';
        document.body.appendChild(div);
        
        
        this.createSideBar(true,true);
        
        this.__modalCallbacks();
        this.__modalsCallbacks();

        
        s_oNetworkManager.addEventListener(ON_USER_LOGOUT,this.onUserLogout,this);
        s_oNetworkManager.addEventListener(ON_USER_LOGGED,this.onUserLogged,this);

    };
    
    this.resetPlayerValues = function(){
        _iWins = 0;
        _iLosses = 0;
        _iTotMatches = 0;
        _iPlayerRanking = 0;
        _iCurBadgeLevel = 0; 
    };
    
    this.onRefreshRanking = function(oData){
        _iPlayerRanking = parseInt(oData.ranking);
        _iWins = parseInt(oData.win_matches);
        _iLosses = parseInt(oData.lose_matches);
        _iTotMatches = _iWins +_iLosses;
        _iCurBadgeLevel = this.calculateBadgeLevelByRanking(_iPlayerRanking);
    };
    
    this.refreshPlayerInfos = function(){
        if(!s_oNetworkManager.isLogged()){
            return;
        }
        
        s_oCurClient.bigDB.loadMyPlayerObject((myDBObject)=>{
            if(myDBObject.ranking !== undefined){
                _iPlayerRanking = parseInt(myDBObject.ranking);

                _iWins = parseInt(myDBObject.wins);
                _iLosses = parseInt(myDBObject.losses);
                _iTotMatches = parseInt(myDBObject.tot_matches);
                _iCurBadgeLevel = this.calculateBadgeLevelByRanking(_iPlayerRanking)
            }else{
                //IF USER DOESNT EXIST, CREATE DATA ON DB
                myDBObject.ranking = _iPlayerRanking;
                myDBObject.wins = _iWins;
                myDBObject.losses = _iLosses;
                myDBObject.tot_matches = _iTotMatches;

                myDBObject.save();
            }

        },function(error){
            console.log(error);
        });
    };
    
    this.addEventListener = function( iEvent,cbCompleted, cbOwner ){
        _aCbCompleted[iEvent] = cbCompleted;
        _aCbOwner[iEvent] = cbOwner; 
    };
    
    this.removeEventListener = function(iEvent){
        _aCbCompleted[iEvent] = null;
        _aCbOwner[iEvent] = null;
    };
    
    this.checkPendingInvitation = function(){
        _oInfoAccessRoom = null;
        _szRoomID = getParameterByName(PARAM_ROOM_ID);
        _szPass = getParameterByName(PARAM_PASSWORD);
        
        

        if(_szRoomID !== undefined && _szPass !== null){
            _oInfoAccessRoom = {id:_szRoomID,pass:_szPass};
            this.__createLoadingModal();

            _bJoiningRoom = true;

            window.history.replaceState(
                null,
                null,
                removeParamsFromURL([PARAM_ROOM_ID,PARAM_PASSWORD])
            );
    
            if(DYNAMIC_LOADING){
                s_oMenu._prepareResources();
            }else{
                if(s_oNetworkManager.isLogged()){
                    s_oNetworkManager.addEventListener(ON_USEROWNERROOM_JOIN_SUCCESS,this.onRoomJoined,this);

                    s_oNetworkManager.tryJoinFromInvitation(_szRoomID.toString(), _szPass.toString());
                }else{
                    this._joinRoomAsGuest();
                }
            }

        }
    };

    this.onUserLogged = function(){

        var szNick = s_oNetworkManager.filterString(s_oNetworkManager.getPlayerNickname());

        document.querySelector("#sidebar-section-login span").innerHTML = szNick;

        //SHOW LOGIN SECTION
        document.getElementById("sidebar-section-login").classList.remove('d-none');
        //HIDE LOGIN BUTTON
        document.getElementById("button_login").classList.add('d-none');
        document.getElementById("button_register").classList.add('d-none');
    };    

    this.onUserLogout = function(){
        this.resetPlayerValues();
        
        document.getElementById("sidebar-section-login").classList.add('d-none');
        document.getElementById("button_login").classList.remove('d-none');
        document.getElementById("button_register").classList.remove('d-none');
 
        if(s_bStorageAvailable){
            localStorage.removeItem(LOCALSTORAGE_STRING+"_player_login");
        }
    };
    
    this.onLogout = function(){
        s_oNetworkManager.logout();
    };
    
    this._joinRoomAsGuest = function(){
        if(document.querySelector(".block-loading-container")){
            this.__removeLoadingModal();
        }
        s_oNetworkManager.addEventListener(ON_LOGIN_SUCCESS, ()=>{
            s_oNetworkManager.tryJoinFromInvitation(_szRoomID.toString(), _szPass.toString());
        },this);

        //s_oNetworkManager.connectToSystem();
        s_oNetworkManager.login();
    };

    this.onRoomJoined = function(){
        s_oNetworkManager.removeEventListener(ON_USEROWNERROOM_JOIN_SUCCESS);
        if(document.querySelector(".block-loading-container")){
            this.__removeLoadingModal();
        }
    };
    
    this.onPlayerInfosRetrieved = function(){
        
    };
    
    this.calculateBadgeLevelByRanking = function(iRanking) {
        //console.log("iRanking "+iRanking)
        var iBadgeIndex = 0;
        for (var i = 0; i < BADGE_OFFSET.length; i++) {
                //console.log("BADGE_OFFSET["+i+"] "+BADGE_OFFSET[i])
                if (iRanking >= BADGE_OFFSET[i]) {
                    iBadgeIndex++;
                    //console.log("iBadgeIndex "+iBadgeIndex)
                } else {
                    if(iBadgeIndex === 0){
                        return 0;
                    }
                  
                    return iBadgeIndex -1;
                }
            
        }

        return iBadgeIndex-1;
    };
    
    this.getBadgePointsByIndex = function(iLevel){
        var iCont = 0;
        for (var i = 0; i < BADGE_OFFSET.length; i++) {
                if(iLevel === iCont){
                    return BADGE_OFFSET[i];
                }
                iCont++;
            
        }
        
        return BADGE_OFFSET[0];
    };
    
    this.getWinPointByRank = function(iBadgeLevel) {
        return WIN_POINTS[iBadgeLevel];
    };
    
    this.showCartButton = function() {
        document.getElementById( "cart-btn" ).classList.remove("d-none");
    };
    
    this.hideCartButton = function() {
        document.getElementById( "cart-btn" ).classList.add("d-none");
    };
    ///////////////////MENU SIDEBAR
    this.__modalCallbacks = function(){
        document.addEventListener("click", (e) => {
            var target = e.target;

            while (target && target.parentNode !== document) {
                if (target.classList.contains('action-show-login')){
                   this.__createLoginPlayerModal();
                   return;
                }else if(target.classList.contains('action-show-register')){
                    this.__createRegisterPanelModal();
                    return;
                }else if(target.classList.contains('action-try-login')){
                    this.onClickSubmitLogin(); 
                    return;
                }else if(target.classList.contains('action-try-register')){
                    this.onClickSubmitRegister();
                    return;
                }else if(target.classList.contains('action-restore-pwd') ){
                    this.onClickRestorePwd(document.getElementById("modal-login-email").value);
                    return;
                }else if(target.classList.contains('action-show-lang')){
                    this.__createLanguageModal();
                    return;
                }else if(target.classList.contains('action-select-lang')){
                    
                    target = target.firstChild;
                    
                    var szClass = target.classList[1];
                    var aTmp = szClass.split("bg-");
                    var szFlag = aTmp[1];

                    var oModal = document.getElementById("languageModal")
                    bootstrap.Modal.getInstance(oModal).hide();

                    document.getElementById("flag-cur-language").classList.remove('bg-'+s_iStartingLangCode);
                    s_iStartingLangCode = szFlag;
                    s_iCurLang = LANG_CODES[s_iStartingLangCode];
                    refreshLanguage();
                    refreshLanguageGUIController();
                    this.refreshMenuLanguage();

                    if(_aCbCompleted[ON_SELECT_LANG]){
                      _aCbCompleted[ON_SELECT_LANG].call(_aCbOwner[ON_SELECT_LANG]);
                    }

                    document.getElementById("flag-cur-language").classList.add('bg-'+s_iStartingLangCode);
                    return;
                }else if(target.classList.contains("action-hide-sidebar")){
                    var oOffcanvas = document.getElementById("sidebarMenu");
                    oOffcanvas.classList.remove('show');
                    return;
                }else if(target.classList.contains("action-toggle-sidebar")){
                    this.toggleSideBar();
                    return;
                }else if(target.classList.contains("action-logout")){
                    this.onLogout();
                    return;
                }else if(target.classList.contains("action-toggle-audio")){
                    this.onToggleAudio();
                    return;
                }else if(target.classList.contains("action-toggle-fullscreen")){
                    this.onToggleFullscreen();
                    return;
                }else if(target.classList.contains('action-goto-menu')){
                    if(s_oMenu === null){
                        this.__createConfirmModal(TEXT_ARE_YOU_SURE,"action-confirm-goto-menu");
                    }
                    return;
                }else if(target.classList.contains('action-confirm-goto-menu')){
                    this.onGotoMenu();
                    return;
                }else if(target.classList.contains('action-confirm-moregames')){
                    window.open("","_blank");
                    return;
                }else if(target.classList.contains('action-not-confirm-in-modal')){
                    
                }else if(target.classList.contains('action-show-leaderboard')){
                    this.getLeaderboardEntries();
                    return;
                }else if(target.classList.contains('action-show-leaderboard-general')){
                    this.onSelectLeaderboardGeneral();
                    return;
                }else if(target.classList.contains('action-show-leaderboard-month')){
                    this.onSelectLeaderboardMonthly();
                    return;
                }else if(target.classList.contains('action-show-leaderboard-day')){
                    this.onSelectLeaderboardDaily();
                    return;
                }else if(target.classList.contains('action-goto-website')){
                    //window.open(TEXT_CREDITS_URL,"_blank");
                    return;
                }else if(target.classList.contains('action-show-credits')){
                    this.__createCreditsModal();
                    return;
                }else if(target.classList.contains('action-report-bug')){
                    this.__createSendEmailModal(TEXT_REPORT_BUG);
                    return;
                }else if(target.classList.contains('action-show-stats')){
                    this.__createStatsModal();
                    return;
                }else if(target.classList.contains('action-show-moregames')){
                    this.__createMoregamesModal();
                    //this.__createConfirmModal("DO YOU WANT PLAY MORE GAMES?<br><br>CLICK OK TO WATCH OUR CATALOG!","action-confirm-moregames");
                    return;
                }else if(target.classList.contains('action-show-profile')){
                    this.__createStatsModal();
                    return;
                }else if(target.classList.contains('action-delete-user')){
                    if(document.querySelector("#statsModal")){
                        document.querySelector(".modal-backdrop").classList.add('d-none');
                        document.querySelector("#statsModal").remove();
                    }
                    this.__createSendEmailModal(TEXT_DELETE_USER);
                    return;
                }
                
                target = target.parentNode;
                if (!target) { return; } // If element doesn't exist
            }
            
        });
    };
    
    this.__modalsCallbacks = function(){
        document.addEventListener('hidden.bs.modal', event => {
            bootstrap.Modal.getInstance(event.target).dispose()
            event.target.remove();
        });
    };
    
    this._setBurgerMarginRight = function(iSafeArea){
        var szPx = -65 - iSafeArea;
        var szCalc = "calc("+szPx+"px - 10px)";
        document.getElementById( "toggle-sidebar-btn-top-right" ).style.left = szCalc;
    };

    this._setSideBarMarginRight = function(iSafeArea){
        if(iSafeArea>0){
            var szPx = iSafeArea;
            var szCalc = szPx+"px";
            document.getElementById( "toggle-sidebar-btn-top-right" ).style.left = szCalc;
            
            document.getElementById( "offcanvas-body" ).style.paddingRight = iSafeArea+"px";
        }else{
            document.getElementById( "toggle-sidebar-btn-top-right" ).style.removeProperty('left');
        }
    };
    
    this.toggleSideBar = function(){
        var oOffcanvas = document.getElementById("sidebarMenu");
                    
        if ( oOffcanvas.classList.contains("show")){
            oOffcanvas.classList.remove('show');
            document.querySelector(".action-toggle-sidebar .hamburger").classList.remove("is-active");
            document.querySelector(".offcanvas-block").classList.remove("show");
        }else{
            oOffcanvas.classList.add('show');
            document.querySelector(".action-toggle-sidebar .hamburger").classList.add("is-active");
            document.querySelector(".offcanvas-block").classList.add("show");                        
        }
    };
    
    this.createSideBar = function(bLoginSection,bMultiLanguage){
        
        //CREATE SIDEBAR
        var szHtml = '';
        
        szHtml += '<div class="offcanvas-block action-toggle-sidebar"></div>';
        if(REMOVE_ADS_TYPE){
            szHtml += '<a id="cart-btn" class="cart-btn action-remove-ads" href="#" role="button"><i class="fa-solid fa-cart-shopping"></i></a>';
        }
        szHtml += '<div class="offcanvas offcanvas-end sidebar-menu" id="sidebarMenu" aria-labelledby="sidebarMenuLabel">';
        szHtml += '<div class="offcanvas-header p-2">';
        
        if(bLoginSection){
            //LOGIN SECTION
            szHtml += '<div class="btn-group logged-user d-none" id="sidebar-section-login">'; 
            szHtml += '<button type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">';
            szHtml += '<img class="leaderboard-avatar" src="" alt="">';
            szHtml += "<span></span></button>"
            szHtml += '<ul class="dropdown-menu">';
            szHtml += '<li><a class="dropdown-item action-show-profile">'+TEXT_MY_PROFILE+'</a></li>';
            szHtml += '<li><hr class="dropdown-divider"></li>';
            szHtml += '<li><a class="dropdown-item action-logout">'+TEXT_LOGOUT+'</a></li>';
            szHtml += '</ul></div>';
            
            szHtml += '<button id="button_login" type="button" class="btn btn-primary action-show-login">'+TEXT_LOGIN+'</button>';
            szHtml += '<button id="button_register" type="button" class="btn btn-primary action-show-register">'+TEXT_REGISTER+'</button>';
        }
        
        szHtml += '</div>';
        
        szHtml += '<div class="offcanvas-body">';
        szHtml += '<div class="list-group sidebar-menu-form-check">';
        szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-0">'+TEXT_SETTINGS+'</h4>';
        
        if(bMultiLanguage){
            var iLangCode = LANG_CODES[s_iStartingLangCode];
            if(iLangCode === undefined){
                iLangCode = LANG_EN;
                s_iStartingLangCode = "en";
            }
            szHtml += '<div class="cursor-pointer form-check action-show-lang"><div class="row align-items-center">';
            szHtml += '<div class="col col-8" id="sidebar-menu-section-0-0"><i class="fa-solid fa-language icon-start"></i><span>'+TEXT_LANGUAGE+'</span></div>';
            szHtml += '<div class="col col-4"><div id="flag-cur-language" class="language-flag bg-'+s_iStartingLangCode+' " ></div></div></div></div>';
        }
        
        if(ENABLE_FULLSCREEN){
            szHtml += '<div class="cursor-pointer form-check form-switch form-check-reverse text-start">';
            szHtml += '<input class="form-check-input action-toggle-fullscreen" type="checkbox" role="switch" id="sidebar-menu-section-0-1">';
            szHtml += '<label class="form-check-label" for="sidebar-menu-section-0-1"><i class="fa-solid fa-expand icon-start"></i><span>'+TEXT_FULLSCREEN_OFF+'</span></label></div>';
        }
        szHtml += '<div class="cursor-pointer form-check form-switch form-check-reverse text-start">';
        szHtml += '<input class="form-check-input action-toggle-audio" type="checkbox" role="switch" id="sidebar-menu-section-0-2" ">';
        szHtml += '<label class="form-check-label" for="sidebar-menu-section-0-2"><i class="fa-solid fa-music icon-start"></i><span>'+TEXT_AUDIO_OFF+'</span></label></div>';
        szHtml += '</div>';
        
        szHtml += '<div class="sidebar-menu-button-link">';
        szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-1">'+TEXT_GAME_OPTION+'</h4>'
        szHtml += '<div class="d-grid">';
        szHtml += '<button type="button" class="btn btn-link text-start action-goto-menu"><i class="fa-solid fa-house icon-start" id="sidebar-menu-section-1-0"></i><span>'+TEXT_MAIN_MENU+'</span></button>'
        szHtml += '<button type="button" class="btn btn-link text-start action-show-leaderboard"><i class="fa-solid fa-ranking-star icon-start" id="sidebar-menu-section-1-1"></i><span>'+TEXT_LEADERBOARD+'</span></button>';
        szHtml += '<button type="button" class="btn btn-link text-start action-report-bug"><i class="fa-solid fa-bug icon-start" id="sidebar-menu-section-1-3"></i><span>'+TEXT_REPORT_BUG+'</span></button>';
        if(REMOVE_ADS_TYPE){
            szHtml += '<button type="button" class="btn btn-link text-start action-remove-ads"><i class="fa-solid fa-cart-shopping icon-start" id="sidebar-menu-section-1-3"></i><span>'+TEXT_REMOVE_ADS+'</span></button>';
        }
        szHtml += '</div></div>';
        
        szHtml += '<div class="sidebar-menu-button-link">';
        szHtml += '<h4 class="sidebar-menu-section-title" id="sidebar-menu-section-title-2">'+TEXT_MY_PROFILE+'</h4>';
        szHtml += '<div class="d-grid sidebar-menu-button-link">';
        szHtml += '<button type="button" class="btn btn-link text-start action-show-stats"><i class="fa-solid fa-chart-line icon-start"></i><span>'+TEXT_STATS+'</span></button>';
        szHtml += '</div></div>';
        
        if (typeof FEATURED_GAMES !== 'undefined' && typeof TAGGED_GAMES !== undefined || typeof OTHER_GAMES !== undefined) {
            //MOREGAMES
            szHtml += '<div class="more-games-btn d-grid gap-2">';
                szHtml += '<button class="btn btn-primary rounded-pill action-show-moregames" type="button"><i class="fa-solid fa-gamepad me-3"></i>'+TEXT_MORE_GAMES+'</button>';
            szHtml += '</div>';
            
            this._loadMoregamesInfos();
            
        }
        //CREDITS
        szHtml += '<div class="sidebar-footer">';
                    szHtml += '<div class="row m-0 text-center">';
                        szHtml += '<div class="col col-6 align-self-center"><img class="ctl-logo action-goto-website" src="ctl_ui/sprites/codethislab-logo-white.svg" alt="Code This Lab">';
                        szHtml += '</div>';
                        szHtml += '<div class="col col-6 align-self-center action-show-credits">';
                            szHtml += '<a href="#" class="text-decoration-none"><i class="fa-solid fa-circle-info icon-start"></i><span>'+TEXT_CREDITS+'</span></a>';
                        szHtml += '</div>';
                    szHtml += '</div>';
                szHtml += '</div>';

            szHtml += '</div>';
            szHtml += '<a class="btn btn-link toggle-sidebar-btn-top-right action-toggle-sidebar" role="button" aria-controls="sidebarMenu">';
                szHtml += '<div class="hamburger hamburger--slider"><div class="hamburger-box"><div class="hamburger-inner hamburger-inner-white"></div></div></div>';
            szHtml += '</a>';            
        szHtml += '</div>';
        
        
        document.querySelector(".sidebar-menu-container").appendChild(htmlMarkupToNode(szHtml));   
        
        if(s_bFullscreen){
            document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-1").checked = true;
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_ON;
        }
        
        if(s_bAudioActive){
            document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-2").checked = true;
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_AUDIO_ON;
        }

    };
    
    

    this.__createLoginPlayerModal = function(){    

        var szHtml = '<div class="modal fade overflow-hidden" id="loginModal" aria-labelledby="loginModalLabel" aria-hidden="true">';
        szHtml += '<div class="modal-dialog modal-dialog-centered">';
        szHtml += '<div class="modal-content"><div class="modal-header">';
        //szHtml += '<div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
        szHtml += '<h1 class="modal-title fs-5" id="loginModalLabel">'+TEXT_LOGIN+'</h1>';
        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="'+TEXT_CLOSE+'"></button></div>';
        szHtml += '<div class="modal-body">';
        szHtml += '<form>';
        szHtml += '<div class="mb-3">';
        szHtml += '<label for="modal-login-email" class="form-label">'+TEXT_SYS_CHOOSENICK_OR_EMAIL+'<i class="mandatory ms-1 fa-solid fa-asterisk"></i></label>';
        szHtml += '<input class="form-control" id="modal-login-email" aria-describedby="emailHelp"></div>';
        szHtml += '<div class="mb-3">';
        szHtml += '<label for="modal-login-pwd" class="form-label">'+TEXT_PWD+'<i class="mandatory ms-1 fa-solid fa-asterisk"></i></label>';
        szHtml += '<input type="password" class="form-control" id="modal-login-pwd" /></div>';
        szHtml += "<a class='underlined-text-but action-restore-pwd'>"+TEXT_PWD_FORGOT+"  </a>";
        szHtml += '<p id="restore-pwd-alert-text" class="ctl-multiplayer-alert-text"></p>';
        szHtml += '<p id="login-alert-text" class="ctl-multiplayer-alert-text"></p>';        
        szHtml += '<div class="btn btn-primary action-try-login">'+TEXT_SUBMIT+'</div>';
        szHtml += '</form></div></div></div></div>';
        
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
   
        
        var oModal = new bootstrap.Modal(document.getElementById('loginModal'));
        oModal.show();
    };
    
    this.__createRegisterPanelModal = function(){
        var szHtml = '<div class="modal fade overflow-hidden" id="registerModal" tabindex="-1" aria-labelledby="registerModalLabel" aria-hidden="true">';
        szHtml += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
        szHtml += '<h1 class="modal-title fs-5" id="registerModalLabel">'+TEXT_REGISTER+'</h1>';
        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="'+TEXT_CLOSE+'"></button></div>';
        szHtml += '<div class="modal-body">';
        szHtml += '<form>';
        szHtml += '<div class="mb-3">';
        szHtml += '<label for="modal-register-nick" class="form-label">'+TEXT_SYS_CHOOSENICK+'<i class="mandatory ms-1 fa-solid fa-asterisk"></i></label>';
        szHtml += '<input class="form-control" id="modal-register-nickname"></div>';
        szHtml += '<div class="mb-3">';
        szHtml += '<label for="modal-register-email" class="form-label">'+TEXT_EMAIL+'<i class="mandatory ms-1 fa-solid fa-asterisk"></i></label>';
        szHtml += '<input class="form-control" id="modal-register-email"></div>';
        szHtml += '<div class="mb-3">';
        szHtml += '<label for="modal-register-pwd" class="form-label">'+TEXT_PWD+'<i class="mandatory ms-1 fa-solid fa-asterisk"></i></label>';
        szHtml += '<input type="password" class="form-control" id="modal-register-pwd"></div>';
        szHtml += '<div class="mb-3">';
        szHtml += '<label for="modal-register-confirm-pwd" class="form-label">'+TEXT_SYS_CONFIRM_PWD+'<i class="mandatory ms-1 fa-solid fa-asterisk"></i></label>';
        szHtml += '<input type="password" class="form-control" id="modal-register-confirm-pwd"></div>';
        if(TEXT_PRIVACY_URL !== ""){
            szHtml += '<div class="mb-3">';
            szHtml += '<a class="terms-privacy-text-color" href="'+TEXT_PRIVACY_URL+'" target="_blank">'+TEXT_PRIVACY+'</a>';
            szHtml += '</div>';
        }
        if(TEXT_TERMS_OF_USE_URL !== ""){
            szHtml += '<div class="mb-3">';
            szHtml += '<a class="terms-privacy-text-color" href="'+TEXT_TERMS_OF_USE_URL+'" target="_blank">'+TEXT_TERMS_OF_USE+'</a>'
            szHtml += '</div>';
        }
        szHtml += '<p id="register-alert-text" class="ctl-multiplayer-alert-text"></p>';
        szHtml += '<button type="button" class="btn btn-primary action-try-register">'+TEXT_REGISTER+'</button>';
        szHtml += '</form></div></div></div></div>';
        
        document.querySelector(".sidebar-menu-container").innerHTML += szHtml;
        
        var oModal = new bootstrap.Modal(document.getElementById('registerModal'));
        oModal.show();
    };
    
    this.__createLanguageModal = function(){
        var szHtml = '';
        szHtml += '<div class="modal fade" id="languageModal" tabindex="-1" aria-labelledby="languageModalLabel" aria-hidden="true">';
        szHtml += '<div class="modal-dialog modal-dialog-scrollable modal-dialog-centered">';
        szHtml += '<div class="modal-content">';
        szHtml += '<div class="modal-header">';
        szHtml += '<h1 class="modal-title fs-5" id="languageModalLabel">' + TEXT_LANGUAGE + '</h1>';
        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="' + TEXT_CLOSE + '"></button></div>';
        szHtml += '<div class="modal-body">';
        szHtml += '<ul class="list-group list-group-flush">';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="en"><span class="language-flag bg-en"></span>'+TEXT_ORIGINAL_LANGUAGE[0]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="es"><span class="language-flag bg-es"></span>'+TEXT_ORIGINAL_LANGUAGE[1]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="fr"><span class="language-flag bg-fr"></span>'+TEXT_ORIGINAL_LANGUAGE[2]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="de"><span class="language-flag bg-de"></span>'+TEXT_ORIGINAL_LANGUAGE[3]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="pt"><span class="language-flag bg-pt"></span>'+TEXT_ORIGINAL_LANGUAGE[4]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="it"><span class="language-flag bg-it"></span>'+TEXT_ORIGINAL_LANGUAGE[5]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="ru"><span class="language-flag bg-ru"></span>'+TEXT_ORIGINAL_LANGUAGE[6]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="tr"><span class="language-flag bg-tr"></span>'+TEXT_ORIGINAL_LANGUAGE[7]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="ar"><span class="language-flag bg-ar"></span>'+TEXT_ORIGINAL_LANGUAGE[8]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="hi"><span class="language-flag bg-hi"></span>'+TEXT_ORIGINAL_LANGUAGE[9]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="id"><span class="language-flag bg-id"></span>'+TEXT_ORIGINAL_LANGUAGE[10]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="ja"><span class="language-flag bg-ja"></span>'+TEXT_ORIGINAL_LANGUAGE[11]+'</li>';
        szHtml += '<li class="list-group-item text-dark action-select-lang" data-flag="zh"><span class="language-flag bg-zh"></span>'+TEXT_ORIGINAL_LANGUAGE[12]+'</li>';
        szHtml += '</ul></div></div></div></div>';
        
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  

        var oModal = new bootstrap.Modal(document.getElementById('languageModal'));
        oModal.show();
    };
    
    this.__createCreditsModal = function(){
        var szUrlText = TEXT_CREDITS_URL.split("//")[1];
        
        var szHtml = '<div class="modal fade credits-box overflow-hidden" id="creditsModal" tabindex="-1" aria-labelledby="creditsModalLabel" aria-hidden="true">';
            szHtml += '<div class="modal-dialog modal-dialog-centered">';
                szHtml += ' <div class="modal-content animate__animated animate__fadeInUpBig">';
                    szHtml += '<div class="modal-header">';
                        szHtml += '<h1 class="modal-title fs-5 text-center" id="creditsModalLabel"><i class="fa-solid fa-circle-info icon-start"></i>'+TEXT_CREDITS+'</h1>';
                        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
                    szHtml += '</div>';
                    //szHtml += '<a href="'+TEXT_CREDITS_URL+'" target="_blank">';
                        szHtml += '<div class="modal-body"> ';
                            szHtml += '<div class="text-center">';
                                szHtml += ' <img class="ctl-logo" src="ctl_ui/sprites/codethislab-logo-white.svg" alt="Code This Lab">';
                                szHtml += '<h3>'+szUrlText+'</h3>';
                            szHtml += '</div> ';
                        szHtml += '</div> ';
                    szHtml += '</a>'; 
                szHtml += ' </div>'; 
            szHtml += ' </div>'; 
        szHtml += ' </div>'; 
            
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
        var oModal = new bootstrap.Modal(document.getElementById('creditsModal'));
        oModal.show();
    };
    
    this.__createSendEmailModal = function(szTitle){
        var szHtml = '<div class="modal fade credits-box overflow-hidden" id="sendEmailModal" tabindex="-1" aria-labelledby="sendEmailModalLabel" aria-hidden="true">';
            szHtml += '<div class="modal-dialog modal-dialog-centered">';
                szHtml += ' <div class="modal-content animate__animated animate__fadeInUpBig">';
                    szHtml += '<div class="modal-header">';
                        szHtml += '<h1 class="modal-title fs-5 text-center" id="sendEmailModalLabel"><i class="fa-solid fa-circle-info icon-start"></i>'+szTitle+'</h1>';
                        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
                    szHtml += '</div>';

                        szHtml += '<div class="modal-body"> ';
                            szHtml += '<div class="text-center">';
                                szHtml += '<h3>'+TEXT_SEND_EMAIL+'</h3>';
                                szHtml += '<h2><a href="mailto:support@codethislab.com target="_blank">support@codethislab.com<a></h2>';
                            szHtml += '</div> ';
                        szHtml += '</div> ';
                    szHtml += '</a>'; 
                szHtml += ' </div>'; 
            szHtml += ' </div>'; 
        szHtml += ' </div>'; 
            
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
        
        if(document.querySelector("#statsModal")){
            document.querySelector(".modal-backdrop").classList.add('d-none');
            document.querySelector("#statsModal").remove();
        }
        
        var oModal = new bootstrap.Modal(document.getElementById('sendEmailModal'));
        oModal.show();
    };
    
    this.__createStatsModal = function(){
        var iPerc = 0;
        if(_iTotMatches>0){
            iPerc = parseFloat((_iWins/_iTotMatches).toFixed(2))*100;
        }

        var szHtml = '<div class="modal fade credits-box overflow-hidden" id="statsModal" tabindex="-1" aria-labelledby="statsLabel" aria-hidden="true">';
            szHtml += '<div class="modal-dialog modal-dialog-centered">';
                szHtml += ' <div class="modal-content animate__animated animate__fadeInUpBig">';
                    szHtml += '<div class="modal-header">';
                        szHtml += '<h1 class="modal-title fs-5 text-center d-flex align-items-center" id="statsLabel"><td class="text-center stats-badge">';
                            szHtml += '<div class="badges-container"><div class="badges badge_'+_iCurBadgeLevel+'"></div></div>';
                            szHtml += '<div class="ml-2">' + s_oNetworkManager.filterString(s_oNetworkManager.getPlayerNickname())+'</div>'+'</h1>';
                        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
                    szHtml += '</div>';
                    szHtml += '<a>';
                        szHtml += '<div class="modal-body"> ';
                            szHtml += '<div class="text-center">';
                                szHtml += '<h3>'+TEXT_WINS+": "+_iWins+'</h3>';
                                szHtml += '<h3>'+TEXT_LOSSES+": "+_iLosses+'</h3>';
                                szHtml += '<h3>'+TEXT_WIN_PERC+": "+iPerc+'%</h3>';
                                 szHtml += '<br>'
                                szHtml += '<h2>'+TEXT_RANKING+": "+_iPlayerRanking+'</h3>';
                                szHtml += '<button class="btn btn-danger rounded-pill action-delete-user mt-5" type="button">'+TEXT_DELETE_USER+'</button>';
                            szHtml += '</div> ';
                        szHtml += '</div> ';
                    szHtml += '</a>'; 
                szHtml += ' </div>'; 
            szHtml += ' </div>'; 
        szHtml += ' </div>'; 
            
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
        var oModal = new bootstrap.Modal(document.getElementById('statsModal'));
        oModal.show();
    };

    this.__createMoregamesModal = function(){
        var szHtml = '<div class="modal fade more-games-box overflow-hidden" id="moregamesModal" tabindex="-1" aria-labelledby="moregamesModalLabel" aria-hidden="true">';
            szHtml += '<div class="modal-dialog modal-dialog-centered modal-xl modal-fullscreen-lg-down">';
                szHtml += '<div class="modal-content animate__animated animate__fadeInUpBig">';
                    szHtml += ' <div class="modal-header">';
                        szHtml += '<img class="ctl-logo m-auto" src="ctl_ui/sprites/codethislab-logo-white.svg" alt="Code This Lab">';
                        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>';
                    szHtml += '</div>';
                    szHtml += '<div class="modal-body">';
                        szHtml += '<div class="col col-12"><h4>'+TEXT_FEATURED_GAMES+'</h4></div>';
                        szHtml += '<div class="owl-carousel owl-main owl-theme mb-4">';
                            for(var k=0;k<_aFeaturedGames.length;k++){
                                szHtml += '<a class="img-game" href="'+_aFeaturedGames[k].url+'" target="_blank"><img src="'+_aFeaturedGames[k].img+'" alt=""></a>';
                            }
                        szHtml += '</div>';
                        szHtml += '<div class="mb-3">';
                            szHtml += '<div class="col col-12"><h4>'+TEXT_OTHER_GAMES+'</h4></div>';
                            szHtml += '<div class="owl-carousel owl-theme mb-3">';
                                for(var k=0;k<_aTaggedGames.length;k++){
                                    szHtml += '<a class="img-game" href="'+_aTaggedGames[k].url+'" target="_blank"><img src="'+_aTaggedGames[k].img+'" alt=""></a>';
                                }
                            szHtml += '</div>';
                            szHtml += '<div class="owl-carousel owl-theme">';
                                for(var i=0;i<_aOtherGames.length;i++){
                                    szHtml += '<a class="img-game" href="'+_aOtherGames[i].url+'" target="_blank"><img src="'+_aOtherGames[i].img+'" alt=""></a>';
                                }
                            szHtml += '</div>';
                        szHtml += '</div>';
                    szHtml += '</div>';
                szHtml += '</div>';
            szHtml += '</div>';
        szHtml += '</div>';
        
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
                            $('.owl-main').owlCarousel({
                stagePadding: 30,
                loop:true,
                margin:10,
                nav:true,
                dots:false,
                items:3,
                responsive:{
                    0:{
                        items:1
                    },
                    600:{
                        items:2
                    },
                    1000:{
                        items:3
                    }
                }
            })
            
            $('.owl-carousel').owlCarousel({
                stagePadding: 20,
                loop:true,
                margin:10,
                nav:true,
                dots:false,
                responsive:{
                    0:{
                        items:2
                    },
                    600:{
                        items:4
                    },
                    1000:{
                        items:5
                    }
                }
            })
        
        var oModal = new bootstrap.Modal(document.getElementById('moregamesModal'));
        oModal.show();
        

    };


    this.__createGeneralAlertModal = function(szText){
        var szHtml = '<div class="modal fade overflow-hidden" id="alertModal" tabindex="-1"  aria-hidden="true">';
        szHtml += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
        szHtml += '<h1 class="modal-title fs-5" id="alertModalLabel">'+szText+'</h1>';
        szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="'+TEXT_CLOSE+'"></button></div>';
        szHtml += '<div class="modal-body">';
        szHtml += '</div></div></div>';

        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
        var oModal = new bootstrap.Modal(document.getElementById('alertModal'));
        oModal.show();
    };
    
    this.__createConfirmModal = function(szText,szAction){
        var szHtml = '<div class="modal fade overflow-hidden" id="confirmModal" tabindex="-1"  aria-hidden="true">';
        szHtml += '<div class="modal-dialog modal-dialog-centered"><div class="modal-content animate__animated animate__fadeInUpBig"><div class="modal-header">';
        szHtml += '<h1 class="modal-title fs-5" id="alertModalLabel">'+szText+'</h1></div>';
        //szHtml += '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="'+TEXT_CLOSE+'"></button></div>';
        szHtml += '<div class="modal-body">';
        szHtml += '<button type="button" class="btn btn-primary btn-sm action-not-confirm-in-modal" data-bs-dismiss="modal"  id="footer-btn-title-'+TEXT_NO+'" >'+TEXT_NO+'</button>';
        szHtml += '<button type="button" class="btn btn-primary btn-sm '+szAction+' float-end" data-bs-dismiss="modal" id="footer-btn-title-'+TEXT_YES+'" >'+TEXT_YES+'</button>';
        szHtml += '</div></div></div>';

        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
        var oModal = new bootstrap.Modal(document.getElementById('confirmModal'));
        oModal.show();
    };
    
    this.__createLoadingModal = function(){
        var szHtml = '';
        szHtml += '<div class="block-loading-container show d-flex justify-content-center align-items-center">';
            szHtml += '<div class="block-loading"></div>';
                szHtml += '<div class="block-loading-spinner">';
                    szHtml += '<div class="spinner-border text-light"></div>';
                szHtml += '</div>';
        szHtml += '</div>';
 
        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
    };
    
    this.__removeLoadingModal = function(){
        if(document.querySelector(".block-loading-container")){
            document.querySelector(".block-loading-container").remove();
        }
    };
/*
this._loadMoregamesInfos = function(){

            if( GAME_LIST_JSON.length === 0 ){
                  return;
            }

            //ADD JUST GAMES WITH SELECTED TAG
            _aFeaturedGames = [];
            for(var t=0;t<GAME_TAGS.length;t++){
                for(var k=0;k<GAME_LIST_JSON.length;k++){
                    if(GAME_LIST_JSON[k].tag.indexOf(GAME_TAGS[t]) !== -1 && _aFeaturedGames.indexOf(GAME_LIST_JSON[k]) === -1 && GAME_LIST_JSON[k].id !== _szGameId){
                        _aFeaturedGames.push(GAME_LIST_JSON[k]);
                    }
                }
            }

            _aOtherGames = new Array();
            for(var k=0;k<GAME_LIST_JSON.length;k++){
                if(_aFeaturedGames.indexOf(GAME_LIST_JSON[k]) === -1 && GAME_LIST_JSON[k].id !== _szGameId){
                    _aOtherGames.push(GAME_LIST_JSON[k]);
                }
            }

    };*/
    this._loadMoregamesInfos = function(){
        _aFeaturedGames = [];
        for(var k=0;k<FEATURED_GAMES.length;k++){
            _aFeaturedGames.push(FEATURED_GAMES[k]);
        }
        
        _aTaggedGames = new Array();
        for(var k=0;k<TAGGED_GAMES.length;k++){
            _aTaggedGames.push(TAGGED_GAMES[k]);
        }
        
        _aOtherGames = new Array();
        for(var k=0;k<OTHER_GAMES.length;k++){
            _aOtherGames.push(OTHER_GAMES[k]);
        }
    }    
    
    /*
    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        
        if ("withCredentials" in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);

        } else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, url);
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        } else {
            // CORS not supported.
            xhr = null;
            return xhr;
        }

        return xhr;
    }
    */
    this.onClickSubmitLogin = function(){
        this.clearAlertTexts();
        
        var szUser = document.getElementById("modal-login-email").value;
        var szPwd  = document.getElementById("modal-login-pwd").value;
        
        if(szUser === "" || szPwd === ""){
            document.getElementById("login-alert-text").textContent = TEXT_FIELDS_NOT_FILLED;
            return;
        }
        
        this.__createLoadingModal();

        s_oNetworkManager.loginGeneric(szUser,szPwd,this.onLoginPlayer,this.onLoginError);
    };
    
    this.onClickSubmitRegister = function(){
        var szNick  = stripHTML(document.getElementById("modal-register-nickname").value);
        var szEmail = stripHTML(document.getElementById("modal-register-email").value);
        var szPwd  = stripHTML(document.getElementById("modal-register-pwd").value);
        var szConfirmPwd  = stripHTML(document.getElementById("modal-register-confirm-pwd").value);
    
        if(szNick === "" || szPwd === "" || szConfirmPwd === "" || szEmail === ""){
            document.getElementById("register-alert-text").textContent = TEXT_FIELDS_NOT_FILLED;
            return;
        }
    
        //CHECK EMAIL
        if(!validateEmail(szEmail)){
            document.getElementById("register-alert-text").textContent = TEXT_EMAIL_NOT_VALID;
            return;
        }
    
        //CHECK IF PASSWORDS ARE MATCHING
        if(szPwd !== szConfirmPwd){
            document.getElementById("register-alert-text").textContent = TEXT_PWD_NOT_MATCHING ;
            return;
        }

        //CHECK PASSWORD LENGTH
        if(szPwd.length <3){
            document.getElementById("register-alert-text").textContent = TEXT_PWD_TOO_SHORT;
            return;
        }

        if(szPwd.length > 10){
            document.getElementById("register-alert-text").textContent =  TEXT_PWD_TOO_LONG;
            return;
        }
        
        this.__createLoadingModal();
        s_oNetworkManager.registerUser(szNick,szEmail,szPwd,this.onRegisterPlayer,this.onRegisterError);
    };
    
    this.clearAlertTexts = function(){
        document.getElementById("restore-pwd-alert-text").textContent = "";
        document.getElementById("login-alert-text").textContent = "";
    };
    
    this.onClickRestorePwd = function(szUser){
        if(szUser === ""){
            s_oGuiController.clearAlertTexts();
             document.getElementById("restore-pwd-alert-text").textContent =  TEXT_INVALID_USER;
        }else{
            s_oNetworkManager.recoverPwd(szUser,this.onPwdRestoreSuccess,this.onPwdRestoreError); 
        }
    };
    
    this.onPwdRestoreSuccess = function(){
        s_oGuiController.__createGeneralAlertModal(TEXT_PWD_RECOVER);
    };
    
    this.onPwdRestoreError = function(szNickname){
        s_oGuiController.clearAlertTexts();
        if(validateEmail(szNickname)){
            document.getElementById("restore-pwd-alert-text").textContent =  TEXT_EMAIL_NOT_VALID;
        }else{
            document.getElementById("restore-pwd-alert-text").textContent =  TEXT_INVALID_USER;
        }
    };

    this.onLoginPlayer = function(){
        s_oGuiController.__removeLoadingModal();

        var oModal = document.getElementById("loginModal")
        bootstrap.Modal.getInstance(oModal).hide();
    };
    
    this.onLoginError = function(error){
        s_oGuiController.__removeLoadingModal();
        var szErr = TEXT_GENERIC_LOGIN_FAILED;

        switch(error.code){
            case "UnknownUser":{
                    szErr = TEXT_INVALID_USER;
                    break;
            }
            case "InvalidPassword":{
                    szErr = TEXT_INVALID_PASSWORD;
                    break;
            }
        }
        
        s_oGuiController.clearAlertTexts();
        document.getElementById("login-alert-text").textContent = szErr;
    };
    
    this.onRegisterPlayer = function(){
        s_oGuiController.__removeLoadingModal();
        
        var oModal = document.getElementById("registerModal")
        bootstrap.Modal.getInstance(oModal).hide();
    };
    
    this.onRegisterError = function(error){
        s_oGuiController.__removeLoadingModal();

        var szErr = TEXT_GENERIC_LOGIN_FAILED;
        switch(error.code){
            case "UnknownUser":{
                    szErr = TEXT_INVALID_USER;
                    break;
            }
            case "InvalidPassword":{
                    szErr = TEXT_INVALID_PASSWORD;
                    break;
            }
            case "InvalidRegistrationData":{
                    szErr = TEXT_ERR_USER_ALREADY_REGISTERED;
                    break;
            }
        }
        document.getElementById("register-alert-text").textContent = szErr;
    };
    
    this.refreshMenuLanguage = function(){
        document.querySelector(".sidebar-menu-container .action-show-profile ").innerHTML = TEXT_MY_PROFILE;
        document.querySelector(".sidebar-menu-container .logged-user .action-logout").innerHTML = TEXT_LOGOUT;
        document.querySelector(".sidebar-menu-container #button_login").innerHTML = TEXT_LOGIN;
        document.querySelector(".sidebar-menu-container #button_register").innerHTML = TEXT_REGISTER;
        document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-0").innerHTML = TEXT_SETTINGS;
        document.querySelector(".sidebar-menu-container #sidebar-menu-section-0-0 span").innerHTML = TEXT_LANGUAGE;
        document.querySelector(".sidebar-menu-container .action-show-moregames").innerHTML = TEXT_MORE_GAMES;
        
        if(ENABLE_FULLSCREEN){
            if(s_bFullscreen){
                document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_ON;
            }else{
                document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_OFF;
            }
        }
     
        if(s_bAudioActive){
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_AUDIO_ON;
        }else{
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_AUDIO_OFF;
        }
        
        document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-2").innerHTML = TEXT_MY_PROFILE;
        document.querySelector(".sidebar-menu-container #sidebar-menu-section-title-1").innerHTML = TEXT_GAME_OPTION;
        document.querySelector(".sidebar-menu-container .action-goto-menu span").innerHTML = TEXT_MAIN_MENU;
        document.querySelector(".sidebar-menu-container .action-show-leaderboard span").innerHTML = TEXT_LEADERBOARD;
        document.querySelector(".sidebar-menu-container .action-report-bug span").innerHTML = TEXT_REPORT_BUG;
        document.querySelector(".sidebar-menu-container .action-show-stats span").innerHTML = TEXT_STATS;
        document.querySelector(".sidebar-menu-container .action-show-credits span").innerHTML = TEXT_CREDITS;

    };
    
    this.onToggleFullscreen = function(){
        if(s_bFullscreen) { 
            _fCancelFullScreen.call(window.document);
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_OFF;
	}else{
            _fRequestFullScreen.call(window.document.documentElement);
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-1] span").innerHTML = TEXT_FULLSCREEN_ON;
	}
	
	sizeHandler(); 
    };
    
    this.onToggleAudio = function(){
        Howler.mute(s_bAudioActive);
        s_bAudioActive = !s_bAudioActive;
        
        if(s_bAudioActive){
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_AUDIO_ON;
        }else{
            document.querySelector(".sidebar-menu-container label[for=sidebar-menu-section-0-2] span").innerHTML = TEXT_AUDIO_OFF;
        }
    };
    
    this.onGotoMenu = function(){
        if(s_oGame !== null){
            if(s_oNetworkManager){
                s_oNetworkManager.disconnect();
            }

            if(s_oGame){
                s_oGame.unload();
            }

            s_oMain.gotoMenu(true);
            
        }else if(s_oLevelMenu !== null){
            s_oLevelMenu.unload();
            s_oMain.gotoMenu(false);
        }else if(s_oSelectMenu !== null){
            s_oSelectMenu.unload();
            s_oMain.gotoMenu(false);
            if(s_oNetworkManager){
                s_oNetworkManager.disconnect();
            }
        }
        
        this.toggleSideBar();
    };

    
    //END################MENU SIDEBAR
    
    ///////////////////////////////////LEADERBOARD
    this.getLeaderboardEntries = function(){
        if(!s_oNetworkManager.isLogged()){
            this.__createGeneralAlertModal(TEXT_PLS_LOGIN);
            return;
        }

        switch(_iCurLeaderboardToShow){
            case LEADERBOARD_GENERAL:{
                    this.onSelectLeaderboardGeneral();
                    break;
            }
            case LEADERBOARD_MONTH:{
                    this.onSelectLeaderboardMonthly();
                    break;
            }
            case LEADERBOARD_DAY:{
                    this.onSelectLeaderboardDaily();
                    break;
            }
        }
        
    };
    
    this.getPlayerNeighbors = async function(iPlayerPos,iTypeLeaderboard){
        var oPromise = new Promise((resolve,reject)=>{
            var szLeaderboard = null;
            let oDate = new Date();


            switch(iTypeLeaderboard){
                case LEADERBOARD_MONTH:{
                        var oDayDate = oDate.toISOString().split('T')[0];
                        var aTmp = oDayDate.split("-");
                        szLeaderboard = aTmp[0]+"-"+aTmp[1];
                        break;
                }
                case LEADERBOARD_DAY:{
                        szLeaderboard = oDate.toISOString().split('T')[0];
                        break;
                }
            }

            if(iPlayerPos > 5){
                //GET TOP 3 PLAYERS
                this.getLeaderboardTopRankings(szLeaderboard,0,3).then((oRet)=>{
                    
                    for(var k=0;k<oRet.length;k++){
                        var oEntry = this.parseLeaderboardEntry(oRet[k]);
                        _aLeaderboard[iTypeLeaderboard][k] = oEntry;
                    }

                    //GET PLAYER NEIGHBOURS
                    this.getLeaderboardNeighbourRanking(szLeaderboard,-2,5).then((oRet)=>{

                        for(var k=0;k<oRet.length;k++){
                            _aLeaderboard[iTypeLeaderboard][k] = this.parseLeaderboardEntry(oRet[k]);
                        }
                        resolve();
                    });
                }).catch(function(){
                    reject();
                });


            }else{

                this.getLeaderboardTopRankings(szLeaderboard,0,NUM_LEADERBOARD_ROWS).then((oRet)=>{

                    for(var k=0;k<oRet.length;k++){
                        _aLeaderboard[iTypeLeaderboard][k] = this.parseLeaderboardEntry(oRet[k]);
                    }

                    resolve();
                }).catch(function(){
                    reject();
                });
            }
        });

        return await oPromise; 
    };
    
    this.__createLeaderboardDialog = function(iTypeLeaderboard,bAnimate){

        var szHtml = '<div class="modal fade more-games-box overflow-hidden" id="leaderboardModal" tabindex="-1" aria-labelledby="leaderboardModalLabel" aria-hidden="true">';
        szHtml += '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">';
        szHtml += '<div class="modal-content leaderboard-container animate__animated animate__fadeInUpBig">';
        szHtml += '<div class="modal-header">';
        szHtml += '<i class="header-leaderboard-icon fa-solid fa-ranking-star"></i>';
        szHtml += '<h1 id="leaderboard-title" class="modal-title header-leaderboard-title text-end">'+TEXT_LEADERBOARD+'</h1>';
        szHtml += '<button type="button" class="btn-close btn-close-white align-self-start" data-bs-dismiss="modal" aria-label="Close"></button>';
        szHtml += '</div>';
        szHtml += '<div class="modal-body">';
        szHtml += '<table class="table">';
        szHtml += '<thead class=""><tr>';
        szHtml += '<th class="text-center leaderboard-level" id="table-title-col-1" scope="col">'+TEXT_POSITION+'</th>';
        szHtml += '<th class="text-center leaderboard-rank" id="table-title-col-2" scope="col">'+TEXT_RANK+'</th>';
        szHtml += '<th class="text-center leaderboard-nickname" id="table-title-col-3" scope="col">'+TEXT_NICKNAME+'</th>';
        szHtml += '<th class="text-center leaderboard-points" id="table-title-col-4" scope="col">'+TEXT_POINTS+'</th>';
        szHtml += '</tr></thead>';
        szHtml += '<tbody class="top-players-container">';

        szHtml += this._refreshLeaderboardTopPlayer(iTypeLeaderboard);
        
        szHtml += '</tbody><tbody class="last-players-container">';

        szHtml += this._refreshLeaderboardLastPlayer(iTypeLeaderboard);
        
        szHtml += '<tbody></table></div>';
        szHtml += '<div class="modal-footer justify-content-center">  ';
        szHtml += '<button type="button" class="btn btn-primary btn-sm active action-show-leaderboard-general" id="footer-btn-title-'+LEADERBOARD_GENERAL+'" >'+TEXT_GENERAL_LEADERBOARD+'</button>';
        szHtml += '<button type="button" class="btn btn-primary btn-sm action-show-leaderboard-month" id="footer-btn-title-'+LEADERBOARD_MONTH + '" >'+TEXT_MONTHLY_LEADERBOARD+'</button>';
        szHtml += '<button type="button" class="btn btn-primary btn-sm action-show-leaderboard-day" id="footer-btn-title-'+LEADERBOARD_DAY + '">'+TEXT_DAILY_LEADERBOARD+'</button>';
        szHtml += '</div></div></div></div></div>';

        document.querySelector("body").appendChild(htmlMarkupToNode(szHtml));  
        
        if(bAnimate){
            var leaderboardModal = new bootstrap.Modal(document.getElementById('leaderboardModal'));
            leaderboardModal.show();
        }
    };
    
    this._refreshLeaderboardTopPlayer = function(iTypeLeaderboard){
        var szHtml = "";
        
        for(var k=0;k<3;k++){
            if(_aLeaderboard[iTypeLeaderboard][k].userId === s_oNetworkManager.getPlayerNickname()){
                szHtml += '<tr class="top-players-bg-color table-active">';
                _aPlayerPos[iTypeLeaderboard]["leaderboard_index"] = k;
            }else{
                szHtml += '<tr class="top-players-bg-color">';
            }

            szHtml += '<th class="text-end leaderboard-level" scope="row">'+(k+1)+'</th>';
            szHtml += '<td class="text-center leaderboard-badge badge-bg-top-player">'
            szHtml += '<div class="badges-container">';
            szHtml += '<div class="badges badge_'+_aLeaderboard[iTypeLeaderboard][k].badge_index+'"></div></td>';
            szHtml += '</div>';
            //szHtml += '<td class="leaderboard-nickname"><img class="leaderboard-avatar" src="sprites/avatar/avatar1.png" alt="">'+_aLeaderboard[iTypeLeaderboard][k].userId+'</td>';
            szHtml += '<td class="leaderboard-nickname">'+_aLeaderboard[iTypeLeaderboard][k].userId+'</td>';
            szHtml += '<td class="text-end leaderboard-point point-bg-top-player">'+_aLeaderboard[iTypeLeaderboard][k].score+'</td></tr>';
        }
        
        if(document.querySelector(".top-players-container")){
            document.querySelector(".top-players-container").innerHTML = "";
            document.querySelector(".top-players-container").appendChild(htmlMarkupToNode(szHtml));
        }
        
        return szHtml;
    };
    
    this._refreshLeaderboardLastPlayer = function(iTypeLeaderboard){
        var szHtml = "";
        var iCont = _aLeaderboard[iTypeLeaderboard][3].rank;
        for(var k=3;k<_aLeaderboard[iTypeLeaderboard].length;k++){
            if(_aLeaderboard[iTypeLeaderboard][k].userId === s_oNetworkManager.getPlayerNickname()){
                szHtml += '<tr class="table-active">';
                _aPlayerPos[iTypeLeaderboard]["leaderboard_index"] = k;
            }else{
                szHtml += '<tr class="">';
            }
            
            szHtml += '<th class="text-end" scope="row">'+iCont+'</th>';
            szHtml += '<td class="text-center leaderboard-badge badge-bg-player"><i class="diamond-1"></i></td>';
            //szHtml += '<td><img class="leaderboard-avatar" src="sprites/avatar/avatar1.png" alt="">'+_aLeaderboard[iTypeLeaderboard][k].userId+'</td>';
            szHtml += '<td>'+_aLeaderboard[iTypeLeaderboard][k].userId+'</td>';
            szHtml += '<td class="text-end leaderboard-point point-bg-player">'+_aLeaderboard[iTypeLeaderboard][k].score+'</td></tr>';

            iCont++;
        }
        
        if(document.querySelector(".last-players-container")){
            document.querySelector(".last-players-container").innerHTML = "";
            document.querySelector(".last-players-container").appendChild(htmlMarkupToNode(szHtml));
        }
        
        return szHtml;
    };

    this.getLeaderboardTopRankings = async function(szLeaderboard,iStartIndex,iCount,oCallbackSuccess,oCallbackError){
        var oPromise = new Promise((resolve,reject)=>{
            s_oCurClient.leaderboards.getTop(LEADERBOARD_GROUP_ID, szLeaderboard, iStartIndex, iCount, null,
                                function(entries) {resolve(entries);},
                                function(error) { reject(error);});
        });

        return await oPromise; 
    };

    this.getLeaderboardPlayerRanking = async function(szLeaderboard,szNickname){
        var oPromise = new Promise((resolve,reject)=>{
            s_oCurClient.leaderboards.getTop(LEADERBOARD_GROUP_ID, szLeaderboard, 0, 1, [ "simple"+szNickname ],
                                function(entries) {
                                    resolve(entries);
                                },
                                function(error) { 
                                    reject(error);
                                });
        });

        return await oPromise; 
    };

    this.getLeaderboardNeighbourRanking = async function(szLeaderboard,iStartIndex,iCount){
        var oPromise = new Promise((resolve,reject)=>{
       
            s_oCurClient.leaderboards.getNeighbourhood(LEADERBOARD_GROUP_ID, szLeaderboard, iStartIndex, iCount, null,
                                            function(entries) {resolve(entries);},
                                            function(error) { reject(error);});

        });

        return await oPromise; 
    };

    this.clearLeaderboards = function(){
        var oNode = document.querySelector("#leaderboardModal");
        oNode.innerHTML = '';
    };
    
    this.resetLeaderboard = function(iTypeLeaderboard){
        //CHECK IF PLAYER IN LEADERBOARD ARE ENOUGH
        if(_aLeaderboard[iTypeLeaderboard].length<NUM_LEADERBOARD_ROWS){
            for(var k=_aLeaderboard[iTypeLeaderboard].length;k<NUM_LEADERBOARD_ROWS;k++){
                _aLeaderboard[iTypeLeaderboard][k] = {userId: "-", rank: k, score: "0"};
            }
        }
    };
    
    this.refreshLeadeboard = function(iTypeLeaderboard){
        if(document.getElementById("leaderboardModal")){
            this._refreshLeaderboardTopPlayer(iTypeLeaderboard);
            this._refreshLeaderboardLastPlayer(iTypeLeaderboard);
        }else{
            this.__createLeaderboardDialog(iTypeLeaderboard,true);
        }
        
        this.deselectButtons();
        _iCurLeaderboardToShow = iTypeLeaderboard;
        document.querySelector("#footer-btn-title-"+iTypeLeaderboard).classList.add('active');
        this.__removeLoadingModal();
    };
    
    this.onSelectLeaderboardGeneral = function(){
        this.__createLoadingModal();
        this.resetLeaderboard(LEADERBOARD_GENERAL);
  
        if( _aPlayerPos[LEADERBOARD_GENERAL] === undefined || 
                _aPlayerPos[LEADERBOARD_GENERAL].score !== _aLeaderboard[LEADERBOARD_GENERAL][_aPlayerPos[LEADERBOARD_GENERAL].leaderboard_index].score){
     
            this.getLeaderboardPlayerRanking(null,s_oNetworkManager.getPlayerNickname()).then(
                (oRet)=>{
                    if(oRet.length>0){
                        _aPlayerPos[LEADERBOARD_GENERAL] = this.parseLeaderboardEntry(oRet[0]);

                        this.getPlayerNeighbors(oRet[0].rank,LEADERBOARD_GENERAL).then(()=>{
                            this.refreshLeadeboard(LEADERBOARD_GENERAL); 
                        });
                    }else{
                        this.refreshLeadeboard(LEADERBOARD_GENERAL);
                    }
                }
            );  
        }else{
            this.refreshLeadeboard(LEADERBOARD_GENERAL);
        }
        

    };

    this.onSelectLeaderboardMonthly = function(){
        this.__createLoadingModal();
        this.resetLeaderboard(LEADERBOARD_MONTH);
        
        let oDate = new Date();
        var oDayDate = oDate.toISOString().split('T')[0];
        var aTmp = oDayDate.split("-");
        var oMonthDate = aTmp[0]+"-"+aTmp[1];

        //GET PLAYER MONTH POSITION
        if( _aPlayerPos[LEADERBOARD_MONTH] === undefined || 
                _aPlayerPos[LEADERBOARD_MONTH].score !== _aLeaderboard[LEADERBOARD_MONTH][_aPlayerPos[LEADERBOARD_MONTH].leaderboard_index].score){
            this.getLeaderboardPlayerRanking(oMonthDate,s_oNetworkManager.getPlayerNickname()).then(    
                    (oRet)=>{ 
                        if(oRet.length>0){
                            _aPlayerPos[LEADERBOARD_MONTH] = this.parseLeaderboardEntry(oRet[0]);
                            this.getPlayerNeighbors(oRet[0].rank,LEADERBOARD_MONTH).then(()=>{
                                this.refreshLeadeboard(LEADERBOARD_MONTH);
                            });
                        }else{
                            this.refreshLeadeboard(LEADERBOARD_MONTH);
                        }
                    }
            );
        }else{
            this.refreshLeadeboard(LEADERBOARD_MONTH);
        }

    };

    this.onSelectLeaderboardDaily = function(){
        this.__createLoadingModal();
        
        this.resetLeaderboard(LEADERBOARD_DAY);
        
        let oDate = new Date();
        var oDayDate = oDate.toISOString().split('T')[0];

        
        //GET PLAYER DAILY POSITION
        if( _aPlayerPos[LEADERBOARD_DAY] === undefined || 
                _aPlayerPos[LEADERBOARD_DAY].score !== _aLeaderboard[LEADERBOARD_DAY][_aPlayerPos[LEADERBOARD_DAY].leaderboard_index].score){
            this.getLeaderboardPlayerRanking(oDayDate,s_oNetworkManager.getPlayerNickname()).then(
                    (oRet)=>{ 
                        if(oRet.length>0){
                            _aPlayerPos[LEADERBOARD_DAY] = this.parseLeaderboardEntry(oRet[0]);
                            this.getPlayerNeighbors(oRet[0].rank,LEADERBOARD_DAY).then(()=>{ 
                                this.refreshLeadeboard(LEADERBOARD_DAY);
                            });

                        }else{
                            this.refreshLeadeboard(LEADERBOARD_DAY);
                        }
                    }
            ); 
        }else{
            this.refreshLeadeboard(LEADERBOARD_DAY);
        }
    };

    this.deselectButtons = function(){
        document.querySelector("#footer-btn-title-"+LEADERBOARD_DAY).classList.remove('active');
        document.querySelector("#footer-btn-title-"+LEADERBOARD_GENERAL).classList.remove('active');
        document.querySelector("#footer-btn-title-"+LEADERBOARD_MONTH).classList.remove('active');
    };

    this.parseLeaderboardEntry = function(oEntry){
        var iScore = 0;
        if(oEntry.score){
            iScore = oEntry.score;
        }

        //CALCULATE BADGE TYPE
        var iLevel = this.calculateBadgeLevelByRanking(iScore);

        return {userId: (oEntry.userId).split("simple")[1], rank: oEntry.rank, score: iScore,badge_index:iLevel};
    };
    
    
    //END#################LEADERBOARD

    this.getRanking = function(){
        return _iPlayerRanking;
    };
    
    this.getWinMatches = function(){
        return _iWins;
    };
    
    this.getLossMatches = function(){
        return _iLosses;
    };
    
    this.getTotMatches = function(){
        return _iTotMatches;
    };
    
    this.getBadgeLevel = function(){
        return _iCurBadgeLevel;
    };
    
    this.getRoomAccess = function(){
        return _oInfoAccessRoom;
    };
    
    this.getNumBadges = function(){
        return _iAmountBadges;
    };
    
    this._init();
}
