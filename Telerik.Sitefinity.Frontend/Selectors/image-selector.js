; (function () {

    var selectors = angular.module('selectors');

    var LIST_MODE = 'list',
        UPLOAD_MODE = 'upload',
        INSERT_MODE = 'insert'

    /*
     * Provides functionality for the list mode of the image selector.
     */
    selectors.controller('sfImageSelectorListCtrl', ['$scope', function ($scope) {

        // Event handler fired by the button for selecting a file manually.
        $scope.selectFile = function () {
            $scope.$emit('doSelectFile');
        };

    }]);

    /*
     * Provides functionality for the upload mode of the image selector.
     */
    selectors.controller('sfImageSelectorUploadCtrl', ['$scope', function ($scope) {

    }]);

    /*
     * Provides functionality for the insert mode of the image selector.
     */
    selectors.controller('sfImageSelectorInsertCtrl', ['$scope', function ($scope) {

    }]);

    /*
     * This directive represents the Sitefinity Image Selector.
     */
    selectors.directive('sfImageSelector', ['serverContext', function (serverContext) {

        var imageSelectorController = function ($scope) {

            $scope.modes = {
                LIST_MODE: LIST_MODE,
                UPLOAD_MODE: UPLOAD_MODE,
                INSERT_MODE: INSERT_MODE
            };

            $scope.activeMode = $scope.modes.LIST_MODE;

            $scope.$emit('needsImage', function (e) {
                
            });

            $scope.$on('changeMode', function (ev, arg) {
                $scope.activeMode = arg;
            });

        };

        return {
            restrict: 'E',
            scope: {},
            templateUrl: serverContext.getEmbeddedResourceUrl('Telerik.Sitefinity.Frontend', 'Selectors/image-selector.html'),
            controller: imageSelectorController
        }

    }]);

    /*
     * Image Selector Modal directive wraps the Image selector in a modal dialog. It is a 
     * convenience thin wrapper which can be used to open the Image Selector in a modal dialog.
     */
    selectors.directive('sfImageSelectorModal', ['$compile', '$parse', 'serverContext', function ($compile, $parse, serverContext) {

        var link = function ($scope, element, attributes) {

            var selectorTemplate = serverContext.getEmbeddedResourceUrl('Telerik.Sitefinity.Frontend', 'Selectors/image-selector-modal.html'),
                directiveMarkup = '<div modal existing-scope="true" window-class="sf-image-selector-dlg" template-url="' + selectorTemplate + '" size="lg"></div>',
                modalDirective = $compile(directiveMarkup)($scope),
                editMarkup;

            // appends the compiled modal directive 
            var modalElement = $(element).append(modalDirective);

            // holds the value of the image that has been selected through the image selector
            var selectedImage;

            $scope.$on('imageSelected', function (ev, arg) {
                selectedImage = arg;
            })

            $scope.$on('needsImage', function (ev, arg) {
                arg(editMarkup);
            });

            /*
             * Opens the image selector modal dialog.
             */
            $scope.open = function (markup) {
                editMarkup = markup;
                var dialog = angular.element(modalElement).scope().$openModalDialog();
            };

            /*
             * Cancels the operation and closes the modal window.
             */
            $scope.cancel = function () {
                $scope.$modalInstance.close();
            }

            // sfOnSelected

            /*
             * Saves the changes and returns the selected image?!
             * TODO: This seems to be awkwardly named by UX team; think of naming it better.
             */
            $scope.saveChanges = function () {
                $scope.$modalInstance.result.then(function (e) {
                    $(element).trigger('imageSelected', e);
                });
                $scope.$modalInstance.close(selectedImage);
            };

        };

        return {
            restrict: 'E',
            link: link
        };

    }]);

    /*
     * Image Selector Button directive is used together with the Image Selector Modal
     * for the cases when the Image Selector should be opened on the button click and
     * it should be open in a modal dialog.
     *
     * To use this directive set the the value of the sf-image-selector-button attribute
     * to jQuery selector of the sf-image-selector-modal element.
     */
    selectors.directive('sfImageSelectorButton', function () {

        var link = function ($scope, element, attributes) {

            var modal = attributes.sfImageSelectorButton;
            if (!modal) {
                throw 'You must specify the selector for the sf-image-selector-modal element.';
            }

            $(element).bind('click', function () {
                angular.element(modal).scope().open();
            });

        };

        return {
            restrict: 'A',
            link: link
        };

    });
    
    selectors.directive('sfImageSelectorUploader', function () {

        var link = function ($scope, element, attributes) {

            $scope.$on('doSelectFile', function () {
                $(element).click();
            });

        };

        return {
            restrict: 'A',
            link: link
        };

    });

}());