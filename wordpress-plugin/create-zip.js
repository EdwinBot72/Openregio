const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream('wordpress-plugin/openregio.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log('✅ ZIP bestand aangemaakt: wordpress-plugin/openregio.zip');
  console.log('📦 Grootte: ' + (archive.pointer() / 1024).toFixed(1) + ' KB');
  console.log('📁 Aantal bestanden: ' + archive.pointer());
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add the openregio directory
archive.directory('wordpress-plugin/openregio/', 'openregio', {
  filter: (name) => {
    // Exclude vendor, node_modules, .git
    return !name.includes('vendor/') && 
           !name.includes('node_modules/') && 
           !name.includes('.git');
  }
});

archive.finalize();
