﻿vLaboralApp.controller('profesionalesCtrl', function ($scope //fpaz: definicion de inyectores de dependencias
    , rubrosDF, profesionalesDF //fpaz: definicion de data factorys
    , listadoRubros, listadoHabilidades //fpaz: definicion de parametros de entrada
) {

    //#region fpaz: Inicializacion de variables de Scope
    $scope.rubros = listadoRubros;
    $scope.habilidades= listadoHabilidades;
    //#endregion

});
