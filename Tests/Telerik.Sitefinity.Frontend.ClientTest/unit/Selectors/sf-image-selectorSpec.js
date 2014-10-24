describe('sfImageSelector', function () {

    var $httpBackend,
        $compile,
        serverDataMock,
        modes,
        imageService;

    beforeEach(module('serverDataModule'))
    beforeEach(module('sfLibrariesService'));
    beforeEach(module('sfImageSelector'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $compile = $injector.get('$compile');
        imageService = $injector.get('sfImageService');
        modes = $injector.get('sfImageSelectorModes');
        serverDataMock = $injector.get('serverData');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Directive: sfImageSelector', function () {

        var scope;

        beforeEach(inject(function ($rootScope) {
            scope = $rootScope.$new();
        }));

        it('should define "list" as an active mode on initialization', function () {

            $httpBackend.expectGET('/Frontend-Assembly/Telerik.Sitefinity.Frontend/Selectors/image-selector.html')
                        .respond('<div></div>');

            var element = angular.element('<sf-image-selector></sf-image-selector>'),
                directive = $compile(element)(scope);

            scope.$digest();
            $httpBackend.flush();

            expect(scope.activeMode.name).toEqual('list');

        });

        it('should subscribe to "ImageSelected" event, set the $scope.image to selected image and switch to insert mode', function () {

            $httpBackend.expectGET('/Frontend-Assembly/Telerik.Sitefinity.Frontend/Selectors/image-selector.html')
                        .respond('<div></div>');

            var element = angular.element('<sf-image-selector></sf-image-selector>'),
                selectedItem = { Title: 'Item 1' },
                childScope = scope.$new(),
                directive = $compile(element)(scope);

            scope.$digest();
            $httpBackend.flush();

            // emit the "ImageSelected" command from child scope
            childScope.$emit('ImageSelected', selectedItem);

            expect(scope.image.Title).toEqual(selectedItem.Title);
            expect(scope.activeMode.name).toEqual('insert');
        });

    });

    describe('Controller: sfImageSelectorListCtrl', function () {

        var $rootScope,
            scope,
            service,
            createController;

        beforeEach(inject(function ($injector, $controller) {

            $rootScope = $injector.get('$rootScope');
            scope = $rootScope.$new();

            createController = function () {
                return $controller('sfImageSelectorListCtrl', {
                    '$scope': scope,
                    'sfImageService' : imageService
                });
            };
        }));

        it('raises ImageSelected event when DoneSelecting command is fired', function () {

            var ctrl = createController();

            scope.selectedItem = {
                Title: 'Item 1'
            };

            // we'll spy on the emit function to make sure
            // ImageSelected event is emitted
            spyOn(scope, '$emit');

            // fire the 'DoneSelecting' command from the scope up
            // the hierarchy
            $rootScope.$broadcast('DoneSelecting');

            expect(scope.$emit).toHaveBeenCalledWith('ImageSelected', scope.selectedItem);

        });

        it('raises CloseDialog event when Cancel command is fired', function () {

            var ctrl = createController();

            // we'll spy on the emit function to make sure
            // Cancel event is emitted
            spyOn(scope, '$emit');


            // fire the 'CancelSelect' command from the scope up the
            // hierarchy
            $rootScope.$broadcast('CancelSelect');

            expect(scope.$emit).toHaveBeenCalledWith('Cancel');
        });

        it('sets the $scope.selectedItem property when select function is called', function () {

            var ctrl = createController(),
                item = { Title: 'One' };

            scope.select(item);

            expect(scope.selectedItem).toBe(item);

        });

        it('clears the listItems array if the filter has been changed', function () {

            var fakeData = {
                Items: []
            };
            for (var i = 0; i < 20; i++) {
                fakeData.Items.push(i);
            }

            var firstFilter = 'all',
                firstRequestUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)',
                secondFilter = 'recent',
                secondRequestUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]';

            var ctrl = createController();

            $httpBackend.expectGET(firstRequestUrl).respond(fakeData);
            scope.listFilter = firstFilter;
            $httpBackend.flush();

            $httpBackend.expectGET(secondRequestUrl).respond(fakeData);
            scope.listFilter = secondFilter;
            $httpBackend.flush();
                        
            // even though we will load 40 items, because filter is being changed
            // we clean the first 20 items, so we should end up only with the 20
            // items from the second request
            expect(scope.listItems.length).toEqual(20);
        })

        it('changes the list mode ok button title to "Done selecting" when filter is applied', function () {

            var ctrl = createController();

            scope.$digest();

            // by default, list has no filter applied and is in upload
            // mode, so the title of the okButton should be 'Done'
            expect(modes.list.okButton.title).toEqual('Done');

            // setting the listFilter to anything (e.g. 'recent')
            // other than null, should change the title of the
            // list mode ok button to 'Done selecting'. Keep in mind that
            // setting a filter will trigger an http request, so we need
            // to take care of that as well
            var requestUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]';
            $httpBackend.expectGET(requestUrl).respond([]);
            scope.listFilter = 'recent';
            $httpBackend.flush();

            expect(modes.list.okButton.title).toEqual('Done selecting');

        });

        var filterTest = function (filter, loadedItemsCount, expectedUrl) {

            var fakeData = {
                Items: []
            };
            for (var i = 0; i < 20; i++) {
                fakeData.Items.push(i);
            }
            
            $httpBackend.expectGET(expectedUrl).respond(fakeData);

            var ctrl = createController();

            scope.listItems = [];
            // preload items in the scope to test paging with skip
            for (var i = 0; i < loadedItemsCount; i++) {
                scope.listItems.push(i);
            }

            scope.listFilter = filter;

            $httpBackend.flush();

            expect(scope.listItems.length).toEqual(20 + loadedItemsCount);

        };

        describe('#filter = "all"', function () {

            it('loads 20 albums and images from service into the listItems array', function () {
                
                var filter = 'all',
                    preloadedItems = 0,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)';

                filterTest(filter, preloadedItems, expectedUrl);

            });

            it('loads 20 albums and images from service into the listItems array, but skips the items already loaded - infinite scroll', function () {

                var filter = 'all',
                    preloadedItems = 20,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&skip=20&take=20&filter=(Visible=true AND Status=Live)';

                filterTest(filter, preloadedItems, expectedUrl);

            });
        });

        describe('#filter = "recent"', function () {

            it('loads 20 albums and images from service into the listItems array', function () {

                var filter = 'recent',
                    preloadedItems = 0,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=[ShowRecentLiveItems]';

                filterTest(filter, preloadedItems, expectedUrl);

            });

        });

        describe('#filter = "mine"', function () {

            it('loads 20 albums and images from service into the listItems array that belong to the current user', function () {

                var filter = 'mine',
                    currentUserId = serverDataMock.get('currentUserId'),
                    preloadedItems = 0,
                    expectedUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live) AND (Owner = (' + currentUserId + '))';

                filterTest(filter, preloadedItems, expectedUrl);

            });

        });

    });

    describe('Directive: sfImageSelectorModal', function () {

        var scope;

        beforeEach(inject(function ($injector) {
            
            scope = $injector.get('$rootScope');

        }));

        it('should call scope.$modalInstance.close() when any of the child scopes emits "Cancel" command', function () {

            var element = angular.element('<sf-image-selector-modal></sf-image-selector-modal>'),
                wasCalled = false;

            scope.$modalInstance = {
                close: function (arg) {
                    wasCalled = true;
                }
            };

            var childScope = scope.$new();

            var directive = $compile(element)(scope);
            scope.$digest();

            // emit "Cancel" command from child scope
            childScope.$emit('Cancel');
            
            expect(wasCalled).toBe(true);
        });

    });

});