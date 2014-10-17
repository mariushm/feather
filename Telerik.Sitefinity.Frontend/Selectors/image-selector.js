; (function () {

    var selectors = angular.module('selectors');

    selectors.directive('sfImageSelectorModal', ['$compile', 'serverContext', function ($compile, serverContext) {

        var link = function ($scope, element, attributes) {

            var selectorTemplate = serverContext.getEmbeddedResourceUrl('Telerik.Sitefinity.Frontend', 'Selectors/image-selector.html'),
                directiveMarkup = '<div modal existing-scope="true" window-class="sf-image-selector-dlg" template-url="' + selectorTemplate + '"></div>',
                modalDirective = $compile(directiveMarkup)($scope);

            // appends the compiled modal directive 
            var modalElement = $(element).append(modalDirective);

            /*
             * Opens the image selector modal dialog.
             */
            $scope.open = function () {
                angular.element(modalElement).scope().$openModalDialog();
            };

        };

        return {
            restrict: 'E',
            link: link
        };

    }]);

    /*
     * Image Selector Button directive is a thin wrapper around
     * Image Selector component. The actual Image Selector is not
     * visible until the button marked with this directive is clicked
     * at which point the Image Selector will be opened in a modal
     * dialog.
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
        

}());