const fs = require('fs');
const { execSync } = require('child_process');

function findKeytool() {
  const possiblePaths = [
    'C:\\Program Files\\Android\\Android Studio\\jre\\bin\\keytool.exe',
    'C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\keytool.exe',
    'C:\\Program Files\\Java\\jdk-11\\bin\\keytool.exe',
    'C:\\Program Files\\Java\\jdk-17\\bin\\keytool.exe',
    'C:\\Program Files\\Android\\Android Studio1\\jre\\bin\\keytool.exe'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  try {
    execSync('keytool -help', { stdio: 'ignore' });
    return 'keytool';
  } catch (e) {
    return null;
  }
}

function run() {
  const keytool = findKeytool();
  if (!keytool) {
    console.error('Ошибка: Утилита keytool не найдена.');
    process.exit(1);
  }

  const keystoreName = 'loadboard.jks';
  const alias = 'loadboard';
  const password = 'password123';
  const dname = 'CN=LoadBoard, OU=App, O=LoadBoard, L=City, ST=State, C=US';

  // 1. Generate Keystore
  if (fs.existsSync(keystoreName)) fs.unlinkSync(keystoreName);
  
  console.log('1. Создаем новый Keystore...');
  try {
    const cmdGen = `"${keytool}" -genkeypair -v -keystore ${keystoreName} -alias ${alias} -keyalg RSA -keysize 2048 -validity 10000 -storepass ${password} -keypass ${password} -dname "${dname}"`;
    execSync(cmdGen, { stdio: 'pipe' });
    console.log(`✅ Keystore успешно создан: ${keystoreName}`);
    console.log(`   Алиас: ${alias}`);
    console.log(`   Пароль: ${password}`);
  } catch (e) {
    console.error('❌ Ошибка при создании Keystore:', e.message);
    process.exit(1);
  }

  // 2. Export PEM
  console.log('\n2. Создаем сертификат для Google Play...');
  const pemName = 'upload_certificate.pem';
  if (fs.existsSync(pemName)) fs.unlinkSync(pemName);

  try {
    const cmdExport = `"${keytool}" -export -rfc -keystore ${keystoreName} -alias ${alias} -file ${pemName} -storepass ${password}`;
    execSync(cmdExport, { stdio: 'pipe' });
    console.log(`✅ Сертификат успешно создан: ${pemName}`);
  } catch (e) {
    console.error('❌ Ошибка при экспорте сертификата:', e.message);
  }
}

run();
