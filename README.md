jAJAX
=====

jQuery-like AJAX method for multiple environments, especially for chrome-extension, safari-extension, firefox-extension

## Usage

    jajax(options: object, ondone: function, onerror: function)
    /*  where
     *          function ondone(result, statusText, xhr[, response]);
     *          function onerror(statusText, type: [error|parsererror|abort|timeout], xhr[, response]);
     *          In Firefox there is response object instead of XHR, xhr is a plain object substitute
     */

