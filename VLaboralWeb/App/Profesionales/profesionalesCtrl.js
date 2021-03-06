﻿vLaboralApp.controller('profesionalesCtrl', function ($scope, $mdMedia, $mdDialog, $ocLazyLoad,$window //fpaz: definicion de inyectores de dependencias
    , blobsDataFactory, rubrosDF, habilidadesDF, tiposIdentificacionDF, profesionalesDF, ofertasDF, authSvc, empresasDF //fpaz: definicion de data factorys
    , profesionalesList, listadoRubros, listadoHabilidades, listadoIdentificacionPro, listadoOfertas, infoProfesional, selectedPro
    , listOpcionesFiltrosOfertas, listOpcionesFiltrosProfesionales//fpaz: definicion de parametros de entrada    
    ) {

    
    //#region fpaz: Inicializacion de variables de Scope    
    $scope.habilidades= listadoHabilidades;
    $scope.identificacionesPro = listadoIdentificacionPro;
    $scope.profesional = infoProfesional; //iafar: ya vienen definidos todos los atributos desde la API
  
    $scope.chipsHabilidad = infoProfesional.Habilidades;

    //$scope.chipsRubros = infoProfesional.SubRubros;
    
    $scope.profesionalesList = profesionalesList;


    $scope.Rubros = listadoRubros;
    $scope.rubroSelected = {};

    $scope.subRubros = {};
    $scope.subRubroSelected = {};

    $scope.subRubroDisabled = true;
    $scope.ofertas = listadoOfertas;
    //$scope.totalOfertas = listadoOfertas.TotalRows;
    
    $scope.selectItems = []; //iafar: array de elementos seleccionados para eliminacion
    
    $scope.editValue = false; // variable que voy a usar para activar y desactivar los modos de edicion para hacer el update de la info

    $scope.usuarioLogueado = authSvc.authentication;//fpaz: obtiene la informacion del usuario logueado

    $scope.profesional.FechaNac = new Date($scope.profesional.FechaNac);

    $scope.opcionesFiltrosOfertas = listOpcionesFiltrosOfertas;
    $scope.opcionesFiltrosProfesionales = listOpcionesFiltrosProfesionales;
    
    //#region variables iniciales para paginacion
    $scope.queryFiltros = { // tiene los parametros que voy a pasar para filtrar el listado. 
        Rows: 5, //valor inicial de cantidad de filas mostradas
        Page: 1 //valor inicial de la pagina mostrada
    };

    $scope.limitOptions = [1, 2, 5, 10, 15];// sirve para seleccionar la cantidad de filas que se van a mostrar en la tabla

    $scope.TotalRows;
    //#endregion

    //#endregion

    //#region iafar: transformar habilidades de chips en strings
    $scope.transformChip = function (chip) {
        
        // iafar: Si es un objeto, es una habilidad desde la BD
        if (angular.isObject(chip)) {
            return chip.Nombre.toUpperCase();
        }
        // iafar: Sino, no existe en BD
        return chip.toUpperCase();
    }
    //#endregion

    //#region SLuna: Traer Listado de Ofertas
    $scope.pageChanged = function (newPage) {
        ofertasDF.getOfertas(newPage, $scope.ofertasPerPage)
          .then(function (data) {
              $scope.totalOfertas = data.TotalRows;
              $scope.ofertas = data.Results;
          });
    };
    //#endregion

    //#region SLuna: eventos relacionados con Rubros
    $scope.rubroChanged = function () {
        rubrosDF.getRubro($scope.rubroSelected)
            .then(function (data) {
                $scope.Rubro = data;
                $scope.subRubroDisabled = $scope.Rubro.Subrubros.length === 0;//Si no tiene SubRubros, oculta el Select de SubRubros
            });
    };
    
    $scope.subRubroChanged = function () {
    };

    $scope.subRubroAddClick = function () {
        
        for (var i = 0; i < $scope.profesional.Subrubros.length; i++) {
            if ($scope.profesional.Subrubros[i].Id === $scope.subRubroSelected.Id) {
                alert("Advertencia: El SubRubro ya está seleccionado.");
                return;
            }
        }
        $scope.profesional.Subrubros.push($scope.subRubroSelected);
    };

    $scope.QuitarSubRubro = function (IdSubRubro) {
        //for (var i = 0; i < $scope.profesional.Subrubros.length; i++) {
        //    if ($scope.profesional.Subrubros[i].Id === IdSubRubro) {
        //        $scope.profesional.Subrubros.splice(i, 1);
        //        return;
        //    }
        //}
        var index = $scope.profesional.Subrubros.indexOf(IdSubRubro);
        $scope.profesional.Subrubros.splice(index, 1);
    };

    //#endregion

    //#region fpaz: actualizacion de perfil del profesional
    $scope.edit = function () {//fpaz: activa el modo de edicion de los campos                
        $scope.editValue = true;
    };

    $scope.profesionalPerfilUpdate = function (prmProfesional) {
        prmProfesional.Habilidades =  $scope.chipsHabilidad !== null ? $scope.chipsHabilidad.toString() : null;
        profesionalesDF.putProfesional(prmProfesional.Id, prmProfesional).then(function (response) {
            alert("Perfil del Profesional Actualizado");
            $scope.profesional = response; //si se actualizo bien el perfil del profesional, cargo el scope con los datos guardados
        },
        function (err) {
            if (err) {
                $scope.error = err;
                alert("Error al Guardar los Cambios en el Perfil: " + $scope.error.Message);
                $scope.profesional = infoProfesional; //Si hubo un error en la actualizacion, cargo los datos originales
            }
        });
    };
    //#endregion

    //#region iafar:region mdTable
    $scope.agregarDoc = function (obj) {
       
       
        $scope.profesional.IdentificacionesProfesional.push(obj);
        borraScopeAdd();
    }

    //iafar: borra el scope de los campos de alta de documento
    function borraScopeAdd() {
        $scope.opcionAgregar = false;
        $scope.nuevoDoc = {};
    }

    $scope.eliminarTipoId = function (objList) {
        var pos;
        for (var o in objList) {
            pos = $scope.profesional.IdentificacionesProfesional.indexOf(objList[o]);
            $scope.profesional.IdentificacionesProfesional.splice(pos, 1);
            //alert($scope.docList.indexOf(objList[o]));
        }
        $scope.selectItems = [];
    }
    $scope.opcionAgregar = false; //iafar: para mostrar el menu para agregar un nuevo tipo de Id
    //#endregion


    //#region kikexp: dispara el modal de nueva experiencia
    $scope.nuevaExperiencia = function () {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'experienciasLaboralesCtrl',
            templateUrl: 'App/ExperienciasLaborales/Partials/nuevaExperiencia.html',
            parent: angular.element(document.body),            
            clickOutsideToClose: true,            
            fullscreen: useFullScreen,
            resolve: {
                experienciasLaboralesDF: 'experienciasLaboralesDF',
                listEmpresas: function (empresasDF) {
                    return empresasDF.getEmpresas();
                },
                experienciaPendiente: function () {
                    return { value: [] };
                },                
                loadExperienciasLaboralesCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/ExperienciasLaborales/experienciasLaboralesCtrl.js']);
                }]
            }
        })
        .then(function (nuevaExperiencia) {
            $scope.profesional.ExperienciasLaborales.push(nuevaExperiencia);
        });
    }
    //#endregion

    //#region kikexp: dispara el modal de nuevo curso o certificacion
    $scope.nuevoCurso = function () {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'cursosCtrl',
            templateUrl: 'App/Cursos/Partials/nuevoCurso.html',
            parent: angular.element(document.body),            
            clickOutsideToClose: true,            
            fullscreen: useFullScreen,
            resolve: {                
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/Cursos/cursosCtrl.js']);
                }]
            }
        })
        .then(function (nuevoCurso) {
            $scope.profesional.Cursos.push(nuevoCurso);
        });
    }
    //#endregion

    //#region kikexp: dispara el modal de nuevo Idioma
    $scope.nuevoIdioma = function () {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'idiomasCtrl',
            templateUrl: 'App/Idiomas/Partials/nuevoIdiomaConocido.html',
            parent: angular.element(document.body),            
            clickOutsideToClose: true,            
            fullscreen: useFullScreen,
            resolve: {
                idiomasDF: 'idiomasDF',
                listIdiomas: function (idiomasDF) {
                    return idiomasDF.getIdiomas();
                },                
                listCompetenciasIdioma: function (idiomasDF) {
                    return idiomasDF.getCompetencias();
                },
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/Idiomas/idiomasCtrl.js']);
                }]
            }
        })
        .then(function (nuevoIdioma) {
            $scope.profesional.IdiomasConocidos.push(nuevoIdioma);
        });
    }
    //#endregion

    //#region kikexp: dispara el modal de nueva educacion
    $scope.nuevaEducacion = function () {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'educacionCtrl',
            templateUrl: 'App/Educacion/Partials/nuevaEducacion.html',
            parent: angular.element(document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,           
            fullscreen: useFullScreen,
            resolve: {
                tiposNivEstudioDF: 'tiposNivEstudioDF',
                listTiposNivelesEstudio: function (tiposNivEstudioDF) {
                    return tiposNivEstudioDF.getTiposNivelEstudio();
                },
                loadCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/Educacion/educacionCtrl.js']);
                }]
            }
        })
        .then(function (nuevaEducacion) {
            $scope.profesional.Educaciones.push(nuevaEducacion);
        });
    }
    //#endregion

    //#region iafar: elementos usados en listado de profesionales

    //iafar: array de profesionales seleccionados
    $scope.search = "";
    $scope.selectedPro = selectedPro; //iafar: array con los profesionales ya listados para invitar en la ventana padre (en caso de usar dialog)
    $scope.selectedItems = []; //iafar: array de elementos seleccionados para eliminacion
    $scope.profesionalesList = profesionalesList; //iafar: cargo scope con primera pagina de profesionales
    $scope.guardarLista = function (response) {
        
        response = response.concat(selectedPro);
        $mdDialog.hide(response);
    }

    $scope.filtrarLista = function (filtro) { //iafar: aqui puede ser usado para consultar a la api a traves de parametros
        $scope.search = filtro.NomApellido;

    }

    //#endregion

    $scope.cancel = function () {
        $mdDialog.cancel();
    }


    //#region Detalle profesional
    $scope.abrirDetalle = function (profesionalId) {
        console.log(profesionalId)
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'profesionalesCtrl',
            templateUrl: 'App/Postulantes/Partials/postulanteDetalle.html',
            parent: angular.element(document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true,
            resolve: {
                listadoOfertas: function () {
                    return { value: [] };
                },                
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
                selectedPro: function () {
                    return [];
                },
                profesionalesList: function () {
                    return { value: [] };
                },
                listOpcionesFiltrosOfertas: function () {
                    return { value: [] };
                },
                listOpcionesFiltrosProfesionales: function () {
                    return { value: [] };
                },
                loadProfesionalesCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/Profesionales/profesionalesCtrl.js']);
                }]
            }
        })
        .then(function () {

        });
    }
    //#endregion

    //#region Convocar profesional
    $scope.convocarProfesional = function (prmProfesional) {
        var arrayProf;
        arrayProf.push(prmProfesional);
        $state.go('empresa.ofertas.convocarPro', {postulantesOferta: arrayProf})

    }

    $scope.invitarOferta = function () {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
        $mdDialog.show({
            controller: 'ofertasCtrl',
            templateUrl: '/App/Ofertas/Partials/ofertasPrivadasList.html',
            parent: angular.element(document.body),
            //targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: true,
            resolve: {
                ofertasDF: 'ofertasDF',
                listadoOfertas: function () {
                    return { value: [] };
                },
                tiposDisponibilidadDF: 'tiposDisponibilidadDF',
                listadoTiposDiponibilidad: function () {
                    return { value: [] };
                },
                rubrosDF: 'rubrosDF',
                habilidadesDF: 'habilidadesDF',
                tiposIdentificacionDF: 'tiposIdentificacionDF',
                listadoRubros: function () {
                    return { value: [] };
                },
                tiposContratoDF: 'tiposContratoDF',
                listadoTiposContratos: function () {
                    return { value: [] };
                },
                listadoHabilidades: function () {
                    return { value: [] };
                },
                listadoIdentificacionPro: function () {
                    return { value: [] };
                },
                requisitosDF: 'requisitosDF',
                listadoTiposRequisitos: function () {
                    return { value: [] };
                },
                profesionalesDF: 'profesionalesDF',
                infoProfesional: function () {
                    return { value: [] };
                },
                ofertaDetalle: function () {
                    //var prmIdOferta = $stateParams.idOferta;
                    //return ofertasDF.getOferta(prmIdOferta);
                },
                etapasObligatorias: function () {
                    return { value: [] };
                },
                ofertasPrivadas: function () {
                    return ofertasDF.getOfertasPrivadasProfesional(1,50);
                },
                loadOfertasCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['App/Ofertas/ofertasCtrl.js']);
                }]
            }


        })
        .then(function () {

        });
    }
    //#endregion

    //#region fpaz: funciones para el manejo de filtros y ordenamiento en el listado de ofertas

    $scope.setSelectedOfertas = function (filterType, filterValue) { //funcion para armar el objeto con los filtros para las ofertas
        //si el valor pasado como parametro existe lo elimino, sino lo agrego

        //convierto el id en string
        var id = filterValue.Id.toString();

        if ($scope.queryFiltros[filterType] && $scope.queryFiltros[filterType].indexOf(id) >= 0) {
            if (Array.isArray($scope.queryFiltros[filterType])) {
                $scope.queryFiltros[filterType].splice($scope.queryFiltros[filterType].indexOf(id), 1);
            } else {
                $scope.queryFiltros[filterType] = [];
            }
        } else {
            if (!$scope.queryFiltros[filterType]) {
                $scope.queryFiltros[filterType] = [];
            }

            $scope.queryFiltros[filterType].push(id);
        }

        //llamo al webapi para obtener los valores filtrados
        $scope.obtenerListadoFiltradoOfertas();

    }
    
    $scope.obtenerListadoFiltradoOfertas = function () {
        console.log('entra a $scope.obtenerListadoFiltradoOfertas');

        var query = angular.copy($scope.queryFiltros);

        ofertasDF.obtenerOfertasFiltradas(query).then(function (response) {
            console.log('entra a obtener ofertas filtradas');            
            $scope.ofertas = response.results;
            $scope.TotalRows = response.totalPages;
        },
    function (err) {
        if (err) {
            $scope.error = err;
            alert("Error al Filtrar las Ofertas: " + $scope.error.Message);
        }
    });
    }

    $scope.logPaginationOfertas = function (page, limit) {
        console.log('page: ', page);
        console.log('limit: ', limit);
        //llamo al webapi para obtener los valores filtrados
        $scope.obtenerListadoFiltradoOfertas();
    }

    //$scope.ordenOfertasChanged = function () {
    //    console.log('Ordenamiento: ', $scope.queryFiltros.orderBy);
    //    //llamo al webapi para obtener los valores filtrados        
    //    $scope.obtenerListadoFiltradoOfertas();
    //}
    $scope.ordenOfertasFechaInicio = function () {
        $scope.FechaInicioConvocatoria = 'FechaInicioConvocatoria';
        console.log('Ordenamiento', $scope.FechaInicioConvocatoria);
        $scope.obtenerListadoFiltradoOfertas();
    }

    $scope.ordenOfertasFechaFin = function () {
        $scope.FechaFinConvocatoria = 'FechaInicioFin';
        console.log('Ordenamiento', $scope.FechaFinConvocatoria);
        $scope.obtenerListadoFiltradoOfertas();
    }


    $scope.busquedaNombreOferta = function (prmNombre) {
        console.log('Busqueda por nombre: ', $scope.queryFiltros.searchText);
        $scope.queryFiltros.searchText = prmNombre;
        //llamo al webapi para obtener los valores filtrados        
        $scope.obtenerListadoFiltradoOfertas();
    }
    //#endregion

    //#region fpaz: funciones para el manejo de filtros y ordenamiento en el listado de profesionales
    $scope.setSelectedProfesionales = function (filterType, filterValue) { //funcion para armar el objeto con los filtros para los profesionales
        //si el valor pasado como parametro existe lo elimino, sino lo agrego

        //convierto el id en string
        var id = filterValue.Id.toString();

        if ($scope.queryFiltros[filterType] && $scope.queryFiltros[filterType].indexOf(id) >= 0) {
            if (Array.isArray($scope.queryFiltros[filterType])) {
                $scope.queryFiltros[filterType].splice($scope.queryFiltros[filterType].indexOf(id), 1);
            } else {
                $scope.queryFiltros[filterType] = [];
            }
        } else {
            if (!$scope.queryFiltros[filterType]) {
                $scope.queryFiltros[filterType] = [];
            }

            $scope.queryFiltros[filterType].push(id);
        }

        //siempre despues de filtar ordeno por valoracion
        $scope.queryFiltros.orderBy = 'ValoracionDesc';
        //llamo al webapi para obtener los valores filtrados
        $scope.obtenerListadoFiltradoProfesionales();

    }
        
    $scope.obtenerListadoFiltradoProfesionales = function () {
        console.log('entra a $scope.obtenerListadoFiltradoProfesionales');

        var query = angular.copy($scope.queryFiltros);

        profesionalesDF.obtenerProfesionalesFiltrados(query).then(function (response) {
            console.log('entra a obtener profesionales filtrados');
            $scope.profesionalesList = response.results;
            $scope.TotalRows = response.totalPages;
        },
    function (err) {
        if (err) {
            $scope.error = err;
            alert("Error al Filtrar los profesionales: " + $scope.error.Message);
        }
    });
    }

    $scope.logPaginationProfesionales = function (page, limit) {
        console.log('page: ', page);
        console.log('limit: ', limit);
        //llamo al webapi para obtener los valores filtrados        
        $scope.obtenerListadoFiltradoProfesionales();
    }

    $scope.ordenProfesionalChanged = function () {
        console.log('Ordenamiento: ', $scope.queryFiltros.orderBy);
        //llamo al webapi para obtener los valores filtrados        
        $scope.obtenerListadoFiltradoProfesionales();
    }

    $scope.busquedaNombreProfesional = function (prmNombre) {
        console.log('Busqueda por nombre: ', $scope.queryFiltros.searchText);
        $scope.queryFiltros.searchText = prmNombre;
        //llamo al webapi para obtener los valores filtrados        
        $scope.obtenerListadoFiltradoProfesionales();
    }
    //#endregion


    $scope.guardarImagenEmpresa = function (profesional, foto) {
        blobsDataFactory.postImagen(foto)
            .then(
            function (response) {
                profesional.UrlImagenPerfil = response.UrlFile;
                profesionalesDF.putEmpresa(profesional);
            })
            .then(
            function (response) {
                prmImagenProfesional = response;
                prmImagenProfesional.ProfesionalId = profesional.Id;
                prmImagenProfesional.Tipo = "img";
                empresasDF.postImagenProfesional(prmImagenProfesional);
                $window.location.reload();
            });
    }

    $scope.guardarCurriculum = function (profesional, curriculumn) {
        blobsDataFactory.postCurriculumn(curriculumn)
        .then(function (response) {
            profesiona.UrlCurriculumn = response.UrlCurriculumn;
            profesionalesDF.putProfesional(profesional);
        })
        .then(function (response) {
            prmCurriculumnProfesional = response;
            prmCurriculumnProfesional.ProfesionalId = profesional.Id;
            prmCurriculumnProfesional.Tipo = "pdf";
            empresaDF.postImagenProfesional(prmImagenProfesional);
            $window.location.reload();
        })
    }
});
