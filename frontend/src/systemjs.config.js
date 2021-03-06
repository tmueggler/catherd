(function (global) {
    SystemJS.config({
        paths: {
            'npm:': 'node_modules/'
        },
        map: {
            app: 'app',
            '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
            '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
            '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
            '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
            '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
            'rxjs': 'npm:rxjs',
            'sockjs-client': 'npm:sockjs-client/dist/sockjs.js',
            'stompjs': 'npm:stompjs/lib/stomp.js',
            'mqtt': 'npm:mqtt/dist/mqtt.js',
            '@catherd/api/web': 'npm:@catherd/api/web/api.umd.js'
        },
        packages: {
            app: {
                defaultExtensions: '*.js'
            },
            rxjs: {
                defaultExtensions: '*.js'
            }
        },
        meta: {
            'npm:stompjs/lib/stomp.js': {
                format: 'global',
                'exports': 'Stomp'
            }
        }
    });
})(this);