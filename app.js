var pmx = require('pmx');
var got = require('got');

var config = require('./config.json');

pmx.initModule({

  // Options related to the display style on Keymetrics
  widget: {

    // Logo displayed
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Ic_cloud_queue_48px.svg/1024px-Ic_cloud_queue_48px.svg.png',

    // Module colors
    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme: ['#fff', '#333', '#222', '#222'],

    // Section to show / hide
    el: {
      probes: true,
      action: true
    },

    // Main block to show / hide
    block: {
      actions: false,
      issues: false,
      meta: false,

      // Custom metrics to put in BIG
      main_probes: ['Weather']
    }

  }

}, function (err, conf) {
  if (err) {
    return console.log(err);
  }
  /**
   * Module specifics like connecting to a database and
   * displaying some metrics
   */

  /**
   *                      Custom Metrics
   *
   * Let's expose some metrics that will be displayed into Keymetrics
   *   For more documentation about metrics: http://bit.ly/1PZrMFB
   */
  var Probe = pmx.probe();

  var valueToInspect = '??';

  /**
   * .metric, .counter, .meter, .histogram are also available (cf doc)
   */
  Probe.metric({
    name: 'Weather',
    value: function () {
      return valueToInspect;
    },
    /**
     * Here we set a default value threshold, to receive a notification
     * These options can be overriden via Keymetrics or via pm2
     * More: http://bit.ly/1O02aap
     */
    alert: {
      mode: 'threshold',
      value: 20,
      msg: 'test-probe alert!',
      action: function (val) {
        // Besides the automatic alert sent via Keymetrics
        // You can also configure your own logic to do something
        console.log('Value has reached %d', val);
      }
    }
  });

  setInterval(function () {
    got('http://api.openweathermap.org/data/2.5/weather?q=Paris&units=metric&APPID=' + config.token).then((data) => {
      valueToInspect = JSON.parse(data.body).main.temp + '°C';
    }).catch((err) => {
      console.log(err);
      valueToInspect = 'Err';
    });
  }, 1000);

  /**
   *                Simple Actions
   *
   *   Now let's expose some triggerable functions
   *  Once created you can trigger this from Keymetrics
   *
   */
  pmx.action('env', function (reply) {
    return reply({
      env: process.env
    });
  });

  /**
   *                 Scoped Actions
   *
   *     This are for long running remote function
   * This allow also to res.emit logs to see the progress
   *
   **/
  var spawn = require('child_process').spawn;

  pmx.scopedAction('lsof cmd', function (options, res) {
    var child = spawn('lsof', []);

    child.stdout.on('data', function (chunk) {
      chunk.toString().split('\n').forEach(function (line) {
        /**
         * Here we send logs attached to this command
         */
        res.send(line);
      });
    });

    child.stdout.on('end', function (chunk) {
      /**
       * Then we emit end to finalize the function
       */
      res.end('end');
    });
  });
});
