; (function () {

    var imageSelector = angular.module('sfImageSelector', ['sfLibrariesService', 'sfDates', 'sfInfiniteScroll']);

    var selectors = angular.module('selectors');

    /*
     * Provides functionality for the list mode of the image selector.
     */
    imageSelector.controller('sfImageSelectorListCtrl', function ($scope, $injector) {

        var imageService = $injector.get('sfImageService'),
            modes = $injector.get('sfImageSelectorModes');

        /*
         * Loads items through the sfImageService. For paging, take is default
         * one as defined in the sfImageService.query function; skip is calculated
         * by the current number of listItems present in the $scope.listItems property
         * as we are doing infinite scrolling.
         */
        $scope.loadItems = function () {

            var queryOptions = {
                skip: $scope.listItems.length,
                filter: {
                    name: $scope.listFilter
                }
            };

            imageService.query(queryOptions)
                .then(
                    // success
                    function (result) {
                        $scope.listItems = $scope.listItems.concat(result.data.Items);
                    },
                    // failure
                    function (reason) {

                    }
                );
        };

        /*
         * The predefined filters present in the user interface. Can have following
         * values
         * null - No filtering, controller should be in upload mode
         * 'recent' - List should display recent items (both images and albums)
         * 'mine' - List should display my items (both images and albums)
         * 'all' - List should display all items (both images and albums)
         */
        $scope.listFilter = null;

        /*
         * The array of all list items that are to be displayed in the list.
         */
        $scope.listItems = [];


        /*
         * Represents the item that is currently selected in the list.
         */
        $scope.selectedItem = null;

        /*
         * Event handler which handles the event of a user selecting an item.
         */
        $scope.select = function (item) {
            $scope.selectedItem = item;
        };

        // Event handler fired by the button for selecting a file manually.
        $scope.selectFile = function () {
            $scope.$emit('doSelectFile');
        };

        /*
         * Watches the listFilter property. If the list property is set to a value
         * it means the list should be displayed with some sort of a filter, otherwise
         * we will be displaying the upload screen of the list mode. The distinction
         * is also the title of the okButton, which is different for list and upload
         * screen. 
         */
        $scope.$watch('listFilter', function (newValue, oldValue) {
            if (newValue) {
                modes.list.okButton.title = 'Done selecting';
                // clean the list items array only if there was
                // an existing filter there
                if (oldValue !== newValue) {
                    $scope.listItems = [];
                }
                $scope.loadItems();
            } else {
                modes.list.okButton.title = 'Done';
            }
        });

        /*
         * Subscribe to the ok command of the list mode so that we can handle
         * it.
         */
        $scope.$on(modes.list.okButton.raise, function () {
            // When ok command for the list mode is fired, we need
            // to rise the ImageSelected event so that it can be 
            // handled up the chain. Also send the selected item
            // as an event argument.
            $scope.$emit('ImageSelected', $scope.selectedItem);
        });

        /*
         * Subscribe to the cancel command of the list mode so that we can handle
         * it.
         */
        $scope.$on(modes.list.cancelButton.raise, function () {
            // When cancel command for list mode is fired, we need
            // to rise the Cancel event so that it can be handled 
            // up the chain
            $scope.$emit('Cancel');
        });

    });

    /*
     * Provides functionality for the upload mode of the image selector.
     */
    imageSelector.controller('sfImageSelectorUploadCtrl', function ($scope, $injector) {

        var imageService = $injector.get('sfImageService'),
            modes = $injector.get('sfImageSelectorModes');

        $scope.completedPercent = 0;

        // represents the HTML File object to be uploaded
        $scope.file = null;

        // subscribe to the event that starts upload
        $scope.$on(modes.upload.okButton.raise, function (ev, args) {

            // set the active mode to uploading
            $scope.$parent.activeMode = modes.uploading;

            imageService.upload($scope.file).then(
                // success
                function (data) {
                    $scope.$parent.image = data.ContentItem;
                },
                // failure
                function (error) {
                    // TODO: handle the upload errors here
                },
                // notification
                function (completion) {
                    $scope.completedPercent = completion;
                });
        });

        // subscribes to the event that cancels upload
        $scope.$on(modes.upload.cancelButton.raise, function (ev, args) {
            // set the file to upload to null
            $scope.$parent.file = null;
            // go back to the list mode
            $scope.$parent.activeMode = modes.list;
        });

        $scope.$parent.$watch('file', function (newValue, oldValue) {
            $scope.file = newValue;
        });

    });

    /*
     * Provides functionality for the insert mode of the image selector.
     */
    imageSelector.controller('sfImageSelectorInsertCtrl', function ($scope, $injector) {

        var $interpolate = $injector.get('$interpolate'),
            modes = $injector.get('sfImageSelectorModes');

        $scope.image = {};

        $scope.insertOptions = {
            alignment: 'none'
        };

        $scope.$parent.$watch('image', function (newValue, oldValue) {
            if (newValue) {
                $scope.image = newValue;
            }
        });

        // subscribe to the event that inserts an image
        $scope.$on(modes.insert.okButton.raise, function (ev, args) {

            var markup = '<img src="{{ MediaUrl }}" />';
            markup = $interpolate(markup)($scope.image);
            $scope.$emit('imageSelected', markup);

        });

    });

    /*
     * This directive represents the Sitefinity Image Selector.
     */
    imageSelector.directive('sfImageSelector', function ($injector) {

        var serverContext = $injector.get('serverContext'),
            modes = $injector.get('sfImageSelectorModes');

        var imageSelectorController = function ($scope) {

            $scope.activeMode = modes.list;

            $scope.$emit('needsImage', function (e) {
                
            });
            
            /*
             * Represents the image user has selected. This selection
             * can happen in several ways (clicks on the image, upload has completed
             * successfully...). The image is a JSON representation of Sitefinity
             * Image (based on Content type).
             */
            $scope.image = null;

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
                    $scope.activeMode = modes.upload;
                }
            });

            /*
             * Subscribe to the ImageSelected event which could be fired by any
             * of the child scopes. Set the $scope.image property to the argument
             * that was sent [newly selected image] and switch the active mode to
             * insert.
             */
            $scope.$on('ImageSelected', function (ev, arg) {
                $scope.image = arg;
                $scope.activeMode = modes.insert;
            });

            /*
             * If the image field has been changed to something else
             * than null, it means user has selected an image and we should
             * switch the mode of the ImageSelector to insert mode.
             */
            //$scope.$watch('image', function (newValue, oldValue) {
            //    if (newValue) {
            //        $scope.activeMode = modes[INSERT_MODE];
            //    }
            //});

            /*
             * Watches the active mode in order to be able to emit an event
             * when mode has changed.
             */
            //$scope.$watch('activeMode', function (newValue, oldValue) {
            //    $scope.$emit('modeChanged', newValue);
            //});

        };

        return {
            restrict: 'E',
            templateUrl: serverContext.getEmbeddedResourceUrl('Telerik.Sitefinity.Frontend', 'Selectors/image-selector.html'),
            controller: imageSelectorController
        };

    });

    /*
     * Image Selector Modal directive wraps the Image selector in a modal dialog. It is a 
     * convenience thin wrapper which can be used to open the Image Selector in a modal dialog.
     */
    imageSelector.directive('sfImageSelectorModal', function ($injector) {

            var $compile = $injector.get('$compile'),
                $parse = $injector.get('$parse'),
                serverContext = $injector.get('serverContext'),
                modes = $injector.get('sfImageSelectorModes');

            var link = function ($scope, element, attributes) {

                var selectorTemplate = serverContext.getEmbeddedResourceUrl('Telerik.Sitefinity.Frontend', 'Selectors/image-selector-modal.html'),
                    directiveMarkup = '<div modal existing-scope="true" window-class="sf-image-selector-dlg" template-url="' + selectorTemplate + '" size="lg"></div>',
                    modalDirective = $compile(directiveMarkup)($scope),
                    editMarkup;

                // appends the compiled modal directive 
                var modalElement = $(element).append(modalDirective);

                $scope.$on('needsImage', function (ev, arg) {
                    arg(editMarkup);
                });

                // Represents the current mode of the Image Selector
                $scope.mode = modes.list;

                // Subscribes to the modeChanged event which is fired by the [child] ImageSelector
                // controller
                $scope.$on('modeChanged', function (ev, newMode) {
                    $scope.mode = newMode;
                });

                //$scope.$on('imageSelected', function (ev, args) {
                //    $scope.$modalInstance.result.then(function (e) {
                //        $(element).trigger('imageSelected', e);
                //    });
                //    $scope.$modalInstance.close(args);
                //});

                /*
                 * Subscribes to the "Cancel" command which could be fired by any
                 * of the child scopes down the hierarchy. Once this command is fired
                 * the directive will close the itself [the modal].
                 */
                $scope.$on('Cancel', function (ev, args) {
                    $scope.$modalInstance.close();
                });

                /*
                 * Opens the image selector modal dialog.
                 */
                $scope.open = function (markup) {
                    editMarkup = markup;
                    var dialog = angular.element(modalElement).scope().$openModalDialog();
                };

                $scope.command = function (cmd) {
                    $scope.$broadcast(cmd);
                };

            };

            return {
                restrict: 'E',
                link: link
            };

    });

    /*
     * This directive enhances the standard HTML5 file upload (input element) with additional functionality needed
     * by the ImageSelector. This directive is not to be reused outside of ImageSelector as it has a very narrow
     * functionality and design.
     */
    imageSelector.directive('sfImageSelectorUploader', function () {

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

    /*
     * Defines the modes of the image selector. The reason value recepie
     * is being used is the fact that some of these properties may be
     * changed during the runtime.
     */
    imageSelector.value('sfImageSelectorModes', {
        list: {
            name: 'list',
            title: 'Select image',
            okButton: {
                title: 'Done',
                raise: 'DoneSelecting'
            },
            cancelButton: {
                title: 'Cancel',
                raise: 'CancelSelect'
            }
        },
        upload: {
            name: 'upload',
            title: 'Upload image',
            okButton: {
                title: 'Upload',
                raise: 'UploadImage'
            },
            cancelButton: {
                title: 'Cancel',
                raise: 'CancelUpload'
            }
        },
        uploading: {
            name: 'uploading',
            title: 'Upload image',
            cancelButton: {
                title: 'Cancel',
                raise: 'CancelUploading'
            }
        },
        insert: {
            name: 'insert',
            title: 'Image',
            okButton: {
                title: 'Done',
                raise: 'InsertImage'
            },
            cancelButton: {
                title: 'Cancel',
                raise: 'CancelInsert'
            }
        }
    });

}());