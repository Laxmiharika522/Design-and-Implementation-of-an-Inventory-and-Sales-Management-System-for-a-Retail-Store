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

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Replace backtick URLs first: `http://localhost:5000/api/...` -> `${import.meta.env.VITE_API_URL}/...`
  content = content.replace(/`http:\/\/localhost:5000\/api\//g, '`${import.meta.env.VITE_API_URL}/');
  content = content.replace(/`http:\/\/localhost:5000\/api`/g, '`${import.meta.env.VITE_API_URL}`');

  // Replace single quote URLs: 'http://localhost:5000/api/...' -> import.meta.env.VITE_API_URL + '/...'
  content = content.replace(/'http:\/\/localhost:5000\/api\//g, 'import.meta.env.VITE_API_URL + \'/');
  content = content.replace(/'http:\/\/localhost:5000\/api'/g, 'import.meta.env.VITE_API_URL');

  // Replace double quote URLs: "http://localhost:5000/api/..." -> import.meta.env.VITE_API_URL + "/..."
  content = content.replace(/"http:\/\/localhost:5000\/api\//g, 'import.meta.env.VITE_API_URL + "/');
  content = content.replace(/"http:\/\/localhost:5000\/api"/g, 'import.meta.env.VITE_API_URL');

  // Special case for axios.defaults.baseURL in main.jsx
  if (file.endsWith('main.jsx')) {
    content = content.replace(/axios\.defaults\.baseURL.*/g, "axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';");
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
    console.log('Fixed:', file);
  }
});

console.log(`\nFinished! Fixed ${changedCount} files.`);
