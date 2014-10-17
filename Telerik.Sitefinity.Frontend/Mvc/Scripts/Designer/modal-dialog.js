/* global angular */
(function () {
    var modalDialogModule = angular.module('modalDialog', ['ui.bootstrap']);

    //Keeps track of the number of opened modal dialogs.
    modalDialogModule.factory('dialogsService', function () {
        var openedDialogsCount = 0;
        return {
            increaseDialogsCount: function () {
                openedDialogsCount++;
            },
            decreaseDialogsCount: function () {
                openedDialogsCount--;
            },
            getOpenedDialogsCount: function () {
                return openedDialogsCount;
            }
        };
    });

    modalDialogModule.directive('modal', ['$modal', 'dialogsService', function ($modal, dialogsService) {
        var resolveControllerName = function (attrs) {
            if (!attrs.dialogController && !attrs.existingScope) {
                throw 'Please either insert an attribute named "dialog-controller" with the name of the controller for the modal dialog next to the "modal" directive ' +
                'or insert attribute named "existing-scope" to reuse the current scope in the dialog.';
            }

            return attrs.dialogController;
        };

        var modalDialogClass = '.modal-dialog';
        var backdropClass = 'div.modal-backdrop';

        var open = function (scope, attrs) {
            //Hide already opened dialogs.
            $(modalDialogClass).hide();

            var modalInstance = $modal.open({
                backdrop: 'static',
                scope: attrs.existingScope && scope,
                templateUrl: attrs.templateUrl,
                controller: resolveControllerName(attrs),
                windowClass: attrs.windowClass
            });

            scope.$modalInstance = modalInstance;

            dialogsService.increaseDialogsCount();

            /*
             * Closes the active dialog and shows the one that
             * was opened before it.
             */
            var closeActiveDialog = function () {

                dialogsService.decreaseDialogsCount();

                $('.' + attrs.windowClass).remove();

                if (dialogsService.getOpenedDialogsCount() > 0) {
                    //There is another dialog except this one. Show it and keep the backdrop.
                    $(modalDialogClass).show();
                }
                else {
                    $(backdropClass).remove();
                }
            }

            /*
             * Subscribe to the promise of a result, but don't do it
             * in the final fashion. We want to allow the chaining of the
             * promises so that functionality down the line can act once
             * the dialog is closed.
             */
            scope.$modalInstance.result.then(function (result) {
                // resolved
                closeActiveDialog();
                return result;
            }, function (reason) {
                // rejected
                closeActiveDialog();
                return reason;
            });
        };

        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                if (attrs.autoOpen) {
                    open(scope, attrs);
                }
                else {
                    scope.$openModalDialog = function () {
                            open(scope, attrs);
                    };
                }
            }
        };
    }]);
})();