const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

// Order matters — longer/more specific patterns first
const replacements = [
  // Ember CSS variable references → accent
  ["var(--ember-glow-s)", "var(--accent-strong)"],
  ["var(--ember-glow)", "var(--accent-subtle)"],
  ["var(--ember-900)", "var(--accent-subtle)"],
  ["var(--ember-700)", "var(--accent-hover)"],
  ["var(--ember-500)", "var(--accent-hover)"],
  ["var(--ember-400)", "var(--accent-base)"],
  ["var(--ember-300)", "var(--accent-base)"],
  
  // Tailwind ember class references → accent
  ["bg-ember-400/10", "bg-accent-subtle"],
  ["bg-ember-400", "bg-accent"],
  ["bg-ember-300", "bg-accent-hover"],
  ["bg-ember-500", "bg-accent-hover"],
  ["border-ember-400/20", "border-accent/20"],
  ["border-ember-400", "border-accent"],
  ["border-ember-500", "border-accent-hover"],
  ["text-ember-400", "text-accent"],
  ["text-ember-300", "text-accent"],
  ["text-ember", "text-accent"],
  ["ember-glow-lg", "accent-glow-lg"],
  ["ember-glow-sm", "accent-glow-sm"],
  ["ember-glow", "accent-glow"],
  
  // Tailwind variant classes in Button.jsx
  ["bg-ember-400 text-void border border-ember-500 shadow-ember-glow hover:bg-ember-300 hover:shadow-ember-glow-lg", "bg-accent text-white border border-transparent hover:bg-accent-hover"],
  ["bg-ember-400 text-void border border-ember-500 font-bold hover:bg-ember-300", "bg-accent text-white border border-transparent font-bold hover:bg-accent-hover"],
  ["shadow-ember-glow hover:shadow-ember-glow-lg", "shadow-accent-glow hover:shadow-accent-glow-lg"],
  ["shadow-ember-glow", "shadow-accent-glow"],
  
  // Inline style color references
  ["color: 'var(--ember-400)'", "color: 'var(--accent-base)'"],
  ["color: 'var(--ember-300)'", "color: 'var(--accent-base)'"],
  ["color: 'var(--ember-500)'", "color: 'var(--accent-hover)'"],
  
  // Background style references
  ["background: 'var(--ember-400)'", "background: 'var(--accent-base)'"],
  ["background: 'var(--ember-300)'", "background: 'var(--accent-base)'"],
  ["background: 'var(--ember-glow)'", "background: 'var(--accent-subtle)'"],
  ["background: 'var(--ember-glow-s)'", "background: 'var(--accent-strong)'"],
  
  // Gradient references
  ["linear-gradient(135deg, var(--ember-500), var(--ember-400))", "var(--accent-base)"],
  ["linear-gradient(135deg, var(--ember-400), var(--ember-300))", "var(--accent-base)"],
  
  // Box shadow references
  ["boxShadow: '0 4px 20px var(--ember-glow-s)'", "boxShadow: '0 4px 14px var(--accent-glow)'"],
  ["boxShadow: '0 4px 16px var(--ember-glow)'", "boxShadow: '0 4px 14px var(--accent-glow)'"],
  ["boxShadow: '0 2px 12px var(--ember-glow)'", "boxShadow: '0 2px 12px var(--accent-glow)'"],
  ["boxShadow: '0 0 8px var(--ember-glow-s)'", "boxShadow: '0 0 8px var(--accent-glow)'"],
  ["boxShadow: '0 6px 24px var(--ember-glow-s)'", "boxShadow: '0 6px 20px var(--accent-glow)'"],
  
  // Border references
  ["border: '1px solid var(--ember-glow-s)'", "border: '1px solid var(--accent-glow)'"],
  ["border: '1px solid var(--ember-glow)'", "border: '1px solid var(--accent-subtle)'"],
  ["borderColor: 'var(--ember-400)'", "borderColor: 'var(--accent-base)'"],
  
  // Focus state in Input.jsx
  ["inset 3px 0 0 var(--ember-400), 0 0 0 2px var(--ember-glow)", "0 0 0 3px var(--accent-subtle)"],
  
  // Catch remaining standalone references
  ["--ember-glow-s", "--accent-strong"],
  ["--ember-glow", "--accent-subtle"],
  ["--ember-400", "--accent-base"],
  ["--ember-300", "--accent-base"],
  ["--ember-500", "--accent-hover"],
  ["--ember-700", "--accent-hover"],
  ["--ember-900", "--accent-subtle"],
];

let totalUpdated = 0;

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir(directoryPath, function(filePath) {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    for (const [search, replace] of replacements) {
      content = content.split(search).join(replace);
    }

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(directoryPath, filePath)}`);
      totalUpdated++;
    }
  }
});

console.log(`\n🎯 Total files updated: ${totalUpdated}`);
