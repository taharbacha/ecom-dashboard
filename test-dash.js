const https = require('https');
https.get('https://docs.google.com/spreadsheets/d/1o53MO3wXbs5-9RcsjW-VcEcFIXT9sgkQ8D-fIC_FIEU/gviz/tq?tqx=out:csv&sheet=DASH', (res) => {
  let data = '';
  res.on('data', (d) => data += d);
  res.on('end', () => console.log(data));
});
