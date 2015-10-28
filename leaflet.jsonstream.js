L.jsonStream = (function(L) {
    /**
     *
     * @param settings
     * @constructor
     */
    function JSONStream(settings) {
        this.settings = [];
        this.setDefaults(settings);
    }

    JSONStream.defaults = {
        url: '',
        each: null,
        done: null
    };

    /**
    * @namespace
    * @type {Object}
    */
    JSONStream.threadScope = {
        stream: function(url, callback) {
            var request = new XMLHttpRequest();
            request.open("GET", url);
            request.onload = function() {
                var json = JSON.parse(request.responseText),
                    i = 0,
                    max = json.length;
                for (; i < max; i++) {
                    callback('each', JSON.stringify(json[i]));
                }
                callback('done');
            };
            request.send();
        }
    };

    JSONStream.prototype = {
        /**
        * @type {Number}
        */
        threadCount: 8,

        /**
        * @type {Number}
        */
        threadIndex: 0,

        /**
        * @type {Object}
        */
        activeThreads: {},

        /**
        *
        * @param {Object} settings
        * @returns {JSONStream}
        */
        setDefaults: function(settings) {
            var defs = JSONStream.defaults,
                prop;

            for(prop in defs) if (defs.hasOwnProperty(prop) && prop) {
                settings[prop] = settings[prop] !== undefined ? settings[prop] : defs[prop];
            }

            this.settings = settings;

            return this;
        },

        /**
        *
        * @returns {operative}
        */
        thread: function() {
            var activeThread,
                i = this.threadIndex;

            if (i >= this.threadCount) i = this.threadIndex = 0;

            if (this.activeThreads[i] === undefined) {
                this.activeThreads[i] = operative(JSONStream.threadScope);
            }

            activeThread = this.activeThreads[i];

            this.threadIndex++;

            return activeThread;
        },

        /**
         *
         * @returns {JSONStream}
         */
        load: function() {
            var thread = this.thread(),
               settings = this.settings;

            thread.stream(operative.getBaseURL() + settings.url, function(methodName, jsonString) {
                var method = settings[methodName];
                if (typeof method === 'function') {
                    if (jsonString) {
                        method(JSON.parse(jsonString));
                    } else {
                        method();
                    }
                }
            });

            return this;
        }
    };

    L.JSONStream = JSONStream;

    return function(settings) {
        return new L.JSONStream(settings);
    };
})(L);