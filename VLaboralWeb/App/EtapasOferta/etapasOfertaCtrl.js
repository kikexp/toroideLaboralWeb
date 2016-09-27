﻿vLaboralApp.controller('etapasOfertaCtrl', function ($scope, $mdDialog, $mdMedia, $filter //fpaz: definicion de inyectores de dependencias
    , listadoTiposEtapas, etapasCargadas, etapaDetalle,postulantesDF, ofertasDF //fpaz: definicion de parametros de entrada 
    ) {

    //#region fpaz: Inicializacion de variables de scope
    $scope.etapasCargadas = etapasCargadas;
    $scope.etapaOferta = {};
    $scope.tiposEtapas = listadoTiposEtapas;
    $scope.etapaDetalle = etapaDetalle;

    $scope.query = {
        order: 'Valoracion',
        limit: 10,
        page: 1
    };
    $scope.selectPostulantes = [];
    //#endregion

    //#region reordenamiento de etapas al agregar una nueva etapa

    $scope.setearEtapaSiguiente = function () {
        
        for (var i in $scope.etapasCargadas) {

            if ($scope.etapasCargadas[i].Orden == $scope.etapaAnterior.Orden + 1) {
                $scope.etapaSiguiente = angular.copy($scope.etapasCargadas[i]);
                break;
            }
        }

    }
    //#endregion

    //#region fpaz: carga de etapas desde el modal
    $scope.addEtapa = function (prmEtapa) {

        for (var i = 0; i < $scope.etapasCargadas.length; i++) {
            if ($scope.etapasCargadas[i].Orden == $scope.etapaSiguiente.Orden) {
                prmEtapa.Orden = $scope.etapaSiguiente.Orden;                
                for (var j = i; j < $scope.etapasCargadas.length; j++) {
                    $scope.etapasCargadas[j].Orden++;
                }
                break;
            }
        }

        $scope.etapasCargadas.push(prmEtapa);

        var etapas = $filter('orderBy')($scope.etapasCargadas, 'Orden'); //array de etapas cargadas incluyendo la nueva que se devuelven ordenadas a la oferta
        
        $mdDialog.hide(etapas);
    }

    $scope.cancel = function () {
        $mdDialog.cancel();
    };

    //#endregion
    
    //#region objeto con el array con los profesionales que pasan a la siguiente etapa de manera parcial
    $scope.guardarPostulantes = function () {
        resultadoPostulaciones.PuestosEtapaOfertaId = $scope.etapaDetalle.Oferta.PuestosEtapaOferta[1].Postulaciones[1].PuestosEtapaOfertaId;
        resultadoPostulaciones.Postulaciones = $scope.selectPostulantes;

        postulantesDF.putPostulacion(resultadoPostulaciones.Postulaciones, resultadoPostulaciones.PuestosEtapaOfertaId);

    }

    //#endregion

    //#region funcion que pasa la oferta a la siguiente etapa
    $scope.pasarSiguienteEtapa = function (prmId) {
        ofertasDF.postOfertaPasarSiguienteEtapa(prmId);

    }
    //#endRegion

    //#region kikepx: modal con el detalle del perfil del postulante
    $scope.postulanteDetalle= function (profesionalId) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'profesionalesCtrl',
            templateUrl: 'App/Postulantes/Partials/postulanteDetalle.html',
            parent: angular.element(document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,            
            fullscreen: useFullScreen,
            resolve: {
                listadoOfertas: function () {
                    return { value: [] };
                },
                rubrosDF: 'rubrosDF',
                habilidadesDF: 'habilidadesDF',
                tiposIdentificacionDF: 'tiposIdentificacionDF',
                listadoRubros: function () {
                    return { value: [] };
                },
                listadoHabilidades: function () {
                    return { value: [] };
                },
                listadoIdentificacionPro: function () {
                    return { value: [] };
                },
                profesionalesDF: 'profesionalesDF',
                infoProfesional: function (profesionalesDF) {
                    
                    return profesionalesDF.getProfesional(profesionalId);
                },
                listadoOfertas: function () {
                    return { value: [] };
                },
                loadProfesionalesCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/Profesionales/profesionalesCtrl.js']);
                }]
            }
        })
        .then(function (nuevasEtapas) {
            $scope.oferta.EtapasOferta = nuevasEtapas;
        });
    }
    //#endregion


});








