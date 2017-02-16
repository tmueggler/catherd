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
            '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
            rxjs: 'npm:rxjs',
            'socket.io-client': 'npm:socket.io-client/dist/socket.io.js'
        },
        packages: {
            app: {
                defaultExtensions: '*.js'
            },
            rxjs: {
                defaultExtensions: '*.js'
            }
        }
    });
})(this);