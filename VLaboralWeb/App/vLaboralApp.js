﻿var vLaboralApp = angular.module('vLaboralApp', ['ngResource', 'ngMdIcons', 'ui.router', 'ngCookies', 'ngTable',
  'ngSanitize', 'ngAnimate', 'ngAria', 'ct.ui.router.extras', 'angular-loading-bar', 'LocalStorageModule', 'angular-jwt', 'ngMaterial',
  'oc.lazyLoad', 'ng-mfb', 'ngAutocomplete', 'angular-input-stars', 'ngFileUpload'])
    .config(function ($stateProvider, $urlRouterProvider, $httpProvider, $stickyStateProvider, cfpLoadingBarProvider) {

        cfpLoadingBarProvider.includeSpinner = true;
        cfpLoadingBarProvider.includeBar = true;


        $urlRouterProvider.otherwise("/home");

        $stateProvider //fpaz: defino los states que van a guiar el ruteo de las vistas parciales de la app       

            //#region Home 
            .state('home', {
                url: "/home",
                views: {
                    '': {
                        templateUrl: '/App/Home/Partials/home.html'
                    },
                    'menuHome': {
                        templateUrl: '/App/Home/Partials/homeMenu.html',
                        controller: ''
                    },
                    'infoHome': {
                        templateUrl: '/App/Home/Partials/homeInfo.html',
                        controller: ''
                    },
                    'ofertasHome': {
                        templateUrl: '/App/Home/Partials/homeOfertas.html',
                        controller: ''
                    }
                }
            })
                .state('registroProfesional', {
                    url: "/registro/profesional",
                    templateUrl: '/App/Seguridad/Partials/registroProfesional.html'
                })
                .state('registroEmpresa', {
                    url: "/registro/empresa",
                    templateUrl: '/App/Seguridad/Partials/registroEmpresa.html'
                })
                .state('login', {
                    url: "/login",
                    templateUrl: '/App/Seguridad/Partials/login.html'
                })
                .state('solicitud', {
                    url: "/solicitud",
                    templateUrl: '/App/Seguridad/Partials/confirmCuenta.html'
                })

        //#endregion

        //#region Empresa
        .state('empresa', {
            abstract: true,
            url: '/empresa',
            views: {
                '': {
                    templateUrl: '/App/DashboardEmpresa/Partials/empresaDashboard.html'
                },
                'menu': {
                    templateUrl: '/App/DashboardEmpresa/Partials/empresaMenu.html'
                },
                'contenido': {
                    templateUrl: '/App/DashboardEmpresa/Partials/empresaContenido.html'
                }
            }
        })
            .state('empresa.ofertas', {
                url: '/ofertas',
                templateUrl: '',
                controller: ''
            })
                .state('empresa.ofertas.add', {
                    url: '/nueva',
                    templateUrl: '/App/Ofertas/Partials/ofertasAdd.html',
                    controller: 'ofertasCtrl',
                    resolve: {
                        tiposDisponibilidadDF: 'tiposDisponibilidadDF',
                        listadoTiposDiponibilidad: function (tiposDisponibilidadDF) {
                            return tiposDisponibilidadDF.getTiposDisp();
                        },
                        tiposContratoDF: 'tiposContratoDF',
                        listadoTiposContratos: function (tiposContratoDF) {
                            return tiposContratoDF.getTiposContratos();
                        },                        
                        loadOfertasCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['App/Ofertas/ofertasCtrl.js']);
                        }]
                    }

                })
        //#endregion

        //#region Profesional
        .state('profesional', {
            abstract: true,
            url: '/profesional',
            views: {
                '': {
                    templateUrl: '/App/DashboardProfesional/Partials/profesionalDashboard.html'
                },
                'menu': {
                    templateUrl: '/App/DashboardProfesional/Partials/profesionalMenu.html'
                },
                'contenido': {
                    templateUrl: '/App/DashboardProfesional/Partials/profesionalContenido.html'
                }
            }
        })
            .state('profesional.perfil', {
                url: '/perfil',
                templateUrl: '/App/Profesionales/Partials/profesionalPerfil.html',
                controller: ''
            })
            .state('profesional.ofertas', {
                url: '/ofertas',
                templateUrl: '/App/Ofertas/Partials/ofertasList.html',
                controller: ''
            })
        //#endregion

    })


    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptorSvc');//agrego al array de interceptor el sevicio authInterceptorSvc que se encarga de mandar ,en cada peticion al web api, el token de acceso obtenido en el login y de redirigir a la pagina de logueo , en caso de que un usuario anonimo quiera agseder a un recurso privado
    })
    .config(
    ['$controllerProvider', '$compileProvider', '$filterProvider', '$provide',
    function ($controllerProvider, $compileProvider, $filterProvider, $provide) {

        // lazy controller, directive and service
        vLaboralApp.controller = $controllerProvider.register;
        vLaboralApp.directive = $compileProvider.directive;
        vLaboralApp.filter = $filterProvider.register;
        vLaboralApp.factory = $provide.factory;
        vLaboralApp.service = $provide.service;
        vLaboralApp.constant = $provide.constant;
        vLaboralApp.value = $provide.value;
    }
    ])
    .run(['authSvc', function (authSvc) { //cada ves que el usuario entra a la aplicacion ejecuto la funcion para obtener el token guardado en el storage que este vigente, en caso de que exita uno almacenado
        authSvc.fillAuthData();
    }]);
