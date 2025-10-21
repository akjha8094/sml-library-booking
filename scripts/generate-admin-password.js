const bcrypt = require('bcryptjs');

// Generate hashed password for admin
const password = 'admin123'; // Change this to your desired password
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

console.log('===============================================');
console.log('ADMIN PASSWORD HASH GENERATOR');
console.log('===============================================');
console.log('Original Password:', password);
console.log('Hashed Password:', hashedPassword);
console.log('===============================================');
console.log('\nCopy the hashed password and use it in the SQL command:');
console.log('\nINSERT INTO admins (name, email, password, role) VALUES');
console.log(`('Super Admin', 'admin@smartlibrary.com', '${hashedPassword}', 'super_admin');`);
console.log('===============================================');
