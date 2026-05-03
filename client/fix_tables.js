import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/pages');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Check if it already has overflow-x-auto wrapper
  if (content.includes('<table') && !content.includes('overflow-x-auto')) {
    // We will do a simple string replacement
    content = content.replace(/<table/g, '<div className="overflow-x-auto w-full pb-4"><table');
    content = content.replace(/<\/table>/g, '</table></div>');
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log('Fixed table in:', file);
  }
});

console.log(`\nFinished! Wrapped tables in ${changedCount} files.`);
