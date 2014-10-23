describe('sfImageSelector', function () {

    var $httpBackend,
        $compile,
        imageService;

    beforeEach(module('sfLibrariesService'));
    beforeEach(module('sfImageSelector'));

    beforeEach(inject(function ($injector) {
        $httpBackend = $injector.get('$httpBackend');
        $compile = $injector.get('$compile');
        imageService = $injector.get('sfImageService');
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

        it('loads 20 albums and images from service into the listItems array', function () {

            var fakeData = {
                Items: []
            };
            for (var i = 0; i < 20; i++) {
                fakeData.Items.push(i);
            }

            var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20&filter=(Visible=true AND Status=Live)';
            $httpBackend.expectGET(serviceUrl).respond(fakeData);

            var ctrl = createController();
            scope.listFilter = 'all';

            $httpBackend.flush();

            expect(scope.listItems.length).toEqual(20);
        });

        it('loads 20 albums and images from service into the listItems array, but skips the items already loaded - infinite scroll', function () {

            var fakeData = {
                Items: []
            };
            for (var i = 0; i < 20; i++) {
                fakeData.Items.push(i);
            }

            var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&skip=20&take=20&filter=(Visible=true AND Status=Live)';
            $httpBackend.expectGET(serviceUrl).respond(fakeData);

            var ctrl = createController();
            scope.listItems = [];
            // preload 20 items in the scope to test paging with skip
            for (var i = 0; i < 20; i++) {
                scope.listItems.push(i);
            }

            scope.listFilter = 'all';

            $httpBackend.flush();

            expect(scope.listItems.length).toEqual(40);

        });
        
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

        it('raises CloseDialog event when CancelSelect command is fired', function () {

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