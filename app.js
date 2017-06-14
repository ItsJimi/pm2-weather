var pmx = require('pmx');
var got = require('got');

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
      action: false
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
}, (err, conf) => {
  if (err) return console.log(err);

  const Probe = pmx.probe();
  let valueToInspect = '??';

  /**
   * .metric, .counter, .meter, .histogram are also available (cf doc)
   */
  Probe.metric({
    name: 'Weather',
    value: function () {
      return valueToInspect;
    }
  });

  setInterval(() => {
    got(`http://api.openweathermap.org/data/2.5/weather?q=${conf.city}&units=metric&APPID=${conf.token}`).then(data => {
      valueToInspect = JSON.parse(data.body).main.temp + '°C';
    }).catch(err => {
      console.log(err);
      valueToInspect = 'Err';
    });
  }, 1000);
});
