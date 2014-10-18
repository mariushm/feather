; (function () {

    var selectors = angular.module('selectors');

    var LIST_MODE = 'list',
        UPLOAD_MODE = 'upload',
        INSERT_MODE = 'insert'

    var modes = [];
    modes[LIST_MODE] = {
        name: LIST_MODE,
        title: 'Select image',
        okButton: 'Done',
        cancelButton: 'Cancel'
    };

    modes[UPLOAD_MODE] = {
        name: UPLOAD_MODE,
        title: 'Upload image',
        okButton: 'Upload',
        cancelButton: 'Cancel'
    };

    modes[INSERT_MODE] = {
        name: INSERT_MODE,
        title: 'Image',
        okButton: 'Done',
        cancelButton: 'Cancel'
    };

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

        // represents the HTML File object to be uploaded
        $scope.file = null;

        $scope.$parent.$watch('file', function (newValue, oldValue) {
            $scope.file = newValue;
        });

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

            $scope.activeMode = modes[LIST_MODE];

            $scope.$emit('needsImage', function (e) {
                
            });
            
            /*
             * Represents a file that has been selected for uploading
             * but has not yet been uploaded.
             */
            $scope.file = null;

            /*
             * If the file field has been changed to something else than null,
             * it means we have a pending upload and we should switch the mode
             * of the ImageSelector to upload mode.
             */
            $scope.$watch('file', function (newValue, oldValue) {
                if (newValue) {
                    $scope.activeMode = modes[UPLOAD_MODE];
                }
            });

            /*
             * Watches the active mode in order to be able to emit an event
             * when mode has changed.
             */
            $scope.$watch('activeMode', function (newValue, oldValue) {
                $scope.$emit('modeChanged', newValue);
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

            // Represents the current mode of the Image Selector
            $scope.mode = modes[LIST_MODE];

            // Subscribes to the modeChanged event which is fired by the [child] ImageSelector
            // controller
            $scope.$on('modeChanged', function (ev, newMode) {
                $scope.mode = newMode;
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
     * This directive enhances the standard HTML5 file upload (input element) with additional functionality needed
     * by the ImageSelector. This directive is not to be reused outside of ImageSelector as it has a very narrow
     * functionality and design.
     */
    selectors.directive('sfImageSelectorUploader', function () {

        var link = function ($scope, element, attributes) {
            
            // Handles the change event (a file has been selected) of the [input type="file"]
            $(element).change(function (ev) {
                $scope.$apply(function () {
                    // TODO: add validation here if there are no files
                    $scope.file = element.get(0).files[0];
                });
            });

            // Open the [input type="file"] choose file dialog. This event could be triggered by
            // various actions in the other controllers.
            $scope.$on('doSelectFile', function () {
                // call the click event in a timeout to avoid digest loop
                setTimeout(function () {
                    $(element).click();
                }, 0);
            });

        };

        return {
            restrict: 'A',
            link: link
        };

    });

}());