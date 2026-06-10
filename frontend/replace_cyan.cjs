const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  '--cyan-core': '--ember-400',
  '--cyan-glow': '--ember-glow',
  '--cyan-glow-s': '--ember-glow-s',
  '--cyan-dim': '--ember-glow',
  '--cyan-muted': '--border-mid',
  '--cyan-bright': '--ember-300',
  'text-cyan': 'text-ember-400',
  'bg-cyan/10': 'bg-ember-400/10',
  'border-cyan/20': 'border-ember-400/20',
  'bg-cyan': 'bg-ember-400',
  'border-cyan': 'border-ember-400',
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.css') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(key, 'g');
      content = content.replace(regex, value);
    }
    
    // Also catch any standalone cyan just in case, but be careful
    // Actually the above mappings cover the variables. Let's see if there are others.
    content = content.replace(/cyan/g, 'ember');

    // Wait, replacing all 'cyan' with 'ember' after might mess up things like 'ember-core' if '--cyan-core' wasn't fully matched.
    // Since we matched '--cyan-core' and replaced with '--ember-400', the string '--cyan-core' is gone.
    // If there is 'text-cyan-500', it becomes 'text-ember-500'. That's fine.

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
