/**
 * angular-schema-form-nwp-file-upload-extended - Upload file type for Angular Schema Form
 * @version v0.1.5.4
 * @link https://github.com/saburab/angular-schema-form-nwp-file-upload
 * @license MIT
 */
'use strict';

angular
    .module('schemaForm')
    .config(['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {
            var defaultPatternMsg = 'Wrong file type. Allowed types are ',
                defaultMaxSizeMsg1 = 'This file is too large. Maximum size allowed is ',
                defaultMaxSizeMsg2 = 'Current file size:',
                defaultMinItemsMsg = 'You have to upload at least one file',
                defaultMaxItemsMsg = 'You can\'t upload more than one file.';

            var nwpSinglefileUpload = function (name, schema, options) {
                if (schema.type === 'array' && schema.format === 'singlefile') {
                    if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
                        schema.pattern.validationMessage = defaultPatternMsg;
                    }
                    if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
                        schema.maxSize.validationMessage = defaultMaxSizeMsg1;
                        schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
                    }
                    if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
                        schema.minItems.validationMessage = defaultMinItemsMsg;
                    }
                    if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
                        schema.maxItems.validationMessage = defaultMaxItemsMsg;
                    }

                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'nwpFileUpload';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.array.unshift(nwpSinglefileUpload);

            var nwpMultifileUpload = function (name, schema, options) {
                if (schema.type === 'array' && schema.format === 'multifile') {
                    if (schema.pattern && schema.pattern.mimeType && !schema.pattern.validationMessage) {
                        schema.pattern.validationMessage = defaultPatternMsg;
                    }
                    if (schema.maxSize && schema.maxSize.maximum && !schema.maxSize.validationMessage) {
                        schema.maxSize.validationMessage = defaultMaxSizeMsg1;
                        schema.maxSize.validationMessage2 = defaultMaxSizeMsg2;
                    }
                    if (schema.minItems && schema.minItems.minimum && !schema.minItems.validationMessage) {
                        schema.minItems.validationMessage = defaultMinItemsMsg;
                    }
                    if (schema.maxItems && schema.maxItems.maximum && !schema.maxItems.validationMessage) {
                        schema.maxItems.validationMessage = defaultMaxItemsMsg;
                    }

                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'nwpFileUpload';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.array.unshift(nwpMultifileUpload);

            schemaFormDecoratorsProvider.addMapping(
                'bootstrapDecorator',
                'nwpFileUpload',
                'directives/decorators/bootstrap/nwp-file/nwp-file.html'
            );
        }
    ]);

angular
    .module('ngSchemaFormFile', [
        'ngFileUpload',
        'ngMessages'
    ])
    .directive('ngSchemaFile', ['Upload', '$timeout', '$q', function (Upload, $timeout, $q) {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                scope.url = scope.form && scope.form.endpoint;
                scope.isSinglefileUpload = scope.form && scope.form.schema && scope.form.schema.format === 'singlefile';

                scope.selectFile = function (file) {
                    scope.picFile = file;
                };
                scope.selectFiles = function (files) {
                    scope.picFiles = files;
                };

                scope.uploadFile = function (file, args) {
                    file && doUpload(file, args);
                };

                scope.uploadFiles = function (files, args) {
                    files.length && angular.forEach(files, function (file) {
                        doUpload(file, args);
                    });
                };

                scope.doNotSendFiles = [];

                function doUpload(file, args) {
                    if (file && !file.$error && scope.url) {

                        file.upload = Upload.upload({
                            url: scope.url,
                            file: file,
                            data: {
                                'do_not_email': scope.doNotSendFiles[file.name],
                                'project_id': scope.form.relatedTo === 'Project' ? scope.model.id : args.project_id,
                                'activity_sheet_id' : scope.form.relatedTo === 'Activity Sheet' ? scope.model.id : args.activity_sheet_id
                            }
                        });

                        file.upload.then(function (response) {
                            $timeout(function () {
                                file.result = response.data;
                            });

                            if (ngModel.$viewValue) {
                                ngModel.$setViewValue(ngModel.$viewValue + ',' + response.data);
                            } else {
                                ngModel.$setViewValue(response.data);
                            }

                            ngModel.$commitViewValue();
                        }, function (response) {
                            if (response.status > 0) {
                                scope.errorMsg = response.status + ': ' + response.data;
                            }
                        });

                        file.upload.progress(function (evt) {
                            file.progress = Math.min(100, parseInt(100.0 *
                                evt.loaded / evt.total));
                        });
                    }
                }

                scope.validateField = function () {
                    if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
                        console.log('singlefile-form is invalid');
                    } else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {
                        console.log('multifile-form is  invalid \n Error::' + scope.picFiles.$error +'\n scope.picFiles::' + scope.picFiles.length + '\n scope.uploadForm.files.$valid::'+scope.uploadForm.files.$valid+' \nscope.uploadForm.files::' + scope.uploadForm.files.length);
                    } else {
                        console.log('single- and multifile-form are valid');
                    }
                };
                scope.submit = function (event, args) {
                    if (scope.uploadForm.file && scope.uploadForm.file.$valid && scope.picFile && !scope.picFile.$error) {
                        scope.uploadFile(scope.picFile, args);
                    } else if (scope.uploadForm.files && scope.uploadForm.files.$valid && scope.picFiles && !scope.picFiles.$error) {

                        scope.uploadFiles(scope.picFiles, args);
                    }
                };
                scope.$on('schemaFormValidate', scope.validateField);
                scope.$on('schemaFormFileUploadSubmit', scope.submit);
            }
        };
    }]);
angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/nwp-file/nwp-file.html","<ng-form class=\"file-upload mb-lg\" ng-schema-file ng-model=\"$$value$$\" name=\"uploadForm\">\r\n   <label ng-show=\"form.title && form.notitle !== true\" class=\"control-label\" for=\"fileInputButton\" ng-class=\"{\'sr-only\': !showTitle(), \'text-danger\': uploadForm.$error.required && !uploadForm.$pristine}\">\r\n      {{ form.title }}<i ng-show=\"form.required\">&nbsp;*</i>\r\n   </label>\r\n\r\n   <div ng-show=\"picFile\">\r\n      <div ng-include=\"\'uploadProcess.html\'\" class=\"mb\"></div>\r\n   </div>\r\n\r\n   <ul ng-show=\"picFiles && picFiles.length\" class=\"list-group\">\r\n      <li class=\"list-group-item\" ng-repeat=\"picFile in picFiles\">\r\n         <div ng-include=\"\'uploadProcess.html\'\"></div>\r\n      </li>\r\n   </ul>\r\n\r\n   <div class=\"well well-sm bg-white mb\" ng-class=\"{\'has-error border-danger\': (uploadForm.$error.required && !uploadForm.$pristine) || (hasError() && errorMessage(schemaError()))}\">\r\n      <small class=\"text-muted\" ng-show=\"form.description\" ng-bind-html=\"form.description\"></small>\r\n      <div ng-if=\"isSinglefileUpload\" ng-include=\"\'singleFileUpload.html\'\"></div>\r\n      <div ng-if=\"!isSinglefileUpload\" ng-include=\"\'multiFileUpload.html\'\"></div>\r\n      <div class=\"help-block mb0\" ng-show=\"uploadForm.$error.required && !uploadForm.$pristine\">{{ \'modules.attribute.fields.required.caption\' | translate }}</div>\r\n      <div class=\"help-block mb0\" ng-show=\"(hasError() && errorMessage(schemaError()))\" ng-bind-html=\"(hasError() && errorMessage(schemaError()))\"></div>\r\n   </div>\r\n</ng-form>\r\n\r\n<script type=\'text/ng-template\' id=\"uploadProcess.html\">\r\n   <div class=\"row mb\">\r\n      <div class=\"col-sm-4 mb-sm\">\r\n         <label title=\"{{ \'modules.upload.field.preview\' | translate }}\" class=\"text-info\">{{\r\n            \'modules.upload.field.preview\' | translate }}</label>\r\n         <img ngf-src=\"picFile\" class=\"img-thumbnail img-responsive\">\r\n         <div class=\"img-placeholder\"\r\n              ng-class=\"{\'show\': picFile.$invalid && !picFile.blobUrl, \'hide\': !picFile || picFile.blobUrl}\">No preview\r\n            available\r\n         </div>\r\n      </div>\r\n      <div class=\"col-sm-8 mb-sm\">\r\n         <label title=\"{{ \'modules.upload.field.filename\' | translate }}\" class=\"text-info\">{{\r\n            \'modules.upload.field.filename\' | translate }}</label>\r\n         <div class=\"filename\" title=\"{{ picFile.name }}\">{{ picFile.name }}</div>\r\n      </div>\r\n     \r\n      <label class=\"col-sm-12\"><input type=\"checkbox\" ng-model=\"doNotSendFiles[picFile.name]\" id=\"{{picFile.name}}\" name=\"doNotSendFiles\" /> Do not send file as attachment</label> \r\n   </div>\r\n   <div ng-messages=\"uploadForm.$error\" ng-messages-multiple=\"\">\r\n      <div class=\"text-danger errorMsg\" ng-message=\"maxSize\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong>. ({{ form.schema[picFile.$error].validationMessage2 | translate }} <strong>{{picFile.size / 1000000|number:1}}MB</strong>)</div>\r\n      <div class=\"text-danger errorMsg\" ng-message=\"pattern\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\r\n      <div class=\"text-danger errorMsg\" ng-message=\"maxItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\r\n      <div class=\"text-danger errorMsg\" ng-message=\"minItems\">{{ form.schema[picFile.$error].validationMessage | translate }} <strong>{{picFile.$errorParam}}</strong></div>\r\n      <div class=\"text-danger errorMsg\" ng-show=\"errorMsg\">{{errorMsg}}</div>\r\n   </div>\r\n</script>\r\n\r\n<script type=\'text/ng-template\' id=\"singleFileUpload.html\">\r\n   <div ngf-drop=\"selectFile(picFile)\" ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\"\r\n        ng-model=\"picFile\" name=\"file\"\r\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n        ng-required=\"form.required\"\r\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\r\n      <p class=\"text-center\">{{ \'modules.upload.descriptionSinglefile\' | translate }}</p>\r\n   </div>\r\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\r\n\r\n   <button ngf-select=\"selectFile(picFile)\" type=\"file\" ngf-multiple=\"false\" ng-model=\"picFile\" name=\"file\"\r\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n           ng-required=\"form.required\"\r\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\r\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\r\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\r\n      {{ \"buttons.add\" | translate }}\r\n   </button>\r\n</script>\r\n\r\n<script type=\'text/ng-template\' id=\"multiFileUpload.html\">\r\n   <div ngf-drop=\"selectFiles(picFiles)\" ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\"\r\n        ng-model=\"picFiles\" name=\"files\"\r\n        ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n        ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n        ng-required=\"form.required\"\r\n        accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n        ng-model-options=\"form.ngModelOptions\" ngf-drag-over-class=\"dragover\" class=\"drop-box dragAndDropDescription\">\r\n      <p class=\"text-center\">{{ \'modules.upload.descriptionMultifile\' | translate }}</p>\r\n   </div>\r\n   <div ngf-no-file-drop>{{ \'modules.upload.dndNotSupported\' | translate}}</div>\r\n\r\n   <button ngf-select=\"selectFiles(picFiles)\" type=\"file\" ngf-multiple=\"true\" multiple ng-model=\"picFiles\" name=\"files\"\r\n           accept=\"{{form.schema.pattern && form.schema.pattern.mimeType}}\"\r\n           ng-attr-ngf-pattern=\"{{form.schema.pattern && form.schema.pattern.mimeType ? form.schema.pattern.mimeType : undefined }}\"\r\n           ng-attr-ngf-max-size=\"{{form.schema.maxSize && form.schema.maxSize.maximum ? form.schema.maxSize.maximum : undefined }}\"\r\n           ng-required=\"form.required\"\r\n           ng-model-options=\"form.ngModelOptions\" id=\"fileInputButton\"\r\n           class=\"btn btn-primary btn-block {{form.htmlClass}} mt-lg mb\">\r\n      <fa fw=\"fw\" name=\"upload\" class=\"mr-sm\"></fa>\r\n      {{ \"buttons.add\" | translate }}\r\n   </button>\r\n\r\n</script>\r\n");}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjaGVtYS1mb3JtLWZpbGUuanMiLCJ0ZW1wbGF0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzhFQ3BLQSIsImZpbGUiOiJzY2hlbWEtZm9ybS1maWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnc2NoZW1hRm9ybScpXHJcbiAgICAuY29uZmlnKFsnc2NoZW1hRm9ybVByb3ZpZGVyJywgJ3NjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXInLCAnc2ZQYXRoUHJvdmlkZXInLFxyXG4gICAgICAgIGZ1bmN0aW9uIChzY2hlbWFGb3JtUHJvdmlkZXIsIHNjaGVtYUZvcm1EZWNvcmF0b3JzUHJvdmlkZXIsIHNmUGF0aFByb3ZpZGVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWZhdWx0UGF0dGVybk1zZyA9ICdXcm9uZyBmaWxlIHR5cGUuIEFsbG93ZWQgdHlwZXMgYXJlICcsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0TWF4U2l6ZU1zZzEgPSAnVGhpcyBmaWxlIGlzIHRvbyBsYXJnZS4gTWF4aW11bSBzaXplIGFsbG93ZWQgaXMgJyxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRNYXhTaXplTXNnMiA9ICdDdXJyZW50IGZpbGUgc2l6ZTonLFxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdE1pbkl0ZW1zTXNnID0gJ1lvdSBoYXZlIHRvIHVwbG9hZCBhdCBsZWFzdCBvbmUgZmlsZScsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0TWF4SXRlbXNNc2cgPSAnWW91IGNhblxcJ3QgdXBsb2FkIG1vcmUgdGhhbiBvbmUgZmlsZS4nO1xyXG5cclxuICAgICAgICAgICAgdmFyIG53cFNpbmdsZWZpbGVVcGxvYWQgPSBmdW5jdGlvbiAobmFtZSwgc2NoZW1hLCBvcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2NoZW1hLnR5cGUgPT09ICdhcnJheScgJiYgc2NoZW1hLmZvcm1hdCA9PT0gJ3NpbmdsZWZpbGUnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5wYXR0ZXJuICYmIHNjaGVtYS5wYXR0ZXJuLm1pbWVUeXBlICYmICFzY2hlbWEucGF0dGVybi52YWxpZGF0aW9uTWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWEucGF0dGVybi52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRQYXR0ZXJuTXNnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2NoZW1hLm1heFNpemUgJiYgc2NoZW1hLm1heFNpemUubWF4aW11bSAmJiAhc2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hLm1heFNpemUudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWF4U2l6ZU1zZzE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlMiA9IGRlZmF1bHRNYXhTaXplTXNnMjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5taW5JdGVtcyAmJiBzY2hlbWEubWluSXRlbXMubWluaW11bSAmJiAhc2NoZW1hLm1pbkl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNaW5JdGVtc01zZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhJdGVtcyAmJiBzY2hlbWEubWF4SXRlbXMubWF4aW11bSAmJiAhc2NoZW1hLm1heEl0ZW1zLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSA9IGRlZmF1bHRNYXhJdGVtc01zZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmID0gc2NoZW1hRm9ybVByb3ZpZGVyLnN0ZEZvcm1PYmoobmFtZSwgc2NoZW1hLCBvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICBmLmtleSA9IG9wdGlvbnMucGF0aDtcclxuICAgICAgICAgICAgICAgICAgICBmLnR5cGUgPSAnbndwRmlsZVVwbG9hZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXBbc2ZQYXRoUHJvdmlkZXIuc3RyaW5naWZ5KG9wdGlvbnMucGF0aCldID0gZjtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHNjaGVtYUZvcm1Qcm92aWRlci5kZWZhdWx0cy5hcnJheS51bnNoaWZ0KG53cFNpbmdsZWZpbGVVcGxvYWQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG53cE11bHRpZmlsZVVwbG9hZCA9IGZ1bmN0aW9uIChuYW1lLCBzY2hlbWEsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzY2hlbWEudHlwZSA9PT0gJ2FycmF5JyAmJiBzY2hlbWEuZm9ybWF0ID09PSAnbXVsdGlmaWxlJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY2hlbWEucGF0dGVybiAmJiBzY2hlbWEucGF0dGVybi5taW1lVHlwZSAmJiAhc2NoZW1hLnBhdHRlcm4udmFsaWRhdGlvbk1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NoZW1hLnBhdHRlcm4udmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0UGF0dGVybk1zZztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjaGVtYS5tYXhTaXplICYmIHNjaGVtYS5tYXhTaXplLm1heGltdW0gJiYgIXNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVtYS5tYXhTaXplLnZhbGlkYXRpb25NZXNzYWdlID0gZGVmYXVsdE1heFNpemVNc2cxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWEubWF4U2l6ZS52YWxpZGF0aW9uTWVzc2FnZTIgPSBkZWZhdWx0TWF4U2l6ZU1zZzI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY2hlbWEubWluSXRlbXMgJiYgc2NoZW1hLm1pbkl0ZW1zLm1pbmltdW0gJiYgIXNjaGVtYS5taW5JdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWEubWluSXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWluSXRlbXNNc2c7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzY2hlbWEubWF4SXRlbXMgJiYgc2NoZW1hLm1heEl0ZW1zLm1heGltdW0gJiYgIXNjaGVtYS5tYXhJdGVtcy52YWxpZGF0aW9uTWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY2hlbWEubWF4SXRlbXMudmFsaWRhdGlvbk1lc3NhZ2UgPSBkZWZhdWx0TWF4SXRlbXNNc2c7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB2YXIgZiA9IHNjaGVtYUZvcm1Qcm92aWRlci5zdGRGb3JtT2JqKG5hbWUsIHNjaGVtYSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZi5rZXkgPSBvcHRpb25zLnBhdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgZi50eXBlID0gJ253cEZpbGVVcGxvYWQnO1xyXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwW3NmUGF0aFByb3ZpZGVyLnN0cmluZ2lmeShvcHRpb25zLnBhdGgpXSA9IGY7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGY7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBzY2hlbWFGb3JtUHJvdmlkZXIuZGVmYXVsdHMuYXJyYXkudW5zaGlmdChud3BNdWx0aWZpbGVVcGxvYWQpO1xyXG5cclxuICAgICAgICAgICAgc2NoZW1hRm9ybURlY29yYXRvcnNQcm92aWRlci5hZGRNYXBwaW5nKFxyXG4gICAgICAgICAgICAgICAgJ2Jvb3RzdHJhcERlY29yYXRvcicsXHJcbiAgICAgICAgICAgICAgICAnbndwRmlsZVVwbG9hZCcsXHJcbiAgICAgICAgICAgICAgICAnZGlyZWN0aXZlcy9kZWNvcmF0b3JzL2Jvb3RzdHJhcC9ud3AtZmlsZS9ud3AtZmlsZS5odG1sJ1xyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgIF0pO1xyXG5cclxuYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnbmdTY2hlbWFGb3JtRmlsZScsIFtcclxuICAgICAgICAnbmdGaWxlVXBsb2FkJyxcclxuICAgICAgICAnbmdNZXNzYWdlcydcclxuICAgIF0pXHJcbiAgICAuZGlyZWN0aXZlKCduZ1NjaGVtYUZpbGUnLCBbJ1VwbG9hZCcsICckdGltZW91dCcsICckcScsIGZ1bmN0aW9uIChVcGxvYWQsICR0aW1lb3V0LCAkcSkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB0cnVlLFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXHJcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWwpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLnVybCA9IHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5lbmRwb2ludDtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmlzU2luZ2xlZmlsZVVwbG9hZCA9IHNjb3BlLmZvcm0gJiYgc2NvcGUuZm9ybS5zY2hlbWEgJiYgc2NvcGUuZm9ybS5zY2hlbWEuZm9ybWF0ID09PSAnc2luZ2xlZmlsZSc7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0RmlsZSA9IGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUucGljRmlsZSA9IGZpbGU7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0RmlsZXMgPSBmdW5jdGlvbiAoZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5waWNGaWxlcyA9IGZpbGVzO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY29wZS51cGxvYWRGaWxlID0gZnVuY3Rpb24gKGZpbGUsIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlICYmIGRvVXBsb2FkKGZpbGUsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY29wZS51cGxvYWRGaWxlcyA9IGZ1bmN0aW9uIChmaWxlcywgYXJncykge1xyXG4gICAgICAgICAgICAgICAgICAgIGZpbGVzLmxlbmd0aCAmJiBhbmd1bGFyLmZvckVhY2goZmlsZXMsIGZ1bmN0aW9uIChmaWxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvVXBsb2FkKGZpbGUsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBzY29wZS5kb05vdFNlbmRGaWxlcyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGRvVXBsb2FkKGZpbGUsIGFyZ3MpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsZSAmJiAhZmlsZS4kZXJyb3IgJiYgc2NvcGUudXJsKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnVwbG9hZCA9IFVwbG9hZC51cGxvYWQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBzY29wZS51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlOiBmaWxlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkb19ub3RfZW1haWwnOiBzY29wZS5kb05vdFNlbmRGaWxlc1tmaWxlLm5hbWVdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwcm9qZWN0X2lkJzogc2NvcGUuZm9ybS5yZWxhdGVkVG8gPT09ICdQcm9qZWN0JyA/IHNjb3BlLm1vZGVsLmlkIDogYXJncy5wcm9qZWN0X2lkLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhY3Rpdml0eV9zaGVldF9pZCcgOiBzY29wZS5mb3JtLnJlbGF0ZWRUbyA9PT0gJ0FjdGl2aXR5IFNoZWV0JyA/IHNjb3BlLm1vZGVsLmlkIDogYXJncy5hY3Rpdml0eV9zaGVldF9pZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGUudXBsb2FkLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZS5yZXN1bHQgPSByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5nTW9kZWwuJHZpZXdWYWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kZWwuJHNldFZpZXdWYWx1ZShuZ01vZGVsLiR2aWV3VmFsdWUgKyAnLCcgKyByZXNwb25zZS5kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmdNb2RlbC4kc2V0Vmlld1ZhbHVlKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5nTW9kZWwuJGNvbW1pdFZpZXdWYWx1ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXJyb3JNc2cgPSByZXNwb25zZS5zdGF0dXMgKyAnOiAnICsgcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnVwbG9hZC5wcm9ncmVzcyhmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWxlLnByb2dyZXNzID0gTWF0aC5taW4oMTAwLCBwYXJzZUludCgxMDAuMCAqXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZ0LmxvYWRlZCAvIGV2dC50b3RhbCkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc2NvcGUudmFsaWRhdGVGaWVsZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUudXBsb2FkRm9ybS5maWxlICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZS4kdmFsaWQgJiYgc2NvcGUucGljRmlsZSAmJiAhc2NvcGUucGljRmlsZS4kZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3NpbmdsZWZpbGUtZm9ybSBpcyBpbnZhbGlkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS51cGxvYWRGb3JtLmZpbGVzICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZXMuJHZhbGlkICYmIHNjb3BlLnBpY0ZpbGVzICYmICFzY29wZS5waWNGaWxlcy4kZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ211bHRpZmlsZS1mb3JtIGlzICBpbnZhbGlkIFxcbiBFcnJvcjo6JyArIHNjb3BlLnBpY0ZpbGVzLiRlcnJvciArJ1xcbiBzY29wZS5waWNGaWxlczo6JyArIHNjb3BlLnBpY0ZpbGVzLmxlbmd0aCArICdcXG4gc2NvcGUudXBsb2FkRm9ybS5maWxlcy4kdmFsaWQ6Oicrc2NvcGUudXBsb2FkRm9ybS5maWxlcy4kdmFsaWQrJyBcXG5zY29wZS51cGxvYWRGb3JtLmZpbGVzOjonICsgc2NvcGUudXBsb2FkRm9ybS5maWxlcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzaW5nbGUtIGFuZCBtdWx0aWZpbGUtZm9ybSBhcmUgdmFsaWQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24gKGV2ZW50LCBhcmdzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNjb3BlLnVwbG9hZEZvcm0uZmlsZSAmJiBzY29wZS51cGxvYWRGb3JtLmZpbGUuJHZhbGlkICYmIHNjb3BlLnBpY0ZpbGUgJiYgIXNjb3BlLnBpY0ZpbGUuJGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnVwbG9hZEZpbGUoc2NvcGUucGljRmlsZSwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzY29wZS51cGxvYWRGb3JtLmZpbGVzICYmIHNjb3BlLnVwbG9hZEZvcm0uZmlsZXMuJHZhbGlkICYmIHNjb3BlLnBpY0ZpbGVzICYmICFzY29wZS5waWNGaWxlcy4kZXJyb3IpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLnVwbG9hZEZpbGVzKHNjb3BlLnBpY0ZpbGVzLCBhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJG9uKCdzY2hlbWFGb3JtVmFsaWRhdGUnLCBzY29wZS52YWxpZGF0ZUZpZWxkKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRvbignc2NoZW1hRm9ybUZpbGVVcGxvYWRTdWJtaXQnLCBzY29wZS5zdWJtaXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1dKTsiLG51bGxdfQ==
