const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findKeytool() {
  const possiblePaths = [
    'C:\\Program Files\\Android\\Android Studio\\jre\\bin\\keytool.exe',
    'C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\keytool.exe',
    'C:\\Program Files\\Java\\jdk-11\\bin\\keytool.exe',
    'C:\\Program Files\\Java\\jdk-17\\bin\\keytool.exe'
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
    console.error('Ошибка: Утилита keytool не найдена. Убедитесь, что установлен Android Studio или Java (JDK).');
    process.exit(1);
  }

  // Find any .jks or .keystore file in the current directory
  const files = fs.readdirSync(__dirname);
  const keystoreFile = files.find(f => f.endsWith('.jks') || f.endsWith('.keystore'));

  if (!keystoreFile) {
    console.error('Ошибка: Файл ключа (.jks или .keystore) не найден в папке проекта!');
    console.error('Пожалуйста, сначала скачайте его с сайта Expo и поместите в эту папку.');
    process.exit(1);
  }

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Введите алиас ключа (Key alias с сайта Expo): ', (alias) => {
    readline.question('Введите пароль ключа (Keystore password с сайта Expo): ', (password) => {
      try {
        const cmd = `"${keytool}" -export -rfc -keystore "${keystoreFile}" -alias "${alias}" -file upload_certificate.pem -storepass "${password}"`;
        console.log('\nСоздаю сертификат...');
        execSync(cmd, { stdio: 'inherit' });
        console.log('\n✅ УСПЕШНО! Файл upload_certificate.pem создан.');
        console.log('Теперь вы можете загрузить этот файл в Google Play Console для сброса ключа.');
      } catch (e) {
        console.error('\n❌ Ошибка при создании сертификата. Проверьте пароль и алиас.');
      }
      readline.close();
    });
  });
}

run();
