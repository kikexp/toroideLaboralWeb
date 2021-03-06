﻿vLaboralApp.controller('experienciasLaboralesCtrl', function ($scope, $mdMedia, $mdDialog, $ocLazyLoad, $filter, $stateParams //fpaz: definicion de inyectores de dependencias
    , experienciasLaboralesDF, authSvc, notificacionesSvc //fpaz: definicion de data factorys
    , listEmpresas, experienciaPendiente//fpaz: definicion de parametros de entrada    
    ) {



    //#region fpaz: Inicializacion de variables
    $scope.empresas = listEmpresas;
    $scope.experienciaPendiente = experienciaPendiente;

    options = { //fpaz: opciones de configuracion para el autocomplete de ciudades
        types: '(cities)'
    }

    $scope.verificacionExperienciaLaboral = {
        Comentario: "",
        Valoracion: 0
    }


    //#endregion



    //#region fpaz: Alta de Nueva Experiencia
    $scope.saveExp = function (prmExp) {

        prmExp.ProfesionalId = $stateParams.idPro; //obtengo el id del profesional directamente desde el parametro de la url, ya que puede ser que una empresa sea la que este cargando la exp, con lo cual authSvc no sirve
        prmExp.idUsuarioCreacion = authSvc.authentication.idUsuarioLogueado; // obtengo el id de identity del usuario logueado, es independiente de si es un profesional o una empresa
        prmExp.FechaCreacion = new Date();

        if (angular.isObject($scope.selectedItem)) {
            prmExp.EmpresaId = $scope.selectedItem.Id;
        } else {
            prmExp.EmpresaExterna = $scope.searchText;
        }

        experienciasLaboralesDF.postExperiencia(prmExp).then(function (response) {

            if (angular.isUndefined(prmExp.EmpresaExterna)) { // si la nueva exp esta relacionada con una empresa cargada en el sistema envio la notificacion
                console.log("Envia Notificacion");
                notificacionesSvc.enviarNotificacionExperiencia(response.data);
                $mdDialog.hide(response.data.ExperienciaLaboral);
            } else {
                console.log("No Envia Notificacion");
                $mdDialog.hide(response.data);
            }            
            alert("Experiencia Guardada");
            
        },
    function (err) {
        if (err) {
            $scope.error = err;
            alert("Error al Guardar la Experiencia: " + $scope.error.Message);
        }
    });
    };
    //#endregion

    //#region Alta de Evaluacion de experiencia
    $scope.verificarExperiencia = function () {

        $scope.verificacionExperienciaLaboral.Id = $scope.experienciaPendiente.id;
        $scope.verificacionExperienciaLaboral.FechaVerificacion = new Date;
        $scope.verificacionExperienciaLaboral.ExperienciaLaboral = null ;
        experienciasLaboralesDF.postVerificarExperiencia($scope.verificacionExperienciaLaboral);
        

    }
    //#endregion

    $scope.cancel = function () {
        $mdDialog.cancel();
    };



});


