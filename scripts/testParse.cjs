const fs = require('fs');

const rawData = fs.readFileSync('scripts/parseStudents.cjs', 'utf8');
const dataStr = rawData.substring(rawData.indexOf('const rawData = `') + 17, rawData.indexOf('`;\n\nconst lines'));

const lines = dataStr.split('\n');
let currentClass = '';
const result = [];

for (let line of lines) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  if (trimmed === '៧ក') { currentClass = '7A'; continue; }
  if (trimmed === '៨ក') { currentClass = '8A'; continue; }
  if (trimmed === '៨ខ') { currentClass = '8B'; continue; }
  if (trimmed === '៩ក') { currentClass = '9A'; continue; }

  // Note: line may start with a tab if id is missing!
  const parts = line.split('\t').map(p => p.trim());
  
  let id = '', name = '', gender = '', dob = '', fatherName = '', fatherJob = '', motherName = '', motherJob = '', phone = '', address = '';
  
  // Check if first column is an ID (number) or if it's empty
  if (parts.length >= 10) {
    id = parts[0];
    name = parts[1];
    gender = parts[2];
    dob = parts[3];
    fatherName = parts[4];
    fatherJob = parts[5];
    motherName = parts[6];
    motherJob = parts[7];
    phone = parts[8];
    address = parts[9];
  } else if (parts.length >= 2) {
    // If id was empty, parts[0] might be empty string ''
    if (parts[0] === '' && parts[1]) {
      name = parts[1];
      gender = parts[2] || '';
      dob = parts[3] || '';
      fatherName = parts[4] || '';
      fatherJob = parts[5] || '';
      motherName = parts[6] || '';
      motherJob = parts[7] || '';
      phone = parts[8] || '';
      address = parts[9] || '';
    } else {
      id = parts[0];
      name = parts[1];
      gender = parts[2] || '';
      dob = parts[3] || '';
      fatherName = parts[4] || '';
      fatherJob = parts[5] || '';
      motherName = parts[6] || '';
      motherJob = parts[7] || '';
      phone = parts[8] || '';
      address = parts[9] || '';
    }
  }

  result.push({
    classId: currentClass,
    id,
    name,
    gender,
    dob,
    fatherName,
    fatherJob,
    motherName,
    motherJob,
    phone,
    address
  });
}

console.log('Sample parsed:');
console.log(result.filter(r => !r.id || r.name.includes('ទួន') || r.name.includes('គឺ') || r.name.includes('សុផល')));
console.log('Total parsed rows:', result.length);
