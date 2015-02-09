describe('libraries breadcrumb in image selector', function () {
    //Load the module that contains the cached templates.
    beforeEach(module('templates'));
    beforeEach(module('sfImageSelector'));

    var $rootScope;
    var $q;
    var mediaFilter;

    beforeEach(module(function ($provide) {
        $provide.value('sfMediaService', fakeMediaService);
        $provide.value('sfFlatTaxonService', fakeFlatTaxonService);
        $provide.value('sfHierarchicalTaxonService', fakeHierarchicalTaxonService);
    }));

    beforeEach(inject(function (_$rootScope_, _$q_, sfMediaFilter) {
        //Build the scope with whom the directive will be compiled.
        $rootScope = _$rootScope_;
        $q = _$q_;
        mediaFilter = sfMediaFilter;
    }));

    var itemsPromiseTransform = function (items) {
        var defer = $q.defer();
        defer.resolve({ Items: items });
        return defer.promise;
    }

    var genericGet = function () {
        var items = [];
        for (var i = 0; i <= 5; i++) {
            items[i] = {
                HasChildren: true,
                Id: i,
                Title: 'Title'+i
            };
        }

        return items;
    };

    var fakeHierarchicalTaxonService = {
        getTaxons: function (taxonomyId, skip, take, search, frontendLanguages) {
            return itemsPromiseTransform([]);
        }
    };

    var fakeFlatTaxonService = {
        getTaxons: function (taxonomyId, skip, take, search, frontendLanguages) {
            return itemsPromiseTransform([]);
        }
    };

    var fakeMediaService = {
        images: {
            getFolders: function (options) {
                return itemsPromiseTransform(genericGet());
            },
            getImages: function (options) {
                return itemsPromiseTransform(genericGet());
            },
            getContent: function (options) {
                return itemsPromiseTransform(genericGet());
            },
            getPredecessorsFolders: function (options) {
                var defer = $q.defer();
                defer.resolve(genericGet());
                return defer.promise;
            },
            get: function (options, filterObject, appendItems) {
                var defer = $q.defer();
                defer.resolve(genericGet());
                return defer.promise;
            }
        }
    };    

    beforeEach(function () {
        commonMethods.mockServerContextToEnableTemplateCache();
    });

    afterEach(function () {
        //Tear down.
        var leftOver = $('.testDiv, .modal, .modal-backdrop');
        leftOver.empty();
        leftOver.remove();
    });

    it('[GeorgiMateev] / should the predecessors of the selected folder for filtering into the breadcrumb.', function () {
        var template = '<sf-image-selector></sf-image-selector>';
        var scope = $rootScope.$new();

        commonMethods.compileDirective(template, scope);

        var s = scope.$$childHead;

        // select filter by library
        s.filterObject = mediaFilter.newFilter();
        s.filterObject.set.parent.to('some Id');

        s.$digest();

        expect(s.breadcrumbs)
            .toEqualArrayOfObjects(fakeMediaService.images.getFolders(), ['Id', 'Title']);
    });

    it('[GeorgiMateev] / should set the parent prop of the filter object to be the selected folder Id', function () {
        var template = '<sf-image-selector></sf-image-selector>';
        var scope = $rootScope.$new();

        commonMethods.compileDirective(template, scope);

        var s = scope.$$childHead;

        // select filter by library
        s.filterObject = mediaFilter.newFilter();
        s.filterObject.set.parent.to('some Id');

        s.$digest();

        // simulate click on the breadcrumb item
        var bcItem = s.breadcrumbs[1];
        s.onBreadcrumbItemClick(bcItem);
        expect(s.filterObject.parent).toEqual(bcItem.Id);
    });
});