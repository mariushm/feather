describe('sfImageSelector', function () {

    var $httpBackend,
        $rootScope,
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

    describe('Controller: sfImageSelectorListCtrl', function () {

        var scope,
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

            var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&take=20';
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

            var serviceUrl = '/Sitefinity/Services/Content/ImageService.svc/?itemType=Telerik.Sitefinity.Libraries.Model.Image&skip=20&take=20';
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
        
        it('raises CloseDialog event when CancelSelect command is fired', function () {

            var ctrl = createController();

            // we'll spy on the emit function to make sure
            // closeDialog is emitted
            spyOn(scope, "$emit");


            // fire the 'CancelSelect' command from the scope up the
            // hierarchy
            $rootScope.$broadcast('CancelSelect');

            expect(scope.$emit).toHaveBeenCalledWith('Cancel');
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